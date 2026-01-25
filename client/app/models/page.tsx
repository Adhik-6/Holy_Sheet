'use client';

import React, { useEffect, useState } from 'react';
import { 
  Cpu, 
  Cloud, 
  Download, 
  Trash2, 
  CheckCircle2, 
  AlertTriangle, 
  Smartphone, 
  Loader2,
  HardDrive
} from 'lucide-react';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { Capacitor } from '@capacitor/core';
import { Wllama } from '@wllama/wllama';

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
  filename?: string; // For SLMs
  downloadUrl?: string; // For SLMs
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
    description: 'Best-in-class coding model for mobile devices. Optimized for Python & Data Analysis.',
    filename: 'qwen2.5-coder-3b.gguf',
    downloadUrl: 'https://huggingface.co/Adhik6495/Qwen2.5-Coder-3B-Instruct/resolve/main/qwen2.5-coder-3b.gguf?download=true'
  },
  {
    id: 'phi-3.5-mini',
    name: 'Phi 3.5 Mini',
    type: 'SLM',
    provider: 'Microsoft',
    size: '2.4 GB',
    params: '3.8 Billion',
    description: 'Strong reasoning capabilities and long context window. Good alternative if Qwen fails.',
    filename: 'phi-3.5-mini-instruct.gguf',
    downloadUrl: 'https://huggingface.co/microsoft/Phi-3.5-mini-instruct-GGUF/resolve/main/Phi-3.5-mini-instruct-Q4_K_M.gguf?download=true'
  },
  // --- CLOUD LLMs ---
  {
    id: 'gemini-1.5-flash',
    name: 'Gemini 1.5 Flash',
    type: 'LLM',
    provider: 'Google',
    description: 'Ultra-fast cloud model. Requires API Key. Best for general reasoning.',
    isCloud: true
  },
  {
    id: 'gpt-4o-mini',
    name: 'GPT-4o Mini',
    type: 'LLM',
    provider: 'OpenAI',
    description: 'Balanced performance and cost. Standard choice for complex tasks.',
    isCloud: true
  },
  {
    id: 'Groq-LLM-2.5B',
    name: 'Groq LLM 2.5B',
    type: 'LLM',
    provider: 'Groq',
    description: 'High-speed inference optimized for Groq hardware. Great for low-latency applications.',
    isCloud: true
  }
];

// --- COMPONENT ---

