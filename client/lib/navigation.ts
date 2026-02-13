import { 
  LayoutDashboard, 
  MessageSquarePlus, 
  Database, 
  FileText, 
  Settings, 
  Cpu, 
  FolderOpen,
  PieChart
} from "lucide-react";

export const SIDEBAR_ITEMS = [
  {
    group: "Start",
    items: [
      { label: "New Chat", href: "/chat", icon: MessageSquarePlus },
      { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    ]
  },
  {
    group: "Workspace",
    items: [
      { label: "Projects", href: "/projects", icon: FolderOpen },
      { label: "Data Sources", href: "/data", icon: Database },
      { label: "Saved Reports", href: "/reports", icon: PieChart },
      { label: "Templates", href: "/templates", icon: FileText },
    ]
  },
  {
    group: "System",
    items: [
      { label: "Model Manager", href: "/models", icon: Cpu },
      { label: "Settings", href: "/settings", icon: Settings },
    ]
  }
];