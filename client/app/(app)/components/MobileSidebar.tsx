"use client"

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, Table } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { SIDEBAR_ITEMS } from "@/lib/navigation"; 

// 1. Accept isOnline prop if needed for header logic, otherwise optional
export const MobileSidebar = () => {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden text-muted-foreground hover:text-primary hover:bg-primary/10">
          <Menu size={24} />
        </Button>
      </SheetTrigger>

      <SheetContent side="left" className="w-72 border-r border-border bg-black/95 backdrop-blur-xl p-0 pt-2">
        <SheetTitle className="sr-only">Mobile Navigation</SheetTitle>
        
        <div className="flex flex-col h-full justify-between py-6">
            
            {/* Top Section */}
            <div className="flex flex-col gap-6 px-6 overflow-y-auto">
                <Link href="/" onClick={() => setOpen(false)} className="flex items-center gap-3 cursor-pointer group">
                    <div className="relative flex items-center justify-center size-10 rounded-xl bg-primary shadow-lg shadow-primary/20">
                        <Table size={20} className="text-primary-foreground" />
                    </div>
                    <div className="flex flex-col">
                        <h1 className="text-foreground text-lg font-black tracking-tighter">ExcelGPT</h1>
                        <p className="text-muted-foreground text-[10px] font-mono tracking-widest uppercase">Data Intelligence</p>
                    </div>
                </Link>

                <nav className="flex flex-col gap-6 mt-4">
                    {SIDEBAR_ITEMS.map((group, idx) => (
                        group.group !== 'System' && (
                            <div key={idx} className="flex flex-col gap-2">
                                <p className="px-3 text-[10px] uppercase tracking-wider text-muted-foreground/50 font-bold">{group.group}</p>
                                {group.items.map((item) => (
                                    <MobileLink 
                                        key={item.href}
                                        onClick={() => setOpen(false)} 
                                        href={item.href} 
                                        icon={<item.icon size={20} />} 
                                        label={item.label}
                                        active={pathname === item.href}
                                    />
                                ))}
                            </div>
                        )
                    ))}
                </nav>
            </div>

            {/* Footer Area */}
            <div className="px-6 border-t border-border pt-6 flex flex-col gap-2">
                {SIDEBAR_ITEMS.find(g => g.group === 'System')?.items.map((item) => (
                    <MobileLink 
                        key={item.href}
                        onClick={() => setOpen(false)} 
                        href={item.href} 
                        icon={<item.icon size={20} />} 
                        label={item.label}
                        active={pathname === item.href}
                    />
                ))}
            </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

// MobileLink Helper
const MobileLink = ({ icon, label, active, onClick, href }: any) => (
  <Link 
    href={href}
    onClick={onClick}
    className={`group flex items-center gap-3 px-3 py-3 rounded-xl transition-all ${active ? 'bg-primary/20 border border-primary/30 text-primary-foreground shadow-[0_0_15px_color-mix(in_srgb,var(--primary),transparent_80%)]' : 'hover:bg-muted/20 text-muted-foreground hover:text-foreground'}`}
  >
    <span className={active ? 'text-primary' : 'text-muted-foreground group-hover:text-foreground'}>{icon}</span>
    <span className={`text-sm font-medium ${active ? 'text-primary font-bold' : ''}`}>{label}</span>
  </Link>
);