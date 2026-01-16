export {};

import { Message } from "@/app/chat/types";

declare global {
  interface Window {
    loadPyodide?: (config?: any) => Promise<any>;
  }
}

export type LLMProvider = 'gemini' | 'openai' | 'groq' | 'custom';

export interface FileContext {
  fileName: string;
  sheetNames: string[];
  columns: string[];
  sampleData: any[];
  rowCount: number;
}

export interface AgentRequest {
  userMessage: string;
  fileContext: string;     // The schema string
  history?: Message[];
  numericColumns?: string[];

  
  // File handling for Pyodide
  fileData?: ArrayBuffer;  // Actual file bytes (only needed on new upload)
  fileName?: string;       // Needed if fileData is present
  
  useLocalModel?: boolean;
}