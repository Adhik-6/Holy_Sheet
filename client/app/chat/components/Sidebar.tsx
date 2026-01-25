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
  PieChart
} from "lucide-react";

export const Sidebar = () => {
    return (
      <aside className="w-20 lg:w-64 h-full flex flex-col justify-between border-r border-border bg-card/40 backdrop-blur-xl z-20 transition-all">
        <div className="flex flex-col gap-6 p-4">
          {/* BRAND HEADER */}
          <Link href="/" className="flex items-center gap-3 px-2 cursor-pointer group mb-2">
            <div className="relative flex items-center justify-center size-10 rounded-xl bg-primary shadow-lg shadow-primary/20 group-hover:scale-105 transition-transform">
              <Table size={20} className="text-primary-foreground" />
            </div>
            <div className="hidden lg:flex flex-col">
              <h1 className="text-foreground text-lg font-black tracking-tighter">ExcelGPT</h1>
              <p className="text-muted-foreground text-[10px] font-mono tracking-widest uppercase">Data Intelligence</p>
            </div>
          </Link>

          {/* MAIN ACTIONS */}
          <div className="flex flex-col gap-2">
             <p className="hidden lg:block px-3 text-[10px] uppercase tracking-wider text-muted-foreground/50 font-bold mb-1">Start</p>
             <SidebarLink icon={<MessageSquarePlus size={20} />} label="New Chat" active href="/chat" />
             <SidebarLink icon={<LayoutDashboard size={20} />} label="Dashboard" href="/dashboard" />
          </div>

          {/* ASSETS & DATA */}
          <div className="flex flex-col gap-2">
             <p className="hidden lg:block px-3 text-[10px] uppercase tracking-wider text-muted-foreground/50 font-bold mb-1">Workspace</p>
             <SidebarLink icon={<FolderOpen size={20} />} label="Projects" href="/projects" />
             <SidebarLink icon={<Database size={20} />} label="Data Sources" href="/data" />
             <SidebarLink icon={<PieChart size={20} />} label="Saved Reports" href="/reports" />
             <SidebarLink icon={<FileText size={20} />} label="Templates" href="/templates" />
          </div>
        </div>

        {/* SYSTEM / FOOTER */}
        <div className="p-4 border-t border-border flex flex-col gap-2">
          {/* Unique Feature: Model Manager for Offline SLMs */}
          
          {/* ✅ FIXED: Pass href directly instead of wrapping */}
          <SidebarLink icon={<Cpu size={20} />} label="Model Manager" href="/models" />
          
          <SidebarLink icon={<Settings size={20} />} label="Settings" href="/settings" />
        </div>
      </aside>
    )
}

// ✅ FIXED: Added 'href' to the interface and component props
interface SidebarLinkProps {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
  href?: string;
}

const SidebarLink: React.FC<SidebarLinkProps> = ({ icon, label, active, href = "#" }) => (
  <Link href={href} className={`group flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 ${active ? 'bg-primary/20 border border-primary/30 text-primary-foreground shadow-[0_0_15px_color-mix(in_srgb,var(--primary),transparent_80%)]' : 'hover:bg-muted/20 text-muted-foreground hover:text-foreground'}`}>
    <span className={`shrink-0 ${active ? 'text-primary' : 'text-muted-foreground group-hover:text-foreground'}`}>
        {icon}
    </span>
    {/* Truncate ensures text doesn't overflow if sidebar width animates/changes */}
    <span className={`hidden lg:block text-sm font-medium truncate ${active ? 'text-primary font-bold' : ''}`}>
        {label}
    </span>
  </Link>
);