// lib/nativeModelManager.ts
import { Filesystem, Directory } from '@capacitor/filesystem';
import { Capacitor } from '@capacitor/core';
import NativeLlama from './nativeLlama'; // ✅ Import your Native Plugin

// 🔥 1. Accept filename dynamically
export const getModelPath = async (filename: string) => {
  try {
    const uri = await Filesystem.getUri({
      directory: Directory.Data,
      path: filename,
    });
    // Convert "file:///data/..." to "/data/..."
    return uri.uri.replace("file://", "");
  } catch (e) {
    console.error("❌ Failed to get URI:", e);
    // Fallback: Manually construct the path if Filesystem fails (Standard Android path)
    return `/data/user/0/com.chiggazz.holy_sheets/files/${filename}`;
  }
};

// 🔥 2. Accept filename dynamically
export const checkNativeModelExists = async (filename: string) => {
  if (!Capacitor.isNativePlatform()) return false;

  try {
    // 🔍 DEBUG LOG: See exactly what we are looking for
    console.log(`🔍 Checking existence of: ${filename} in Directory.Data`);
    
    const stat = await Filesystem.stat({
      directory: Directory.Data,
      path: filename,
    });
    
    console.log(`✅ File found! Size: ${stat.size} bytes. Path: ${stat.uri}`);
    return true;
  } catch (e: any) {
    // 🔍 DEBUG LOG: See WHY it failed
    console.warn(`⚠️ Model check failed:`, e.message);
    return false;
  }
};

// 🔥 3. Accept BOTH url and filename dynamically
export const downloadNativeModel = async (url: string, filename: string, onProgress: (progress: number) => void) => {
  try {
    console.log(`⬇️ Starting Native Download via Manager for ${filename}...`);
    
    // 1. Setup Listener
    const listener = await NativeLlama.addListener('downloadProgress', (info: any) => {
      onProgress(info.progress);
    });

    // 2. Start Download
    await NativeLlama.downloadModel({
      url: url,
      filename: filename
    });

    // 3. Cleanup
    listener.remove();
    return true;
    
  } catch (err) {
    console.error("❌ Native Manager Download failed:", err);
    throw err;
  }
};