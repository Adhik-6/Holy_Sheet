// lib/modelLoader.ts
import NativeLlama from './nativeLlama';
import { getModelPath, checkNativeModelExists } from './nativeModelManager';
import { useSettingsStore } from '@/store/settingsStore';
import { getActiveSLMConfig } from './modelRegistry'; 

let isNativeModelLoaded = false;

export async function unloadNativeModel() {
  if (!isNativeModelLoaded) return;
  await NativeLlama.unload(); 
  isNativeModelLoaded = false;
}

export async function loadModelForChat(onProgress?: (progress: number) => void) {
  if (isNativeModelLoaded) {
    console.log("⚡ Native model already loaded. Skipping boot.");
    onProgress?.(100);
    return;
  }

  console.log("⚙️ Initializing Native Engine...");
  onProgress?.(10);

  const settings = useSettingsStore.getState();
  const config = getActiveSLMConfig(settings.activeSLM);

  const exists = await checkNativeModelExists(config.filename);
  if (!exists) throw new Error("MODEL_NOT_DOWNLOADED");

  const modelPath = await getModelPath(config.filename);
  onProgress?.(30);

  setTimeout(() => onProgress?.(50), 100);
  console.log(`🚀 Loading model [${config.name}] with GPU: ${settings.useGpu}`);
  
  await NativeLlama.loadModel({
    modelPath: modelPath,
    nThreads: settings.cpuThreads,  
    nCtx: settings.contextSize,        
    useMmap: settings.useMmap,       
    nGpuLayers: settings.useGpu ? 99 : 0, 
  });

  isNativeModelLoaded = true;
  onProgress?.(100);
  console.log("✅ Native Model Ready");
}

export function isModelLoaded() {
  return isNativeModelLoaded;
}