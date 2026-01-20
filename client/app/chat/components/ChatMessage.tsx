"use client";

import { useState, useRef } from "react";
import { motion } from "framer-motion";
import { Bot, User, Download, FileSpreadsheet, Loader2 } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { atomDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import { toPng } from "html-to-image";
import jsPDF from "jspdf";
import * as XLSX from "xlsx";


// UI Components
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

// Types
import { Message, AIResponse, TableData } from "./../types";

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

  // rawText is what user said OR AI summary
  const rawText = isUser ? (content as string) : (content as AIResponse).summary;

  // Refs
  const widgetRef = useRef<HTMLDivElement>(null);

  const [isDownloading, setIsDownloading] = useState(false);

  const formatSize = (bytes: number) => {
    if (!bytes) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
  };

  const handleDownload = async () => {
    // Only AI messages have summary + widget
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

      // ============================
      // STEP 1: ADD SUMMARY AS REAL TEXT (NO SCREENSHOT)
      // ============================
      const summaryText = rawText?.trim() || "";

      if (summaryText.length > 0) {
        pdf.setFont("helvetica", "bold");
        pdf.setFontSize(14);
        pdf.setTextColor(0, 0, 0);
        pdf.text("ExcelGPT Summary", margin, cursorY);

        cursorY += 8;

        pdf.setFont("helvetica", "normal");
        pdf.setFontSize(11);

        // split into lines to fit width
        const lines = pdf.splitTextToSize(summaryText, contentWidth);

        // handle page overflow
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

      // ============================
      // STEP 2: ADD WIDGET AS IMAGE (CHART/TABLE/KPI)
      // ============================
      if (widgetRef.current) {
        // let charts finish rendering
        await new Promise((resolve) => setTimeout(resolve, 250));

        const widgetWidth = widgetRef.current.scrollWidth;
        const widgetHeight = widgetRef.current.scrollHeight;

        const widgetImgUrl = await toPng(widgetRef.current, {
          cacheBust: true,
          backgroundColor: "#09090b", // Zinc-950 for dark theme
          width: widgetWidth,
          height: widgetHeight,
          pixelRatio: 2,
        });

        if (widgetImgUrl && widgetImgUrl.length > 100) {
          const widgetProps = pdf.getImageProperties(widgetImgUrl);
          const pdfWidgetHeight =
            (widgetProps.height * contentWidth) / widgetProps.width;

          // If widget doesn't fit, new page
          if (cursorY + pdfWidgetHeight > maxY) {
            pdf.addPage();
            cursorY = margin;
          }

          pdf.addImage(
            widgetImgUrl,
            "PNG",
            margin,
            cursorY,
            contentWidth,
            pdfWidgetHeight
          );
        }
      }

      pdf.save(`ExcelGPT-Insight-${Date.now()}.pdf`);
    } catch (error) {
      console.error("PDF Generation Failed:", error);
    } finally {
      setIsDownloading(false);
    }
  };

  const handleDownloadTableXlsx = () => {
    if (!aiPayload || aiPayload.type !== "table") return;

    const { headers, rows } = aiPayload.data as {
      headers: string[];
      rows: (string | number)[][];
    };

    // Combine headers + rows into AOA format
    const aoa = [headers, ...rows];

    const worksheet = XLSX.utils.aoa_to_sheet(aoa);

    // Optional: make columns auto width (simple + works well)
    worksheet["!cols"] = headers.map((h, colIndex) => {
      const maxLen = Math.max(
        h.length,
        ...rows.map((r) => String(r[colIndex] ?? "").length)
      );
      return { wch: Math.min(Math.max(maxLen + 2, 12), 40) };
    });

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Table");

    XLSX.writeFile(workbook, `ExcelGPT-Table-${Date.now()}.xlsx`);
  };



  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      // RESPONSIVE: gap-2 on mobile, gap-4 on desktop
      className={`flex w-full gap-2 md:gap-4 ${isUser ? "justify-end" : ""} ${
        isLastMsg ? "mb-32" : ""
      }`}
    >
      {!isUser && (
        // RESPONSIVE: Hidden on small screens to save space, visible on sm+
        <div className="hidden sm:flex flex-col items-center gap-2 shrink-0">
          <Avatar className="size-8 md:size-10 border border-primary/30 shadow-lg">
            <AvatarFallback className="bg-primary text-primary-foreground">
              <Bot size={20} />
            </AvatarFallback>
          </Avatar>
          <div className="h-full w-0.5 bg-linear-to-b from-primary/30 to-transparent rounded-full" />
        </div>
      )}

      <div
        // RESPONSIVE: max-w-full on mobile (minus padding), max-w-4xl on desktop
        className={`max-w-full md:max-w-4xl flex flex-col grow gap-2 ${
          isUser ? "items-end" : ""
        }`}
      >
        <div
          className={`flex items-center gap-2 ${
            isUser ? "flex-row-reverse" : ""
          }`}
        >
          <span className="text-foreground font-black text-xs uppercase tracking-widest">
            {isUser ? "You" : "ExcelGPT"}
          </span>

          {!isUser && (
            <Badge
              variant="outline"
              // RESPONSIVE: adjusted tracking/padding
              className="bg-primary/10 text-primary border-primary/20 font-black uppercase tracking-widest text-[8px] md:text-[10px] px-1.5 md:px-2 py-0.5"
            >
              Analysis Complete
            </Badge>
          )}

          <span className="text-muted-foreground text-[10px] font-mono tracking-tighter">
            {timestamp}
          </span>
        </div>

        <Card
          // RESPONSIVE: p-4 on mobile, p-6 on desktop. 
          className={`p-4 md:p-6 shadow-xl backdrop-blur-md border overflow-hidden gap-2 ${
            isUser
              ? "bg-muted/10 border-border rounded-2xl rounded-tr-sm text-foreground"
              : "bg-card/40 border-border rounded-2xl rounded-tl-sm w-full relative"
          }`}
        >
          {!isUser && (
            <div className="absolute top-0 left-0 w-full h-px bg-linear-to-r from-transparent via-primary/50 to-transparent"></div>
          )}

          {isUser && attachment && (
            // RESPONSIVE: max-w-full on mobile
            <div className="mb-1 flex items-center gap-3 p-3 bg-card/50 border border-border/50 rounded-xl w-full sm:max-w-sm">
              <div className="p-2.5 bg-green-500/10 rounded-lg text-green-500 border border-green-500/20 shrink-0">
                <FileSpreadsheet size={20} />
              </div>
              <div className="flex flex-col overflow-hidden min-w-0">
                <p className="text-sm font-bold text-foreground truncate">
                  {attachment.name}
                </p>
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-bold">
                  {attachment.type.toUpperCase()} • {formatSize(attachment.size)}
                </p>
              </div>
            </div>
          )}

          {/* TEXT SECTION */}
          <div className="bg-transparent p-1 rounded-sm overflow-x-auto">
            {isUser ? (
              <p className="whitespace-pre-wrap text-sm leading-relaxed wrap-break-word">
                {rawText}
              </p>
            ) : (
              <div className="prose prose-invert prose-p:text-sm prose-p:leading-relaxed prose-code:text-primary prose-code:bg-primary/10 prose-code:px-1 prose-code:rounded prose-pre:bg-muted/50 prose-pre:border prose-pre:border-border max-w-none mb-2 wrap-break-word">
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  components={{
                    code({ inline, className, children, ...props }: any) {
                      const match = /language-(\w+)/.exec(className || "");
                      return !inline && match ? (
                        // RESPONSIVE: Ensure code blocks can scroll horizontally
                        <div className="overflow-x-auto my-4 rounded-lg">
                          <SyntaxHighlighter
                            style={atomDark}
                            language={match[1]}
                            PreTag="div"
                            {...props}
                            customStyle={{ margin: 0, borderRadius: 0 }}
                          >
                            {String(children).replace(/\n$/, "")}
                          </SyntaxHighlighter>
                        </div>
                      ) : (
                        <code className={className} {...props}>
                          {children}
                        </code>
                      );
                    },
                  }}
                >
                  {rawText}
                </ReactMarkdown>
              </div>
            )}
          </div>

          {/* WIDGET SECTION */}
          {!isUser && aiPayload && (
            <div
              ref={widgetRef}
              className="space-y-4 rounded-xl overflow-hidden mt-2 overflow-x-auto"
            >
              {aiPayload.type === "table" && <DataTable data={aiPayload.data} />}
              {aiPayload.type === "chart" && <DataChart data={aiPayload.data} />}
              {aiPayload.type === "kpi" && <KPIGrid data={aiPayload.data} />}
            </div>
          )}

          {!isUser && (
            // RESPONSIVE: flex-wrap allows buttons to stack on very small screens
            <div className="mt-6 flex flex-wrap gap-2">
              {aiPayload?.type === "table" ? (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDownloadTableXlsx}
                  className="h-7 text-[10px] uppercase tracking-widest font-bold text-muted-foreground hover:text-primary hover:border-primary/50 hover:bg-muted/50!"
                >
                  <Download size={14} className="mr-2" />
                  Download .xlsx
                </Button>
              ) : (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDownload}
                  disabled={isDownloading}
                  className="h-7 text-[10px] uppercase tracking-widest font-bold text-muted-foreground hover:text-primary hover:border-primary/50 hover:bg-muted/50!"
                >
                  {isDownloading ? (
                    <Loader2 size={14} className="mr-2 animate-spin" />
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