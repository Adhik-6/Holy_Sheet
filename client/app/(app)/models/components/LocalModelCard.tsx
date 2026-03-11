import React from 'react';
import { Download, Trash2, CheckCircle2, Loader2 } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

export default function LocalModelCard({ 
  model, isActive, isDownloaded, isDownloading, progress, isMobile, onActivate, onDownload, onDelete 
}: any) {
  return (
    <div className={`relative overflow-hidden rounded-xl border transition-all ${isActive ? 'border-primary bg-primary/5 shadow-md' : 'border-border bg-card'}`}>
      
      {/* Progress Overlay */}
      {isDownloading && (
        <div className="absolute inset-0 bg-background/90 z-20 flex flex-col items-center justify-center gap-2 backdrop-blur-sm">
          <Loader2 className="animate-spin text-primary" size={30} />
          <p className="font-mono text-sm font-bold">
             {progress < 100 ? `${progress}% Downloading` : 'Saving to Disk...'}
          </p>
          <div className="w-1/2 h-1 bg-muted rounded-full overflow-hidden">
              <div className="h-full bg-primary transition-all duration-300" style={{ width: `${progress}%` }} />
          </div>
        </div>
      )}

      <div className="p-5 flex flex-col gap-3">
        <div className="flex justify-between items-start">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-lg">{model.name}</h3>
              {isActive && (
                <span className="text-[10px] bg-primary text-primary-foreground px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
                  Active
                </span>
              )}
            </div>
            {/* 🔥 Added the quantization stat here! */}
            <p className="text-xs text-muted-foreground font-mono mt-1">
              {model.params} • {model.size} • {model.quant}
            </p>
          </div>
          
          {/* Status Badge */}
          {isDownloaded ? (
            <div className="flex items-center gap-1.5 text-green-600 bg-green-500/10 px-2 py-1 rounded-md">
              <CheckCircle2 size={14} />
              <span className="text-xs font-bold">Ready</span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 text-muted-foreground bg-muted px-2 py-1 rounded-md">
              <Download size={14} />
              <span className="text-xs font-bold">Not Downloaded</span>
            </div>
          )}
        </div>
        
        <p className="text-sm text-muted-foreground leading-relaxed">{model.description}</p>

        <div className="pt-2 flex gap-3 mt-auto">
          {/* ACTIVATE BUTTON */}
          <button 
            onClick={() => onActivate(model)}
            disabled={!isDownloaded || !isMobile}
            className={`flex-1 py-2 rounded-lg text-sm font-bold transition-colors ${
              isActive ? 'bg-primary text-primary-foreground cursor-default' : 
              isDownloaded && isMobile ? 'bg-secondary hover:bg-secondary/80 text-secondary-foreground' : 
              'bg-muted text-muted-foreground cursor-not-allowed opacity-50'
            }`}
          >
            {isActive ? 'Current SLM' : 'Select SLM'}
          </button>

          {/* ACTIONS (Download/Delete) */}
          {isDownloaded ? (
            <button onClick={() => onDelete(model)} className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg" title="Delete Model">
              <Trash2 size={20} />
            </button>
          ) : (
             !isMobile ? (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="cursor-not-allowed">
                        <button disabled className="p-2 text-muted-foreground bg-muted/50 rounded-lg opacity-50"><Download size={20} /></button>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent><p>Available only on Mobile App</p></TooltipContent>
                  </Tooltip>
                </TooltipProvider>
             ) : (
                <button onClick={() => onDownload(model)} disabled={isDownloading} className="p-2 text-primary hover:bg-primary/10 rounded-lg" title="Download Model">
                  <Download size={20} />
                </button>
             )
          )}
        </div>
      </div>
    </div>
  );
}