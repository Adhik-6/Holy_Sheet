"use client"

import { Bell, ChevronDown, User } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

export const Header = () => {
    return (
        <header className="h-16 flex items-center justify-between px-6 border-b border-border bg-background/20 backdrop-blur-md z-20 shrink-0">
          <div className="flex items-center gap-4">
            <h2 className="text-muted-foreground text-sm font-medium hidden sm:block">
              Analysis Session: <span className="text-foreground font-bold">Q3 Financial Review</span>
            </h2>
          </div>
          <div className="flex items-center gap-3">
            {/* SHADCN BADGE */}
            <Badge variant="outline" className="hidden sm:flex gap-2 bg-muted/40 border-border font-mono uppercase tracking-widest text-[10px] py-1">
              <span className="size-2 rounded-full bg-green-500 animate-pulse"></span>
              Gemini-1.5-Flash
            </Badge>
            
            <Separator orientation="vertical" className="h-6 mx-2" />
            
            {/* SHADCN BUTTONS (Ghost variant for icons) */}
            <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
              <Bell size={18} />
            </Button>
            <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
              <ChevronDown size={18} />
            </Button>
            
            {/* SHADCN AVATAR */}
            <Avatar className="size-8 border border-primary/40">
              <AvatarFallback className="bg-primary/20 text-primary">
                <User size={16} />
              </AvatarFallback>
            </Avatar>
          </div>
        </header>
    )
}