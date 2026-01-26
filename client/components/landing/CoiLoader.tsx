"use client";
import { useEffect } from "react";

export function CoiLoader() {
  useEffect(() => {
    // Only register if not already registered
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      // Check if we already have it
      navigator.serviceWorker.getRegistrations().then((registrations) => {
        const isRegistered = registrations.some(r => r.active?.scriptURL.includes('coi-serviceworker'));
        
        if (!isRegistered) {
          navigator.serviceWorker.register('/coi-serviceworker.js')
            .then(() => console.log("✅ COI Service Worker Registered!"))
            .catch(err => console.error("❌ COI Failed:", err));
        }
      });
    }
  }, []);
  
  return null;
}