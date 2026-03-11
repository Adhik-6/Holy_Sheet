#include <jni.h>
#include <string>
#include <vector>
#include <cstring>
#include <stdlib.h>
#include <android/log.h>
#include <sys/auxv.h>
#include <asm/hwcap.h>
#include <atomic>
#include "llama.h"

#define TAG "LlamaJNI"
#define LOGI(...) __android_log_print(ANDROID_LOG_INFO, TAG, __VA_ARGS__)
#define LOGE(...) __android_log_print(ANDROID_LOG_ERROR, TAG, __VA_ARGS__)

static void llama_log_callback_impl(ggml_log_level level, const char* text, void* user_data) {
    if (level == GGML_LOG_LEVEL_ERROR)
        __android_log_print(ANDROID_LOG_ERROR, "llama.cpp", "%s", text);
    else if (level == GGML_LOG_LEVEL_WARN)
        __android_log_print(ANDROID_LOG_WARN, "llama.cpp", "%s", text);
    else
        __android_log_print(ANDROID_LOG_INFO, "llama.cpp", "%s", text);
}

static void log_cpu_features() {
    unsigned long hwcap  = getauxval(AT_HWCAP);
    unsigned long hwcap2 = getauxval(AT_HWCAP2);

    bool has_neon    = (hwcap  & HWCAP_ASIMD)   != 0;
    bool has_dotprod = (hwcap  & HWCAP_ASIMDDP) != 0;
    bool has_fp16    = (hwcap  & HWCAP_ASIMDHP) != 0;
    bool has_sve     = (hwcap  & HWCAP_SVE)     != 0;
    bool has_i8mm    = (hwcap2 & HWCAP2_I8MM)   != 0;

    LOGI("🖥️ CPU Features Detected (OS Level):");
    LOGI("   NEON    : %s", has_neon    ? "✅" : "❌");
    LOGI("   DOTPROD : %s", has_dotprod ? "✅" : "❌");
    LOGI("   FP16    : %s", has_fp16    ? "✅" : "❌");
    LOGI("   SVE     : %s", has_sve     ? "✅" : "❌");
    LOGI("   I8MM    : %s", has_i8mm    ? "✅" : "❌");
}

// 🔥 THE KILL SWITCH FLAG
static std::atomic<bool> is_generation_cancelled{false};

