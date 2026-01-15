"use client"

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Table } from 'lucide-react';
import Link from 'next/link'; 

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
        
        {/* LOGO: Changed to a Link to home */}
        <Link href="/" className="flex items-center gap-2 group cursor-pointer">
          <motion.div 
            whileHover={{ rotate: 15, scale: 1.1 }}
            className="bg-primary p-2 rounded-xl text-primary-foreground shadow-lg shadow-primary/20"
          >
            <Table size={18} />
          </motion.div>
          <span className="text-xl font-black tracking-tight">ExcelGPT</span>
        </Link>

        {/* NAVIGATION */}
        <nav className="hidden md:flex items-center gap-2 relative">
          {['Features', 'Architecture', 'Comparison', 'Trust'].map((item) => (
            <Link 
              key={item}
              // Points to ID sections on the home page
              href={`/#${item.toLowerCase()}`}
              onMouseEnter={() => setHoveredLink(item)}
              onMouseLeave={() => setHoveredLink(null)}
              className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors relative"
            >
              {item}
              {hoveredLink === item && (
                <motion.div
                  layoutId="nav-glow"
                  className="absolute inset-0 bg-primary/10 rounded-lg -z-10"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.3 }}
                />
              )}
            </Link>
          ))}
        </nav>

        {/* CTA BUTTONS */}
        <div className="flex items-center gap-4">
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="hidden sm:block text-sm font-semibold text-muted-foreground hover:text-primary transition-colors px-4 py-2 rounded-lg"
          >
            Sign In
          </motion.button>
          
          {/* Changed 'onClick' to <Link> wrapping the button */}
          <Link href="/chat">
            <motion.button 
              whileHover={{ 
                scale: 1.05, 
                // FIXED: Use CSS variable for shadow color
                boxShadow: '0 0 20px -5px hsl(var(--primary) / 0.5)' 
              }}
              whileTap={{ scale: 0.94 }}
              className="bg-primary text-primary-foreground text-sm font-bold py-2.5 px-6 rounded-xl transition-all duration-200"
            >
              Get Started
            </motion.button>
          </Link>
        </div>
      </div>
    </motion.header>
  );
};

export default Header;