// lib/modelLoader.ts
import NativeLlama from './nativeLlama';
import { getModelPath, checkNativeModelExists } from './nativeModelManager';

const NTHREADS = 4; // Adjust based on device capabilities
const NCTX = 2048;   // Context size for the model

// Tracks if the C++ engine has the model loaded in RAM
let isNativeModelLoaded = false;

export async function loadModelForChat(onProgress?: (progress: number) => void) {
  // 1. Fast exit if already loaded
  if (isNativeModelLoaded) {
    console.log("⚡ Native model already loaded.");
    onProgress?.(100);
    return;
  }

  console.log("⚙️ Initializing Native Engine...");
  onProgress?.(10);

  // 2. Check File
  const exists = await checkNativeModelExists();
  if (!exists) throw new Error("MODEL_NOT_DOWNLOADED");

  // 3. Get Path
  const modelPath = await getModelPath();
  onProgress?.(30);

  // 4. Load (Blocking Call)
  // We fake some progress steps because the native call blocks JS
  setTimeout(() => onProgress?.(50), 100);
  console.log(`🚀 Loading model into Native Engine with: nThreads-${NTHREADS}, nCtx-${NCTX}`);
  await NativeLlama.loadModel({
    modelPath: modelPath,
    nThreads: NTHREADS,   // 🔥 Using 4 cores
    nCtx: NCTX,         // 🧠 Context size of 512
  });

  isNativeModelLoaded = true;
  onProgress?.(100);
  console.log("✅ Native Model Ready");
}

export function isModelLoaded() {
  return isNativeModelLoaded;
}