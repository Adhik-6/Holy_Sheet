// lib/index.ts
import { getPyodide, processAgentRequest } from "./aiService";
import { formatContextForPrompt, buildFileContext } from "./contextBuilder";
import { loadModelForChat } from "./modelLoader"; // Updated import

import { callGemini, callGroq, callCustomEndpoint, callOpenAI, getLLMResponse, callLocalSLM } from "./llm";

import { cn } from "./utils";

export { 
    getPyodide, processAgentRequest,
    formatContextForPrompt, buildFileContext,
    callGemini, callGroq, callCustomEndpoint, callOpenAI, getLLMResponse, callLocalSLM,
    cn,
    loadModelForChat, 
    // getRunningWllama ❌ REMOVED
};