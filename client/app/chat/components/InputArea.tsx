"use client"

import React, { useRef, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Paperclip, Mic, ArrowUp, X, FileSpreadsheet } from "lucide-react";

interface InputAreaProps {
  // CHANGED: Handler now accepts an optional file
  handleSend: (file?: File | null) => void;
  input: string;
  setInput: (value: string) => void;
  disabled?: boolean;
}

export const InputArea = ({ handleSend, input, setInput, disabled }: InputAreaProps) => {
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    
    // Local state for the "Staged" file
    const [selectedFile, setSelectedFile] = useState<File | null>(null);

    // Auto-resize logic
    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto'; 
            textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
        }
    }, [input]);

    // WRAPPER: Handles clearing state after sending
    const onSend = () => {
        if ((input.trim() || selectedFile) && !disabled) {
            handleSend(selectedFile); // Pass the file up
            setSelectedFile(null);    // Clear local file preview immediately
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault(); 
            onSend();
        }
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setSelectedFile(e.target.files[0]);
            e.target.value = "";
        }
    };

    const formatFileSize = (bytes: number) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
    };

    return (
        // RESPONSIVE: Reduced padding on mobile (p-2) vs desktop (p-4 md:px-8)
        <div className="absolute bottom-0 left-0 right-0 p-2 sm:p-4 md:px-8 md:pb-6 z-30 pointer-events-none">
          <div className="max-w-4xl mx-auto relative group pointer-events-auto">
            {/* Glow Effect */}
            <div className="absolute -inset-0.5 bg-linear-to-r from-primary/30 to-accent/30 rounded-2xl blur opacity-30 group-hover:opacity-60 transition duration-500"></div>
            
            <div className="relative flex flex-col gap-2 bg-card/60 backdrop-blur-md border border-border rounded-2xl p-2 shadow-2xl">
              
              {/* 1. STAGED FILE PREVIEW AREA (Compact & Stackable) */}
              {selectedFile && (
                  <div className="flex flex-wrap gap-2 mx-2 mt-2">
                      <div className="inline-flex items-center gap-3 p-2 pr-3 bg-white/5 border border-white/10 rounded-xl relative group/file animate-in fade-in slide-in-from-bottom-2 duration-200 max-w-full">
                          <div className="p-2 bg-green-500/20 rounded-lg text-green-400 shrink-0">
                              <FileSpreadsheet size={18} />
                          </div>
                          
                          <div className="flex flex-col min-w-0">
                              {/* RESPONSIVE: Truncate longer filenames on mobile */}
                              <p className="text-xs font-medium text-foreground truncate max-w-35 sm:max-w-35">
                                  {selectedFile.name}
                              </p>
                              <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-bold">
                                  {formatFileSize(selectedFile.size)}
                              </p>
                          </div>
                          
                          {/* Remove Button */}
                          <button 
                            onClick={() => setSelectedFile(null)}
                            className="ml-2 p-1 hover:bg-red-500/20 hover:text-red-400 text-muted-foreground rounded-md transition-colors shrink-0"
                          >
                              <X size={14} />
                          </button>
                      </div>
                  </div>
              )}

              {/* 2. INPUT ROW */}
              <div className="flex items-end gap-2">
                {/* Hidden File Input */}
                <input 
                    type="file" 
                    ref={fileInputRef}
                    className="hidden"
                    onChange={handleFileSelect}
                    accept=".csv,.xlsx,.xls,.json"
                />
                
                <Button 
                    variant="ghost" 
                    size="icon" 
                    className="text-muted-foreground hover:bg-muted/20 rounded-xl shrink-0 mb-0.5"
                    onClick={() => fileInputRef.current?.click()}
                >
                    <Paperclip size={20} />
                </Button>
                
                <textarea 
                    ref={textareaRef}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    rows={1}
                    // RESPONSIVE: adjusted placeholder font size if needed
                    className="flex-1 min-h-10 max-h-37.5 md:max-h-50 w-full bg-transparent border-0 focus:ring-0 resize-none text-[15px] font-medium placeholder:text-muted-foreground py-2.5 custom-scrollbar focus-visible:outline-none"
                    placeholder="Ask ExcelGPT to analyze..."
                    disabled={disabled}
                />
                
                <div className="flex items-center gap-1 shrink-0 mb-0.5">
                    {/* RESPONSIVE: Hide Mic button on very small screens to save space */}
                    <Button variant="ghost" size="icon" className="hidden sm:inline-flex text-muted-foreground hover:bg-muted/20 rounded-xl">
                        <Mic size={20} />
                    </Button>
                    
                    <Button 
                        onClick={onSend}
                        disabled={(!input.trim() && !selectedFile) || disabled}
                        size="icon"
                        className="ml-1 size-10 bg-linear-to-br from-primary to-accent rounded-xl text-primary-foreground shadow-lg hover:shadow-primary/40 hover:scale-105 transition-all disabled:opacity-50"
                    >
                        <ArrowUp size={20} />
                    </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
    )
}