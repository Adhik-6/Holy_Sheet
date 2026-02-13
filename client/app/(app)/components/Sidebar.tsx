"use client"

import Link from "next/link";
import { usePathname } from "next/navigation"; // Import this
import { Table } from "lucide-react";
import { SIDEBAR_ITEMS } from "@/lib/navigation"; // Import config

export const Sidebar = () => {
    const pathname = usePathname(); // Get current route

    return (
      <aside className="w-20 lg:w-64 h-full flex flex-col justify-between border-r border-border bg-card/40 backdrop-blur-xl z-20 transition-all">
        <div className="flex flex-col gap-6 p-4">
          {/* BRAND */}
          <Link href="/" className="flex items-center gap-3 px-2 cursor-pointer group mb-2">
            <div className="relative flex items-center justify-center size-10 rounded-xl bg-primary shadow-lg shadow-primary/20 group-hover:scale-105 transition-transform">
              <Table size={20} className="text-primary-foreground" />
            </div>
            <div className="hidden lg:flex flex-col">
              <h1 className="text-foreground text-lg font-black tracking-tighter">ExcelGPT</h1>
              <p className="text-muted-foreground text-[10px] font-mono tracking-widest uppercase">Data Intelligence</p>
            </div>
          </Link>

          {/* DYNAMIC NAVIGATION GROUPS */}
          <div className="overflow-y-auto max-h-[calc(100vh-8rem)]">
          {SIDEBAR_ITEMS.map((group, idx) => (
             // Skip rendering System group here if you want it at the bottom (custom logic below)
             group.group !== 'System' && (
                <div key={idx} className="flex flex-col gap-2">
                    <p className="hidden lg:block px-3 text-[10px] uppercase tracking-wider text-muted-foreground/50 font-bold mb-1">
                        {group.group}
                    </p>
                    {group.items.map((item) => (
                        <SidebarLink 
                            key={item.href}
                            icon={<item.icon size={20} />} 
                            label={item.label} 
                            href={item.href}
                            // Auto-Active Logic
                            active={pathname === item.href || pathname.startsWith(item.href)}
                        />
                    ))}
                </div>
             )
          ))}
        </div>
        </div>

        {/* SYSTEM / FOOTER (Hardcoded position for layout reasons, but dynamic data) */}
        <div className="p-4 border-t border-border flex flex-col gap-2">
            {SIDEBAR_ITEMS.find(g => g.group === 'System')?.items.map((item) => (
                <SidebarLink 
                    key={item.href}
                    icon={<item.icon size={20} />} 
                    label={item.label} 
                    href={item.href}
                    active={pathname === item.href}
                />
            ))}
        </div>
      </aside>
    )
}

// ... SidebarLink component remains the same ...
const SidebarLink: React.FC<{ icon: React.ReactNode, label: string, active?: boolean, href: string }> = ({ icon, label, active, href }) => (
  <Link href={href} className={`group flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 ${active ? 'bg-primary/20 border border-primary/30 text-primary-foreground shadow-[0_0_15px_color-mix(in_srgb,var(--primary),transparent_80%)]' : 'hover:bg-muted/20 text-muted-foreground hover:text-foreground'}`}>
    <span className={`shrink-0 ${active ? 'text-primary' : 'text-muted-foreground group-hover:text-foreground'}`}>
        {icon}
    </span>
    <span className={`hidden lg:block text-sm font-medium truncate ${active ? 'text-primary font-bold' : ''}`}>
        {label}
    </span>
  </Link>
);