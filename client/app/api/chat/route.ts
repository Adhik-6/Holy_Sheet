// app/api/chat/route.ts
import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

// 1. Initialize Gemini Client
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function POST(request: Request) {
  try {
    // 2. Parse the incoming JSON body (like req.body in Express)
    const body = await request.json();
    const { prompt } = body;

    if (!prompt) {
      return NextResponse.json(
        { error: "Prompt is required" }, 
        { status: 400 }
      );
    }

    // 3. Call the LLM
    // We use gemini-1.5-flash for speed/cost, or pro for better reasoning
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    // We expect the prompt to contain the System Instructions + User Query + Schema
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // 4. Return the result
    return NextResponse.json({ text });

  } catch (error: any) {
    console.error("API Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error", details: error.message },
      { status: 500 }
    );
  }
}