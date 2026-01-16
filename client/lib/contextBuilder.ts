// src/utils/contextBuilder.ts
import * as XLSX from 'xlsx';
import { FileContext } from '@/types/global';

/**
 * Reads an Excel/CSV file and returns a lightweight schema summary
 * to be sent to the LLM (not the whole file).
 */
export const buildFileContext = async (file: File): Promise<FileContext> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        
        // Assume working with the first sheet for now
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        
        // Convert to JSON to inspect headers and data
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
        
        if (jsonData.length === 0) {
          reject(new Error("File is empty"));
          return;
        }

        const rawHeaders = jsonData[0] as string[];
        const headers = rawHeaders.map(h => (h || '').toString().trim());
        const rows = jsonData.slice(1);
        
        // Create the context object
        const context: FileContext = {
          fileName: file.name,
          sheetNames: workbook.SheetNames,
          columns: headers,
          sampleData: rows.slice(0, 5), // Only send first 5 rows to LLM
          rowCount: rows.length
        };

        resolve(context);
      } catch (err) {
        reject(err);
      }
    };

    reader.onerror = (err) => reject(err);
    reader.readAsArrayBuffer(file);
  });
};

/**
 * Formats the FileContext into a string string for the LLM System Prompt
 */
export const formatContextForPrompt = (context: FileContext): string => {
  return `
  ACTIVE FILE METADATA:
  - File Name: "${context.fileName}"
  - Sheet Name: "${context.sheetNames[0]}"
  - Total Rows: ${context.rowCount}
  - Columns: ${JSON.stringify(context.columns)}
  - Sample Data (Top 5 rows): 
    ${JSON.stringify(context.sampleData)}
  `;
};