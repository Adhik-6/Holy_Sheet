"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { App } from "@capacitor/app";

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

  return null; // guard component renders nothing
}
