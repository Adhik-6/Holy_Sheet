"use client"

import { motion } from "framer-motion";
import { Bot, User, Download, CodeIcon, FileSpreadsheet } from "lucide-react";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { atomDark } from 'react-syntax-highlighter/dist/esm/styles/prism';

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

interface ChatMessageProps extends Message {
  isLastMsg?: boolean; // Made optional to prevent errors if not passed
}

export const ChatMessage = ({ role, content, timestamp, attachment, isLastMsg }: ChatMessageProps) => {
  const isUser = role === 'user';
  const rawText = isUser ? (content as string) : (content as AIResponse).summary;
  const aiPayload = !isUser ? (content as AIResponse) : null;

  // Helper to format bytes
  const formatSize = (bytes: number) => {
      if (!bytes) return '0 B';
      const k = 1024;
      const sizes = ['B', 'KB', 'MB', 'GB'];
      const i = Math.floor(Math.log(bytes) / Math.log(k));
      return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex w-full gap-4 ${isUser ? 'justify-end' : ''} ${isLastMsg ? 'mb-32' : ''}`} // Corrected 'mb-32' for spacing
    >
      {/* ASSISTANT AVATAR */}
      {!isUser && (
        <div className="flex flex-col items-center gap-2">
          <Avatar className="size-10 border border-primary/30 shadow-lg">
              <AvatarFallback className="bg-primary text-primary-foreground">
                  <Bot size={20} />
              </AvatarFallback>
          </Avatar>
          <div className="h-full w-0.5 bg-linear-to-b from-primary/30 to-transparent rounded-full" />
        </div>
      )}
      
      <div className={`max-w-4xl flex flex-col grow gap-2 ${isUser ? 'items-end' : ''}`}>
        {/* MESSAGE META HEADER */}
        <div className={`flex items-center gap-2 ${isUser ? 'flex-row-reverse' : ''}`}>
          <span className="text-foreground font-black text-xs uppercase tracking-widest">
            {isUser ? 'You' : 'ExcelGPT'}
          </span>
          {!isUser && (
              <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 font-black uppercase tracking-widest text-[10px] px-2 py-0.5">
                  Analysis Complete
              </Badge>
          )}
          <span className="text-muted-foreground text-[10px] font-mono tracking-tighter">{timestamp}</span>
        </div>
        
        {/* MESSAGE CARD */}
        <Card className={`p-6 shadow-xl backdrop-blur-md border overflow-hidden gap-2 ${isUser ? 'bg-muted/10 border-border rounded-2xl rounded-tr-sm text-foreground' : 'bg-card/40 border-border rounded-2xl rounded-tl-sm w-full relative'}`}>
          {!isUser && <div className="absolute top-0 left-0 w-full h-px bg-linear-to-r from-transparent via-primary/50 to-transparent"></div>}
          
          {/* --- NEW: USER ATTACHMENT DISPLAY --- */}
          {isUser && attachment && (
            <div className="mb-1 flex items-center gap-3 p-3 bg-card/50 border border-border/50 rounded-xl max-w-sm">
                <div className="p-2.5 bg-green-500/10 rounded-lg text-green-500 border border-green-500/20">
                    <FileSpreadsheet size={20} />
                </div>
                <div className="flex flex-col overflow-hidden">
                    <p className="text-sm font-bold text-foreground truncate">{attachment.name}</p>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-bold">
                        {attachment.type.toUpperCase()} • {formatSize(attachment.size)}
                    </p>
                </div>
            </div>
          )}

          {/* A. TEXT / MARKDOWN CONTENT */}
          {isUser ? (
             <p className="whitespace-pre-wrap text-sm leading-relaxed">{rawText}</p> 
          ) : (
              <div className="prose prose-invert prose-p:text-sm prose-p:leading-relaxed prose-code:text-primary prose-code:bg-primary/10 prose-code:px-1 prose-code:rounded prose-pre:bg-muted/50 prose-pre:border prose-pre:border-border max-w-none mb-4">
                  <ReactMarkdown 
                    remarkPlugins={[remarkGfm]}
                    components={{
                        code({ node, inline, className, children, ...props }: any) {
                        const match = /language-(\w+)/.exec(className || '');
                        return !inline && match ? (
                            <SyntaxHighlighter
                            style={atomDark}
                            language={match[1]}
                            PreTag="div"
                            {...props}
                            >
                            {String(children).replace(/\n$/, '')}
                            </SyntaxHighlighter>
                        ) : (
                            <code className={className} {...props}>
                            {children}
                            </code>
                        );
                        }
                    }}
                  >
                  {rawText}
                  </ReactMarkdown>
              </div>
          )}

          {/* B. DYNAMIC WIDGETS (Assistant Only) */}
          {!isUser && aiPayload && (
            <div className="space-y-4">
                {aiPayload.type === 'table' && <DataTable data={aiPayload.data} />}
                {aiPayload.type === 'chart' && <DataChart data={aiPayload.data} />}
                {aiPayload.type === 'kpi' && <KPIGrid data={aiPayload.data} />}
            </div>
          )}

          {/* C. FOOTER ACTIONS */}
          {!isUser && (
            <div className="mt-6 flex gap-2">
              <Button variant="outline" size="sm" className="h-7 text-[10px] uppercase tracking-widest font-bold text-muted-foreground hover:text-primary hover:border-primary/50 hover:bg-muted/50">
                  <Download size={14} className="mr-2" /> Download Report
              </Button>
              <Button variant="outline" size="sm" className="h-7 text-[10px] uppercase tracking-widest font-bold text-muted-foreground hover:text-primary hover:border-primary/50 hover:bg-muted/50">
                  <CodeIcon size={14} className="mr-2" /> View Script
              </Button>
            </div>
          )}
        </Card>
      </div>

      {/* USER AVATAR */}
      {isUser && (
        <Avatar className="size-8 border border-accent/40 self-end mb-1">
          <AvatarFallback className="bg-accent/20 text-accent">
              <User size={16} />
          </AvatarFallback>
        </Avatar>
      )}
    </motion.div>
  );
}