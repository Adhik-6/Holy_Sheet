"use client"

import { useState, useEffect } from "react";
import { Capacitor } from "@capacitor/core";
import { Network } from "@capacitor/network";

export function useNetworkStatus() {
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    const initNetwork = async () => {
      // 1. Check initial status
      if (Capacitor.isNativePlatform()) {
        const status = await Network.getStatus();
        setIsOnline(status.connected);
      } else {
        setIsOnline(navigator.onLine);
      }
    };

    initNetwork();

    // 2. Setup Listeners
    if (Capacitor.isNativePlatform()) {
      // NATIVE LISTENER (Better for Mobile)
      const handle = Network.addListener('networkStatusChange', status => {
        setIsOnline(status.connected);
      });
      
      return () => {
        handle.then(h => h.remove());
      };
    } else {
      // WEB LISTENER (Standard Browser API)
      const handleOnline = () => setIsOnline(true);
      const handleOffline = () => setIsOnline(false);

      window.addEventListener("online", handleOnline);
      window.addEventListener("offline", handleOffline);

      return () => {
        window.removeEventListener("online", handleOnline);
        window.removeEventListener("offline", handleOffline);
      };
    }
  }, []);

  return isOnline;
}