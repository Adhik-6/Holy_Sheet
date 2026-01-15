import type { Metadata } from "next";
import "./globals.css";
import { RootProvider } from "@/components/providers/root-provider"
import meta from "@/metadata.json";
import { Inter, JetBrains_Mono } from "next/font/google"; 

const inter = Inter({ 
  subsets: ["latin"],
  variable: "--font-inter",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
});

export const metadata: Metadata = meta;

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body className={`${inter.variable} ${jetbrainsMono.variable} font-sans bg-background text-foreground grid-bg antialiased`}>
        {/* Wrap the entire app in your provider here */}
          <RootProvider>
            {children}
          </RootProvider>
      </body>
    </html>
  )
}