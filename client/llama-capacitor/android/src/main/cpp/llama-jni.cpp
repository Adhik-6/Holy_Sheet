#include <jni.h>
#include <string>
#include <vector>
#include <cstring>
#include <android/log.h>
#include "llama.h"

#define TAG "LlamaJNI"
#define LOGI(...) __android_log_print(ANDROID_LOG_INFO, TAG, __VA_ARGS__)
#define LOGE(...) __android_log_print(ANDROID_LOG_ERROR, TAG, __VA_ARGS__)

// Global variables to keep model loaded (Optional optimization for later)
// For now, we stick to the safety of your current flow.

// 🔥 ADD THIS: The Log Interceptor
static void llama_log_callback_impl(ggml_log_level level, const char * text, void * user_data) {
    // llama.cpp sends strings with trailing newlines, Android adds its own.
    // We route everything to Logcat under the tag "llama.cpp"
    if (level == GGML_LOG_LEVEL_ERROR) {
        __android_log_print(ANDROID_LOG_ERROR, "llama.cpp", "%s", text);
    } else if (level == GGML_LOG_LEVEL_WARN) {
        __android_log_print(ANDROID_LOG_WARN, "llama.cpp", "%s", text);
    } else {
        __android_log_print(ANDROID_LOG_INFO, "llama.cpp", "%s", text);
    }
}

