"use client"

import { motion } from 'framer-motion';
import { Upload, Cpu, CheckCircle } from 'lucide-react';

const steps = [
  {
    icon: <Upload size={32} />,
    title: "1. Load File",
    desc: "Drag & drop CSV/XLSX. File stays in browser memory."
  },
  {
    icon: <Cpu size={32} />,
    title: "2. Local Process",
    desc: "WebAssembly & WebGPU power the AI analysis instantly.",
    highlight: true
  },
  {
    icon: <CheckCircle size={32} />,
    title: "3. Verify Results",
    desc: "Get answers with code citations and confidence scores."
  }
];

const Architecture = () => {
  return (
    <section id="architecture" className="py-32 px-6 bg-black/20">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-black mb-4">How it works</h2>
          <p className="text-muted-foreground">A simplified flow of our browser-first architecture.</p>
        </div>

        <div className="relative flex flex-col md:flex-row gap-8 items-stretch justify-center">
          {/* Connector Line */}
          {/* <div className="hidden md:block absolute top-1/2 left-0 right-0 h-0.5 bg-linear-to-r from-transparent via-border to-transparent -translate-y-1/2" /> */}
          
          {steps.map((step, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className={`relative z-10 flex-1 flex flex-col items-center p-8 rounded-2xl border ${
                step.highlight 
                  ? 'border-primary/50 shadow-[0_0_30px_rgba(var(--primary),0.2)] bg-card' 
                  : 'border-border bg-card/40'
              } text-center`}
            >
              {step.highlight && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-primary text-primary-foreground text-[9px] font-black uppercase rounded-full">
                  Core Engine
                </div>
              )}
              
              <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-6 shadow-xl ${
                step.highlight 
                  ? 'bg-primary text-primary-foreground' 
                  : 'bg-card border border-border text-muted-foreground'
              }`}>
                {step.icon}
              </div>
              
              <h3 className="text-lg font-bold mb-2">{step.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{step.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Architecture;