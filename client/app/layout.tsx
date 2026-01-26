import type { Metadata, Viewport } from "next";
import "./globals.css";
import { RootProvider } from "@/components/providers/root-provider"
import meta from "@/metadata.json";
import { Inter, JetBrains_Mono } from "next/font/google"; 
import { MobileGuards } from "./chat/components/index";
import { CoiLoader } from "@/components/landing/CoiLoader";

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
      <head>
        {/* <meta httpEquiv="origin-trial" content="...token..." /> 
        {/* <script src="/coi-serviceworker.js" async></script> */}
      </head>
      <body className={`${inter.variable} ${jetbrainsMono.variable} font-sans bg-background text-foreground grid-bg antialiased`}>
        {/* Wrap the entire app in your provider here */}
          <CoiLoader />
          <MobileGuards />
          <RootProvider>
            {children}
          </RootProvider>
      </body>
    </html>
  )
}