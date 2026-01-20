"use client"

import { useState } from "react";
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { atomDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { CodeIcon, Copy, Check } from "lucide-react"; 
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"; 
import { Button } from "@/components/ui/button";


export const ScriptDialog = ({ code }: { code: string }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="h-7 text-[10px] uppercase tracking-widest font-bold text-muted-foreground hover:text-primary hover:border-primary/50 hover:bg-muted/50!">
          <CodeIcon size={14} className="mr-2" /> View Script
        </Button>
      </DialogTrigger>
      {/* RESPONSIVE: w-[95vw] ensures it fits mobile screens, sm:max-w-5xl handles desktop */}
      <DialogContent className="w-[95vw] sm:max-w-5xl bg-black/95 border-white/10 backdrop-blur-xl text-foreground shadow-2xl p-4 md:p-6">
        <DialogHeader className="flex flex-row items-center justify-between border-b border-white/10 pb-4">
          <DialogTitle className="text-lg font-bold tracking-tight text-primary">Generated Python Script</DialogTitle>
        </DialogHeader>
        
        <div className="relative mt-4 rounded-xl overflow-hidden border border-white/10 group">
          <Button size="icon" variant="ghost" className="absolute top-2 right-2 h-8 w-8 bg-black/50 hover:bg-primary/20 text-muted-foreground hover:text-primary transition-colors z-10 border border-white/5" onClick={handleCopy}>
            {copied ? <Check size={14} className="text-green-500" /> : <Copy size={14} />}
          </Button>

          {/* RESPONSIVE: max-h-[50vh] on mobile to avoid overflow issues, 60vh on desktop */}
          <div className="max-h-[50vh] md:max-h-[60vh] overflow-y-auto custom-scrollbar">
            <SyntaxHighlighter 
                language="python" 
                style={atomDark} 
                customStyle={{ margin: 0, padding: '1.5rem', background: 'rgba(0,0,0,0.5)', fontSize: '0.85rem' }} 
                showLineNumbers={true} 
                wrapLines={true}
            >
              {code}
            </SyntaxHighlighter>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};