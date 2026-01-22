"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Menu, Table } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";

const navItems = ["Features", "Architecture", "Comparison", "Trust"];

const Header = () => {
  const [hoveredLink, setHoveredLink] = useState<string | null>(null);

  return (
    <motion.header
      initial={{ y: -64 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      className="fixed top-0 left-0 right-0 z-50 h-16 flex items-center bg-background/15 backdrop-blur-lg border-b border-border"
    >
      <div className="container mx-auto px-6 flex justify-between items-center">
        {/* LOGO */}
        <Link href="/" className="flex items-center gap-2 group cursor-pointer">
          <motion.div
            whileHover={{ rotate: 15, scale: 1.1 }}
            className="bg-primary p-2 rounded-xl text-primary-foreground shadow-lg shadow-primary/20"
          >
            <Table size={18} />
          </motion.div>
          <span className="text-xl font-black tracking-tight">ExcelGPT</span>
        </Link>

        {/* NAVIGATION (Desktop) - RESTORED ORIGINAL EFFECT */}
        <nav className="hidden md:flex items-center gap-2 relative">
          {navItems.map((item) => (
            <Link
              key={item}
              href={`/#${item.toLowerCase()}`}
              onMouseEnter={() => setHoveredLink(item)}
              onMouseLeave={() => setHoveredLink(null)}
              className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors relative rounded-lg"
            >
              <span className="relative z-10">{item}</span>

              {hoveredLink === item && (
                <motion.span
                  layoutId="nav-glow"
                  className="absolute inset-0 bg-primary/10 rounded-lg z-0"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.3 }}
                />
              )}
            </Link>
          ))}
        </nav>

        {/* CTA BUTTONS */}
        <div className="flex items-center gap-3">
          {/* Sign In */}
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button
              variant="ghost"
              className="hidden sm:inline-flex text-sm font-semibold text-muted-foreground hover:text-primary px-4 py-2 rounded-lg"
            >
              Sign In
            </Button>
          </motion.div>

          {/* Get Started - SAME glow effect */}
          <motion.div
            whileHover={{
              scale: 1.05,
              boxShadow: "0 0 20px -5px hsl(var(--primary) / 0.5)",
            }}
            whileTap={{ scale: 0.94 }}
            className="rounded-xl"
          >
            <Button asChild className="rounded-xl text-sm font-bold py-2.5 px-6">
              <Link href="/chat">Get Started</Link>
            </Button>
          </motion.div>

          {/* MOBILE MENU */}
          <div className="md:hidden">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" size="icon" className="rounded-xl">
                  <Menu size={18} />
                </Button>
              </SheetTrigger>

              <SheetContent side="right" className="w-[320px]">
                <SheetHeader>
                  <SheetTitle className="flex items-center gap-2">
                    <div className="bg-primary p-1.5 rounded-lg text-primary-foreground">
                      <Table size={16} />
                    </div>
                    <span className="font-black tracking-tight">ExcelGPT</span>
                  </SheetTitle>
                </SheetHeader>

                <Separator className="my-6" />

                <div className="flex flex-col gap-2">
                  {navItems.map((item) => (
                    <Button
                      key={item}
                      asChild
                      variant="ghost"
                      className="justify-start rounded-xl text-muted-foreground hover:text-foreground"
                    >
                      <Link href={`/#${item.toLowerCase()}`}>{item}</Link>
                    </Button>
                  ))}
                </div>

                <Separator className="my-6" />

                <div className="flex flex-col gap-3">
                  <Button
                    variant="ghost"
                    className="justify-start rounded-xl text-muted-foreground hover:text-primary"
                  >
                    Sign In
                  </Button>

                  <Button asChild className="rounded-xl font-bold">
                    <Link href="/chat">Get Started</Link>
                  </Button>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </motion.header>
  );
};

export default Header;
