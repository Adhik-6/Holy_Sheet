"use client"

import { useState, useRef, useEffect } from 'react';
import { GoogleGenerativeAI } from "@google/generative-ai";
import { Message, AIResponse } from './types'; 
import { Header, Sidebar, ChatArea, InputArea } from './components/index';
import msgs from "@/data/messages.json";

// --- SYSTEM PROMPT ---
const systemPrompt = `
You are ExcelGPT, an advanced data analyst.
You MUST respond using ONLY a valid JSON object. Do not add markdown formatting.

RESPONSE FORMATS:

1. For purely text explanations:
{
  "type": "markdown",
  "summary": "Your markdown explanation here..."
}

2. For Data Visualizations (Charts + KPIs):
{
  "type": "chart",
  "summary": "Brief explanation of the chart...",
  "data": {
    "config": {
      "type": "line" | "bar" | "pie",
      "title": "Revenue Trend Q3",
      "xAxisKey": "month",
      "series": [
        { "dataKey": "revenue", "label": "Total Revenue", "color": "hsl(var(--primary))" }
      ]
    },
    "data": [
      { "month": "Aug", "revenue": 5000 },
      { "month": "Sep", "revenue": 7000 }
    ]
  }
}

3. For KPI Cards (Summary Stats):
{
  "type": "kpi",
  "summary": "Here are the key metrics.",
  "data": [
    { "label": "Total Revenue", "value": "$12,000", "status": "positive", "trend": "+12%" }
  ]
}

4. For Tables:
{
  "type": "table",
  "summary": "Here is the raw data.",
  "data": {
    "headers": ["Name", "Role"],
    "rows": [["Alice", "Admin"], ["Bob", "User"]]
  }
}
`;

export default function ChatPage() {
  // Initialize state with data from JSON
  const [messages, setMessages] = useState<Message[]>(msgs as Message[]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  // UPDATED: handleSend now accepts the optional file from InputArea
  const handleSend = async (file?: File | null) => {
    if (!input.trim() && !file) return;

    // 1. Create User Message
    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      // Attach file metadata if present
      attachment: file ? {
        name: file.name,
        size: file.size,
        type: file.name.split('.').pop() || 'file'
      } : undefined
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    try {
      const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY; 
      if (!apiKey) throw new Error("API Key missing");

      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ 
        model: "gemini-1.5-flash", 
        systemInstruction: systemPrompt,
        generationConfig: { responseMimeType: "application/json" } 
      });

      // 2. Prepare Context (History)
      // Convert complex objects back to strings for Gemini context
      const history = messages.map(m => ({
        role: m.role === 'assistant' ? 'model' : 'user',
        parts: [{ 
          text: typeof m.content === 'string' 
            ? m.content 
            : JSON.stringify(m.content) 
        }]
      }));

      const chat = model.startChat({ history });

      // 3. Construct the prompt
      // If there is a file, we prepend a note to the AI so it knows what it's looking at
      const promptContent = file 
        ? `[User uploaded file: ${file.name}] ${input}` 
        : input;

      const result = await chat.sendMessage(promptContent);
      const responseText = result.response.text();

      // 4. Parse the JSON Response safely
      let parsedContent: AIResponse;
      try {
        parsedContent = JSON.parse(responseText);
      } catch (e) {
        // Fallback if AI returns bad JSON
        parsedContent = {
          type: 'markdown',
          summary: responseText
        };
      }

      const assistantMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: parsedContent,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      
      setMessages(prev => [...prev, assistantMsg]);

    } catch (err) {
      console.error(err);
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: { type: 'markdown', summary: "Error: Failed to connect to AI engine." },
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="flex h-screen w-full bg-transparent text-foreground overflow-hidden relative font-sans selection:bg-primary/30 selection:text-primary-foreground">
      {/* Ambient Glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] bg-[color-mix(in_srgb,var(--primary),transparent_85%)] blur-[120px] rounded-full -z-10 pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[60vw] h-[60vw] bg-[color-mix(in_srgb,var(--accent),transparent_85%)] blur-[140px] rounded-full -z-10 pointer-events-none" />

      <Sidebar />

      <main className="flex-1 flex flex-col h-full relative overflow-hidden">
        <Header />
        
        <ChatArea 
          scrollRef={scrollRef} 
          messages={messages} 
          isTyping={isTyping} 
        />

        <InputArea 
          handleSend={handleSend} 
          input={input} 
          setInput={setInput} 
          disabled={isTyping} 
        />
      </main>
    </div>
  );
}
