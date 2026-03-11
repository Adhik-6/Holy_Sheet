# iOS Implementation Guide: Native `llama.cpp` Capacitor Plugin

## 1. Architectural Overview

This application runs a local Large Language Model (SLM) on-device. The frontend is built in React/TypeScript and uses Capacitor to communicate with the native OS.

Because Apple's native language (Swift) cannot directly interface with complex C++ libraries like `llama.cpp`, the iOS architecture requires a specific language bridge.

**The iOS Data Pipeline:**
`React (TypeScript)` ➡️ `Capacitor API` ➡️ `Swift (Plugin Class)` ➡️ `Objective-C++ (.mm Wrapper)` ➡️ `llama.cpp (Core Engine)`

Unlike Android (which uses Vulkan), iOS devices feature a highly optimized Unified Memory Architecture (UMA). We will utilize Apple's **Metal** API to achieve 15-30+ tokens/second hardware acceleration.

---

## 2. Initial Setup

1. **Generate the iOS Project:** Run `npx cap add ios` in the root directory.
2. **Open Xcode:** Run `npx cap open ios`. Do not attempt to configure C++ files in VS Code; Xcode's build system is required to compile Apple Metal shaders.

---

## 3. Importing `llama.cpp` Core Files

Unlike Android (which used `CMakeLists.txt`), iOS projects manage dependencies directly through Xcode targets.

1. Create a new group (folder) in Xcode called `LlamaCore`.
2. Drag and drop the following core files from the official `llama.cpp` repository into this group:
* `llama.h`, `llama.cpp`
* `ggml.h`, `ggml.c`
* `ggml-alloc.h`, `ggml-alloc.c`
* `ggml-backend.h`, `ggml-backend.c`
* `ggml-quants.h`, `ggml-quants.c`


3. **The Metal Shaders (Crucial):** Drag `ggml-metal.h`, `ggml-metal.m`, and `ggml-metal.metal` into the project.
* *Note:* Xcode will automatically compile `ggml-metal.metal` into a `default.metallib` file during the build process. This file contains the GPU instructions.



---

## 4. Configuring Xcode Build Settings

To enable Hardware Acceleration, you must link Apple's math and GPU frameworks.

1. Go to your Project Target -> **General** -> **Frameworks, Libraries, and Embedded Content**.
2. Click the `+` icon and add:
* `Accelerate.framework`
* `Metal.framework`
* `MetalPerformanceShaders.framework`
* `Foundation.framework`


3. Go to **Build Settings** -> **Preprocessor Macros** (or `GCC_PREPROCESSOR_DEFINITIONS`) and add:
* `GGML_USE_METAL=1`
* `GGML_USE_ACCELERATE=1`



---

## 5. The Objective-C++ Wrapper (The Bridge)

Create a new file named `LlamaWrapper.mm` (the `.mm` extension tells Xcode to compile it as Objective-C++, allowing it to hold C++ pointers). Create its header `LlamaWrapper.h`.

**LlamaWrapper.h**

```objective-c
#import <Foundation/Foundation.h>

@interface LlamaWrapper : NSObject

// Shared singleton instance
+ (instancetype)shared;

- (BOOL)loadModelAtPath:(NSString *)path 
               nThreads:(int)nThreads 
                   nCtx:(int)nCtx 
                useMmap:(BOOL)useMmap 
             nGpuLayers:(int)nGpuLayers;

- (NSString *)generateWithPrompt:(NSString *)prompt 
                        nPredict:(int)nPredict 
                     temperature:(float)temperature 
                       stopToken:(NSString *)stopToken;

- (void)stopGeneration;
- (void)unloadModel;

@end

```

*Note to iOS Developer:* Inside `LlamaWrapper.mm`, you will initialize the `llama_context` and handle the text-generation `while` loop, exactly mirroring the logic found in the Android `llama-jni.cpp` file.

---

## 6. The Swift Capacitor Plugin

Create `LlamaPlugin.swift`. This file receives the JSON parameters from the React frontend and passes them to the wrapper.

**LlamaPlugin.swift**

```swift
import Foundation
import Capacitor

@objc(NativeLlama)
public class NativeLlama: CAPPlugin {
    
    @objc func loadModel(_ call: CAPPluginCall) {
        guard let modelPath = call.getString("modelPath") else {
            call.reject("Must provide modelPath")
            return
        }
        
        let nThreads = call.getInt("nThreads") ?? 4
        let nCtx = call.getInt("nCtx") ?? 2048
        let useMmap = call.getBool("useMmap") ?? true
        let nGpuLayers = call.getInt("nGpuLayers") ?? 99 // Default to Metal GPU
        
        // Dispatch to background thread to prevent UI freezing
        DispatchQueue.global(qos: .userInitiated).async {
            let success = LlamaWrapper.shared().loadModel(
                atPath: modelPath,
                nThreads: Int32(nThreads),
                nCtx: Int32(nCtx),
                useMmap: useMmap,
                nGpuLayers: Int32(nGpuLayers)
            )
            
            if success {
                call.resolve()
            } else {
                call.reject("Failed to load model into memory.")
            }
        }
    }
    
    @objc func generate(_ call: CAPPluginCall) {
        guard let prompt = call.getString("prompt") else {
            call.reject("Must provide prompt")
            return
        }
        
        let nPredict = call.getInt("nPredict") ?? 512
        let temp = call.getFloat("temperature") ?? 0.1
        let stopToken = call.getString("stop") ?? "<|im_end|>"
        
        DispatchQueue.global(qos: .userInitiated).async {
            let result = LlamaWrapper.shared().generate(
                withPrompt: prompt,
                nPredict: Int32(nPredict),
                temperature: temp,
                stopToken: stopToken
            )
            
            call.resolve(["text": result])
        }
    }
    
    @objc func stop(_ call: CAPPluginCall) {
        LlamaWrapper.shared().stopGeneration()
        call.resolve()
    }
    
    @objc func unload(_ call: CAPPluginCall) {
        LlamaWrapper.shared().unloadModel()
        call.resolve()
    }
}

```

Register the plugin by creating a `LlamaPlugin.m` file:

```objective-c
import <Capacitor/Capacitor.h>

CAP_PLUGIN(NativeLlama, "LlamaCapacitor",
    CAP_PLUGIN_METHOD(loadModel, CAPPluginReturnPromise);
    CAP_PLUGIN_METHOD(generate, CAPPluginReturnPromise);
    CAP_PLUGIN_METHOD(stop, CAPPluginReturnPromise);
    CAP_PLUGIN_METHOD(unload, CAPPluginReturnPromise);
)

```

---

## 7. Crucial iOS Limitations & Gotchas

### Jetsam Memory Limits

iOS is much stricter about RAM than Android. If your app attempts to load a 3GB model into memory on an iPhone with 4GB of RAM, the iOS "Jetsam" daemon will instantly terminate the app without throwing a catchable exception.

* **Rule of Thumb:** Always use Quantized models (e.g., `Q4_K_M`). A 3B parameter `Q4` model takes about 1.9GB, which is safe for iPhone 13 Pro and newer.

### The App Bundle vs. Documents Directory

In Capacitor, files downloaded via the Filesystem API are saved to the app's `Documents` directory. Ensure your `modelPath` string resolves to the correct internal iOS filesystem path, not a `file://` web URI. The wrapper requires absolute Unix paths.

### Background Execution

Model generation will halt immediately if the user swipes up to put the app in the background. If background generation is required, you must implement iOS Background Tasks (`UIBackgroundTaskIdentifier`).