"use client";

import { motion } from "framer-motion";
import { Upload, Cpu, CheckCircle } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const steps = [
  {
    icon: <Upload size={32} />,
    title: "1. Load File",
    desc: "Drag & drop CSV/XLSX. File stays in browser memory.",
  },
  {
    icon: <Cpu size={32} />,
    title: "2. Local Process",
    desc: "WebAssembly & WebGPU power the AI analysis instantly.",
    highlight: true,
  },
  {
    icon: <CheckCircle size={32} />,
    title: "3. Verify Results",
    desc: "Get answers with code citations and confidence scores.",
  },
];

const Architecture = () => {
  return (
    <section id="architecture" className="py-32 px-6 bg-black/20">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-black mb-4">How it works</h2>
          <p className="text-muted-foreground">
            A simplified flow of our browser-first architecture.
          </p>
        </div>

        <div className="relative flex flex-col md:flex-row gap-8 items-stretch justify-center">
          {steps.map((step, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="relative z-10 flex-1"
            >
              <Card
                className={[
                  "h-full flex flex-col items-center p-8 rounded-2xl text-center",
                  step.highlight
                    ? "border-primary/50 shadow-[0_0_30px_rgba(var(--primary),0.2)] bg-card"
                    : "border-border bg-card/40",
                ].join(" ")}
              >
                {step.highlight && (
                  <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 text-[9px] font-black uppercase rounded-full">
                    Core Engine
                  </Badge>
                )}

                <div
                  className={[
                    "w-16 h-16 rounded-full flex items-center justify-center mb-6 shadow-xl",
                    step.highlight
                      ? "bg-primary text-primary-foreground"
                      : "bg-card border border-border text-muted-foreground",
                  ].join(" ")}
                >
                  {step.icon}
                </div>

                <h3 className="text-lg font-bold mb-2">{step.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {step.desc}
                </p>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Architecture;
