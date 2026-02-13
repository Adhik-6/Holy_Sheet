import { registerPlugin } from '@capacitor/core';

export interface LlamaPlugin {
  loadModel(options: { modelPath: string; nThreads?: number; nCtx?: number }): Promise<void>;
  generate(options: { prompt: string; nPredict?: number; temperature?: number }): Promise<{ text: string }>;
  unload(): Promise<void>;
  // 👇 Add this definition
  downloadModel(options: { url: string; filename: string }): Promise<void>;
  // 👇 Add listener definition
  addListener(eventName: 'downloadProgress', listenerFunc: (info: { progress: number }) => void): Promise<any>;
}

const NativeLlama = registerPlugin<LlamaPlugin>('LlamaCapacitor');

export default NativeLlama;