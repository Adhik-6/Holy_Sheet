"use client"

import { useState, useRef, useEffect } from 'react';
import { Message } from './types';
import { FileContext } from '@/types/global';
import { Header, Sidebar, ChatArea, InputArea } from './components/index';
import { buildFileContext, formatContextForPrompt, processAgentRequest } from '@/lib/index';
import msgs from "@/data/messages.json"

let fileData: ArrayBuffer | undefined;

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>(msgs as Message[]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  
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

      if (file) {
        const newContext = await buildFileContext(file);
        setActiveFileContext(newContext);
        currentContext = newContext;
        fileData = await file.arrayBuffer();
      }

      if (currentContext) {
        systemContextString = formatContextForPrompt(currentContext);
      }

      const aiResponse = await processAgentRequest({
        userMessage: input,
        fileContext: systemContextString,
        history: messages,
        fileData: fileData,
        fileName: file?.name,
        useLocalModel: false 
      });

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
    // CHANGE 1: Use 'h-[100dvh]' for mobile browser compatibility
    <div className="flex h-dvh w-full bg-transparent text-foreground overflow-hidden relative font-sans selection:bg-primary/30 selection:text-primary-foreground">
      
      {/* Ambient Glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] bg-[color-mix(in_srgb,var(--primary),transparent_85%)] blur-[120px] rounded-full -z-10 pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[60vw] h-[60vw] bg-[color-mix(in_srgb,var(--accent),transparent_85%)] blur-[140px] rounded-full -z-10 pointer-events-none" />

      {/* CHANGE 2: Wrap Sidebar in a div that is HIDDEN on mobile (<md) and VISIBLE on desktop (md+) */}
      {/* This prevents the sidebar from squishing the chat area on phones */}
      <div className="hidden md:flex h-full flex-col z-20 justify-between">
        <Sidebar />
      </div>

      <main className="flex-1 flex flex-col h-full relative overflow-hidden">
        <Header />
        
        {/* ChatArea takes remaining height */}
        <ChatArea 
          scrollRef={scrollRef} 
          messages={messages} 
          isTyping={isTyping} 
        />
        
        {/* InputArea stays at the bottom */}
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