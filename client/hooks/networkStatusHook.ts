"use client"

import { useState, useEffect } from "react";
import { Network } from "@capacitor/network";

export function useNetworkStatus() {
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    // 1. Check Initial Status (Works on Web & Mobile)
    Network.getStatus().then(status => setIsOnline(status.connected));

    // 2. Setup Listener (Works on Web & Mobile)
    const listener = Network.addListener('networkStatusChange', status => {
      console.log('Network status changed:', status.connected); // Optional debug log
      setIsOnline(status.connected);
    });

    // 3. CLEANUP (Crucial to prevent the log spam you saw earlier)
    return () => {
      listener.then(handle => handle.remove());
    };
  }, []);

  return isOnline;
}