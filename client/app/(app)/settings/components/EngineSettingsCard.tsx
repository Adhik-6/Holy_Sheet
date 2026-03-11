'use client';

import React from 'react';
import { Cpu, Zap, HardDrive, AlertTriangle, Smartphone } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { toast } from "sonner"; // 🔥 Import Sonner's toast function

export default function EngineSettingsCard({ 
  cpuThreads, setCpuThreads, 
  useGpu, setUseGpu, 
  useMmap, setUseMmap,
  isNative 
}: any) {

  // 🔥 Notice how simple this is now! No hooks needed.
  const notifyRestartRequired = () => {
    toast("Restart Required 🔄", {
      description: "Close and reopen the app for hardware changes to take place.",
      duration: 5000,
    });
  };

  const handleCpuChange = (vals: number[]) => {
    setCpuThreads(vals[0]);
    notifyRestartRequired();
  };

  const handleGpuChange = (checked: boolean) => {
    setUseGpu(checked);
    notifyRestartRequired();
  };

  const handleMmapChange = (checked: boolean) => {
    setUseMmap(checked);
    notifyRestartRequired();
  };

  return (
    <Card className={!isNative ? "opacity-75" : ""}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Cpu className="text-primary" size={20} />
          Native Engine Hardware
        </CardTitle>
        <CardDescription>Configure how the local SLM interacts with your device's physical hardware.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-8">

        {!isNative && (
          <div className="text-xs bg-amber-500/10 text-amber-600 p-3 rounded-md flex gap-2 items-center border border-amber-500/20">
            <Smartphone size={16} />
            <span>Hardware settings are only available on the Mobile App.</span>
          </div>
        )}
        
        {/* CPU Threads Slider */}
        <div className={`space-y-4 ${!isNative ? 'opacity-50 pointer-events-none' : ''}`}>
          <div className="flex justify-between items-center">
            <Label className="text-base flex items-center gap-2">CPU Threads</Label>
            <span className="font-mono text-primary font-bold">{cpuThreads} Cores</span>
          </div>
          <Slider 
            disabled={!isNative}
            value={[cpuThreads]} 
            onValueChange={(vals) => setCpuThreads(vals[0])} 
            onValueCommit={handleCpuChange} 
            max={8} min={1} step={1} 
          />
          <p className="text-xs text-muted-foreground">
            Higher threads = faster generation, but consumes more battery.
          </p>
        </div>

        {/* GPU Toggle */}
        <div className={`flex items-center justify-between gap-2 ${!isNative ? 'opacity-50 pointer-events-none' : ''}`}>
          <div className="space-y-0.5">
            <Label className="text-base flex items-center gap-2">
              <Zap size={16} className={useGpu ? "text-orange-500 fill-orange-500" : "text-muted-foreground"} />
              Hardware Acceleration (Vulkan)
            </Label>
            <p className="text-xs text-muted-foreground">Offload matrix math to the GPU.</p>
          </div>
          <Switch disabled={!isNative} checked={useGpu} onCheckedChange={handleGpuChange} />
        </div>

        {/* MMAP Toggle */}
        <div className={`flex items-center justify-between ${!isNative ? 'opacity-50 pointer-events-none' : ''}`}>
          <div className="space-y-0.5">
            <Label className="text-base flex items-center gap-2">
              <HardDrive size={16} className="text-blue-500" />
              Memory Mapping (mmap)
            </Label>
            <p className="text-xs text-muted-foreground">Enabled: Fast boot. Disabled: Max speed.</p>
          </div>
          <Switch disabled={!isNative} checked={useMmap} onCheckedChange={handleMmapChange} />
        </div>
        
      </CardContent>
    </Card>
  );
}