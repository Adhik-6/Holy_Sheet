// lib/modelLoader.ts
import NativeLlama from './nativeLlama';
import { getModelPath, checkNativeModelExists } from './nativeModelManager';

const NTHREADS = 4; // strictly 4 for performance cores
const NCTX = 2048;  

let isNativeModelLoaded = false;

export async function loadModelForChat(onProgress?: (progress: number) => void) {
  if (isNativeModelLoaded) {
    console.log("⚡ Native model already loaded.");
    onProgress?.(100);
    return;
  }

  console.log("⚙️ Initializing Native Engine...");
  onProgress?.(10);

  const exists = await checkNativeModelExists();
  if (!exists) throw new Error("MODEL_NOT_DOWNLOADED");

  const modelPath = await getModelPath();
  onProgress?.(30);

  setTimeout(() => onProgress?.(50), 100);
  console.log(`🚀 Loading model with: nThreads-${NTHREADS}, nCtx-${NCTX}`);
  
  await NativeLlama.loadModel({
    modelPath: modelPath,
    nThreads: NTHREADS,  
    nCtx: NCTX,        
    
    // 🔥 NEW PERFORMANCE PARAMS
    // nBatch: 512,         // Process 512 tokens at once during prompt evaluation
    useMmap: true,       // Force Memory Mapping (Saves RAM)
    nGpuLayers: 0,      // Offload all layers to Vulkan GPU
    // flashAttn: true      // Enable Flash Attention (if plugin supports it)
  });

  isNativeModelLoaded = true;
  onProgress?.(100);
  console.log("✅ Native Model Ready");
}

export function isModelLoaded() {
  return isNativeModelLoaded;
}