extern "C" {

// 1. INIT
JNIEXPORT jlong JNICALL Java_com_chiggazz_llama_LlamaPlugin_llamaInit(JNIEnv* env, jobject thiz, jstring modelPath, jint nThreads, jint nCtx, jboolean useMmap, jint nGpuLayers) {

    llama_log_set(llama_log_callback_impl, nullptr);

    const char* path = env->GetStringUTFChars(modelPath, nullptr);

    llama_backend_init();

    // Model Params
    llama_model_params model_params = llama_model_default_params();
    // 🔥 APPLY HARDWARE PARAMS
    model_params.use_mmap = (useMmap == JNI_TRUE);
    model_params.n_gpu_layers = nGpuLayers;

    LOGI("📂 Loading model: %s (Mmap: %d, GPU Layers: %d)", path, model_params.use_mmap, model_params.n_gpu_layers);

    // 🔥 FIXED: Updated to modern function to silence deprecation warnings
    llama_model* model = llama_model_load_from_file(path, model_params);
    env->ReleaseStringUTFChars(modelPath, path);

    if (!model) {
        LOGE("❌ Failed to load model");
        return 0;
    }

    // Context Params
    llama_context_params ctx_params = llama_context_default_params();
    ctx_params.n_ctx = nCtx;     // Ensure this is 2048+
    ctx_params.n_threads = nThreads;
    ctx_params.n_threads_batch = nThreads;

    // 🔥 FIXED: Updated to modern function to silence deprecation warnings
    llama_context* ctx = llama_init_from_model(model, ctx_params);
    if (!ctx) {
        LOGE("❌ Failed to create context");
        llama_model_free(model); // 🔥 FIXED warning
        return 0;
    }

    LOGI("✅ Model Initialized Successfully. Context: %d", nCtx);
    return reinterpret_cast<jlong>(ctx);
}

// 2. GENERATE (THE FIXED VERSION)
JNIEXPORT jstring JNICALL Java_com_chiggazz_llama_LlamaPlugin_llamaGenerate(JNIEnv* env, jobject thiz, jlong contextPtr, jstring prompt, jint nPredict, jfloat temperature, jstring stopToken) {

    // 🔥 FIXED: UNCOMMENTED THE MISSING VARIABLES
    llama_context* ctx = reinterpret_cast<llama_context*>(contextPtr);
    const char* prompt_cstr = env->GetStringUTFChars(prompt, nullptr);

    // 🔥 CONVERT STOP TOKEN TO C++ STRING
    const char* stop_cstr = env->GetStringUTFChars(stopToken, nullptr);
    std::string stop_str(stop_cstr);
    env->ReleaseStringUTFChars(stopToken, stop_cstr);

    LOGI("🚀 Starting Generate. Prompt Length: %lu chars", strlen(prompt_cstr));

    // 1. Tokenize
    const llama_model* model = llama_get_model(ctx);
    const llama_vocab* vocab = llama_model_get_vocab(model);

    // Allocate space for tokens
    int n_ctx = llama_n_ctx(ctx);
    std::vector<llama_token> tokens_list(n_ctx);

    int n_tokens = llama_tokenize(vocab, prompt_cstr, strlen(prompt_cstr), tokens_list.data(), tokens_list.size(), true, false);

    if (n_tokens < 0) {
        LOGE("❌ Tokenization failed");
        env->ReleaseStringUTFChars(prompt, prompt_cstr);
        return env->NewStringUTF("Error: Tokenization failed");
    }
    LOGI("🔢 Tokens: %d", n_tokens);

    // 2. Prepare Batch (The Fix: Process in Chunks)
    // Create a batch with a safe size (e.g. 512)
    int n_batch = 128;
    llama_batch batch = llama_batch_init(n_batch, 0, 1);

    // Loop to process the prompt in chunks
    for (int i = 0; i < n_tokens; i += n_batch) {
        int n_eval = n_tokens - i;
        if (n_eval > n_batch) n_eval = n_batch;

        LOGI("⚡ Processing batch chunk: %d to %d", i, i + n_eval);

        // Prepare this chunk
        batch.n_tokens = n_eval;
        for (int k = 0; k < n_eval; k++) {
            batch.token[k] = tokens_list[i + k];
            batch.pos[k] = i + k;
            batch.n_seq_id[k] = 1;
            batch.seq_id[k][0] = 0;
            batch.logits[k] = false; // No logits for prompt processing
        }

        // Only calculate logits for the VERY LAST token of the prompt
        if (i + n_eval == n_tokens) {
            batch.logits[n_eval - 1] = true;
        }

        // Decode this chunk
        if (llama_decode(ctx, batch) != 0) {
            LOGE("❌ llama_decode failed on prompt processing");
            return env->NewStringUTF("Error: Decode failed");
        }
    }

    LOGI("✅ Prompt Processed. Starting Generation...");

    // 3. Generation Loop
    std::string result_str = "";
    llama_token curr_token;

    for (int i = 0; i < nPredict; i++) {
        // Get logits from the last token
        auto * logits = llama_get_logits_ith(ctx, batch.n_tokens - 1);

        // Simple Greedy Sampling
        int best_token_id = 0;
        float max_val = -1e9;
        int n_vocab = llama_vocab_n_tokens(vocab);

        for (int k = 0; k < n_vocab; k++) {
            if (logits[k] > max_val) {
                max_val = logits[k];
                best_token_id = k;
            }
        }
        curr_token = best_token_id;

        // Check EOS
        if (curr_token == llama_vocab_eos(vocab)) {
            LOGI("🛑 End of Sentence (EOS) reached");
            break;
        }

        // Convert token to string
        char buf[256];
        int n = llama_token_to_piece(vocab, curr_token, buf, sizeof(buf), 0, true);
        if (n > 0) {
            std::string piece(buf, n);
            result_str += piece;

            if (i % 10 == 0) LOGI("💓 Gen: %s", piece.c_str());

            // 🔥 CHECK FOR STOP TOKEN
            if (!stop_str.empty() && result_str.find(stop_str) != std::string::npos) {
                LOGI("🛑 Stop token '%s' found. Halting generation.", stop_str.c_str());

                // Clean up the stop token from the final output so it doesn't break JSON parsing
                size_t pos = result_str.find(stop_str);
                if (pos != std::string::npos) {
                    result_str.erase(pos, stop_str.length());
                }
                break;
            }
        }

        // Prepare next batch (Single token)
        batch.n_tokens = 1;
        batch.token[0] = curr_token;
        batch.pos[0] = n_tokens + i;
        batch.n_seq_id[0] = 1;
        batch.seq_id[0][0] = 0;
        batch.logits[0] = true;

        if (llama_decode(ctx, batch) != 0) {
            LOGE("❌ llama_decode failed during generation");
            break;
        }
    }

    LOGI("🎉 Generation Complete. Result length: %lu", result_str.length());

    llama_batch_free(batch);
    env->ReleaseStringUTFChars(prompt, prompt_cstr);

    return env->NewStringUTF(result_str.c_str());
}

// 3. FREE
JNIEXPORT void JNICALL Java_com_chiggazz_llama_LlamaPlugin_llamaFree(JNIEnv* env, jobject thiz, jlong contextPtr) {
    if (contextPtr == 0) return;
    llama_context* ctx = reinterpret_cast<llama_context*>(contextPtr);
    if (ctx) {
        const llama_model* model = llama_get_model(ctx);
        llama_free(ctx);
        if (model) llama_model_free(const_cast<llama_model*>(model)); // 🔥 FIXED warning
    }
}

}