"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShieldCheck, CheckCircle2, Cpu, Globe } from "lucide-react";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";

const OfflineSpotlight = () => {
  const [isOffline, setIsOffline] = useState(true);

  return (
    <section className="py-32 px-6 relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-1/2 left-0 w-125 h-125 bg-primary/5 rounded-full blur-[120px] -z-10" />

      <div className="container mx-auto max-w-6xl flex flex-col lg:flex-row items-center justify-between gap-16">
        {/* LEFT COLUMN */}
        <div className="flex-1">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="mb-8"
          >
            <Badge className="gap-2 bg-primary/10 border border-primary/20 text-primary text-xs font-black uppercase tracking-widest rounded-full px-4 py-2">
              <ShieldCheck size={16} />
              Maximum Security Mode
            </Badge>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl md:text-6xl font-black mb-8 leading-[1.1] tracking-tight"
          >
            No Internet? <br />
            No Problem.
          </motion.h2>

          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-lg text-muted-foreground mb-10 max-w-md leading-relaxed"
          >
            Unlike traditional LLMs that leak data to central servers, ExcelGPT
            runs as a local binary within your browser.
          </motion.p>

          <div className="space-y-5">
            {[
              { text: "Zero telemetry or tracking" },
              { text: "Browser-memory encryption" },
              { text: "Permanent local storage (IndexDB)" },
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -10 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="flex items-center gap-4 text-sm font-medium"
              >
                <CheckCircle2 className="text-primary" />
                <span>{item.text}</span>
              </motion.div>
            ))}
          </div>
        </div>

        {/* RIGHT COLUMN */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="flex-1 w-full max-w-lg relative"
        >
          <Card className="glass-card p-10 rounded-[3rem] shadow-2xl relative border border-border bg-card/40">
            <div className="flex justify-between items-center mb-12">
              <div className="space-y-1">
                <span className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
                  Engine Status
                </span>
                <p className="font-bold text-xl">Privacy Controls</p>
              </div>

              <div className="p-3 bg-primary/10 rounded-2xl text-primary">
                <Cpu size={24} />
              </div>
            </div>

            {/* TOGGLE PANEL */}
            <div className="bg-muted/40 p-6 rounded-3xl border border-border flex items-center justify-between transition-all duration-300">
              <div className="flex items-center gap-4">
                <div
                  className={[
                    "p-3 rounded-2xl transition-colors duration-300",
                    isOffline
                      ? "bg-primary/20 text-primary"
                      : "bg-muted text-muted-foreground",
                  ].join(" ")}
                >
                  {isOffline ? (
                    <ShieldCheck size={20} />
                  ) : (
                    <Globe size={20} />
                  )}
                </div>

                <div>
                  <p className="font-bold">Air-Gapped Mode</p>

                  <AnimatePresence mode="wait">
                    <motion.p
                      key={isOffline ? "on" : "off"}
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -5 }}
                      transition={{ duration: 0.15 }}
                      className={[
                        "text-[10px] font-black uppercase tracking-widest",
                        isOffline ? "text-primary" : "text-orange-500",
                      ].join(" ")}
                    >
                      {isOffline ? "Fully Secure" : "Public Access"}
                    </motion.p>
                  </AnimatePresence>
                </div>
              </div>

              {/* shadcn Switch */}
              <Switch checked={isOffline} onCheckedChange={setIsOffline} />
            </div>

            <div className="mt-10 space-y-4">
              <div className="flex justify-between text-[10px] font-mono text-muted-foreground tracking-tighter">
                <span>LOCAL MODEL LOADED</span>
                <span>100% SECURE</span>
              </div>

              <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  whileInView={{ width: "100%" }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                  className="h-full bg-linear-to-r from-primary to-accent"
                />
              </div>
            </div>
          </Card>

          <div className="absolute -z-10 -bottom-10 -right-10 w-64 h-64 bg-primary/10 rounded-full blur-[100px]" />
        </motion.div>
      </div>
    </section>
  );
};

export default OfflineSpotlight;
