import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export type ModelMode = 'auto' | 'llm' | 'slm';

export interface AppState {
  // State Variables
  mode: ModelMode;
  activeLLM: string;
  activeSLM: string;
  
  // Actions (Setters)
  setMode: (mode: ModelMode) => void;
  setActiveLLM: (modelId: string) => void;
  setActiveSLM: (modelId: string) => void;
}

export const useSettingsStore = create<AppState>()(
  persist(
    (set) => ({
      // Initial Default Values
      mode: 'auto',
      activeLLM: 'groq', 
      activeSLM: 'llama-3-8b-quantized',

      // Actions
      setMode: (mode) => set({ mode }),
      setActiveLLM: (id) => set({ activeLLM: id }),
      setActiveSLM: (id) => set({ activeSLM: id }),
    }),
    {
      name: 'holy_sheets-storage', // Key name in localStorage
      storage: createJSONStorage(() => localStorage), 
    }
  )
);