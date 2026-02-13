import { Filesystem, Directory } from '@capacitor/filesystem';
import { Capacitor } from '@capacitor/core';
import { QWEN_FILENAME, QWEN_MODEL_URL } from './constants';
import NativeLlama from './nativeLlama'; // ✅ Import your Native Plugin

export const getModelPath = async () => {
  try {
    const uri = await Filesystem.getUri({
      directory: Directory.Data,
      path: QWEN_FILENAME,
    });
    // Convert "file:///data/..." to "/data/..."
    return uri.uri.replace("file://", "");
  } catch (e) {
    console.error("❌ Failed to get URI:", e);
    // Fallback: Manually construct the path if Filesystem fails (Standard Android path)
    return `/data/user/0/com.chiggazz.holy_sheets/files/${QWEN_FILENAME}`;
  }
};

export const checkNativeModelExists = async () => {
  if (!Capacitor.isNativePlatform()) return false;

  try {
    // 🔍 DEBUG LOG: See exactly what we are looking for
    console.log(`🔍 Checking existence of: ${QWEN_FILENAME} in Directory.Data`);
    
    const stat = await Filesystem.stat({
      directory: Directory.Data,
      path: QWEN_FILENAME,
    });
    
    console.log(`✅ File found! Size: ${stat.size} bytes. Path: ${stat.uri}`);
    return true;
  } catch (e: any) {
    // 🔍 DEBUG LOG: See WHY it failed
    console.warn(`⚠️ Model check failed:`, e.message);
    return false;
  }
};

// ✅ UPDATED: Use the Native Plugin to download (Prevents OOM Crashes)
export const downloadNativeModel = async (onProgress: (progress: number) => void) => {
  try {
    console.log("⬇️ Starting Native Download via Manager...");
    
    // 1. Setup Listener
    const listener = await NativeLlama.addListener('downloadProgress', (info: any) => {
      onProgress(info.progress);
    });

    // 2. Start Download
    await NativeLlama.downloadModel({
      url: QWEN_MODEL_URL,
      filename: QWEN_FILENAME
    });

    // 3. Cleanup
    listener.remove();
    return true;
    
  } catch (err) {
    console.error("❌ Native Manager Download failed:", err);
    throw err;
  }
};