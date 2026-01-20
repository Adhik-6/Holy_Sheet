"use client"

import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Check, X } from 'lucide-react';

const rows = [
  { feature: "Data Residency", cloud: "External Servers", local: "Your Browser Only" },
  { feature: "Offline Processing", cloud: false, local: true },
  { feature: "Response Time", cloud: "Network Bound", local: "Zero Latency" },
  { feature: "Annual Cost", cloud: "$2,400+ per seat", local: "Completely Free" },
  { feature: "Compliance", cloud: "Complex Audit", local: "Native Compliance" }
];

const ComparisonTable = () => {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    setMousePos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  return (
    <section id="comparison" className="py-20 md:py-32 px-4 md:px-6">
      <div className="container mx-auto max-w-4xl">
        <div className="text-center mb-10 md:mb-16">
           <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl md:text-4xl font-black mb-4 tracking-tight"
           >
             The Local Advantage
           </motion.h2>
           <p className="text-muted-foreground text-sm md:text-base">Why privacy-focused teams are moving away from the cloud.</p>
        </div>

        <div 
          ref={containerRef}
          onMouseMove={handleMouseMove}
          onMouseEnter={() => setIsHovering(true)}
          onMouseLeave={() => setIsHovering(false)}
          className="relative rounded-3xl border border-border overflow-hidden shadow-2xl glass-card bg-card/30"
        >
          {isHovering && (
            <motion.div 
              className="absolute -translate-x-1/2 -translate-y-1/2 w-100 h-100 bg-primary/20 blur-[100px] rounded-full pointer-events-none z-0"
              animate={{ left: mousePos.x, top: mousePos.y }}
              transition={{ type: "spring", damping: 30, stiffness: 200, restDelta: 0.001 }}
            />
          )}

          {/* 1. SCROLL WRAPPER: Allows horizontal swipe on mobile */}
          <div className="overflow-x-auto w-full custom-scrollbar">
            {/* 2. MIN-WIDTH: Forces table to keep its shape and trigger scroll instead of squishing */}
            <table className="w-full text-left relative z-10 border-collapse min-w-150 md:min-w-0">
              <thead>
                <tr className="border-b border-border bg-muted/20">
                  {/* 3. RESPONSIVE PADDING: px-4 on mobile, px-10 on desktop */}
                  <th className="px-4 md:px-10 py-4 md:py-6 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Feature</th>
                  <th className="px-4 md:px-10 py-4 md:py-6 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground text-center">Standard Cloud</th>
                  <th className="px-4 md:px-10 py-4 md:py-6 text-[10px] font-black uppercase tracking-[0.2em] text-primary text-center">ExcelGPT</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {rows.map((row, idx) => (
                  <motion.tr 
                    key={idx}
                    className="group transition-colors duration-200 hover:bg-white/5"
                  >
                    <td className="px-4 md:px-10 py-4 md:py-7 text-xs md:text-sm font-bold whitespace-nowrap">{row.feature}</td>
                    <td className="px-4 md:px-10 py-4 md:py-7 text-xs md:text-sm text-center text-muted-foreground whitespace-nowrap">
                      {typeof row.cloud === 'boolean' ? (
                        <X className="mx-auto text-destructive/70" size={18} />
                      ) : row.cloud}
                    </td>
                    <td className="px-4 md:px-10 py-4 md:py-7 text-xs md:text-sm font-bold text-center text-primary whitespace-nowrap">
                      {typeof row.local === 'boolean' ? (
                        <Check className="mx-auto text-primary" size={20} />
                      ) : row.local}
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
          
        </div>
      </div>
    </section>
  );
};

export default ComparisonTable;