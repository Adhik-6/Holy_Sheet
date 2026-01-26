"use client"

import Link from "next/link";
import { 
  LayoutDashboard, 
  MessageSquarePlus, 
  Database, 
  FileText, 
  Settings, 
  Table, 
  Cpu, 
  FolderOpen,
  PieChart,
  Menu 
} from "lucide-react";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { useState } from "react";

export const MobileSidebar = () => {
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      {/* 1. The Trigger (Hamburger Button) */}
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden text-muted-foreground hover:text-primary hover:bg-primary/10">
          <Menu size={24} />
        </Button>
      </SheetTrigger>

      {/* 2. The Drawer Content */}
      <SheetContent side="left" className="w-72 border-r border-border bg-black/95 backdrop-blur-xl p-0">
        <SheetTitle className="sr-only">Mobile Navigation</SheetTitle>
        
        <div className="flex flex-col h-full justify-between py-6">
            
            {/* Top Section: Brand + Navigation */}
            <div className="flex flex-col gap-6 px-6 overflow-y-auto">
                {/* Brand Header */}
                <Link href="/" onClick={() => setOpen(false)} className="flex items-center gap-3 cursor-pointer group">
                    <div className="relative flex items-center justify-center size-10 rounded-xl bg-primary shadow-lg shadow-primary/20">
                        <Table size={20} className="text-primary-foreground" />
                    </div>
                    <div className="flex flex-col">
                        <h1 className="text-foreground text-lg font-black tracking-tighter">ExcelGPT</h1>
                        <p className="text-muted-foreground text-[10px] font-mono tracking-widest uppercase">Data Intelligence</p>
                    </div>
                </Link>

                {/* Nav Links Container */}
                <nav className="flex flex-col gap-6 mt-4">
                    
                    {/* Group: Start */}
                    <div className="flex flex-col gap-2">
                        <p className="px-3 text-[10px] uppercase tracking-wider text-muted-foreground/50 font-bold">Start</p>
                        <MobileLink onClick={() => setOpen(false)} href="/chat" icon={<MessageSquarePlus size={20} />} label="New Chat" active />
                        <MobileLink onClick={() => setOpen(false)} href="/dashboard" icon={<LayoutDashboard size={20} />} label="Dashboard" />
                    </div>

                    {/* Group: Workspace */}
                    <div className="flex flex-col gap-2">
                        <p className="px-3 text-[10px] uppercase tracking-wider text-muted-foreground/50 font-bold">Workspace</p>
                        <MobileLink onClick={() => setOpen(false)} href="/projects" icon={<FolderOpen size={20} />} label="Projects" />
                        <MobileLink onClick={() => setOpen(false)} href="/data" icon={<Database size={20} />} label="Data Sources" />
                        <MobileLink onClick={() => setOpen(false)} href="/reports" icon={<PieChart size={20} />} label="Saved Reports" />
                        <MobileLink onClick={() => setOpen(false)} href="/templates" icon={<FileText size={20} />} label="Templates" />
                    </div>
                </nav>
            </div>

            {/* Footer Area: System Links */}
            <div className="px-6 border-t border-border pt-6 flex flex-col gap-2">
                <MobileLink onClick={() => setOpen(false)} href="/models" icon={<Cpu size={20} />} label="Model Manager" />
                <MobileLink onClick={() => setOpen(false)} href="/settings" icon={<Settings size={20} />} label="Settings" />
            </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

// Helper Component for Mobile Links
interface MobileLinkProps {
    icon: React.ReactNode;
    label: string;
    active?: boolean;
    onClick: () => void;
    href: string;
}

const MobileLink = ({ icon, label, active, onClick, href }: MobileLinkProps) => (
  <Link 
    href={href}
    onClick={onClick}
    className={`group flex items-center gap-3 px-3 py-3 rounded-xl transition-all ${active ? 'bg-primary/20 border border-primary/30 text-primary-foreground shadow-[0_0_15px_color-mix(in_srgb,var(--primary),transparent_80%)]' : 'hover:bg-muted/20 text-muted-foreground hover:text-foreground'}`}
  >
    <span className={active ? 'text-primary' : 'text-muted-foreground group-hover:text-foreground'}>{icon}</span>
    <span className={`text-sm font-medium ${active ? 'text-primary font-bold' : ''}`}>{label}</span>
  </Link>
);