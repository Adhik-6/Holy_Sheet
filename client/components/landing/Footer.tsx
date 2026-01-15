"use client"

import { Table } from 'lucide-react';
import Link from 'next/link';

const Footer = () => {
  return (
    <footer className="py-12 px-6 bg-background/40 border-t border-border backdrop-blur-sm">
      <div className="container mx-auto max-w-6xl flex flex-col md:flex-row justify-between items-center gap-8">
        <div className="flex items-center gap-2">
          <div className="bg-primary p-1.5 rounded-lg">
            <Table size={16} className="text-primary-foreground" />
          </div>
          <span className="font-black tracking-tight text-lg">ExcelGPT</span>
        </div>
        
        <div className="text-muted-foreground text-sm font-medium">
          Built with <span className="text-red-500">❤</span> by <a href="#" className="text-foreground hover:text-primary transition-colors">A.M.</a> © 2026
        </div>
        
        <div className="flex gap-8">
          {['Twitter', 'GitHub', 'Discord'].map((social) => (
            <Link 
              key={social} 
              href="#" 
              className="text-sm font-bold text-muted-foreground hover:text-foreground transition-colors"
            >
              {social}
            </Link>
          ))}
        </div>
      </div>
    </footer>
  );
};

export default Footer;