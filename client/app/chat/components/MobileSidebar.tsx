"use client"

import Link from "next/link";
import { LayoutDashboard, PlusCircle, LinkIcon, History, Settings, Table, Menu } from "lucide-react";
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
        {/* Accessibility Title (Required by Radix UI) */}
        <SheetTitle className="sr-only">Mobile Navigation</SheetTitle>
        
        <div className="flex flex-col h-full justify-between py-6">
            {/* Header Area */}
            <div className="flex flex-col gap-6 px-6">
                <Link href="/" onClick={() => setOpen(false)} className="flex items-center gap-3 cursor-pointer group">
                    <div className="relative flex items-center justify-center size-10 rounded-xl bg-primary shadow-lg shadow-primary/20">
                        <Table size={20} className="text-primary-foreground" />
                    </div>
                    <div className="flex flex-col">
                        <h1 className="text-foreground text-lg font-black tracking-tighter">ExcelGPT</h1>
                        <p className="text-primary text-[10px] font-mono tracking-widest uppercase">v2.4.0 • Online</p>
                    </div>
                </Link>

                {/* Nav Links */}
                <nav className="flex flex-col gap-2 mt-4">
                    <MobileLink onClick={() => setOpen(false)} icon={<LayoutDashboard size={20} />} label="Dashboard" active />
                    <MobileLink onClick={() => setOpen(false)} icon={<PlusCircle size={20} />} label="New Analysis" />
                    <MobileLink onClick={() => setOpen(false)} icon={<LinkIcon size={20} />} label="Connectors" />
                    <MobileLink onClick={() => setOpen(false)} icon={<History size={20} />} label="History" />
                </nav>
            </div>

            {/* Footer Area */}
            <div className="px-6 border-t border-border pt-6">
                <MobileLink onClick={() => setOpen(false)} icon={<Settings size={20} />} label="Settings" />
            </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

// Helper Component for Mobile Links
const MobileLink = ({ icon, label, active, onClick }: { icon: React.ReactNode, label: string, active?: boolean, onClick: () => void }) => (
  <Link 
    href="#" 
    onClick={onClick}
    className={`group flex items-center gap-3 px-3 py-3 rounded-xl transition-all ${active ? 'bg-primary/20 border border-primary/30 text-primary-foreground shadow-[0_0_15px_color-mix(in_srgb,var(--primary),transparent_80%)]' : 'hover:bg-muted/20 text-muted-foreground hover:text-foreground'}`}
  >
    <span className={active ? 'text-primary' : 'text-muted-foreground group-hover:text-foreground'}>{icon}</span>
    <span className={`text-sm font-medium ${active ? 'text-primary font-bold' : ''}`}>{label}</span>
  </Link>
);