"use client"

import { useRef } from 'react';
import { 
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer 
} from 'recharts';
import { Download, Maximize2 } from 'lucide-react';
import { toPng } from 'html-to-image';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ChartPayload } from './../../types'; 

// 1. NEON CYBERPUNK PALETTE
// We use Hex codes here because Recharts can't always parse "var(--primary)" for fills/strokes reliably.
const CHART_COLORS = [
  "#22d3ee", // Cyan (Primary)
  "#b247fa", // Purple (Accent)
  "#34d399", // Emerald (Success)
  "#f472b6", // Pink (Hot)
  "#fb923c", // Orange (Warning)
  "#818cf8", // Indigo (Cool)
  "#c084fc", // Violet
  "#2dd4bf", // Teal
];

// Helper to cycle colors if we have more series than colors
const getColor = (index: number) => CHART_COLORS[index % CHART_COLORS.length];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-black/35 backdrop-blur-md border border-white/10 p-3 rounded-xl shadow-2xl text-xs">
        {/* Fix: Pie charts don't have an XAxis 'label', so we hide this header if it's empty */}
        {label && <p className="font-bold text-white mb-2">{label}</p>}
        
        {payload.map((p: any, idx: number) => {
            // FIX: Recharts Pie chart cells pass color in 'fill', others in 'color'
            const indicatorColor = p.color || p.fill || p.payload.fill;
            
            return (
                <div key={idx} className="flex items-center gap-2 mb-1">
                    <div 
                        className="size-2 rounded-full shadow-[0_0_8px_currentcolor]" 
                        style={{ backgroundColor: indicatorColor, color: indicatorColor }} 
                    />
                    <span className="text-gray-300 capitalize">{p.name}:</span>
                    <span className="font-mono font-bold text-white">
                        {typeof p.value === 'number' ? p.value.toLocaleString() : p.value}
                    </span>
                </div>
            );
        })}
      </div>
    );
  }
  return null;
};

export const DataChart = ({ data }: { data: ChartPayload }) => {
  const chartRef = useRef<HTMLDivElement>(null);
  const { config, data: chartData } = data;

  const handleDownload = async () => {
    if (chartRef.current) {
      const dataUrl = await toPng(chartRef.current, { cacheBust: true, backgroundColor: '#09090b' });
      const link = document.createElement('a');
      link.download = `${config.title.replace(/\s+/g, '_').toLowerCase()}.png`;
      link.href = dataUrl;
      link.click();
    }
  };

  return (
    <Card className="p-4 border-border bg-black/20 relative group">
      <div className="flex justify-between items-start mb-6">
        <div>
           <h4 className="text-sm font-bold text-foreground">{config.title}</h4>
           <p className="text-[10px] text-muted-foreground uppercase tracking-widest">
             {config.type} Chart • {chartData.length} Data Points
           </p>
        </div>
        
        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
           <Button variant="ghost" size="icon" className="h-6 w-6" onClick={handleDownload}>
             <Download size={14} />
           </Button>
           <Button variant="ghost" size="icon" className="h-6 w-6">
             <Maximize2 size={14} />
           </Button>
        </div>
      </div>

      <div ref={chartRef} className="h-75 w-full min-w-75">
        <ResponsiveContainer width="100%" height="100%">
          {config.type === 'line' ? (
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.4} vertical={false} />
              
              <XAxis 
                dataKey={config.xAxisKey} 
                stroke="#94a3b8"
                tick={{ fill: "#94a3b8", fontSize: 12 }} 
                tickLine={false} 
                axisLine={false} 
                dy={10}
              />
              <YAxis 
                stroke="#94a3b8"
                tick={{ fill: "#94a3b8", fontSize: 12 }} 
                tickLine={false} 
                axisLine={false} 
                tickFormatter={(value) => `${value}`} 
              />
              <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#22d3ee', strokeWidth: 1, strokeDasharray: '5 5' }} />
              <Legend wrapperStyle={{ paddingTop: '20px' }} />
              
              {config.series.map((s, i) => (
                <Line 
                  key={s.dataKey}
                  type="monotone" 
                  dataKey={s.dataKey} 
                  name={s.label}
                  // USE PALETTE HERE
                  stroke={getColor(i)} 
                  strokeWidth={3}
                  dot={{ r: 4, fill: '#09090b', strokeWidth: 2 }}
                  activeDot={{ r: 6 }}
                />
              ))}
            </LineChart>
          ) : config.type === 'bar' ? (
            <BarChart data={chartData}>
               <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.4} vertical={false} />
               <XAxis 
                 dataKey={config.xAxisKey} 
                 stroke="#94a3b8"
                 tick={{ fill: "#94a3b8", fontSize: 12 }} 
                 tickLine={false} 
                 axisLine={false}
                 dy={10}
               />
               <YAxis 
                 stroke="#94a3b8" 
                 tick={{ fill: "#94a3b8", fontSize: 12 }} 
                 tickLine={false} 
                 axisLine={false} 
               />
               <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(148,163,184,0.1)' }} />
               <Legend wrapperStyle={{ paddingTop: '20px' }} />
               {config.series.map((s, i) => (
                 <Bar 
                   key={s.dataKey}
                   dataKey={s.dataKey} 
                   name={s.label}
                   // USE PALETTE HERE
                   fill={getColor(i)} 
                   radius={[4, 4, 0, 0]}
                 />
               ))}
            </BarChart>
          ) : (
            <PieChart>
               <Tooltip content={<CustomTooltip />} />
               <Legend wrapperStyle={{ paddingTop: '20px' }} />
               <Pie
                 data={chartData}
                 cx="50%"
                 cy="50%"
                 innerRadius={50}
                 outerRadius={80}
                 paddingAngle={5}
                 dataKey={config.series[0].dataKey}
                 nameKey={config.xAxisKey} 
               >
                 {chartData.map((entry, index) => (
                   // USE PALETTE HERE (Index based)
                   <Cell key={`cell-${index}`} fill={getColor(index)} />
                 ))}
               </Pie>
            </PieChart>
          )}
        </ResponsiveContainer>
      </div>
    </Card>
  );
};