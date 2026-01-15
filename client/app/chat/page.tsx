"use client"

import { useState, useRef, useEffect } from 'react';
import { Message } from './types';
import { FileContext } from '@/types/global';
import { Header, Sidebar, ChatArea, InputArea } from './components/index';
import { buildFileContext, formatContextForPrompt, processAgentRequest } from '@/lib/index';

let fileData: ArrayBuffer | undefined;

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  
  // New State: Keep track of the currently loaded file context
  const [activeFileContext, setActiveFileContext] = useState<FileContext | null>(null);
  
  const scrollRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSend = async (file?: File | null) => {
    if (!input.trim() && !file) return;

    // 1. Create User Message UI immediately
    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
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
      let currentContext = activeFileContext;
      let systemContextString = "";

      // 2. If a NEW file is uploaded, process it first
      if (file) {
        // Parse the file locally to get the schema
        const newContext = await buildFileContext(file);
        setActiveFileContext(newContext); // Save to state for follow-up questions
        currentContext = newContext;
        fileData = await file.arrayBuffer();
        
        // Load the file into the Pyodide Engine (Pseudo-code for now)
        // await pyodideEngine.loadFile(file); 
      }

      // 3. Prepare the Context String for the LLM
      if (currentContext) {
        systemContextString = formatContextForPrompt(currentContext);
      }

      // 4. Call the Independent AI Service
      // This function handles the LLM/SLM switch and the Python Execution Loop
      const aiResponse = await processAgentRequest({
        userMessage: input,
        fileContext: systemContextString,
        history: messages,
        fileData: fileData, // <--- Add this
        fileName: file?.name, // <--- Add this
        useLocalModel: false 
      });

      // 5. Add Assistant Response
      const assistantMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: aiResponse,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      
      setMessages(prev => [...prev, assistantMsg]);

    } catch (err) {
      console.error(err);
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: { type: 'markdown', summary: "Error: I encountered an issue processing your data." },
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
};