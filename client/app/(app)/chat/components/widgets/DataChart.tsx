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
    // RESPONSIVE: p-3 on mobile, p-4 on desktop
    <Card className="p-3 sm:p-4 border-border bg-black/20 relative group">
      {/* RESPONSIVE: mb-4 on mobile, mb-6 on desktop */}
      <div className="flex justify-between items-start mb-4 sm:mb-6">
        <div className="min-w-0 pr-2">
           <h4 className="text-sm font-bold text-foreground truncate">{config.title}</h4>
           <p className="text-[10px] text-muted-foreground uppercase tracking-widest truncate">
             {config.type} Chart • {chartData.length} Data Points
           </p>
        </div>
        
        {/* RESPONSIVE: Hidden on mobile group hover (always visible if clicked, but hover logic tricky on touch), kept opacity logic but ensured layout doesn't break */}
        {/* <div className="flex gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity shrink-0">
           <Button variant="ghost" size="icon" className="h-6 w-6" onClick={handleDownload}>
             <Download size={14} />
           </Button>
           <Button variant="ghost" size="icon" className="h-6 w-6 hidden sm:inline-flex">
             <Maximize2 size={14} />
           </Button>
        </div> */}
      </div>

      {/* RESPONSIVE: h-[250px] on mobile, h-[300px] on sm+. Removed min-w-75 to prevent mobile overflow. */}
      <div ref={chartRef} className="h-62.5 sm:h-75 w-full min-w-0">
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
                // RESPONSIVE: Prevents label overlap on small screens
                minTickGap={30}
              />
              <YAxis 
                stroke="#94a3b8"
                tick={{ fill: "#94a3b8", fontSize: 12 }} 
                tickLine={false} 
                axisLine={false} 
                tickFormatter={(value) => `${value}`} 
                // RESPONSIVE: Hide Y-axis on very small screens to save width? 
                // Kept for now but gave it a narrow width if possible via Recharts props
                width={40}
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
                 // RESPONSIVE: Prevents label overlap
                 minTickGap={30}
               />
               <YAxis 
                 stroke="#94a3b8" 
                 tick={{ fill: "#94a3b8", fontSize: 12 }} 
                 tickLine={false} 
                 axisLine={false} 
                 width={40}
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