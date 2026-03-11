'use client';

import React from 'react';
import { Thermometer, BrainCircuit, Smartphone } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner"; // 🔥 Import Sonner

export default function GenerationSettingsCard({ 
  temperature, setTemperature, 
  contextSize, setContextSize,
  isNative 
}: any) {
  
  // 🔥 Helper function to trigger the restart warning for context size changes
  const handleContextChange = (val: string) => {
    setContextSize(parseInt(val));
    toast("Restart Required 🔄", {
      description: "Close and reopen the app for memory changes to take place.",
      duration: 5000,
    });
  };

  return (
    <Card className={!isNative ? "opacity-75" : ""}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BrainCircuit className="text-accent" size={20} />
          Inference & Generation
        </CardTitle>
        <CardDescription>Adjust the AI's behavior and memory limits.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-8">

        {/* 🛡️ DESKTOP GUARD BANNER */}
        {!isNative && (
          <div className="text-xs bg-amber-500/10 text-amber-600 p-3 rounded-md flex gap-2 items-center border border-amber-500/20">
            <Smartphone size={16} />
            <span>Inference limits are locked to the local native engine.</span>
          </div>
        )}
        
        {/* Temperature Slider */}
        <div className={`space-y-4 ${!isNative ? 'opacity-50 pointer-events-none' : ''}`}>
          <div className="flex justify-between items-center">
            <Label className="text-base flex items-center gap-2">
              <Thermometer size={16} className="text-red-500" />
              Temperature
            </Label>
            <span className="font-mono text-primary font-bold">{temperature.toFixed(2)}</span>
          </div>
          <Slider 
            disabled={!isNative}
            value={[temperature]} 
            onValueChange={(vals) => setTemperature(vals[0])} // 🔥 No toast needed here
            max={1.0} min={0.0} step={0.05} 
          />
          <p className="text-xs text-muted-foreground">
            0.1 is best for strict Python code. 0.8 is best for brainstorming.
          </p>
        </div>

        {/* Context Size Dropdown */}
        <div className={`flex items-center justify-between ${!isNative ? 'opacity-50 pointer-events-none' : ''}`}>
          <div className="space-y-0.5 flex-1 pr-4">
            <Label className="text-base">Context Window</Label>
            <p className="text-xs text-muted-foreground">Larger context uses more RAM.</p>
          </div>
          <Select 
            disabled={!isNative}
            value={contextSize.toString()} 
            onValueChange={handleContextChange} // 🔥 Triggers the state update AND the toast
          >
            <SelectTrigger className="w-[120px]">
              <SelectValue placeholder="Select size" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="512">512 Tokens</SelectItem>
              <SelectItem value="1024">1024 Tokens</SelectItem>
              <SelectItem value="2048">2048 Tokens</SelectItem>
              <SelectItem value="4096">4096 Tokens</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>
  );
}