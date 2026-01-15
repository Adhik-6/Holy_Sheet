// app/api/chat/route.ts
import { NextResponse } from "next/server";
import Groq from "groq-sdk";

// Initialize Groq Client
const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY
});

export async function POST(request: Request) {
  try {
    // 1. Parse Body (Equivalent to req.body)
    const body = await request.json();
    const { prompt } = body;

    if (!prompt) {
      return NextResponse.json({ error: "Prompt is required" }, { status: 400 });
    }

    // 2. Call Groq (Llama 3 - 70B is powerful and free)
    const completion = await groq.chat.completions.create({
      messages: [
        // If you passed the system prompt in the body, use that. 
        // Otherwise, inject it here if strictly server-side.
        { role: "user", content: prompt } 
      ],
      model: "llama3-70b-8192", 
      temperature: 0.1, // Low temperature for code generation
      response_format: { type: "json_object" } // Force JSON mode
    });

    const text = completion.choices[0]?.message?.content || "";

    // 3. Send Response (Equivalent to res.json)
    return NextResponse.json({ text });

  } catch (error: any) {
    console.error("API Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error", details: error.message },
      { status: 500 }
    );
  }
}