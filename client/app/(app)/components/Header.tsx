"use client"

import { useState, useEffect } from "react";
import { Capacitor } from "@capacitor/core";
import { User, Cloud, Laptop, Sparkles, Smartphone, Check } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { 
  Tooltip, 
  TooltipContent, 
  TooltipProvider, 
  TooltipTrigger 
} from "@/components/ui/tooltip";

// 1. IMPORT STORE & HOOKS
import { useSettingsStore, ModelMode } from "@/store/settingsStore";
import { useNetworkStatus } from "@/hooks/networkStatusHook"; // Ensure this path is correct
import { checkNativeModelExists } from '@/lib/nativeModelManager';

import { MobileSidebar } from "./MobileSidebar";
import { ModelDownloadDialog } from "../chat/components/modelDownloadDialog"; 

// NO PROPS NEEDED! The component is now self-contained.
export const Header = () => {
  // 2. USE GLOBAL STORE
  const { mode, setMode, activeSLM } = useSettingsStore();
  const isOnline = useNetworkStatus();

  const [isMobileApp, setIsMobileApp] = useState(false);
  const [isModelReady, setIsModelReady] = useState(false); 
  const [showDownloadDialog, setShowDownloadDialog] = useState(false);

  useEffect(() => {
    const isNative = Capacitor.isNativePlatform();
    setIsMobileApp(isNative);
    
    // Native Cache Check
    const checkRealCache = async () => {
       if (isNative) {
         const exists = await checkNativeModelExists();
         setIsModelReady(exists);
         console.log(exists ? "✅ Native model found." : "❌ Native model missing.");
       } else {
         // If on Web, we assume not ready (or implement web-cache check)
         setIsModelReady(false);
       }
    };

    checkRealCache();
  }, [activeSLM]);

  const handleModeChange = (val: string) => {
    // Prevent switching if disabled (Desktop check)
    if (!isMobileApp && val !== 'llm' && val !== 'auto') return;

    // Intercept SLM selection if model is missing
    if (val === 'slm' && !isModelReady) {
        setShowDownloadDialog(true);
        return; 
    }
    
    // Update Global Store
    setMode(val as ModelMode);
  };

  const getActiveIndicator = () => {
    if (mode === "llm") return { color: "bg-green-500" };
    if (mode === "slm") return { color: "bg-orange-500" };
    return { color: isOnline ? "bg-green-500" : "bg-orange-500" };
  };
  const indicator = getActiveIndicator();
  
  // 🎨 DROPDOWN ITEM COMPONENT (Unchanged logic, just cleanup)
  const RestrictedItem = ({ value, icon: Icon, label, subLabel }: any) => {
    const isDisabled = !isMobileApp && value !== 'llm';
    
    const content = (
      <div className={`flex items-center justify-between w-full gap-4 ${isDisabled ? "opacity-50" : ""}`}>
        <div className="flex items-center gap-2">
          <Icon size={14} className={isDisabled ? "text-muted-foreground" : "text-primary"} />
          <span className={isDisabled ? "text-muted-foreground" : "text-foreground font-medium"}>
            {label} 
            {subLabel && <span className="text-muted-foreground ml-1 font-normal text-[10px]">{subLabel}</span>}
          </span>
        </div>
        {isDisabled && <Smartphone size={14} className="text-muted-foreground/40" />}
      </div>
    );

    if (isDisabled) {
      return (
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="w-full">
              <SelectItem value={value} disabled className="cursor-not-allowed">
                {content}
              </SelectItem>
            </div>
          </TooltipTrigger>
          <TooltipContent side="left" className="text-xs bg-foreground text-background">
            <p>Available only on Mobile App</p>
          </TooltipContent>
        </Tooltip>
      );
    }
    
    return (
      <SelectItem 
        value={value} 
        className="cursor-pointer focus:bg-muted focus:text-foreground my-1"
      >
        {content}
      </SelectItem>
    );
  };

  return (
    <header className="h-auto flex items-center justify-between sm:px-6 border-b border-border bg-background/20 backdrop-blur-md z-20 shrink-0 sticky top-0 min-h-16 pt-[env(safe-area-inset-top)] flex-col">
      
      <ModelDownloadDialog 
        open={showDownloadDialog} 
        onOpenChange={setShowDownloadDialog}
      />

      <div className="flex items-center justify-between px-4 sm:px-6 h-16 w-full">
          <div className="flex items-center gap-2 sm:gap-4 flex-1 min-w-0">
            {/* Pass isOnline if needed, or let Sidebar use the hook internally too */}
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
                        <SelectTrigger className="h-8 gap-2 bg-muted/50 border-border/60 font-mono uppercase tracking-widest text-[10px] px-3 focus:ring-1 focus:ring-primary/20 min-w-[140px]">
                            <span className={`size-2 rounded-full ${indicator.color} animate-pulse mr-1 shadow-[0_0_8px_rgba(0,0,0,0.2)]`}></span>
                            <SelectValue placeholder="Select Model" />
                        </SelectTrigger>
                        
                        <SelectContent align="end" className="font-sans text-xs bg-background/95 backdrop-blur-xl border-border shadow-xl min-w-[180px] mt-8">
                            <RestrictedItem value="auto" icon={Sparkles} label="Auto" subLabel={`(${isOnline ? "Cloud" : "Local"})`} />
                            <RestrictedItem value="llm" icon={Cloud} label="Cloud LLM" />
                            <RestrictedItem value="slm" icon={Laptop} label="Local SLM" />
                        </SelectContent>
                    </Select>
                 </TooltipProvider>
            </div>

            <Separator orientation="vertical" className="h-6 mx-2 hidden sm:block" />
            <Avatar className="size-7 sm:size-8 border border-primary/20 shrink-0">
              <AvatarFallback className="bg-primary/10 text-primary font-bold"><User size={16} /></AvatarFallback>
            </Avatar>
          </div>
      </div>
    </header>
  )
}