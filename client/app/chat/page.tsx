"use client"

import { useState, useRef, useEffect } from 'react';
import { Capacitor } from "@capacitor/core";
import { Message } from './types';
import { FileContext } from '@/types/global';
import { Header, Sidebar, ChatArea, InputArea } from './components/index';
import { buildFileContext, formatContextForPrompt, processAgentRequest, loadModelForChat } from '@/lib/index';
import msgs from "@/data/messages.json";
import { useNetworkStatus } from "@/lib/networkStatusHook";
import { ModelMode } from './components/Header'; 
import Link from 'next/link'; 
import { Download, Loader2 } from 'lucide-react'; 

let fileData: ArrayBuffer | undefined;

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>(msgs as Message[]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [activeFileContext, setActiveFileContext] = useState<FileContext | null>(null);
  
  // --- MODIFIED MODEL STATE ---
  // We no longer store the 'wllama' object here. Just a flag.
  const [isModelReady, setIsModelReady] = useState(false); 
  const [isModelLoading, setIsModelLoading] = useState(false);
  const [modelError, setModelError] = useState<string | null>(null);

  const isOnline = useNetworkStatus();
  const [selectedMode, setSelectedMode] = useState<ModelMode>("auto");

  useEffect(() => {
    if (!Capacitor.isNativePlatform()) {
      setSelectedMode("llm");
    }
  }, []);

  const actualMode = selectedMode === "auto" 
    ? (isOnline ? "llm" : "slm") 
    : selectedMode;

  const scrollRef = useRef<HTMLDivElement>(null);

  // --- 💡 SMART MODEL LOADING (Singleton Version) ---
  useEffect(() => {
    // 1. If we switched to SLM and it's not ready yet...
    if (actualMode === 'slm' && !isModelReady) {
      
      const initModel = async () => {
        setIsModelLoading(true);
        setModelError(null);
        try {
          // 2. Call the Loader. It saves the instance globally.
          await loadModelForChat((progress) => {
             console.log(`Loading into RAM: ${progress}%`);
          });
          
          // 3. Mark as Ready (UI Unlock)
          setIsModelReady(true);
          
        } catch (err: any) {
          if (err.message === "MODEL_NOT_DOWNLOADED") {
            setModelError("missing_download");
          } else {
            console.error("Model Load Error:", err);
            setModelError("generic_error");
          }
        } finally {
          setIsModelLoading(false);
        }
      };

      initModel();
    }
  }, [actualMode, isModelReady]); 

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

    // BLOCKER: Check our boolean flag
    if (actualMode === 'slm' && !isModelReady) {
      alert("Please wait for the model to load.");
      return;
    }

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
        useLocalModel: actualMode === 'slm',
        // ❌ REMOVED: wllamaInstance: wllama 
        // (The service grabs it from the singleton now)
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
    <div className="flex h-dvh w-full bg-transparent text-foreground overflow-hidden relative font-sans selection:bg-primary/30 selection:text-primary-foreground">
      
      <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] bg-[color-mix(in_srgb,var(--primary),transparent_85%)] blur-[120px] rounded-full -z-10 pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[60vw] h-[60vw] bg-[color-mix(in_srgb,var(--accent),transparent_85%)] blur-[140px] rounded-full -z-10 pointer-events-none" />

      <div className="hidden md:flex h-full flex-col z-20 justify-between">
        <Sidebar />
      </div>

      <main className="flex-1 flex flex-col h-full relative overflow-hidden">
        <Header 
            isOnline={isOnline} 
            mode={selectedMode} 
            setMode={setSelectedMode} 
        />
        
        {/* --- ERROR / LOADING OVERLAYS --- */}
        
        {/* CASE 1: Model Missing */}
        {actualMode === 'slm' && modelError === 'missing_download' && (
           <div className="absolute inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-6">
              <div className="bg-card border border-border p-6 rounded-2xl shadow-2xl max-w-md text-center flex flex-col items-center">
                 <div className="bg-red-100 dark:bg-red-900/30 p-4 rounded-full mb-4">
                    <Download className="text-red-500" size={32} />
                 </div>
                 <h2 className="text-xl font-bold mb-2">Download Required</h2>
                 <p className="text-muted-foreground mb-6">
                    You switched to <b>Offline Mode</b>, but the AI model is not downloaded yet.
                 </p>
                 <Link href="/models" className="w-full">
                    <button className="w-full bg-primary text-primary-foreground py-3 rounded-xl font-bold hover:opacity-90 transition-all flex items-center justify-center gap-2">
                       <Download size={18} />
                       Go to Model Manager
                    </button>
                 </Link>
                 <button 
                   onClick={() => setSelectedMode('llm')}
                   className="mt-3 text-sm text-muted-foreground hover:text-foreground underline"
                 >
                   Switch back to Cloud Mode
                 </button>
              </div>
           </div>
        )}

        {/* CASE 2: Loading Model (Loading into RAM) */}
        {actualMode === 'slm' && isModelLoading && (
           <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-background/50 backdrop-blur-sm">
              <Loader2 className="animate-spin text-primary mb-4" size={40} />
              <h3 className="font-bold text-lg">Waking up AI...</h3>
              <p className="text-sm text-muted-foreground">Loading model into memory</p>
           </div>
        )}

        <ChatArea 
          scrollRef={scrollRef} 
          messages={messages} 
          isTyping={isTyping} 
        />
        
        <InputArea 
          handleSend={handleSend} 
          input={input} 
          setInput={setInput} 
          disabled={isTyping || (actualMode === 'slm' && !isModelReady)} 
        />
      </main>
    </div>
  );
};