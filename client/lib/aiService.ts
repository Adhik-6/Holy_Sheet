// lib/aiService.ts
import axios from 'axios';
import { AIResponse } from '@/app/chat/types'; // Adjust path if needed
import { AgentRequest } from '@/types/global';

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
      
    await pyodide.runPythonAsync(readCmd);
    console.log("Data loaded into variable 'df'.");
  }

  // Step B: Construct Prompt for the LLM
  // We combine the System Prompt + File Schema + Conversation History
  const fullPrompt = `
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
      console.log(`Attempt ${++attempts}: Generating Python code...`);
      
      // 1. Get Code from AI
      const pythonCode = await callLLM(currentPrompt, params.useLocalModel);
      
      // 2. Clean Code (remove markdown fences if LLM ignored instructions)
      const cleanCode = pythonCode.replace(/```python/g, '').replace(/```/g, '').trim();
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
      pyodide.setStdout({ batched: (str: string) => { /* ignore intermediate prints */ } });
      
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