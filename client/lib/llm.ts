// lib/llm.ts
import { GoogleGenerativeAI } from "@google/generative-ai";
import OpenAI from "openai";
import Groq from "groq-sdk";
import axios from "axios";

import { LLMProvider } from "@/types/global";

const SYSTEM_PROMPT = `
You are an expert Python Data Analyst working in a restricted browser environment (Pyodide).
Your goal is to answer the user's question by writing a VALID, BUG-FREE PYTHON SCRIPT.

--- CRITICAL SURVIVAL RULES ---
1. DATA LOADING: The dataframe 'df' is ALREADY LOADED. Do NOT use pd.read_csv().
2. COLUMN SAFETY: 
   - NEVER guess column names. Check the provided schema.
   - NEVER use position-based indexing (like df.iloc[:, 2]) for aggregations. It is fragile.
   - ALWAYS use explicit column names (e.g., df['Sales'] + df['Profit']).
3. HANDLING NANS (Crucial):
   - JSON fails on NaN/Infinity. 
   - You MUST run this cleaner line before dumping JSON:
     df = df.where(pd.notnull(df), None)
4. OUTPUT FORMAT:
   - Output ONLY raw Python code. NO Markdown blocks (\`\`\`). NO explanations.
   - The LAST executable line MUST be: print(json.dumps(output_payload, default=str))

--- EXPECTED JSON OUTPUT STRUCTURE ---
(You must output a JSON object that matches one of these TypeScript interfaces)

type ChartPayload = {
  config: {
    type: 'bar' | 'line' | 'pie';
    title: string;
    xAxisKey: string;
    series: { dataKey: string; label: string; color?: string }[];
  };
  data: Record<string, any>[]; 
};

type Output = 
  | { type: 'markdown'; summary: string }
  | { type: 'chart'; summary: string; data: ChartPayload }
  | { type: 'table'; summary: string; data: { headers: string[]; rows: any[][] } }
  | { type: 'kpi'; summary: string; data: { label: string; value: string; status?: 'positive'|'negative' }[] };

--- EXAMPLES ---

[SCENARIO 1: Bar Chart (Categorical)]
# Logic: Group by Category, sum Sales
grouped = df.groupby('Category')['Sales'].sum().reset_index()
grouped = grouped.where(pd.notnull(grouped), None)
print(json.dumps({
  "type": "chart",
  "summary": "Sales by Category",
  "data": {
    "config": { 
      "type": "bar", "title": "Sales by Category", "xAxisKey": "Category", 
      "series": [{"dataKey": "Sales", "label": "Sales Amount"}] 
    },
    "data": grouped.to_dict(orient='records')
  }
}, default=str))

[SCENARIO 2: Line Chart (Time-Series)]
# Logic: Sort by Date is CRITICAL for line charts
trend = df.sort_values('Date').groupby('Date')['Profit'].sum().reset_index()
trend = trend.where(pd.notnull(trend), None)
print(json.dumps({
  "type": "chart",
  "summary": "Profit Trend over Time",
  "data": {
    "config": { 
      "type": "line", "title": "Profit Trend", "xAxisKey": "Date", 
      "series": [{"dataKey": "Profit", "label": "Total Profit"}] 
    },
    "data": trend.to_dict(orient='records')
  }
}, default=str))

[SCENARIO 3: Table (Raw Data)]
# Logic: Filter top 5 rows, select specific columns
top_5 = df.nlargest(5, 'Sales')[['Date', 'Product', 'Sales']]
top_5 = top_5.where(pd.notnull(top_5), None)
print(json.dumps({
  "type": "table",
  "summary": "Top 5 Sales Transactions",
  "data": {
    "headers": top_5.columns.tolist(),
    "rows": top_5.values.tolist()
  }
}, default=str))

[SCENARIO 4: KPI (Single Value)]
total_rev = df['Revenue'].sum()
print(json.dumps({
  "type": "kpi",
  "summary": "Total Revenue",
  "data": [{ "label": "Revenue", "value": f"\${total_rev:,.2f}", "status": "positive" }]
}, default=str))
`;


export async function callGemini(prompt: string): Promise<string> {
  printPrompt(prompt);
  const fullPrompt = `
${SYSTEM_PROMPT}

${prompt}
`;
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
  const model = genAI.getGenerativeModel({ 
    model: "gemini-1.5-flash",
    // Force JSON for consistent output if supported, or rely on prompt engineering
    generationConfig: { responseMimeType: "application/json" } 
  });

  const result = await model.generateContent(fullPrompt);
  const response = await result.response;
  return response.text();
}

// --- 2. OPENAI (CHATGPT) IMPLEMENTATION ---
export async function callOpenAI(prompt: string): Promise<string> {
  printPrompt(prompt);
  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  
  const completion = await openai.chat.completions.create({
    messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: prompt }
    ],
    model: "gpt-4-turbo", // or gpt-3.5-turbo
    response_format: { type: "json_object" }, // Crucial for your use case
  });

  return completion.choices[0].message.content || "";
}

// --- 3. GROQ IMPLEMENTATION ---
export async function callGroq(prompt: string): Promise<string> {
  printPrompt(prompt);
  const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

  const completion = await groq.chat.completions.create({
    messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: prompt }
    ],
    model: "llama-3.3-70b-versatile",
    temperature: 0.1,
    stream: false,
    stop: null,
    top_p: 1,
    max_completion_tokens: 1024
  });

  return completion.choices[0]?.message?.content || "";
}

// --- 4. CUSTOM ENDPOINT (Your hosted SLM/Colab) ---
export async function callCustomEndpoint(prompt: string): Promise<string> {
  printPrompt(prompt);
  // Assume your custom API expects { prompt: string } and returns { response: string }
  const endpoint = process.env.CUSTOM_LLM_URL; // e.g., "https://xyz.ngrok-free.app/generate"
  if (!endpoint) throw new Error("Custom Endpoint URL not defined in .env");

  const response = await axios.post(`${endpoint}/generate`, { 
    prompt: prompt,
    systemPrompt: SYSTEM_PROMPT
    // Add any headers or secrets if your custom API needs them
    // headers: { "Authorization": `Bearer ${process.env.CUSTOM_API_SECRET}` }
  });

  // Adjust this based on your custom API's actual response structure
  return response.data.text || response.data.response; 
}

// --- THE SWITCHER (FACTORY) ---

export async function getLLMResponse(provider: LLMProvider, prompt: string): Promise<string> {
  switch (provider) {
    case 'gemini':
      return await callGemini(prompt);
    case 'openai':
      return await callOpenAI(prompt);
    case 'groq':
      return await callGroq(prompt);
    case 'custom':
      return await callCustomEndpoint(prompt);
    default:
      throw new Error(`Unsupported provider: ${provider}`);
  }
}

function printPrompt(prompt: string) {
  console.log("----- LLM SYSTEM PROMPT START -----");
  console.log(SYSTEM_PROMPT);
  console.log("----- LLM SYSTEM PROMPT END -----");
  console.log("----- LLM PROMPT START -----");
  console.log(prompt);
  console.log("----- LLM PROMPT END -----");
}