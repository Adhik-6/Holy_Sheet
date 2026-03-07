import { registerPlugin } from '@capacitor/core';

export interface LlamaPlugin {
  loadModel(options: { 
    modelPath: string; 
    nThreads?: number; 
    nCtx?: number;
    useMmap?: boolean;     // 🔥 Added
    nGpuLayers?: number;   // 🔥 Added
  }): Promise<void>;

  generate(options: { 
    prompt: string; 
    nPredict?: number; 
    temperature?: number;
    stop?: string;         // 🔥 Added (Passing a single string is easier for C++)
  }): Promise<{ text: string }>;
  
  unload(): Promise<void>;
  downloadModel(options: { url: string; filename: string }): Promise<void>;
  addListener(eventName: 'downloadProgress', listenerFunc: (info: { progress: number }) => void): Promise<any>;
}

const NativeLlama = registerPlugin<LlamaPlugin>('LlamaCapacitor');

export default NativeLlama;