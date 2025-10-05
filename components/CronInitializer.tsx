'use client';

import { useEffect } from 'react';

export function CronInitializer() {
  useEffect(() => {
    // Initialize cron manager via API call (server-side)
    const initializeCron = async () => {
      try {
        const response = await fetch('/api/cron/init', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
        });
        
        if (response.ok) {
          console.log('🚀 Cron manager initialized successfully');
        } else {
          console.warn('⚠️ Failed to initialize cron manager');
        }
      } catch (error) {
        console.error('❌ Error initializing cron manager:', error);
      }
    };

    // Only initialize in production
    if (process.env.NODE_ENV === 'production') {
      initializeCron();
    }
  }, []);

  return null; // This component doesn't render anything
}
