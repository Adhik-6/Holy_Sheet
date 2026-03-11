'use client';

import React, { useEffect, useState } from 'react';
import { 
  Cpu, Cloud, Download, Trash2, CheckCircle2, Loader2, HardDrive, Zap, Smartphone 
} from 'lucide-react';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { Capacitor } from '@capacitor/core';
import NativeLlama from '@/lib/nativeLlama';

// ✅ Import the new Registry
import { SLM_REGISTRY } from '@/lib/modelRegistry';
import { useSettingsStore } from '@/store/settingsStore';
import { toast } from "sonner";

import LocalModelCard from './components/LocalModelCard';
import CloudModelCard from './components/CloudModelCard';

// 🔥 1. Import Sonner

// --- DATA DEFINITIONS ---

type ModelType = 'SLM' | 'LLM';

interface ModelDef {
  id: string;
  name: string;
  type: ModelType;
  provider: string;
  size?: string;
  params?: string;
  quant?: string;
  description: string;
  filename?: string; 
  downloadUrl?: string; 
  isCloud?: boolean;
}

// 1. Dynamically pull local models from the Registry
const SLM_MODELS: ModelDef[] = Object.values(SLM_REGISTRY).map(config => ({
  id: config.id,
  name: config.name,
  type: 'SLM',
  provider: config.provider,
  size: config.size,
  params: config.params,
  quant: config.quant,
  description: config.description,
  filename: config.filename,
  downloadUrl: config.downloadUrl,
  isCloud: false
}));

// 2. Keep Cloud Models static
const CLOUD_MODELS: ModelDef[] = [
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

// 3. Combine them
const AVAILABLE_MODELS: ModelDef[] = [...SLM_MODELS, ...CLOUD_MODELS];

export default function ModelManagerPage() {
  const [downloadedModels, setDownloadedModels] = useState<Record<string, boolean>>({});
  
  const { activeSLM, activeLLM, setActiveSLM, setActiveLLM } = useSettingsStore();

  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);

  const isMobile = Capacitor.isNativePlatform();

  useEffect(() => {
    checkDownloadedModels();
  }, [isMobile]);

  const checkModelExists = async (filename: string) => {
    try {
      await Filesystem.stat({
        path: filename,
        directory: Directory.Data
      });
      return true; 
    } catch (error: any) {
      if (typeof error?.message === 'string' && error.message.includes('does not exist')) {
        return false; 
      }
      console.warn(`Filesystem check failed for ${filename}:`, error);
      return false;
    }
  };

  const checkDownloadedModels = async () => {
    if (!isMobile) return; 

    const statusMap: Record<string, boolean> = {};
    
    for (const model of AVAILABLE_MODELS) {
      if (!model.isCloud && model.filename) {
        const exists = await checkModelExists(model.filename);
        statusMap[model.id] = exists;
         
        if (exists) {
          console.log(`✅ Ready: ${model.name}`);
        }
      }
    }
    setDownloadedModels(statusMap);
  };

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
        
        const listener = await NativeLlama.addListener('downloadProgress', (info: any) => {
            setProgress(info.progress);
        });

        await NativeLlama.downloadModel({
          url: model.downloadUrl,
          filename: model.filename
        });

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
        if (activeSLM === model.id) setActiveSLM('');
        alert("Model deleted.");
      } catch (e) {
        console.error("Delete failed", e);
      }
    }
  };

  const isModelActive = (model: ModelDef) => {
    if (model.isCloud) return activeLLM === model.id;
    return activeSLM === model.id;
  };

  // 🔥 2. Updated handleActivate with Toast Notifications
  const handleActivate = (model: ModelDef) => {
    if (model.isCloud) {
      setActiveLLM(model.id);
      toast.success(`${model.name} is now the active Cloud LLM.`);
    } else {
      setActiveSLM(model.id);
      toast("Restart Required 🔄", {
        description: "Close and reopen the app to load the new AI model into memory.",
        duration: 5000,
      });
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
                <Smartphone size={14} /> <span>Offline models are only available on the Mobile App.</span>
             </div>
          )}
          <div className="grid gap-4">
            {AVAILABLE_MODELS.filter(m => !m.isCloud).map(model => (
              <LocalModelCard 
                key={model.id}
                model={model}
                isActive={isModelActive(model)}
                isDownloaded={downloadedModels[model.id]}
                isDownloading={downloadingId === model.id}
                progress={progress}
                isMobile={isMobile}
                onActivate={handleActivate}
                onDownload={handleDownload}
                onDelete={handleDelete}
              />
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
              <CloudModelCard 
                key={model.id}
                model={model}
                isActive={isModelActive(model)}
                onActivate={handleActivate}
              />
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}