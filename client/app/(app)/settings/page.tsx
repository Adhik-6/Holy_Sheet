'use client';

import React, { useEffect, useState } from 'react';
import { Settings2, Network } from 'lucide-react';
import { Capacitor } from '@capacitor/core';
import { useSettingsStore } from '@/store/settingsStore';

// UI Components
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
// import { Label } from "@/components/ui/label";
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// Custom Presenters
import EngineSettingsCard from './components/EngineSettingsCard';
import GenerationSettingsCard from './components/GenerationSettingsCard';

export default function SettingsPage() {
  const { 
    mode, setMode,
    cpuThreads, setCpuThreads,
    useGpu, setUseGpu,
    useMmap, setUseMmap,
    contextSize, setContextSize,
    temperature, setTemperature
  } = useSettingsStore();

  // 🔥 Safely determine if we are on mobile to prevent hydration errors
  const [isNative, setIsNative] = useState(false);

  useEffect(() => {
    setIsNative(Capacitor.isNativePlatform());
  }, []);

  return (
    <div className="p-6 lg:p-10 space-y-8 max-w-4xl mx-auto pb-24 overflow-y-auto scrollbar-hidden">
      
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <Settings2 className="text-primary" size={32} />
          App Settings
        </h1>
        <p className="text-muted-foreground">
          Configure application behavior and native inference parameters.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-8">
        
        {/* GENERAL ROUTING CARD (Always Enabled) */}
        {/* <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Network className="text-green-500" size={20} />
              Default Intelligence Routing
            </CardTitle>
            <CardDescription>Choose how the app defaults to answering queries.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5 flex-1 pr-4">
                <Label className="text-base">System Mode</Label>
                <p className="text-xs text-muted-foreground">
                  Auto: App decides. LLM: Forces Cloud. SLM: Forces On-Device Local.
                </p>
              </div>
              <Select value={mode} onValueChange={(val: any) => setMode(val)}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Select Mode" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="auto">Auto Router</SelectItem>
                  <SelectItem value="llm">Cloud LLM Only</SelectItem>
                  <SelectItem value="slm">Local SLM Only</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card> */}

        {/* NATIVE ENGINE CARD */}
        <EngineSettingsCard 
          cpuThreads={cpuThreads} setCpuThreads={setCpuThreads}
          useGpu={useGpu} setUseGpu={setUseGpu}
          useMmap={useMmap} setUseMmap={setUseMmap}
          isNative={isNative} // 🔥 Pass the flag down
        />

        {/* GENERATION CARD */}
        <GenerationSettingsCard 
          temperature={temperature} setTemperature={setTemperature}
          contextSize={contextSize} setContextSize={setContextSize}
          isNative={isNative} // 🔥 Pass the flag down
        />

      </div>
    </div>
  );
}