"use client";

import { useState, useRef } from "react";
import { motion } from "framer-motion";
import { Bot, User, Download, FileSpreadsheet, Loader2, CheckCircle2 } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { atomDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import { toPng } from "html-to-image";
import jsPDF from "jspdf";
import * as XLSX from "xlsx";

// 1. IMPORT CAPACITOR MODULES
import { Capacitor } from "@capacitor/core";
import { Filesystem, Directory, Encoding } from "@capacitor/filesystem";

// UI Components
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

// Types
import { Message, AIResponse } from "./../types";

// Widgets
import { DataChart } from "./widgets/DataChart";
import { DataTable } from "./widgets/DataTable";
import { KPIGrid } from "./widgets/KPIGrid";

import { ScriptDialog } from "./index";

interface ChatMessageProps extends Message {
  isLastMsg?: boolean;
}

export const ChatMessage = ({
  role,
  content,
  timestamp,
  attachment,
  isLastMsg,
}: ChatMessageProps) => {
  const isUser = role === "user";
  const aiPayload = !isUser ? (content as AIResponse) : null;
  const rawText = isUser ? (content as string) : (content as AIResponse).summary;
  const widgetRef = useRef<HTMLDivElement>(null);

  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false); // Feedback for mobile users

  const formatSize = (bytes: number) => {
    if (!bytes) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
  };

  // --- 📱 HELPER: SAVE FILE ON MOBILE ---
  const saveToMobileFilesystem = async (fileName: string, dataBase64: string) => {
    try {
      await Filesystem.writeFile({
        path: fileName,
        data: dataBase64,
        directory: Directory.Documents, // Saves to 'Documents' on Android/iOS
        // encoding: Encoding.UTF8 // Not needed if data is explicitly base64
      });
      
      // Show success feedback
      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 3000);
      alert(`File saved to Documents folder:\n${fileName}`);
    } catch (e) {
      console.error("Mobile File Save Error:", e);
      alert("Error saving file. Check app permissions.");
    }
  };

  const handleDownload = async () => {
    if (isUser) return;
    setIsDownloading(true);

    try {
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

      const pageWidth = 210;
      const pageHeight = 297;
      const margin = 15;
      const contentWidth = pageWidth - margin * 2;
      const maxY = pageHeight - margin;
      let cursorY = margin;

      // STEP 1: SUMMARY TEXT
      const summaryText = rawText?.trim() || "";
      if (summaryText.length > 0) {
        pdf.setFont("helvetica", "bold");
        pdf.setFontSize(14);
        pdf.text("ExcelGPT Summary", margin, cursorY);
        cursorY += 8;

        pdf.setFont("helvetica", "normal");
        pdf.setFontSize(11);
        const lines = pdf.splitTextToSize(summaryText, contentWidth);
        const lineHeight = 6;
        for (let i = 0; i < lines.length; i++) {
          if (cursorY + lineHeight > maxY) {
            pdf.addPage();
            cursorY = margin;
          }
          pdf.text(lines[i], margin, cursorY);
          cursorY += lineHeight;
        }
        cursorY += 8;
      }

      // STEP 2: WIDGET SNAPSHOT
      // Note: toPng might still fail on some restricted WebViews. 
      // Wrapped in try/catch to ensure at least text PDF saves.
      try {
        if (widgetRef.current) {
          await new Promise((resolve) => setTimeout(resolve, 250));
          
          const widgetWidth = widgetRef.current.scrollWidth;
          const widgetHeight = widgetRef.current.scrollHeight;

          const widgetImgUrl = await toPng(widgetRef.current, {
            cacheBust: true,
            backgroundColor: "#09090b",
            width: widgetWidth,
            height: widgetHeight,
            pixelRatio: 2,
          });

          if (widgetImgUrl && widgetImgUrl.length > 100) {
            const widgetProps = pdf.getImageProperties(widgetImgUrl);
            const pdfWidgetHeight = (widgetProps.height * contentWidth) / widgetProps.width;

            if (cursorY + pdfWidgetHeight > maxY) {
              pdf.addPage();
              cursorY = margin;
            }

            pdf.addImage(widgetImgUrl, "PNG", margin, cursorY, contentWidth, pdfWidgetHeight);
          }
        }
      } catch (imgError) {
        console.warn("Snapshot failed on mobile, saving text only", imgError);
      }

      const fileName = `ExcelGPT-Insight-${Date.now()}.pdf`;

      // 🛑 BRANCHING LOGIC: MOBILE vs WEB
      if (Capacitor.isNativePlatform()) {
        // Mobile: Get Base64 string (remove 'data:application/pdf;base64,' prefix)
        const pdfBase64 = pdf.output('datauristring').split(',')[1];
        await saveToMobileFilesystem(fileName, pdfBase64);
      } else {
        // Web: Standard Download
        pdf.save(fileName);
      }

    } catch (error) {
      console.error("PDF Generation Failed:", error);
    } finally {
      setIsDownloading(false);
    }
  };

  const handleDownloadTableXlsx = async () => {
    if (!aiPayload || aiPayload.type !== "table") return;

    const { headers, rows } = aiPayload.data as {
      headers: string[];
      rows: (string | number)[][];
    };

    const aoa = [headers, ...rows];
    const worksheet = XLSX.utils.aoa_to_sheet(aoa);

    // Auto-width columns
    worksheet["!cols"] = headers.map((h, colIndex) => {
      const maxLen = Math.max(
        h.length,
        ...rows.map((r) => String(r[colIndex] ?? "").length)
      );
      return { wch: Math.min(Math.max(maxLen + 2, 12), 40) };
    });

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Table");

    const fileName = `ExcelGPT-Table-${Date.now()}.xlsx`;

    // 🛑 BRANCHING LOGIC: MOBILE vs WEB
    if (Capacitor.isNativePlatform()) {
      try {
        // Mobile: Generate Base64
        const xlsxBase64 = XLSX.write(workbook, { bookType: 'xlsx', type: 'base64' });
        await saveToMobileFilesystem(fileName, xlsxBase64);
      } catch (e) {
        console.error("Mobile XLSX Error:", e);
      }
    } else {
      // Web: Standard Download
      XLSX.writeFile(workbook, fileName);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex w-full gap-2 md:gap-4 ${isUser ? "justify-end" : ""} ${
        isLastMsg ? "mb-32" : ""
      }`}
    >
      {!isUser && (
        <div className="hidden sm:flex flex-col items-center gap-2 shrink-0">
          <Avatar className="size-8 md:size-10 border border-primary/30 shadow-lg">
            <AvatarFallback className="bg-primary text-primary-foreground">
              <Bot size={20} />
            </AvatarFallback>
          </Avatar>
          <div className="h-full w-0.5 bg-linear-to-b from-primary/30 to-transparent rounded-full" />
        </div>
      )}

      <div className={`max-w-full md:max-w-4xl flex flex-col grow gap-2 ${isUser ? "items-end" : ""}`}>
        {/* ... Header Section (Unchanged) ... */}
        <div className={`flex items-center gap-2 ${isUser ? "flex-row-reverse" : ""}`}>
          <span className="text-foreground font-black text-xs uppercase tracking-widest">
            {isUser ? "You" : "ExcelGPT"}
          </span>
          {!isUser && (
            <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 font-black uppercase tracking-widest text-[8px] md:text-[10px] px-1.5 md:px-2 py-0.5">
              Analysis Complete
            </Badge>
          )}
          <span className="text-muted-foreground text-[10px] font-mono tracking-tighter">
            {timestamp}
          </span>
        </div>

        <Card className={`p-4 md:p-6 shadow-xl backdrop-blur-md border overflow-hidden gap-2 ${
            isUser
              ? "bg-muted/10 border-border rounded-2xl rounded-tr-sm text-foreground"
              : "bg-card/40 border-border rounded-2xl rounded-tl-sm w-full relative"
          }`}
        >
          {/* ... Attachment & Text Section (Unchanged) ... */}
          {!isUser && <div className="absolute top-0 left-0 w-full h-px bg-linear-to-r from-transparent via-primary/50 to-transparent"></div>}
          
          {isUser && attachment && (
             <div className="mb-1 flex items-center gap-3 p-3 bg-card/50 border border-border/50 rounded-xl w-full sm:max-w-sm">
                <div className="p-2.5 bg-green-500/10 rounded-lg text-green-500 border border-green-500/20 shrink-0">
                  <FileSpreadsheet size={20} />
                </div>
                <div className="flex flex-col overflow-hidden min-w-0">
                   <p className="text-sm font-bold text-foreground truncate">{attachment.name}</p>
                   <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-bold">{attachment.type.toUpperCase()} • {formatSize(attachment.size)}</p>
                </div>
             </div>
          )}

          <div className="bg-transparent p-1 rounded-sm overflow-x-auto">
             {/* ... ReactMarkdown Section (Unchanged) ... */}
             {isUser ? (
                <p className="whitespace-pre-wrap text-sm leading-relaxed wrap-break-word">{rawText}</p>
             ) : (
                <div className="prose prose-invert prose-p:text-sm prose-p:leading-relaxed prose-code:text-primary prose-code:bg-primary/10 prose-code:px-1 prose-code:rounded prose-pre:bg-muted/50 prose-pre:border prose-pre:border-border max-w-none mb-2 wrap-break-word">
                  <ReactMarkdown remarkPlugins={[remarkGfm]} components={{
                      code({ inline, className, children, ...props }: any) {
                        const match = /language-(\w+)/.exec(className || "");
                        return !inline && match ? (
                          <div className="overflow-x-auto my-4 rounded-lg">
                            <SyntaxHighlighter style={atomDark} language={match[1]} PreTag="div" {...props} customStyle={{ margin: 0, borderRadius: 0 }}>
                              {String(children).replace(/\n$/, "")}
                            </SyntaxHighlighter>
                          </div>
                        ) : (
                          <code className={className} {...props}>{children}</code>
                        );
                      },
                    }}>
                    {rawText}
                  </ReactMarkdown>
                </div>
             )}
          </div>

          {/* WIDGET SECTION */}
          {!isUser && aiPayload && (
            <div ref={widgetRef} className="space-y-4 rounded-xl overflow-hidden mt-2 overflow-x-auto">
              {aiPayload.type === "table" && <DataTable data={aiPayload.data} />}
              {aiPayload.type === "chart" && <DataChart data={aiPayload.data} />}
              {aiPayload.type === "kpi" && <KPIGrid data={aiPayload.data} />}
            </div>
          )}

          {/* ACTION BUTTONS */}
          {!isUser && (
            <div className="mt-6 flex flex-wrap gap-2">
              {aiPayload?.type === "table" ? (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDownloadTableXlsx}
                  className="h-7 text-[10px] uppercase tracking-widest font-bold text-muted-foreground hover:text-primary hover:border-primary/50 hover:bg-muted/50 transition-all"
                >
                  {downloadSuccess ? <CheckCircle2 size={14} className="mr-2 text-green-500"/> : <Download size={14} className="mr-2" />}
                  Download .xlsx
                </Button>
              ) : (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDownload}
                  disabled={isDownloading}
                  className="h-7 text-[10px] uppercase tracking-widest font-bold text-muted-foreground hover:text-primary hover:border-primary/50 hover:bg-muted/50 transition-all"
                >
                  {isDownloading ? (
                    <Loader2 size={14} className="mr-2 animate-spin" />
                  ) : downloadSuccess ? (
                    <CheckCircle2 size={14} className="mr-2 text-green-500" />
                  ) : (
                    <Download size={14} className="mr-2" />
                  )}
                  {isDownloading ? "Generating..." : "Download Report"}
                </Button>
              )}

              {aiPayload && (aiPayload as any).code && (
                <ScriptDialog code={(aiPayload as any).code} />
              )}
            </div>
          )}
        </Card>
      </div>
      
      {isUser && (
        // RESPONSIVE: Hidden on small screens to save space
        <Avatar className="hidden sm:flex size-8 border border-accent/40 self-end mb-1 shrink-0">
          <AvatarFallback className="bg-accent/20 text-accent">
            <User size={16} />
          </AvatarFallback>
        </Avatar>
      )}
    </motion.div>
  );
};