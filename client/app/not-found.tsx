"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { FileWarning, Home, MoveLeft } from "lucide-react"

export default function NotFound() {
  return (
    <div className="h-screen w-full flex flex-col items-center justify-center text-foreground overflow-hidden relative selection:bg-[color-mix(in_srgb,var(--primary),transparent_70%)] selection:text-primary-foreground">
        
        {/* FIXED: Ambient Background Glow using color-mix for correct transparency */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-150 h-150 rounded-full blur-[120px] -z-10 pointer-events-none bg-[color-mix(in_srgb,var(--primary),transparent_85%)]" />
        
        {/* Grid Background - reduced opacity via color-mix */}
        <div className="grid-bg absolute inset-0 -z-20 opacity-20" />

        <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="p-8 md:p-12 rounded-[2.5rem] border border-border text-center max-w-lg w-full mx-6 shadow-2xl relative backdrop-blur-xl bg-[color-mix(in_srgb,var(--card),transparent_30%)]"
        >
            {/* Animated Icon */}
            <motion.div 
                initial={{ rotate: -10 }}
                animate={{ rotate: 10 }}
                transition={{ repeat: Infinity, repeatType: "mirror", duration: 2, ease: "easeInOut" }}
                // FIXED: Background color-mix
                className="w-24 h-24 rounded-3xl flex items-center justify-center mx-auto mb-8 border border-border bg-[color-mix(in_srgb,var(--muted),transparent_70%)]"
            >
                <FileWarning size={40} className="text-primary" />
            </motion.div>

            {/* REAL GLITCH EFFECT */}
            <motion.h1 
                // Glitch Animation: Random skews and slight x-shifts
                animate={{ 
                    skewX: [0, 5, -5, 0, 0, 2, 0],
                    x: [0, 2, -2, 0, 0, 1, 0],
                    opacity: [1, 0.8, 1, 1, 0.9, 1]
                }}
                transition={{ 
                    duration: 0.2, 
                    repeat: Infinity, 
                    repeatDelay: 3, // Glitches every 3 seconds
                    repeatType: "mirror"
                }}
                className="text-7xl md:text-8xl font-black mb-4 tracking-tighter text-foreground"
            >
                404
            </motion.h1>

            <h2 className="text-2xl font-bold mb-4">Data Not Found</h2>

            <p className="text-muted-foreground mb-10 leading-relaxed">
                The spreadsheet row you are looking for has been deleted, corrupted, or never existed in this dataset.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/" className="w-full sm:w-auto">
                    <motion.button 
                        whileHover={{ 
                            scale: 1.02, 
                            boxShadow: '0 0 20px -5px color-mix(in srgb, var(--primary), transparent 50%)' 
                        }}
                        whileTap={{ scale: 0.98 }}
                        className="w-full bg-primary text-primary-foreground font-bold py-3.5 px-8 rounded-xl flex items-center justify-center gap-2 transition-all duration-300"
                    >
                        <Home size={18} />
                        Return Home
                    </motion.button>
                </Link>
                
                <motion.button 
                    onClick={() => window.history.back()}
                    whileHover={{ 
                        scale: 1.02, 
                        backgroundColor: 'color-mix(in srgb, var(--foreground), transparent 95%)' 
                    }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full sm:w-auto border border-border text-muted-foreground font-semibold py-3.5 px-8 rounded-xl flex items-center justify-center gap-2 backdrop-blur-sm transition-all duration-200"
                >
                    <MoveLeft size={18} />
                    Go Back
                </motion.button>
            </div>
        </motion.div>

        {/* Footer Text */}
        <div className="absolute bottom-10 text-[10px] uppercase tracking-[0.2em] font-mono text-[color-mix(in_srgb,var(--muted-foreground),transparent_60%)]">
            Error: ID_NULL_REFERENCE
        </div>
    </div>
  )
}