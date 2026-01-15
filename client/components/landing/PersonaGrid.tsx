"use client"

import React from 'react';
import { motion } from 'framer-motion';
import { BarChart, Users, Code, Microscope, Shield } from 'lucide-react';

const personas = [
  { 
    icon: <BarChart />, 
    title: "Financial Analysts", 
    desc: "Analyze sensitive P&L data without cloud risk.",
    color: "primary"
  },
  { 
    icon: <Users />, 
    title: "HR Partners", 
    desc: "Process payroll and personnel files locally.",
    color: "accent"
  },
  { 
    icon: <Shield />, 
    title: "Gov & Defense", 
    desc: "Air-gapped intelligence for classified datasets.",
    color: "primary"
  },
  { 
    icon: <Microscope />, 
    title: "Researchers", 
    desc: "Secure health and medical data exploration.",
    color: "accent"
  }
];

const PersonaGrid: React.FC = () => {
  return (
    <section className="py-32 px-6">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-20">
          <h2 className="text-4xl md:text-5xl font-black mb-6 tracking-tight">Built for Secure Verticals</h2>
          <p className="text-muted-foreground text-lg">Trusted by professionals who can't afford a data breach.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {personas.map((p, i) => (
            <motion.div
              key={i}
              layout
              whileHover={{ y: -8 }}
              whileTap={{ scale: 0.96 }}
              className={`p-10 rounded-[2.5rem] border border-border glass-card text-center cursor-default group transition-all duration-300 ${p.color === 'primary' ? 'glow-primary' : 'glow-accent'}`}
            >
              <div className={`w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-8 transition-all duration-300 
                ${p.color === 'primary' 
                ? 'bg-primary/10 text-primary border border-primary/20 group-hover:bg-primary group-hover:text-primary-foreground' 
                : 'bg-accent/10 text-accent border border-accent/20 group-hover:bg-accent group-hover:text-accent-foreground'}`}>
                {p.icon}
              </div>
              <h3 className="font-bold text-xl mb-4 tracking-tight">{p.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{p.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PersonaGrid;
