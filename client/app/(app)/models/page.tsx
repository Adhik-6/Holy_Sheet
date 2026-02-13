'use client';

import React, { useEffect, useState } from 'react';
import { 
  Cpu, Cloud, Download, Trash2, CheckCircle2, Loader2, HardDrive, Zap, Smartphone 
} from 'lucide-react';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { Capacitor } from '@capacitor/core';
import NativeLlama from '@/lib/nativeLlama';
import { QWEN_MODEL_URL, QWEN_FILENAME } from '@/lib/constants';

// ✅ IMPORT YOUR EXISTING STORE
import { useSettingsStore } from '@/store/settingsStore';

// ✅ IMPORT TOOLTIP COMPONENTS
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

// --- DATA DEFINITIONS ---

type ModelType = 'SLM' | 'LLM';

interface ModelDef {
  id: string;
  name: string;
  type: ModelType;
  provider: string;
  size?: string;
  params?: string;
  description: string;
  filename?: string; 
  downloadUrl?: string; 
  isCloud?: boolean;
}

const AVAILABLE_MODELS: ModelDef[] = [
  // --- LOCAL SLMs ---
  {
    id: 'qwen-2.5-coder-3b',
    name: 'Qwen 2.5 Coder',
    type: 'SLM',
    provider: 'Alibaba Cloud',
    size: '2.2 GB',
    params: '3 Billion',
    description: 'Best-in-class coding model. Optimized for Python & Data Analysis.',
    filename: QWEN_FILENAME, 
    downloadUrl: QWEN_MODEL_URL
  },
  {
    id: 'phi-3.5-mini',
    name: 'Phi 3.5 Mini',
    type: 'SLM',
    provider: 'Microsoft',
    size: '2.4 GB',
    params: '3.8 Billion',
    description: 'Strong reasoning capabilities. Good alternative if Qwen fails.',
    filename: 'phi-3.5-mini.gguf',
    downloadUrl: 'https://huggingface.co/microsoft/Phi-3.5-mini-instruct-GGUF/resolve/main/Phi-3.5-mini-instruct-Q4_K_M.gguf?download=true'
  },
  // --- CLOUD LLMs ---
  {
    id: 'groq', 
    name: 'Llama 3.3 (Groq)',
    type: 'LLM',
    provider: 'Groq',
    description: 'Extremely fast inference. Great for quick chats.',
    isCloud: true
  },
  {
    id: 'gemini',
    name: 'Gemini 1.5 Flash',
    type: 'LLM',
    provider: 'Google',
    description: 'Ultra-fast cloud model. Requires API Key.',
    isCloud: true
  },
  {
    id: 'openai',
    name: 'GPT-4o Mini',
    type: 'LLM',
    provider: 'OpenAI',
    description: 'Balanced performance and cost.',
    isCloud: true
  }
];

