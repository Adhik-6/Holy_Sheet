"use client";

import { Table } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

const Footer = () => {
  return (
    <footer className="py-12 px-6 bg-background/40 border-t border-border backdrop-blur-sm">
      <div className="container mx-auto max-w-6xl flex flex-col md:flex-row justify-between items-center gap-8">
        {/* Brand */}
        <Link href="/" className="flex items-center gap-2">
          <div className="bg-primary p-1.5 rounded-lg">
            <Table size={16} className="text-primary-foreground" />
          </div>
          <span className="font-black tracking-tight text-lg">ExcelGPT</span>
        </Link>

        {/* Center */}
        <div className="text-muted-foreground text-sm font-medium text-center">
          Built with <span className="text-red-500">❤</span> by{" "}
          <a
            href="#"
            className="text-foreground hover:text-primary transition-colors"
          >
            A.M.
          </a>{" "}
          © 2026
        </div>

        {/* Social */}
        <div className="flex items-center gap-2">
          {["Twitter", "GitHub", "Discord"].map((social) => (
            <Button
              key={social}
              asChild
              variant="link"
              className="text-sm font-bold text-muted-foreground hover:text-foreground px-0"
            >
              <Link href="#">{social}</Link>
            </Button>
          ))}
        </div>
      </div>
    </footer>
  );
};

export default Footer;
