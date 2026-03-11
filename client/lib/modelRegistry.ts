// lib/modelRegistry.ts

export interface SLMConfig {
  id: string;
  name: string;
  provider: string;
  size: string;         // For UI display (e.g., "2.2 GB")
  params: string;       // For UI display (e.g., "3 Billion")
  quant: string;        // Quantization level
  description: string;  // For UI display
  filename: string;     // The actual file saved on the Android device
  downloadUrl: string;  // Where to fetch it from
  stopToken: string;    // Crucial for the C++ engine to know when to stop
  formatPrompt: (system: string, user: string) => string; // Specific prompt template
}

// 1.5B - Q4_K_M 
// export const QWEN_MODEL_URL = "https://huggingface.co/Qwen/Qwen2.5-Coder-1.5B-Instruct-GGUF/resolve/main/qwen2.5-coder-1.5b-instruct-q4_k_m.gguf?download=true";
// export const QWEN_FILENAME = "qwen2.5-coder-1.5b-instruct-q4_k_m.gguf"; // Matches your original filename

export const SLM_REGISTRY: Record<string, SLMConfig> = {
  'qwen-2.5-coder-3b': {
    id: 'qwen-2.5-coder-3b',
    name: 'Qwen 2.5 Coder',
    provider: 'Alibaba Cloud',
    size: '2.2 GB',
    params: '3 Billion',
    quant: 'Q4_K_M',
    description: 'Best-in-class coding model. Optimized for Python & Data Analysis.',
    filename: 'qwen2.5-coder-3b-instruct-q4_k_m.gguf',
    // Replace this with your exact direct download URL if different
    downloadUrl: 'https://huggingface.co/Qwen/Qwen2.5-Coder-3B-Instruct-GGUF/resolve/main/qwen2.5-coder-3b-instruct-q4_k_m.gguf?download=true',
    stopToken: '<|im_end|>',
    formatPrompt: (system, user) => 
      `<|im_start|>system\n${system}<|im_end|>\n<|im_start|>user\n${user}<|im_end|>\n<|im_start|>assistant\n`
  },
  'phi-3.5-mini': {
    id: 'phi-3.5-mini',
    name: 'Phi 3.5 Mini',
    provider: 'Microsoft',
    size: '2.4 GB',
    params: '3.8 Billion',
    quant: 'Q4_K_M',
    description: 'Strong reasoning capabilities. Good alternative if Qwen fails.',
    filename: 'phi-3.5-mini-instruct-Q4_K_M.gguf',
    downloadUrl: 'https://huggingface.co/microsoft/Phi-3.5-mini-instruct-GGUF/resolve/main/Phi-3.5-mini-instruct-Q4_K_M.gguf?download=true',
    stopToken: '<|end|>',
    formatPrompt: (system, user) => 
      `<|system|>\n${system}<|end|>\n<|user|>\n${user}<|end|>\n<|assistant|>\n`
  }
};

// Helper function to safely get the current model's config (defaults to Qwen if not found)
export const getActiveSLMConfig = (modelId: string): SLMConfig => {
  return SLM_REGISTRY[modelId] || SLM_REGISTRY['qwen-2.5-coder-3b'];
};