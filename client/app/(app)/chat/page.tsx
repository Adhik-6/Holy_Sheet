"use client"

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link'; 
import { Download, Loader2 } from 'lucide-react'; 
import { Capacitor } from "@capacitor/core";

// Types & Data
import { Message } from './types';
import { FileContext } from '@/types/global';
import msgs from "@/data/messages.json";

// Components
import { ChatArea, InputArea } from './components/index';

// Libs & Hooks
import { buildFileContext, formatContextForPrompt, processAgentRequest, loadModelForChat } from '@/lib/index';
import { useNetworkStatus } from "@/hooks/networkStatusHook";
import { useSettingsStore, AppState } from "@/store/settingsStore"; // ✅ Use Global Store
import { useStore } from "@/hooks/useStore"; // ✅ Use Hydration Safe Hook

let fileData: ArrayBuffer | undefined;

export default function ChatPage() {
  // --- STATE ---
  const [messages, setMessages] = useState<Message[]>(msgs as Message[]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [activeFileContext, setActiveFileContext] = useState<FileContext | null>(null);
  
  // --- MODEL STATE ---
  const [isModelReady, setIsModelReady] = useState(false); 
  const [isModelLoading, setIsModelLoading] = useState(false);
  const [modelError, setModelError] = useState<string | null>(null);

  // --- GLOBAL MODE SYNC ---
  const isOnline = useNetworkStatus();
  
  // 1. Read 'mode' from global store (Header updates this)
  const mode = useStore<AppState, AppState['mode']>(
    useSettingsStore, 
    (state) => state.mode
  ); 
  const { setMode } = useSettingsStore();

  // 2. Calculate Effective Mode
  const actualMode = mode === "auto" 
    ? (isOnline ? "llm" : "slm") 
    : (mode || "auto");

  // 3. Force LLM on Desktop (One-time check)
  useEffect(() => {
    if (!Capacitor.isNativePlatform()) {
      setMode("llm");
    }
  }, []);

  const scrollRef = useRef<HTMLDivElement>(null);

  // --- 💡 SMART MODEL LOADING ---
  useEffect(() => {
    if (actualMode === 'slm' && !isModelReady) {
      const initModel = async () => {
        setIsModelLoading(true);
        setModelError(null);
        try {
          await loadModelForChat((progress) => {
             console.log(`Loading into RAM: ${progress}%`);
          });
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

  // --- AUTO SCROLL ---
  const scrollToBottom = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  // --- SEND HANDLER ---
  const handleSend = async (file?: File | null) => {
    if (!input.trim() && !file) return;

    if (actualMode === 'slm' && !isModelReady) {
      // Fallback alert, though UI overlay should prevent this
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
    <>
       {/* --- ERROR / LOADING OVERLAYS --- */}
       
       {/* CASE 1: Model Missing */}
       {actualMode === 'slm' && modelError === 'missing_download' && (
           <div className="absolute inset-0 z-40 flex items-center justify-center bg-background/80 backdrop-blur-sm p-6">
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
                   onClick={() => setMode('llm')}
                   className="mt-3 text-sm text-muted-foreground hover:text-foreground underline"
                 >
                   Switch back to Cloud Mode
                 </button>
              </div>
           </div>
       )}

       {/* CASE 2: Loading Model (Loading into RAM) */}
       {actualMode === 'slm' && isModelLoading && (
           <div className="absolute inset-0 z-40 flex flex-col items-center justify-center bg-background/50 backdrop-blur-sm pointer-events-auto">
              <Loader2 className="animate-spin text-primary mb-4" size={40} />
              <h3 className="font-bold text-lg">Waking up AI...</h3>
              <p className="text-sm text-muted-foreground">Loading model into memory</p>
           </div>
       )}

       {/* --- CHAT INTERFACE --- */}
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
    </>
  );
};