extern "C" {

// -------------------------------------------------------
// 1. INIT
// -------------------------------------------------------
JNIEXPORT jlong JNICALL Java_com_chiggazz_llama_LlamaPlugin_llamaInit(
    JNIEnv* env, jobject thiz,
    jstring modelPath,
    jint    nThreads,
    jint    nCtx,
    jboolean useMmap,
    jint    nGpuLayers)
{
    llama_log_set(llama_log_callback_impl, nullptr);

    // Hide or expose Vulkan BEFORE backend init
    if (nGpuLayers <= 0) {
        setenv("GGML_VK_VISIBLE_DEVICES", "-1", 1);
        LOGI("⚙️ GPU Layers = 0. Vulkan hidden. Forcing Pure CPU.");
    } else {
        unsetenv("GGML_VK_VISIBLE_DEVICES");
        LOGI("🎮 GPU Layers > 0. Vulkan enabled.");
    }

    // Log OS-level CPU features
    log_cpu_features();

    llama_backend_init();
    LOGI("🖥️ llama.cpp system info: %s", llama_print_system_info());

    // Acquire path AFTER backend init — held for minimum time
    const char* path = env->GetStringUTFChars(modelPath, nullptr);

    llama_model_params model_params  = llama_model_default_params();
    model_params.use_mmap            = (useMmap == JNI_TRUE);
    model_params.n_gpu_layers        = nGpuLayers;

    LOGI("📂 Loading model: %s (mmap=%d, gpu_layers=%d)",
         path, model_params.use_mmap, model_params.n_gpu_layers);

    llama_model* model = llama_model_load_from_file(path, model_params);
    env->ReleaseStringUTFChars(modelPath, path);  // Release immediately after use

    if (!model) {
        LOGE("❌ Failed to load model");
        return 0;
    }

    llama_context_params ctx_params   = llama_context_default_params();
    ctx_params.n_ctx                  = nCtx;
    ctx_params.n_threads              = nThreads;
    ctx_params.n_threads_batch        = nThreads;

    llama_context* ctx = llama_init_from_model(model, ctx_params);
    if (!ctx) {
        LOGE("❌ Failed to create context");
        llama_model_free(model);
        return 0;
    }

    LOGI("✅ Model initialized. Context size: %d", nCtx);
    return reinterpret_cast<jlong>(ctx);
}

// -------------------------------------------------------
// 2. GENERATE
// -------------------------------------------------------
JNIEXPORT jstring JNICALL Java_com_chiggazz_llama_LlamaPlugin_llamaGenerate(
    JNIEnv* env, jobject thiz,
    jlong   contextPtr,
    jstring prompt,
    jint    nPredict,
    jfloat  temperature,
    jstring stopToken)
{
    is_generation_cancelled = false;
    llama_context* ctx = reinterpret_cast<llama_context*>(contextPtr);

    // Acquire and immediately copy stop token, then release
    const char* stop_cstr = env->GetStringUTFChars(stopToken, nullptr);
    std::string stop_str(stop_cstr);
    env->ReleaseStringUTFChars(stopToken, stop_cstr);

    const char* prompt_cstr = env->GetStringUTFChars(prompt, nullptr);
    LOGI("🚀 Starting generation. Prompt length: %zu chars", strlen(prompt_cstr));

    const llama_model* model = llama_get_model(ctx);
    const llama_vocab* vocab = llama_model_get_vocab(model);

    // -------------------------------------------------------
    // Tokenize
    // -------------------------------------------------------
    int n_ctx = llama_n_ctx(ctx);
    std::vector<llama_token> tokens_list(n_ctx);

    int n_tokens = llama_tokenize(
        vocab,
        prompt_cstr, strlen(prompt_cstr),
        tokens_list.data(), tokens_list.size(),
        true,   // add BOS
        false   // parse special tokens
    );

    if (n_tokens < 0) {
        LOGE("❌ Tokenization failed");
        env->ReleaseStringUTFChars(prompt, prompt_cstr);
        return env->NewStringUTF("Error: Tokenization failed");
    }
    LOGI("🔢 Token count: %d", n_tokens);

    // -------------------------------------------------------
    // Prefill (prompt processing)
    // -------------------------------------------------------
    const int n_batch = 256;
    llama_batch batch = llama_batch_init(n_batch, 0, 1);

    for (int i = 0; i < n_tokens; i += n_batch) {
        if (is_generation_cancelled) {
            LOGI("🛑 Prefill aborted by Kill Switch.");
            break; 
        }

        int n_eval = std::min(n_tokens - i, n_batch);

        LOGI("⚡ Prefill chunk: tokens %d → %d", i, i + n_eval);

        batch.n_tokens = n_eval;
        for (int k = 0; k < n_eval; k++) {
            batch.token[k]     = tokens_list[i + k];
            batch.pos[k]       = i + k;
            batch.n_seq_id[k]  = 1;
            batch.seq_id[k][0] = 0;
            batch.logits[k]    = false;
        }
        // Enable logits only on the last token of the final chunk
        if (i + n_eval == n_tokens) {
            batch.logits[n_eval - 1] = true;
        }

        if (llama_decode(ctx, batch) != 0) {
            LOGE("❌ llama_decode failed during prefill");
            llama_batch_free(batch);
            env->ReleaseStringUTFChars(prompt, prompt_cstr);
            return env->NewStringUTF("Error: Prefill decode failed");
        }
    }

    LOGI("✅ Prefill complete. Starting generation...");

    // -------------------------------------------------------
    // Sampler chain: top_k → top_p → temperature → dist
    // -------------------------------------------------------
    auto sparams = llama_sampler_chain_default_params();
    llama_sampler* sampler = llama_sampler_chain_init(sparams);

    llama_sampler_chain_add(sampler, llama_sampler_init_top_k(40));
    llama_sampler_chain_add(sampler, llama_sampler_init_top_p(0.95f, 1));
    llama_sampler_chain_add(sampler, llama_sampler_init_temp(temperature));
    llama_sampler_chain_add(sampler, llama_sampler_init_dist(LLAMA_DEFAULT_SEED));

    // -------------------------------------------------------
    // Generation loop
    // -------------------------------------------------------
    std::string result_str;
    llama_token curr_token;

    for (int i = 0; i < nPredict; i++) {

        if (is_generation_cancelled) {
            LOGI("🛑 Generation aborted by Kill Switch.");
            break;
        }

        curr_token = llama_sampler_sample(sampler, ctx, batch.n_tokens - 1);
        llama_sampler_accept(sampler, curr_token);

        // Covers all EOG variants (EOS, <|im_end|>, <|endoftext|>, etc.)
        if (llama_vocab_is_eog(vocab, curr_token)) {
            LOGI("🛑 EOG token reached. Stopping.");
            break;
        }

        char buf[256];
        int n = llama_token_to_piece(vocab, curr_token, buf, sizeof(buf), 0, true);
        if (n > 0) {
            result_str.append(buf, n);

            if (i % 10 == 0) LOGI("💓 Token %d: %s", i, std::string(buf, n).c_str());

            // Single find — no duplicate search
            if (!stop_str.empty()) {
                size_t pos = result_str.find(stop_str);
                if (pos != std::string::npos) {
                    LOGI("🛑 Stop token '%s' found. Halting.", stop_str.c_str());
                    result_str.erase(pos, stop_str.length());
                    break;
                }
            }
        }

        // Prepare single-token decode for next step
        batch.n_tokens     = 1;
        batch.token[0]     = curr_token;
        batch.pos[0]       = n_tokens + i;
        batch.n_seq_id[0]  = 1;
        batch.seq_id[0][0] = 0;
        batch.logits[0]    = true;

        if (llama_decode(ctx, batch) != 0) {
            LOGE("❌ llama_decode failed during generation at token %d", i);
            break;
        }
    }

    LOGI("🎉 Generation complete. Output length: %zu chars", result_str.length());

    llama_sampler_free(sampler);
    llama_batch_free(batch);
    env->ReleaseStringUTFChars(prompt, prompt_cstr);

    return env->NewStringUTF(result_str.c_str());
}

// -------------------------------------------------------
// 3. FREE
// -------------------------------------------------------
JNIEXPORT void JNICALL Java_com_chiggazz_llama_LlamaPlugin_llamaFree(
    JNIEnv* env, jobject thiz,
    jlong contextPtr)
{
    if (contextPtr == 0) return;

    llama_context* ctx = reinterpret_cast<llama_context*>(contextPtr);
    if (ctx) {
        const llama_model* model = llama_get_model(ctx);
        llama_free(ctx);
        if (model) llama_model_free(const_cast<llama_model*>(model));
    }
}

// 🔥 THE NEW JNI STOP METHOD
JNIEXPORT void JNICALL Java_com_chiggazz_llama_LlamaPlugin_llamaStopGeneration(
    JNIEnv* env, jobject thiz) 
{
    is_generation_cancelled = true;
    LOGI("🛑 Kill switch activated from Java! Aborting C++ thread...");
}

} // extern "C"