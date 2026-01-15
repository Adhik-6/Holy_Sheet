"use client"

import { Card } from "@/components/ui/card";
import { ArrowUpRight, ArrowDownRight, Minus, TrendingUp, TrendingDown } from "lucide-react";
import { Kpi as KPI } from './../../types'; // Ensure import path matches your structure

export const KPIGrid = ({ data }: { data: KPI[] }) => {
  return (
    <div className="grid grid-cols-2 gap-3 mt-2">
      {data.map((kpi, idx) => {
        // 1. Determine dynamic colors based on status
        const statusColor = 
            kpi.status === 'positive' ? 'text-emerald-400 border-emerald-500/20 from-emerald-500/20' : 
            kpi.status === 'negative' ? 'text-rose-400 border-rose-500/20 from-rose-500/20' : 
            'text-blue-400 border-blue-500/20 from-blue-500/20';
        
        const blobColor = 
            kpi.status === 'positive' ? 'bg-emerald-500' : 
            kpi.status === 'negative' ? 'bg-rose-500' : 
            'bg-blue-500';

        const Icon = kpi.status === 'positive' ? TrendingUp : kpi.status === 'negative' ? TrendingDown : Minus;

        return (
          <Card 
            key={idx} 
            className={`p-4 bg-card/40 backdrop-blur-xl border ${statusColor} relative overflow-hidden group hover:scale-[1.02] transition-transform duration-300 ease-out will-change-transform`}
          >
            <div className="relative z-10 flex flex-col h-full justify-between">
              
              {/* Header: Label + Icon */}
              <div className="flex justify-between items-start mb-2">
                <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">
                    {kpi.label}
                </p>
                {/* Neon Icon Container */}
                <div className={`p-1.5 rounded-lg ${blobColor}/10 border ${statusColor.split(' ')[1]}`}>
                    <Icon size={14} className={statusColor.split(' ')[0]} />
                </div>
              </div>

              {/* Value & Trend */}
              <div>
                <div className="flex items-baseline gap-2">
                   <span className="text-2xl font-black text-foreground tracking-tight">
                        {kpi.value}
                   </span>
                </div>
                
                {kpi.trend && (
                   <div className={`flex items-center gap-1.5 mt-1 text-xs font-bold ${statusColor.split(' ')[0]}`}>
                     <span>{kpi.trend}</span>
                     <span className="text-[10px] opacity-60 font-medium uppercase tracking-wider text-muted-foreground">vs last month</span>
                   </div>
                )}
              </div>
            </div>

            {/* 2. Stronger Ambient Gradient Blob */}
            {/* Increased opacity from 20 -> 30/40 and added mix-blend-mode for better glowing effect */}
            <div className={`absolute -right-6 -bottom-6 w-24 h-24 rounded-full blur-2xl opacity-30 ${blobColor} group-hover:opacity-50 transition-opacity duration-500`} />
            
            {/* Top Highlight Line */}
            <div className={`absolute top-0 left-0 w-full h-px bg-linear-to-r from-transparent ${statusColor.split(' ')[2]} to-transparent opacity-50`} />
          </Card>
        );
      })}
    </div>
  );
};