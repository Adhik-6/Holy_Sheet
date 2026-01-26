"use client"

import { HardDrive, ArrowRight, AlertCircle } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface ModelDownloadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const ModelDownloadDialog = ({ open, onOpenChange }: ModelDownloadDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-106.25 bg-black/95 border-white/10 backdrop-blur-xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <HardDrive className="text-primary" size={24} />
            Offline Model Required
          </DialogTitle>
          <DialogDescription className="text-muted-foreground pt-2">
            You selected the Offline (SLM) mode, but no local model was found on this device.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
            {/* Info Card */}
            <div className="bg-muted/30 p-4 rounded-xl border border-white/5 space-y-3">
                {/* <div className="flex justify-between items-center">
                    <span className="font-bold text-sm text-foreground">Llama-3-8B-Quantized</span>
                    <span className="text-xs bg-orange-500/20 text-orange-400 px-2 py-1 rounded-md border border-orange-500/20">Missing</span>
                </div> */}
                <div className="flex gap-3 items-start">
                    <AlertCircle size={16} className="text-muted-foreground shrink-0 mt-0.5" />
                    <p className="text-xs text-muted-foreground leading-relaxed">
                        To use ExcelGPT without internet, you must first download the model files via the Model Manager.
                    </p>
                </div>
            </div>
        </div>

        <DialogFooter>
            <div className="flex w-full gap-2">
                <Button variant="ghost" onClick={() => onOpenChange(false)} className="flex-1">
                    Cancel
                </Button>
                {/* Navigation Button */}
                <Button asChild className="flex-1 gap-2 font-bold">
                    <Link href="/models" onClick={() => onOpenChange(false)}>
                        Go to Model Manager
                        <ArrowRight size={16} />
                    </Link>
                </Button>
            </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};