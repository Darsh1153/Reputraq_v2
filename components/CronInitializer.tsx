'use client';

import { useEffect } from 'react';

export function CronInitializer() {
  useEffect(() => {
    // Initialize cron manager on client side
    if (typeof window !== 'undefined' && process.env.NODE_ENV === 'production') {
      import('@/services/cronManager').then(({ cronManager }) => {
        cronManager.start();
        console.log('🚀 Cron manager started on client side');
      });
    }
  }, []);

  return null; // This component doesn't render anything
}
