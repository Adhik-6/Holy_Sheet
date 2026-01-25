// lib/aiService.ts
import axios from 'axios';
import { AIResponse } from '@/app/chat/types'; // Adjust path if needed
import { AgentRequest } from '@/types/global';
import { callLocalSLM, getRunningWllama } from './index';

// Helper to safely extract code from LLM markdown response
function extractCodeBlock(response: string): string {
  // 1. Regex to find content specifically inside ```python ... ``` blocks
  const pythonBlock = response.match(/```python([\s\S]*?)```/);
  
  if (pythonBlock && pythonBlock[1]) {
    // Found a block! Return ONLY the content inside it
    return pythonBlock[1].trim();
  }
  
  // 2. Fallback: Check for generic ``` ... ``` blocks
  const genericBlock = response.match(/```([\s\S]*?)```/);
  if (genericBlock && genericBlock[1]) {
    return genericBlock[1].trim();
  }

  // 3. Last Resort: If no blocks found, return the raw text 
  // (but trimmed of potential "Here is the code:" prefixes)
  return response.trim();
}

// --- 1. PYODIDE SINGLETON ---
// We only want to load the Python engine once.
let pyodideInstance: any = null;

const PYODIDE_INDEX =
  process.env.NEXT_PUBLIC_PYODIDE_SOURCE === "local"
    ? "/pyodide/"
    : "https://cdn.jsdelivr.net/pyodide/v0.25.0/full/";

const PYODIDE_URL = `${PYODIDE_INDEX}pyodide.js`;

export async function getPyodide() {
  if (pyodideInstance) return pyodideInstance;

  console.log("Initializing Pyodide...");

  // 1. Load pyodide.js (once)
  if (!(window as any).loadPyodide) {
    const script = document.createElement("script");
    script.src = PYODIDE_URL;
    script.async = true;
    document.body.appendChild(script);
    await new Promise((resolve) => (script.onload = resolve));
  }

  // 2. Initialize runtime
  // @ts-ignore
  pyodideInstance = await window.loadPyodide({
    indexURL: PYODIDE_INDEX,
  });

  // 3. Load required packages (CDN now, local later)
  console.log("Loading Pandas...");
  await pyodideInstance.loadPackage(["pandas", "micropip"]);

  // 3. Manually Install OpenPyXL from local wheels
  // We use micropip to install the specific .whl files we just downloaded
  const micropip = pyodideInstance.pyimport("micropip");
  
  console.log("Installing OpenPyXL locally...");
  await micropip.install([
    "/pyodide/et_xmlfile-1.1.0-py3-none-any.whl", 
    "/pyodide/openpyxl-3.1.2-py2.py3-none-any.whl"
  ]);
  
  // 4. Setup Python Environment
  await pyodideInstance.runPythonAsync(`
    import pandas as pd
    import json
  `);

  console.log("Pyodide Ready.");
  return pyodideInstance;
}

const indentCode = (code: string, indentLevel: number = 4): string => {
  const indent = ' '.repeat(indentLevel);
  return code
    .split('\n')
    .map(line => indent + line)
    .join('\n');
};

// --- 3. THE SERVICE ---
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
      
// Sanitize column names in Python immediately after loading
    const cleanCmd = `
import pandas as pd
global df 
df = ${readCmd}
# Clean column names: strip whitespace and replace spaces with underscores if needed
df.columns = df.columns.astype(str).str.strip()
print("Columns cleaned:", df.columns.tolist())
`;

    await pyodide.runPythonAsync(cleanCmd);
    console.log("Data loaded into variable 'df'.");
  }

  // Step B: Construct Prompt for the LLM
  // We combine the System Prompt + File Schema + Conversation History
  const fullPrompt = `
DATA SCHEMA:
${fileContext}

USER REQUEST: "${userMessage}"

---
FINAL CHECKLIST BEFORE YOU WRITE CODE:
1. Did you use the exact column names from the list above?
2. Did you replace NaNs with None?
3. Is your output pure Python code (no markdown)?

Write the script now.
`;

  // Step C: The Agent Loop (Generate Code -> Execute -> Retry)
  let attempts = 0;
  const maxRetries = 2;
  let lastError: string | null = null;
  let currentPrompt = fullPrompt;

  while (attempts <= maxRetries) {
    try {
      console.log(`Attempt ${++attempts}: Generating Python code...`);
      
      // 1. Get Code from AI
      
      const rawResponse = await callLLM(currentPrompt, params.useLocalModel);
      
      // 2. Clean Code (remove markdown fences if LLM ignored instructions)
      // const cleanCode = pythonCode.replace(/```python/g, '').replace(/```/g, '').trim();
      // 2. Extract ONLY the code (Discarding the "chatty" explanation)
      const cleanCode = extractCodeBlock(rawResponse);
      console.log("Executing Code:", cleanCode);

      const indentedUserCode = indentCode(cleanCode, 4);
      const finalScript = `
import sys
import json
from io import StringIO

# Capture Standard Output
_old_stdout = sys.stdout
sys.stdout = _captured = StringIO()

try:
# --- CRITICAL FIX: explicit global declaration ---
    global df 
    if 'df' not in globals():
        raise NameError("df is missing from global scope! Did the file load?")
${indentedUserCode}
except Exception as e:
    # Restore stdout before raising so we can see the error
    sys.stdout = _old_stdout
    raise e
finally:
    # Always restore stdout
    sys.stdout = _old_stdout
`;

      // 3. Execute in Pyodide
      // We capture stdout to get the JSON result
      // pyodide.setStdout({ batched: (str: string) => { /* ignore intermediate prints */ } });
      
      // Run the code and capture the result of the LAST expression or print statement
      // We wrap it to ensure we capture the specific JSON print
      await pyodide.runPythonAsync(finalScript);
      
      const rawOutput = pyodide.runPython("_captured.getvalue()");
      console.log("Pyodide Output:", rawOutput);

      // 4. Parse JSON
      const jsonResponse = JSON.parse(rawOutput);
      
      // Basic validation
      if (!jsonResponse.type || !jsonResponse.summary) {
        throw new Error("Invalid JSON structure returned");
      }

      return {...jsonResponse, code: indentedUserCode} as AIResponse;

    } catch (err: any) {
      console.warn(`Attempt ${attempts} failed:`, err.message);
      lastError = err.message;

      let columnInfo = "";
      if (lastError?.includes("KeyError")) {
        try {
          // Run a tiny python script to get the actual columns
          const actualColumns = pyodide.runPython("str(list(df.columns))");
          columnInfo = `\nCRITICAL INFO: The available columns in 'df' are strictly: ${actualColumns}. YOU MUST USE THESE EXACT NAMES.`;
          console.log("Detected KeyError. Feedback to AI:", columnInfo);
        } catch (e) { /* ignore if df is somehow not there */ }
      }

      // SELF-CORRECTION PROMPT
      currentPrompt = `
The previous python script you wrote failed with this error:
"${lastError}"
${columnInfo}
Original Request: "${userMessage}"

Please analyze the error and RE-WRITE the script to fix it.
Don't be lazy.
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
    console.log("🧠 Using Local SLM...");
    return await callLocalSLM(prompt);
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