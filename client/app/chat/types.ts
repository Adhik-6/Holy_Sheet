// app/types.ts

export type ModelMode = "auto" | "llm" | "slm";

// --- 1. Sub-Types ---

export interface Kpi {
  label: string;
  value: string | number;
  trend?: string; // e.g., "+5%"
  status?: 'positive' | 'negative' | 'neutral';
}

// app/types.ts

// 1. The Configuration Object
// This tells the renderer HOW to draw the data
export interface ChartConfig {
  type: 'line' | 'bar' | 'pie' | 'area' | 'scatter'; // <--- Discriminator
  title: string;
  xAxisKey: string; // Key for the X-axis labels (e.g., "month")
  
  // Array allows for multi-line or stacked bars
  series: { 
    dataKey: string; // Key for values (e.g., "revenue")
    label: string;   // Human readable name (e.g., "Total Revenue")
    color: string;   // Hex or CSS var (e.g., "hsl(var(--primary))")
  }[];
}

// 2. The Raw Data Points
// Generic structure allows any shape: { month: "Jan", revenue: 500, cost: 300, ... }
export type DataPoint = Record<string, string | number>;

// 3. The Final Interface for AI Response
export interface ChartPayload {
  config: ChartConfig;
  data: DataPoint[];
}

export interface TableData {
  headers: string[];
  rows: string[][];
}

// --- 2. The AI Response Union ---
// This uses "Discriminated Unions" for type safety

export type AIResponse = 
  | { type: 'markdown'; summary: string; data?: never }
  | { type: 'kpi'; code: String, summary: string; data: Kpi[] }
  | { type: 'chart'; code: String, summary: string; data: ChartPayload }
  | { type: 'table'; code: String, summary: string; data: TableData };

// --- 3. The Message Interface ---
export interface Message {
  id: string;
  role: 'user' | 'assistant';
  // User messages are strings; Assistant messages are parsed objects
  content: string | AIResponse; 
  timestamp: string;
  attachment?: {
    name: string;
    size: number;
    type: string; // e.g. "csv" or "xlsx"
  };
}