export default function ModelManagerPage() {
  const [downloadedModels, setDownloadedModels] = useState<Record<string, boolean>>({});
  const [activeModel, setActiveModel] = useState<string>('qwen-2.5-coder-3b'); // Default
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const isMobile = Capacitor.isNativePlatform();

  // 1. Check Filesystem on Mount
  useEffect(() => {
    checkDownloadedModels();
  }, []);

  const checkDownloadedModels = async () => {
    if (!isMobile) return; // Skip checks on web

    const statusMap: Record<string, boolean> = {};
    
    for (const model of AVAILABLE_MODELS) {
      if (!model.isCloud && model.filename) {
        try {
          await Filesystem.stat({
            path: model.filename,
            directory: Directory.Data
          });
          statusMap[model.id] = true;
        } catch (e) {
          statusMap[model.id] = false;
        }
      }
    }
    setDownloadedModels(statusMap);
  };

  // 2. Handle Download (Using Wllama to cache)
  const handleDownload = async (model: ModelDef) => {
    if (!model.downloadUrl || !model.filename) return;
    
    setDownloadingId(model.id);
    setProgress(0);

    try {
      // Initialize temp Wllama just for downloading
        const wllama = new Wllama({
            'single-thread/wllama.wasm': '/wllama/single-thread/wllama.wasm',
            'multi-thread/wllama.wasm': '/wllama/multi-thread/wllama.wasm',
        });

      console.log(`⬇️ Starting download for ${model.name}...`);
      
      await wllama.loadModelFromUrl(model.downloadUrl, {
        n_ctx: 512, // Minimal context for download-check
        progressCallback: ({ loaded, total }) => {
          const p = Math.round((loaded / total) * 100);
          setProgress(p);
        }
      });

      // Verification success
      setDownloadedModels(prev => ({ ...prev, [model.id]: true }));
      alert(`${model.name} downloaded successfully!`);
      
    } catch (error) {
      console.error("Download failed:", error);
      alert("Download failed. Check internet connection.");
    } finally {
      setDownloadingId(null);
      setProgress(0);
    }
  };

  // 3. Handle Delete
// inside app/models/page.tsx

    const handleDelete = async (model: ModelDef) => {
    if (!model.downloadUrl) return;
    const confirm = window.confirm(`Delete ${model.name}?`);
    
    if (confirm) {
        try {
        // Initialize a temporary wllama instance to access CacheManager
        const wllama = new Wllama({
            'single-thread/wllama.wasm': '/wllama/single-thread/wllama.wasm',
            'multi-thread/wllama.wasm': '/wllama/multi-thread/wllama.wasm',
        });
        
        // CORRECT WAY: Delete from Wllama Cache
        await wllama.cacheManager.delete(model.downloadUrl);
        
        setDownloadedModels(prev => ({ ...prev, [model.id]: false }));
        alert("Model deleted from cache.");
        } catch (e) {
        console.error("Delete failed", e);
        }
    }
    };

  return (
    <div className="p-6 lg:p-10 space-y-8 max-w-6xl mx-auto pb-24">
      
      {/* HEADER */}
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <Cpu className="text-primary" size={32} />
          Model Manager
        </h1>
        <p className="text-muted-foreground">
          Manage your AI Intelligence engines. Switch between offline privacy-focused models (SLMs) and powerful cloud models (LLMs).
        </p>
      </div>

      {/* MOBILE WARNING BANNER */}
      {!isMobile && (
        <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 flex items-start gap-3">
          <Smartphone className="text-amber-500 shrink-0 mt-1" />
          <div>
            <h4 className="font-bold text-amber-600">Web Browser Detected</h4>
            <p className="text-sm text-amber-600/80">
              Offline SLMs (Small Language Models) are optimized for the Mobile App environment. 
              On the web, models will run slower and may require re-downloading if you clear browser cache. 
              <br/><strong>For the best experience, use the ExcelGPT Android/iOS App.</strong>
            </p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* --- SECTION: LOCAL SLMS --- */}
        <section className="space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <HardDrive className="text-primary" size={20} />
            <h2 className="text-xl font-semibold">On-Device Models (SLM)</h2>
          </div>
          <p className="text-sm text-muted-foreground mb-4">
            These models run 100% offline on your phone's CPU. Zero data leaves your device.
          </p>

          <div className="grid gap-4">
            {AVAILABLE_MODELS.filter(m => !m.isCloud).map(model => (
              <div key={model.id} className={`relative overflow-hidden rounded-xl border transition-all ${activeModel === model.id ? 'border-primary bg-primary/5 shadow-md' : 'border-border bg-card'}`}>
                
                {/* Progress Bar Overlay */}
                {downloadingId === model.id && (
                  <div className="absolute inset-0 bg-background/80 z-20 flex flex-col items-center justify-center gap-2 backdrop-blur-sm">
                    <Loader2 className="animate-spin text-primary" size={30} />
                    <p className="font-mono text-sm font-bold">{progress}% Downloading...</p>
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
                        {activeModel === model.id && (
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
                      onClick={() => setActiveModel(model.id)}
                      disabled={!downloadedModels[model.id]}
                      className={`flex-1 py-2 rounded-lg text-sm font-bold transition-colors ${
                        activeModel === model.id 
                          ? 'bg-primary text-primary-foreground cursor-default'
                          : downloadedModels[model.id] 
                            ? 'bg-secondary hover:bg-secondary/80 text-secondary-foreground'
                            : 'bg-muted text-muted-foreground cursor-not-allowed opacity-50'
                      }`}
                    >
                      {activeModel === model.id ? 'Currently Active' : 'Select Model'}
                    </button>

                    {/* DOWNLOAD / DELETE ACTIONS */}
                    {downloadedModels[model.id] ? (
                      <button 
                        onClick={() => handleDelete(model)}
                        className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                        title="Delete Model"
                      >
                        <Trash2 size={20} />
                      </button>
                    ) : (
                      <button 
                        onClick={() => handleDownload(model)}
                        disabled={!!downloadingId}
                        className="p-2 text-primary hover:bg-primary/10 rounded-lg transition-colors"
                        title="Download Model"
                      >
                        <Download size={20} />
                      </button>
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
          <p className="text-sm text-muted-foreground mb-4">
            Powerful models running on remote servers. Requires internet connection and API keys.
          </p>

          <div className="grid gap-4">
            {AVAILABLE_MODELS.filter(m => m.isCloud).map(model => (
              <div key={model.id} className="p-5 rounded-xl border border-border bg-card/50 flex flex-col gap-3 hover:border-accent/30 transition-colors">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-bold text-lg">{model.name}</h3>
                    <p className="text-xs text-accent font-mono mt-1">{model.provider}</p>
                  </div>
                  <button className="text-xs border border-border px-3 py-1 rounded-full hover:bg-muted">
                    Configure Key
                  </button>
                </div>
                <p className="text-sm text-muted-foreground">
                  {model.description}
                </p>
                <div className="pt-2">
                   <button 
                      onClick={() => alert("Cloud model switching coming soon!")}
                      className="w-full py-2 rounded-lg text-sm font-bold bg-muted text-muted-foreground hover:bg-muted/80 transition-colors"
                    >
                      Use Cloud Model
                    </button>
                </div>
              </div>
            ))}
          </div>

           <div className="mt-6 p-4 bg-accent/5 border border-accent/10 rounded-xl">
              <div className="flex gap-2 items-center text-accent mb-2">
                <AlertTriangle size={18} />
                <h4 className="font-bold text-sm">Privacy Note</h4>
              </div>
              <p className="text-xs text-muted-foreground">
                When using Cloud Models, your data (Excel sheets/prompts) is sent to external servers (Google/OpenAI) for processing. 
                Use <strong>SLM (On-Device)</strong> for sensitive financial data.
              </p>
           </div>
        </section>

      </div>
    </div>
  );
}