"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { App } from "@capacitor/app";
import { Capacitor } from "@capacitor/core";
import { StatusBar, Style } from "@capacitor/status-bar";

export function MobileGuards() {
  const router = useRouter();
  const pathname = usePathname();

  const isCapacitor =
    typeof window !== "undefined" &&
    (window as any).Capacitor?.isNativePlatform?.();

  // ✅ Block `/` in mobile app
  useEffect(() => {
    if (isCapacitor && pathname === "/") {
      router.replace("/chat");
    }
  }, [isCapacitor, pathname, router]);

  // ✅ Android hardware back button
  useEffect(() => {
    if (!isCapacitor) return;

    let removeListener: (() => void) | undefined;

    App.addListener("backButton", ({ canGoBack }) => {
      if (canGoBack) {
        window.history.back();
      } else {
        App.exitApp();
      }
    }).then((handle) => {
      removeListener = handle.remove;
    });

    return () => {
      removeListener?.();
    };
  }, [isCapacitor]);

  useEffect(() => {
      // Only run on native mobile (iOS/Android)
      if (Capacitor.isNativePlatform()) {
        
        const configureStatusBar = async () => {
          try {
            // 1. Force the content to go UNDER the status bar (Immersive)
            await StatusBar.setOverlaysWebView({ overlay: true });

            // 2. Make the Status Bar background transparent 
            // (This allows your app background/header to be visible)
            // '#00000000' is Hex for fully transparent
            await StatusBar.setBackgroundColor({ color: '#00000000' });

            // 3. Set icons to Light (White text/battery) since you have a Dark Mode app
            await StatusBar.setStyle({ style: Style.Dark });
            
          } catch (err) {
            console.warn("StatusBar config failed", err);
          }
        };

        configureStatusBar();
      }
    }, []);

  return null; // guard component renders nothing
}
