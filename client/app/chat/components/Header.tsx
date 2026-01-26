"use client"

import { useState, useEffect } from "react";
import { Capacitor } from "@capacitor/core";
import { User, Cloud, Laptop, Sparkles, Smartphone } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

// 1. IMPORT WLLAMA & CONSTANTS
import { Wllama } from '@wllama/wllama';
import { QWEN_MODEL_URL } from '@/lib/constants';

import { MobileSidebar } from "./MobileSidebar";
import { ModelDownloadDialog } from "./modelDownloadDialog"; 

export type ModelMode = "auto" | "llm" | "slm";

interface HeaderProps {
  isOnline: boolean;
  mode: ModelMode;
  setMode: (mode: ModelMode) => void;
}

export const Header = ({ isOnline, mode, setMode }: HeaderProps) => {
  const [isMobileApp, setIsMobileApp] = useState(false);
  const [isModelReady, setIsModelReady] = useState(false); 
  const [showDownloadDialog, setShowDownloadDialog] = useState(false);

  useEffect(() => {
    const isNative = Capacitor.isNativePlatform();
    setIsMobileApp(isNative);
    
    // 2. REAL CACHE CHECK (Replaces localStorage)
    const checkRealCache = async () => {
       try {
         // Init lightweight instance just for checking DB
         const wllama = new Wllama({
           'single-thread/wllama.wasm': '/wllama/single-thread/wllama.wasm',
           'multi-thread/wllama.wasm': '/wllama/multi-thread/wllama.wasm',
         });

         // Check the exact same key we use for downloading
         const size = await wllama.cacheManager.getSize(QWEN_MODEL_URL);
         
         if (size > 0) {
            console.log("✅ Header detected model in cache!");
            setIsModelReady(true);
         } else {
            console.log("❌ Header: Model missing from cache.");
            setIsModelReady(false);
         }
       } catch (e) {
         console.error("Header cache check failed:", e);
       }
    };

    checkRealCache();
  }, []);

  const handleModeChange = (val: ModelMode) => {
    // Only block standard browser users from "slm" if that's your policy
    // (If you want Desktop Web to use SLM too, remove the !isMobileApp check)
    if (!isMobileApp && (val === 'auto' || val === 'slm')) return;

    // INTERCEPT: If model missing, show dialog instead of switching
    if (val === 'slm' && !isModelReady) {
        setShowDownloadDialog(true);
        return; 
    }

    setMode(val);
  };

  const getActiveIndicator = () => {
    if (mode === "llm") return { color: "bg-green-500", label: "Online (LLM)" };
    if (mode === "slm") return { color: "bg-orange-500", label: "Offline (SLM)" };
    if (isOnline) return { color: "bg-green-500", label: "Auto (Online)" };
    return { color: "bg-orange-500", label: "Auto (Offline)" };
  };
  const indicator = getActiveIndicator();
  
  const RestrictedItem = ({ value, icon: Icon, label, subLabel }: any) => {
    // Logic: If on desktop, disable offline modes (unless you want to allow it)
    const isDisabled = !isMobileApp && value !== 'llm';
    
    const content = (
      <div className={`flex items-center justify-between w-full gap-4 ${isDisabled ? "opacity-50 cursor-not-allowed" : ""}`}>
        <div className="flex items-center gap-2">
          <Icon size={14} className={isDisabled ? "text-muted-foreground" : "text-purple-400"} />
          <span>{label} {subLabel && <span className="text-muted-foreground">{subLabel}</span>}</span>
        </div>
        {isDisabled && <Smartphone size={14} className="text-muted-foreground/50" />}
      </div>
    );
    if (isDisabled) {
      return (
        <Tooltip>
          <TooltipTrigger asChild><div><SelectItem value={value} className="focus:bg-transparent focus:text-muted-foreground">{content}</SelectItem></div></TooltipTrigger>
          <TooltipContent side="left" className="text-xs"><p>Available only on Mobile App</p></TooltipContent>
        </Tooltip>
      );
    }
    return <SelectItem value={value}>{content}</SelectItem>;
  };

  return (
    <header className="h-auto flex items-center justify-between  sm:px-6 border-b border-border bg-background/20 backdrop-blur-md z-20 shrink-0 sticky top-0 min-h-16 pt-[env(safe-area-inset-top)] flex-col">
      
      <ModelDownloadDialog 
        open={showDownloadDialog} 
        onOpenChange={setShowDownloadDialog}
      />

      <div className="flex items-center justify-between px-4 sm:px-6 h-16 w-full">
          <div className="flex items-center gap-2 sm:gap-4 flex-1 min-w-0">
            <MobileSidebar />
            <h2 className="text-muted-foreground text-sm font-medium truncate max-w-[120px] sm:max-w-none">
              <span className="hidden sm:inline">Analysis Session: </span>
              <span className="text-foreground font-bold">Q3 Financial Review</span>
            </h2>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <div>
                <TooltipProvider>
                    <Select value={mode} onValueChange={handleModeChange}>
                        <SelectTrigger className="h-7 gap-2 bg-muted/40 border-border font-mono uppercase tracking-widest text-[10px] px-3 focus:ring-0 focus:ring-offset-0 min-w-[130px] sm:min-w-[140px]">
                            <span className={`size-2 rounded-full ${indicator.color} animate-pulse mr-1`}></span>
                            <SelectValue placeholder="Select Model" />
                        </SelectTrigger>
                        
                        <SelectContent align="end" className="font-mono text-xs bg-muted/95 backdrop-blur-xl border-border">
                            <RestrictedItem value="auto" icon={Sparkles} label="Auto" subLabel={`(${isOnline ? "LLM" : "SLM"})`} />
                            <RestrictedItem value="llm" icon={Cloud} label="LLM (Online)" />
                            <RestrictedItem value="slm" icon={Laptop} label="SLM (Offline)" />
                        </SelectContent>
                    </Select>
                </TooltipProvider>
            </div>

            <Separator orientation="vertical" className="h-6 mx-2 hidden sm:block" />
            <Avatar className="size-7 sm:size-8 border border-primary/40 shrink-0"><AvatarFallback className="bg-primary/20 text-primary"><User size={16} /></AvatarFallback></Avatar>
          </div>
      </div>
    </header>
  )
}