package com.chiggazz.llama;

import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

import java.io.File;
import java.io.FileOutputStream;
import java.io.InputStream;
import java.net.HttpURLConnection;
import java.net.URL;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

@CapacitorPlugin(name = "LlamaCapacitor")
public class LlamaPlugin extends Plugin {

    // Load the C++ Library
    static {
        System.loadLibrary("llama-android");
    }

    // Native Methods (C++)
    private native long llamaInit(String modelPath, int nThreads, int nCtx);
    private native String llamaGenerate(long contextPtr, String prompt, int nPredict, float temperature);
    private native void llamaFree(long contextPtr);

    // Executor for background tasks
    private final ExecutorService executor = Executors.newSingleThreadExecutor();
    private long contextPtr = 0;

    @PluginMethod
    public void loadModel(PluginCall call) {
        String modelPath = call.getString("modelPath");
        Integer nThreads = call.getInt("nThreads", 8);
        Integer nCtx = call.getInt("nCtx", 2048);

        if (modelPath == null) {
            call.reject("modelPath required");
            return;
        }

        executor.execute(() -> {
            try {
                File file;
                if (modelPath.startsWith("/")) {
                    file = new File(modelPath);
                } else {
                    file = new File(getContext().getFilesDir(), modelPath);
                }

                if (!file.exists()) {
                    call.reject("Model file not found: " + file.getAbsolutePath());
                    return;
                }

                long ptr = llamaInit(file.getAbsolutePath(), nThreads, nCtx);

                if (ptr == 0) {
                    call.reject("Failed to initialize llama context");
                } else {
                    contextPtr = ptr;
                    call.resolve();
                }
            } catch (Exception e) {
                call.reject("Error loading model: " + e.getMessage());
            }
        });
    }

    @PluginMethod
    public void generate(PluginCall call) {
        if (contextPtr == 0) {
            call.reject("Model not loaded");
            return;
        }

        String prompt = call.getString("prompt");
        Integer nPredict = call.getInt("nPredict", 512);
        Float temperature = call.getFloat("temperature", 0.2f);

        if (prompt == null) {
            call.reject("prompt required");
            return;
        }

        executor.execute(() -> {
            try {
                String result = llamaGenerate(contextPtr, prompt, nPredict, temperature);
                JSObject ret = new JSObject();
                ret.put("text", result);
                call.resolve(ret);
            } catch (Exception e) {
                call.reject("Generation error: " + e.getMessage());
            }
        });
    }

    @PluginMethod
    public void downloadModel(PluginCall call) {
        String urlString = call.getString("url");
        String filename = call.getString("filename");

        if (urlString == null || filename == null) {
            call.reject("URL and filename are required");
            return;
        }

        executor.execute(() -> {
            try {
                File destFile = new File(getContext().getFilesDir(), filename);
                URL url = new URL(urlString);
                HttpURLConnection connection = (HttpURLConnection) url.openConnection();
                connection.connect();

                int fileLength = connection.getContentLength();
                InputStream input = connection.getInputStream();
                FileOutputStream output = new FileOutputStream(destFile);

                byte[] data = new byte[4096];
                long total = 0;
                int count;
                int lastProgressUpdate = 0;

                while ((count = input.read(data)) != -1) {
                    total += count;
                    output.write(data, 0, count);

                    if (fileLength > 0) {
                        int progress = (int) (total * 100 / fileLength);
                        if (progress > lastProgressUpdate) {
                            JSObject ret = new JSObject();
                            ret.put("progress", progress);
                            notifyListeners("downloadProgress", ret);
                            lastProgressUpdate = progress;
                        }
                    }
                }

                output.flush();
                output.close();
                input.close();

                call.resolve();

            } catch (Exception e) {
                call.reject("Download failed: " + e.getMessage());
            }
        });
    }

    @PluginMethod
    public void unload(PluginCall call) {
        executor.execute(() -> {
            if (contextPtr != 0) {
                llamaFree(contextPtr);
                contextPtr = 0;
            }
            call.resolve();
        });
    }

    @Override
    protected void handleOnDestroy() {
        super.handleOnDestroy();
        if (contextPtr != 0) {
            llamaFree(contextPtr);
            contextPtr = 0;
        }
        executor.shutdown();
    }
}