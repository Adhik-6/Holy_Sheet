"use client";
import { useEffect } from "react";

export const CoiLoader = () => {
  useEffect(() => {
    if (typeof window !== "undefined" && "serviceWorker" in navigator) {
      navigator.serviceWorker.register("/coi-serviceworker.js").then((registration) => {
        console.log("✅ COI Service Worker Registered:", registration.scope);

        // 🚨 THE MISSING PIECE: 
        // If the service worker is active but not yet controlling this page, 
        // we MUST reload. Otherwise, crossOriginIsolated stays false.
        if (registration.active && !navigator.serviceWorker.controller) {
          console.log("🔄 COI: Activating Headers... Reloading page.");
          window.location.reload();
        }
      });

      // Listen for the moment the worker takes control
      navigator.serviceWorker.addEventListener("controllerchange", () => {
        console.log("🔄 COI: Controller changed. Reloading for turbo mode.");
        window.location.reload();
      });
    }
  }, []);

  return null;
};