"use client"

import { motion } from 'framer-motion';
import { Play, Code, Zap } from 'lucide-react';
import Link from 'next/link'; // Added Link for navigation

const Hero = () => {
  return (
    <section className="relative pt-24 pb-20 px-6 overflow-hidden">
      {/* Dynamic ambient lights */}
      {/* CHANGED: Hardcoded bg-primary/10 matches theme, but adjusted opacity for better light mode blend */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-250 h-175 bg-primary/10 rounded-full blur-[160px] -z-10 opacity-60" />
      <div className="absolute top-1/2 right-0 w-100 h-100 bg-accent/10 rounded-full blur-[140px] -z-10" />
      
      <div className="container mx-auto max-w-5xl text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
          className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 px-4 py-1.5 rounded-full text-primary text-[10px] font-black uppercase tracking-widest mb-10"
        >
          <Zap size={14} className="fill-current" />
          WebGPU Accelerated v2.0
        </motion.div>

        <motion.h1 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="text-5xl md:text-7xl lg:text-8xl font-black mb-8 leading-[1.05] tracking-tight"
        >
          Chat with Excel.<br />
          <span className="text-transparent bg-clip-text bg-linear-to-r from-primary via-primary/80 to-accent">
            Stays on your device.
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1, duration: 0.4 }}
          className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-12"
        >
          The private AI Data Analyst built for security-first organizations. Zero server egress. Infinite local compute.
        </motion.p>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.3 }}
          className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-24"
        >
          <Link href="/chat" className="w-full sm:w-auto">
            <motion.button
              whileHover={{ scale: 1.05, boxShadow: '0 0 30px -5px color-mix(in srgb, var(--primary), transparent 60%)' }}
              whileTap={{ scale: 0.95 }}
              className="w-full bg-primary text-primary-foreground py-4 px-10 rounded-2xl font-bold flex items-center justify-center gap-2 shadow-xl shadow-primary/10 transition-shadow duration-300"
            >
              <Play size={20} fill="currentColor" />
              Launch Dashboard
            </motion.button>
          </Link>
          
          <Link href="#features" className="w-full sm:w-auto">
            <motion.button
              whileHover={{ scale: 1.05, backgroundColor: 'color-mix(in srgb, var(--foreground), transparent 95%)' }}
              whileTap={{ scale: 0.95 }}
              className="w-full border border-border py-4 px-10 rounded-2xl font-bold flex items-center justify-center gap-2 backdrop-blur-sm transition-all duration-200 text-foreground"
            >
              <Code size={20} />
              View Documentation
            </motion.button>
          </Link>
        </motion.div>

        {/* Demo Window with Layout Projection */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 50 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5, ease: "easeOut" }}
          className="relative max-w-5xl mx-auto rounded-[2.5rem] p-3 glass-card shadow-2xl overflow-hidden group border border-border"
        >
          <div className="relative aspect-video rounded-[1.8rem] bg-card border border-border overflow-hidden flex flex-col">
              {/* Mock Sidebar UI */}
              <div className="flex grow">
                <div className="w-20 sm:w-64 border-r border-border bg-muted/30 hidden sm:flex flex-col p-6 text-left">
                  <div className="h-2 w-32 bg-foreground/10 rounded-full mb-6" />
                  <div className="space-y-4">
                    {[1, 2, 3].map(i => <div key={i} className="h-2 w-full bg-foreground/5 rounded-full" />)}
                  </div>
                </div>
                
                <div className="grow bg-background flex flex-col p-8 items-center justify-center relative">
                  {/* CHANGED: Hardcoded oklch radial gradient -> hsl(var(--primary)) */}
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,hsl(var(--primary)/0.1)_0%,transparent_60%)]" />
                  
                  <div className="z-10 space-y-4 text-center">
                    <div className="w-20 h-20 bg-primary/10 rounded-3xl flex items-center justify-center mx-auto mb-4 border border-primary/20">
                      <Zap size={32} className="text-primary" />
                    </div>
                    <h3 className="text-xl font-bold text-foreground">Waiting for local model...</h3>
                    <div className="h-1.5 w-48 bg-muted rounded-full overflow-hidden mx-auto">
                      <motion.div 
                        animate={{ x: [-100, 200] }}
                        transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
                        className="h-full w-24 bg-primary"
                      />
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Bottom Status Bar */}
              {/* CHANGED: bg-background/80, border-border */}
              <div className="h-12 border-t border-border bg-muted/50 flex items-center px-6 justify-between text-[10px] font-mono tracking-widest text-muted-foreground uppercase">
                 <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-primary animate-pulse shadow-[0_0_8px_hsl(var(--primary))]" />
                    <span>WebLLM Local Engine Active</span>
                 </div>
                 <span>Encrypted • Browser-Only</span>
              </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default Hero;