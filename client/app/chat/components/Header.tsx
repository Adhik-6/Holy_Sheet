"use client"

import { Bell, ChevronDown, User } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { MobileSidebar } from "./MobileSidebar"; // Import the new component

export const Header = () => {
    return (
        <header className="h-16 flex items-center justify-between px-4 sm:px-6 border-b border-border bg-background/20 backdrop-blur-md z-20 shrink-0">
          <div className="flex items-center gap-3 sm:gap-4">
            {/* 1. MOBILE MENU TRIGGER (Visible only on small screens) */}
            <MobileSidebar />

            {/* 2. TITLE (Adjusted for mobile) */}
            <h2 className="text-muted-foreground text-sm font-medium truncate max-w-50 sm:max-w-none">
              <span className="hidden sm:inline">Analysis Session: </span>
              <span className="text-foreground font-bold">Q3 Financial Review</span>
            </h2>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            {/* SHADCN BADGE (Hidden on very small screens to save space) */}
            <Badge variant="outline" className="hidden md:flex gap-2 bg-muted/40 border-border font-mono uppercase tracking-widest text-[10px] py-1">
              <span className="size-2 rounded-full bg-green-500 animate-pulse"></span>
              Gemini-1.5-Flash
            </Badge>
            
            <Separator orientation="vertical" className="h-6 mx-2 hidden sm:block" />
            
            {/* SHADCN BUTTONS */}
            <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground size-8 sm:size-10">
              <Bell size={18} />
            </Button>
            {/* Hidden on mobile to save space */}
            <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground hidden sm:flex size-10">
              <ChevronDown size={18} />
            </Button>
            
            {/* SHADCN AVATAR */}
            <Avatar className="size-7 sm:size-8 border border-primary/40">
              <AvatarFallback className="bg-primary/20 text-primary">
                <User size={16} />
              </AvatarFallback>
            </Avatar>
          </div>
        </header>
    )
}