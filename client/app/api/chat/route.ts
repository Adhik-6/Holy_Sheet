// app/api/chat/route.ts
import { NextResponse } from "next/server";
import { getLLMResponse } from "@/lib/index"; 
import { LLMProvider } from "@/types/global";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { prompt, provider } = body; 

    if (!prompt) {
      return NextResponse.json({ error: "Prompt is required" }, { status: 400 });
    }

    // 1. Determine which Model to use
    // Priority: 
    //   1. Value sent from Frontend (user choice)
    //   2. Value in .env.local (default setting)
    //   3. Fallback to 'gemini'
    const selectedProvider = (provider || process.env.DEFAULT_LLM_PROVIDER || 'gemini') as LLMProvider;

    console.log(`Using LLM Provider: ${selectedProvider}`);

    // 2. Call the factory function
    const text = await getLLMResponse(selectedProvider, prompt);

    return NextResponse.json({ text });

  } catch (error: any) {
    console.error("LLM Dispatch Error:", error);
    return NextResponse.json(
      { error: "AI Generation Failed", details: error.message },
      { status: 500 }
    );
  }
}