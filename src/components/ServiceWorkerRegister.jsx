'use client';

import { useEffect } from 'react';

export default function ServiceWorkerRegister() {
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch(() => {
        // Offline support is a bonus, not a requirement — fail quietly.
      });
    }
  }, []);

  return null;
}
