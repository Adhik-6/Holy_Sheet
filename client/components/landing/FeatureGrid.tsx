"use client"

import React from 'react';
import { motion } from 'framer-motion';
import { MessageSquare, Layers, BarChart3, WifiOff, HelpCircle, Eye } from 'lucide-react';

const features = [
  {
    icon: <MessageSquare size={24} />,
    title: "Language-First Analysis",
    desc: "Ask deep questions about your data in plain English. No SQL or formula mastery required.",
    layoutId: "feat-1"
  },
  {
    icon: <Layers size={24} />,
    title: "Smart Pivot Generation",
    desc: "Instant summaries and aggregated views built on-the-fly based on your intent.",
    layoutId: "feat-2"
  },
  {
    icon: <BarChart3 size={24} />,
    title: "Visual Intelligence",
    desc: "Auto-suggested charting that actually makes sense. One-click export to high-res SVG.",
    layoutId: "feat-3"
  },
  {
    icon: <WifiOff size={24} />,
    title: "Offline Sovereignty",
    desc: "Complete operational independence. Works on planes, trains, and secure air-gapped rooms.",
    layoutId: "feat-4"
  },
  {
    icon: <HelpCircle size={24} />,
    title: "Iterative Deep-Dive",
    desc: "The AI remembers previous questions. Drill down from 'annual' to 'daily' in seconds.",
    layoutId: "feat-5"
  },
  {
    icon: <Eye size={24} />,
    title: "Radical Transparency",
    desc: "Every answer includes the exact Python code used. Audit every single calculation.",
    layoutId: "feat-6"
  }
];

const FeatureGrid: React.FC = () => {
  return (
    <section id="features" className="py-32 px-6">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-20">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl md:text-5xl font-black mb-6 tracking-tight"
          >
            Built for High-Stakes Data
          </motion.h2>
          <p className="text-muted-foreground max-w-xl mx-auto text-lg">
            Security shouldn't compromise intelligence. We brought the lab to your browser.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((f, idx) => (
            <motion.div
              key={idx}
              layout
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.25, delay: idx * 0.03 }}
              whileHover={{ 
                y: -8, 
                transition: { duration: 0.2 }
              }}
              className="group p-8 rounded-3xl glass-card glow-primary hover:bg-white/3"
            >
              <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary mb-8 border border-primary/20 transition-transform duration-300 group-hover:rotate-6 group-hover:scale-110">
                {f.icon}
              </div>
              <h3 className="text-xl font-bold mb-4 tracking-tight">{f.title}</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeatureGrid;
