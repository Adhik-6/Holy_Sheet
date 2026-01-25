import type { Metadata, Viewport } from "next";
import "./globals.css";
import { RootProvider } from "@/components/providers/root-provider"
import meta from "@/metadata.json";
import { Inter, JetBrains_Mono } from "next/font/google"; 
import { MobileGuards } from "./chat/components/index";

const inter = Inter({ 
  subsets: ["latin"],
  variable: "--font-inter",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover", 
};

export const metadata: Metadata = meta;

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body className={`${inter.variable} ${jetbrainsMono.variable} font-sans bg-background text-foreground grid-bg antialiased pt-[env(safe-area-inset-top)]`}>
        {/* Wrap the entire app in your provider here */}
          <MobileGuards />
          <RootProvider>
            {children}
          </RootProvider>
      </body>
    </html>
  )
}