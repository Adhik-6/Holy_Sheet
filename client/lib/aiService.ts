// lib/aiService.ts
import axios from 'axios';
import { loadPyodide } from "pyodide"; // <--- Import directly
import { Message, AIResponse } from '@/app/chat/types'; // Adjust path if needed

// --- 1. PYODIDE SINGLETON ---
// We only want to load the Python engine once.
let pyodideInstance: any = null;

async function getPyodide() {
  if (pyodideInstance) return pyodideInstance;

  console.log("Initializing Pyodide...");

  // Initialize Pyodide
  // indexURL is required so it knows where to fetch the WASM and standard lib
  pyodideInstance = await loadPyodide({
    indexURL: "/pyodide/"
  });
  
  // Pre-load essential Data Science packages
  console.log("Loading Pandas...");
  await pyodideInstance.loadPackage(["pandas", "micropip"]);
  
  // Setup environment: Import pandas globally
  await pyodideInstance.runPythonAsync(`
    import pandas as pd
    import json
    import io
  `);
  
  console.log("Pyodide Ready.");
  return pyodideInstance;
}

// --- 2. SYSTEM PROMPTS ---
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

// --- 3. THE SERVICE ---

interface AgentRequest {
  userMessage: string;
  fileContext: string;     // The schema string
  history: Message[];
  
  // File handling for Pyodide
  fileData?: ArrayBuffer;  // Actual file bytes (only needed on new upload)
  fileName?: string;       // Needed if fileData is present
  
  useLocalModel?: boolean;
}

export async function processAgentRequest(params: AgentRequest): Promise<AIResponse> {
  const { userMessage, fileContext, history, fileData, fileName } = params;
  
  // Step A: Initialize Pyodide & Load Data (if new file)
  const pyodide = await getPyodide();
  
  if (fileData && fileName) {
    console.log(`Mounting file ${fileName} to Pyodide FS...`);
    pyodide.FS.writeFile(fileName, new Uint8Array(fileData));
    
    // Determine loader based on extension
    const readCmd = fileName.endsWith('.csv') 
      ? `df = pd.read_csv('${fileName}')` 
      : `df = pd.read_excel('${fileName}')`;
      
    await pyodide.runPythonAsync(readCmd);
    console.log("Data loaded into variable 'df'.");
  }

  // Step B: Construct Prompt for the LLM
  // We combine the System Prompt + File Schema + Conversation History
  const fullPrompt = `
  ${SYSTEM_PROMPT}

  DATA SCHEMA:
  ${fileContext}

  USER REQUEST: "${userMessage}"
  
  Write the Python script now.
  `;

  // Step C: The Agent Loop (Generate Code -> Execute -> Retry)
  let attempts = 0;
  const maxRetries = 2;
  let lastError: string | null = null;
  let currentPrompt = fullPrompt;

  while (attempts <= maxRetries) {
    try {
      attempts++;
      console.log(`Attempt ${attempts}: Generating Python code...`);
      
      // 1. Get Code from AI
      const pythonCode = await callLLM(currentPrompt, params.useLocalModel);
      
      // 2. Clean Code (remove markdown fences if LLM ignored instructions)
      const cleanCode = pythonCode.replace(/```python/g, '').replace(/```/g, '').trim();
      console.log("Executing Code:", cleanCode);

      // 3. Execute in Pyodide
      // We capture stdout to get the JSON result
      pyodide.setStdout({ batched: (str: string) => { /* ignore intermediate prints */ } });
      
      // Run the code and capture the result of the LAST expression or print statement
      // We wrap it to ensure we capture the specific JSON print
      await pyodide.runPythonAsync(`
        import sys
        from io import StringIO
        _old_stdout = sys.stdout
        sys.stdout = _captured = StringIO()
        
        try:
          ${cleanCode}
        except Exception as e:
          raise e
        finally:
          sys.stdout = _old_stdout
      `);
      
      const rawOutput = pyodide.runPython("_captured.getvalue()");
      console.log("Pyodide Output:", rawOutput);

      // 4. Parse JSON
      const jsonResponse = JSON.parse(rawOutput);
      
      // Basic validation
      if (!jsonResponse.type || !jsonResponse.summary) {
        throw new Error("Invalid JSON structure returned");
      }

      return jsonResponse as AIResponse;

    } catch (err: any) {
      console.warn(`Attempt ${attempts} failed:`, err.message);
      lastError = err.message;

      // SELF-CORRECTION PROMPT
      currentPrompt = `
      The previous python script you wrote failed with this error:
      "${lastError}"

      Original Request: "${userMessage}"
      
      Please analyze the error and RE-WRITE the script to fix it.
      Remember: The dataframe is named 'df'.
      `;
    }
  }

  // If all retries fail
  return {
    type: 'markdown',
    summary: `I tried to analyze the data but encountered an error I couldn't fix: ${lastError}`
  };
}

// --- 4. MODEL ADAPTER (Cloud vs Local) ---

async function callLLM(prompt: string, useLocal: boolean = false): Promise<string> {
  if (useLocal) {
    throw new Error("Local LLM not implemented yet");
  } else {
    try {
      // call the Next.js API Route using Axios
      const response = await axios.post('/api/chat', {
        prompt: prompt
      });
      
      // Axios automatically throws on 4xx/5xx errors, 
      // so we don't need the "if (!response.ok)" check manually.
      
      // Axios also automatically parses JSON, so we access .data directly
      return response.data.text; 

    } catch (error: any) {
      console.error("LLM Call Failed:", error);
      
      // Axios wraps the actual server response in error.response
      const errorMessage = error.response?.data?.error || error.message || "Unknown API Error";
      throw new Error(`AI Service Error: ${errorMessage}`);
    }
  }
}