export default function ModelManagerPage() {
  const [downloadedModels, setDownloadedModels] = useState<Record<string, boolean>>({});
  
  // ✅ USE YOUR EXISTING STORE
  const { activeSLM, activeLLM, setActiveSLM, setActiveLLM } = useSettingsStore();

  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);

  // ✅ CHECK PLATFORM (Strictly Capacitor)
  const isMobile = Capacitor.isNativePlatform();

  // 1. Check Native Filesystem on Mount
  useEffect(() => {
    checkDownloadedModels();
  }, [isMobile]);

  const checkModelExists = async (filename: string) => {
    try {
      await Filesystem.stat({
        path: filename,
        directory: Directory.Data
      });
      return true; // File exists
    } catch (error: any) {
      // Flatten the error: If it's just "not found", return false silently.
      if (typeof error?.message === 'string' && error.message.includes('does not exist')) {
        return false; 
      }
      // If it's a real error (like permission denied), log it.
      console.warn(`Filesystem check failed for ${filename}:`, error);
      return false;
    }
  };

  const checkDownloadedModels = async () => {
    if (!isMobile) return; // Skip on desktop

    const statusMap: Record<string, boolean> = {};
    
    for (const model of AVAILABLE_MODELS) {
      if (!model.isCloud && model.filename) {
        // Use the safe helper
        const exists = await checkModelExists(model.filename);
        statusMap[model.id] = exists;
         
        if (exists) {
          console.log(`✅ Ready: ${model.name}`);
        }
      }
    }
    setDownloadedModels(statusMap);
  };

  // 2. Helper: Blob to Base64
  const blobToBase64 = (blob: Blob): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onerror = reject;
      reader.onload = () => resolve(reader.result as string);
      reader.readAsDataURL(blob);
    });
  };

  // 3. Handle Download
  const handleDownload = async (model: ModelDef) => {
      if (!isMobile) {
          alert("Offline models require the mobile app.");
          return;
      }
      if (!model.downloadUrl || !model.filename) return;
      
      setDownloadingId(model.id);
      setProgress(0); 

      try {
        console.log(`⬇️ Native Stream Started: ${model.name}`);
        
        // 1. Setup Progress Listener
        const listener = await NativeLlama.addListener('downloadProgress', (info: any) => {
            setProgress(info.progress);
        });

        // 2. Start Download (Blocks until finished)
        await NativeLlama.downloadModel({
          url: model.downloadUrl,
          filename: model.filename
        });

        // 3. Cleanup
        listener.remove();

        console.log("✅ Download Complete!");
        setDownloadedModels(prev => ({ ...prev, [model.id]: true }));
        setActiveSLM(model.id);
        alert(`${model.name} is ready!`);
        
      } catch (error: any) {
        console.error("Native download failed:", error);
        alert(`Download failed: ${error.message}`);
      } finally {
        setDownloadingId(null);
        setProgress(0);
      }
  };

  // 4. Handle Delete
  const handleDelete = async (model: ModelDef) => {
    if (!model.filename) return;
    const confirm = window.confirm(`Delete ${model.name} from device storage?`);
    if (confirm) {
      try {
        await Filesystem.deleteFile({
          path: model.filename,
          directory: Directory.Data
        });
        setDownloadedModels(prev => ({ ...prev, [model.id]: false }));
        // Reset active SLM if deleted
        if (activeSLM === model.id) setActiveSLM('');
        alert("Model deleted.");
      } catch (e) {
        console.error("Delete failed", e);
      }
    }
  };

  // ✅ HELPER: Check if a model is active
  const isModelActive = (model: ModelDef) => {
    if (model.isCloud) return activeLLM === model.id;
    return activeSLM === model.id;
  };

  // ✅ HELPER: Set Active
  const handleActivate = (model: ModelDef) => {
    if (model.isCloud) {
        setActiveLLM(model.id);
    } else {
        setActiveSLM(model.id);
    }
  };

  return (
    <div className="p-6 lg:p-10 space-y-8 max-w-6xl mx-auto pb-24 overflow-y-auto">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <Cpu className="text-primary" size={32} />
          Model Manager
        </h1>
        <p className="text-muted-foreground">
          Manage your AI engines. Select a model to make it the default for that mode.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* --- SECTION: LOCAL SLMS --- */}
        <section className="space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <HardDrive className="text-primary" size={20} />
            <h2 className="text-xl font-semibold">On-Device Models (Native)</h2>
          </div>
          {!isMobile && (
             <div className="text-xs bg-amber-500/10 text-amber-600 p-2 rounded-lg flex gap-2 items-center border border-amber-500/20 mb-2">
                <Smartphone size={14} />
                <span>Offline models are only available on the Mobile App.</span>
             </div>
          )}
          
          <div className="grid gap-4">
            {AVAILABLE_MODELS.filter(m => !m.isCloud).map(model => (
              <div key={model.id} className={`relative overflow-hidden rounded-xl border transition-all ${isModelActive(model) ? 'border-primary bg-primary/5 shadow-md' : 'border-border bg-card'}`}>
                
                {/* Progress Overlay */}
                {downloadingId === model.id && (
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
                        {isModelActive(model) && (
                          <span className="text-[10px] bg-primary text-primary-foreground px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
                            Active
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground font-mono mt-1">{model.params} Params • {model.size}</p>
                    </div>
                    {/* Status Badge */}
                    {downloadedModels[model.id] ? (
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
                  
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {model.description}
                  </p>

                  <div className="pt-2 flex gap-3 mt-auto">
                    {/* ACTIVATE BUTTON */}
                    <button 
                      onClick={() => handleActivate(model)}
                      disabled={!downloadedModels[model.id] || !isMobile}
                      className={`flex-1 py-2 rounded-lg text-sm font-bold transition-colors ${
                        isModelActive(model)
                          ? 'bg-primary text-primary-foreground cursor-default'
                          : downloadedModels[model.id] && isMobile
                            ? 'bg-secondary hover:bg-secondary/80 text-secondary-foreground'
                            : 'bg-muted text-muted-foreground cursor-not-allowed opacity-50'
                      }`}
                    >
                      {isModelActive(model) ? 'Current SLM' : 'Select SLM'}
                    </button>

                    {/* ACTIONS (Download/Delete) */}
                    {downloadedModels[model.id] ? (
                      <button 
                        onClick={() => handleDelete(model)}
                        className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                        title="Delete Model"
                      >
                        <Trash2 size={20} />
                      </button>
                    ) : (
                       // 🛡️ DESKTOP GUARD: Tooltip + Disabled Button
                       !isMobile ? (
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                {/* Wrap in div because disabled buttons don't fire events */}
                                <div className="cursor-not-allowed">
                                  <button disabled className="p-2 text-muted-foreground bg-muted/50 rounded-lg opacity-50">
                                    <Download size={20} />
                                  </button>
                                </div>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Available only on Mobile App</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                       ) : (
                          // ✅ MOBILE: Normal Download Button
                          <button 
                            onClick={() => handleDownload(model)}
                            disabled={!!downloadingId}
                            className="p-2 text-primary hover:bg-primary/10 rounded-lg transition-colors"
                            title="Download Model"
                          >
                            <Download size={20} />
                          </button>
                       )
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* --- SECTION: CLOUD LLMS --- */}
        <section className="space-y-4">
           <div className="flex items-center gap-2 mb-2">
            <Cloud className="text-accent" size={20} />
            <h2 className="text-xl font-semibold">Cloud Models (LLM)</h2>
          </div>
          <div className="grid gap-4">
            {AVAILABLE_MODELS.filter(m => m.isCloud).map(model => (
              <div key={model.id} className={`p-5 rounded-xl border transition-all flex flex-col gap-3 ${isModelActive(model) ? 'border-primary bg-primary/5' : 'border-border bg-card/50 hover:border-accent/30'}`}>
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center gap-2">
                         <h3 className="font-bold text-lg">{model.name}</h3>
                         {model.provider === 'Groq' && <Zap size={14} className="text-orange-500 fill-orange-500" />}
                    </div>
                    <p className="text-xs text-accent font-mono mt-1">{model.provider}</p>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">{model.description}</p>
                
                {/* Cloud Activation */}
                <div className="pt-2">
                    <button 
                      onClick={() => handleActivate(model)}
                      className={`w-full py-2 rounded-lg text-sm font-bold transition-colors ${
                        isModelActive(model)
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted text-muted-foreground hover:bg-muted/80'
                      }`}
                    >
                      {isModelActive(model) ? 'Current Cloud Model' : 'Use this Model'}
                    </button>
                </div>
              </div>
            ))}
          </div>
        </section>

      </div>
    </div>
  );
}