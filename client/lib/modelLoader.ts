import { Wllama } from '@wllama/wllama';
import { QWEN_MODEL_URL } from './constants'; 

const REMOTE_MODEL_URL = QWEN_MODEL_URL;

// 1. THE SINGLETON STORAGE
// This variable lives in memory as long as the app is running
let activeWllamaInstance: Wllama | null = null;

export async function loadModelForChat(
  onProgress?: (progress: number) => void
): Promise<Wllama> {
  // Return existing instance if available (Fast Path)
  if (activeWllamaInstance) return activeWllamaInstance;

  console.log("⚙️ Configuring Wllama...");
  const wllama = new Wllama({
    'single-thread/wllama.wasm': '/wllama/single-thread/wllama.wasm',
    'multi-thread/wllama.wasm': '/wllama/multi-thread/wllama.wasm',
  });

  const cacheSize = await wllama.cacheManager.getSize(REMOTE_MODEL_URL);
  if (cacheSize === 0) throw new Error("MODEL_NOT_DOWNLOADED");

  console.log("🚀 Loading model into RAM...");
  await wllama.loadModelFromUrl(REMOTE_MODEL_URL, {
    n_ctx: 2048,
    n_threads: 4,
    progressCallback: ({ loaded, total }) => {
      if (onProgress) onProgress(Math.round((loaded / total) * 100));
    }
  });

  // 2. SAVE TO SINGLETON
  console.log("✅ Model Ready & Saved to Singleton");
  activeWllamaInstance = wllama;
  
  return wllama;
}

// 3. THE GETTER (For aiService.ts)
export function getRunningWllama(): Wllama {
  if (!activeWllamaInstance) {
    throw new Error("Local Model is not loaded. Please wait for initialization.");
  }
  return activeWllamaInstance;
}