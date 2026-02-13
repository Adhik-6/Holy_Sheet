"use client"

import { Sidebar } from "./components/Sidebar";
import { MobileSidebar } from "./components/MobileSidebar";
import { Header } from "./components/Header";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex h-dvh w-full bg-transparent text-foreground overflow-hidden relative font-sans selection:bg-primary/30 selection:text-primary-foreground">
      
      {/* 1. Global Ambient Background */}
      <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] bg-[color-mix(in_srgb,var(--primary),transparent_85%)] blur-[120px] rounded-full -z-10 pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[60vw] h-[60vw] bg-[color-mix(in_srgb,var(--accent),transparent_85%)] blur-[140px] rounded-full -z-10 pointer-events-none" />

      {/* 2. Desktop Sidebar (Hidden on Mobile) */}
      <div className="hidden md:flex h-full flex-col z-20 justify-between">
        <Sidebar />
      </div>

      {/* 3. Main Content Area */}
      <main className="flex-1 flex flex-col h-full relative overflow-hidden">
        {/* Header contains the MobileSidebar and Mode Selector */}
        <Header />
        
        {/* The Page Content (Chat, Models, etc.) renders here */}
        {children}
      </main>
    </div>
  );
}