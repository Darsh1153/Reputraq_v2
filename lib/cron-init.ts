// Initialize cron manager when the application starts
import { cronManager } from '@/services/cronManager';

// Start the cron manager (it will auto-start, but this ensures it's available)
console.log('🚀 Cron manager initialized and available');

// Export for potential manual control
export { cronManager };
