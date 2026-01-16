"use client"

import React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { Bot, BarChart3, FileSpreadsheet, Search } from "lucide-react";
import { ChatMessage } from "./ChatMessage"; 
import { Message } from "./../types";

type ChatAreaProps = {
  scrollRef: React.RefObject<HTMLDivElement | null>;
  messages: Message[];
  isTyping: boolean;
}



export const ChatArea = ({ scrollRef, messages, isTyping }: ChatAreaProps) => {
    
    // 1. EMPTY STATE: "WAITING FOR DATA"
    if (messages.length === 0) {
        return (
            <div className="flex-1 flex flex-col items-center justify-center h-full p-6 relative overflow-hidden pb-30">
                {/* Background Ambient Blobs */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-125 h-125 bg-primary/5 rounded-full blur-[100px] pointer-events-none" />
                
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, ease: "easeOut" }}
                    className="max-w-3xl w-full flex flex-col items-center relative z-10"
                >

                    {/* Gradient Headline */}
                    <motion.h1 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ 
                            opacity: 1, 
                            y: 0,
                            // Cycle the background position from 0% -> 100% -> 0%
                            backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"] 
                        }}
                        transition={{ 
                            // Fade-in animation (runs once)
                            y: { duration: 0.8, ease: "easeOut" },
                            opacity: { duration: 0.8, ease: "easeOut" },
                            // Shimmer animation (runs forever)
                            backgroundPosition: {
                                duration: 5,
                                repeat: Infinity,
                                ease: "linear"
                            }
                        }}
                        // 1. Define the gradient colors (Cyan -> Purple -> Cyan)
                        // 2. Add drop-shadow for the glow
                        className="
                            text-5xl md:text-6xl font-black tracking-tighter mb-6 text-center 
                            text-transparent bg-clip-text 
                            bg-linear-to-r from-primary via-accent to-primary
                            drop-shadow-[0_0_10px_rgba(34,211,238,0.5)]
                        "
                        // 3. Make background larger than text so it can move
                        style={{ backgroundSize: "200% auto" }}
                    >
                        ExcelGPT
                    </motion.h1>
                    
                    <p className="text-xl text-muted-foreground/80 mb-12 text-center max-w-lg font-light leading-relaxed">
                        Your personal <span className="text-primary font-medium">AI Data Analyst</span>. <br/>
                        Upload a file to uncover hidden insights instantly.
                    </p>

                    {/* Feature Showcase (Non-Clickable) */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full px-4 md:px-0">
                        <FeatureCard 
                            icon={<FileSpreadsheet size={24} className="text-blue-400" />}
                            title="Data Cleaning"
                            desc="Auto-detect duplicates & format errors."
                            delay={0.1}
                        />
                        <FeatureCard 
                            icon={<Search size={24} className="text-purple-400" />}
                            title="Deep Analysis"
                            desc="Ask complex questions in plain English."
                            delay={0.2}
                        />
                        <FeatureCard 
                            icon={<BarChart3 size={24} className="text-emerald-400" />}
                            title="Visualization"
                            desc="Generate interactive charts & KPIs."
                            delay={0.3}
                        />
                    </div>

                </motion.div>
            </div>
        );
    }

    // 2. NORMAL CHAT LIST
    return (
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 md:p-8 space-y-8 scroll-smooth pb-32">
          <AnimatePresence mode="popLayout">
            {messages.map((msg, i) => (
              <ChatMessage key={msg.id} {...msg} isLastMsg={i === messages.length - 1} />
            ))}
            
            {isTyping && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }} 
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="flex gap-4 mb-32"
              >
                <Avatar className="size-10 border border-primary/30 shadow-lg">
                    <AvatarFallback className="bg-primary text-primary-foreground">
                        <Bot size={20} />
                    </AvatarFallback>
                </Avatar>
                
                <Card className="bg-muted/40 p-4 border-border flex flex-row gap-1 items-center rounded-2xl rounded-tl-none">
                  <div className="size-1.5 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="size-1.5 bg-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="size-1.5 bg-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
    )
}

// Sub-component for Features
// Sub-component for Features
const FeatureCard = ({ icon, title, desc, delay }: { icon: React.ReactNode, title: string, desc: string, delay: number }) => (
    <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        // 1. FLOAT EFFECT ON HOVER
        whileHover={{ 
            y: -8,                  // Moves up 8px
            transition: { 
                type: "spring",     // Makes it bouncy/magnetic
                stiffness: 300, 
                damping: 20 
            } 
        }}
        transition={{ delay, duration: 0.5 }}
        className="flex flex-col items-center text-center p-5 rounded-2xl bg-white/5 border border-white/5 backdrop-blur-sm hover:bg-white/10 hover:border-white/10 hover:shadow-2xl hover:shadow-primary/5 transition-colors cursor-default"
    >
        <div className="mb-3 p-3 bg-white/5 rounded-xl border border-white/5 shadow-inner">
            {icon}
        </div>
        <h3 className="font-bold text-sm text-foreground mb-1">{title}</h3>
        <p className="text-xs text-muted-foreground leading-relaxed max-w-37.5">{desc}</p>
    </motion.div>
);