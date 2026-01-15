"use client"

import Link from "next/link";
import { LayoutDashboard, PlusCircle, LinkIcon, History, Settings, Table } from "lucide-react";

export const Sidebar = () => {
    return (
      <aside className="w-20 lg:w-64 flex flex-col justify-between border-r border-border bg-card/40 backdrop-blur-xl z-20 transition-all">
        <div className="flex flex-col gap-6 p-4">
          <Link href="/" className="flex items-center gap-3 px-2 cursor-pointer group">
            <div className="relative flex items-center justify-center size-10 rounded-xl bg-primary shadow-lg shadow-primary/20 group-hover:scale-105 transition-transform">
              <Table size={20} className="text-primary-foreground" />
            </div>
            <div className="hidden lg:flex flex-col">
              <h1 className="text-foreground text-lg font-black tracking-tighter">ExcelGPT</h1>
              <p className="text-primary text-[10px] font-mono tracking-widest uppercase">v2.4.0 • Online</p>
            </div>
          </Link>

          <nav className="flex flex-col gap-2 mt-4">
            <SidebarLink icon={<LayoutDashboard size={20} />} label="Dashboard" active />
            <SidebarLink icon={<PlusCircle size={20} />} label="New Analysis" />
            <SidebarLink icon={<LinkIcon size={20} />} label="Connectors" />
            <SidebarLink icon={<History size={20} />} label="History" />
          </nav>
        </div>

        <div className="p-4 border-t border-border">
          <SidebarLink icon={<Settings size={20} />} label="Settings" />
        </div>
      </aside>
    )
}

const SidebarLink: React.FC<{ icon: React.ReactNode, label: string, active?: boolean }> = ({ icon, label, active }) => (
  <Link href="#" className={`group flex items-center gap-3 px-3 py-3 rounded-xl transition-all ${active ? 'bg-primary/20 border border-primary/30 text-primary-foreground shadow-[0_0_15px_color-mix(in_srgb,var(--primary),transparent_80%)]' : 'hover:bg-muted/20 text-muted-foreground hover:text-foreground'}`}>
    <span className={active ? 'text-primary' : 'text-muted-foreground group-hover:text-foreground'}>{icon}</span>
    <span className={`hidden lg:block text-sm font-medium ${active ? 'text-primary font-bold' : ''}`}>{label}</span>
  </Link>
);