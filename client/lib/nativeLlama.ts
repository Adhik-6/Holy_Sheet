import { registerPlugin } from '@capacitor/core';

export interface LlamaPlugin {
  loadModel(options: { 
    modelPath: string; 
    nThreads?: number; 
    nCtx?: number;
    useMmap?: boolean;     
    nGpuLayers?: number;   
  }): Promise<void>;

  generate(options: { 
    prompt: string; 
    nPredict?: number; 
    temperature?: number;
    stop?: string;         
  }): Promise<{ text: string }>;
  
  // 🔥 Exposes the C++ Kill Switch to the frontend
  stop(): Promise<void>; 
  
  unload(): Promise<void>;
  downloadModel(options: { url: string; filename: string }): Promise<void>;
  addListener(eventName: 'downloadProgress', listenerFunc: (info: { progress: number }) => void): Promise<any>;
}

const NativeLlama = registerPlugin<LlamaPlugin>('LlamaCapacitor');

export default NativeLlama;