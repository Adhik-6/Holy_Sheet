// lib/llm.ts
import { GoogleGenerativeAI } from "@google/generative-ai";
import OpenAI from "openai";
import Groq from "groq-sdk";
import axios from "axios";

import { LLMProvider } from "@/types/global";

const SYSTEM_PROMPT = `
You are a Python Data Analyst.
Your goal is to answer the user's question by writing a VALID PYTHON SCRIPT.

RULES:
1. You have a pandas DataFrame named 'df' ALREADY LOADED. Do not load it yourself.
2. You MUST use 'df' to calculate the answer.
3. The LAST line of your script must print a JSON object.
4. Do NOT wrap code in markdown blocks (like \`\`\`python). Just raw code.
5. If the user asks for a chart, return the 'chart' JSON type.
6. If the user asks for a table, return the 'table' JSON type.

EXPECTED JSON OUTPUT STRUCTURE (TypeScript Interface):

type ChartPayload = {
  config: {
    type: 'bar' | 'line' | 'pie';
    title: string;
    xAxisKey: string;
    series: { dataKey: string; label: string; color?: string }[];
  };
  data: any[]; // The array of objects for the chart
};

type Output = 
  | { type: 'markdown'; summary: string }
  | { type: 'chart'; summary: string; data: ChartPayload }
  | { type: 'table'; summary: string; data: { headers: string[]; rows: any[][] } }
  | { type: 'kpi'; summary: string; data: { label: string; value: string; status?: 'positive'|'negative' }[] };

EXAMPLE PYTHON SCRIPT:
# Calculate revenue by month
monthly = df.groupby('Month')['Revenue'].sum().reset_index()
print(json.dumps({
  "type": "chart",
  "summary": "Revenue peaked in December.",
  "data": {
    "config": { "type": "bar", "title": "Revenue", "xAxisKey": "Month", "series": [{"dataKey": "Revenue", "label": "Rev"}] },
    "data": monthly.to_dict(orient='records')
  }
}))
`;

// --- 1. GEMINI IMPLEMENTATION ---
export async function callGemini(prompt: string): Promise<string> {
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
  const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

  const completion = await groq.chat.completions.create({
    messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: prompt }
    ],
    model: "llama3-70b-8192",
    temperature: 0.1,
    response_format: { type: "json_object" }
  });

  return completion.choices[0]?.message?.content || "";
}

// --- 4. CUSTOM ENDPOINT (Your hosted SLM/Colab) ---
export async function callCustomEndpoint(prompt: string): Promise<string> {
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