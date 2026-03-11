import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export type ModelMode = 'auto' | 'llm' | 'slm';

export interface AppState {
  // --------------------------------------------------------
  // Existing State Variables
  // --------------------------------------------------------
  mode: ModelMode;
  activeLLM: string;
  activeSLM: string;
  
  // --------------------------------------------------------
  // Native Engine Settings
  // --------------------------------------------------------
  useGpu: boolean;
  useMmap: boolean;
  cpuThreads: number;
  contextSize: number;
  temperature: number;

  // --------------------------------------------------------
  // Actions (Setters)
  // --------------------------------------------------------
  setMode: (mode: ModelMode) => void;
  setActiveLLM: (modelId: string) => void;
  setActiveSLM: (modelId: string) => void;
  
  setUseGpu: (use: boolean) => void;
  setUseMmap: (use: boolean) => void;
  setCpuThreads: (threads: number) => void;
  setContextSize: (size: number) => void;
  setTemperature: (temp: number) => void;
}

export const useSettingsStore = create<AppState>()(
  persist(
    (set) => ({
      // Initial Default Values
      mode: 'auto',
      activeLLM: 'groq', 
      activeSLM: 'qwen-2.5-coder-3b', // Updated to match your actual file

      // Safe Native Defaults
      useGpu: false,       // Default to universally safe CPU
      useMmap: true,       // Default to safe RAM usage
      cpuThreads: 4,       // Balanced thermal profile
      contextSize: 2048,   // Standard context
      temperature: 0.1,    // Low temp for accurate coding

      // Actions
      setMode: (mode) => set({ mode }),
      setActiveLLM: (id) => set({ activeLLM: id }),
      setActiveSLM: (id) => set({ activeSLM: id }),
      
      setUseGpu: (useGpu) => set({ useGpu }),
      setUseMmap: (useMmap) => set({ useMmap }),
      setCpuThreads: (cpuThreads) => set({ cpuThreads }),
      setContextSize: (contextSize) => set({ contextSize }),
      setTemperature: (temperature) => set({ temperature }),
    }),
    {
      name: 'holy_sheets-storage', // Key name in localStorage
      storage: createJSONStorage(() => localStorage), 
    }
  )
);