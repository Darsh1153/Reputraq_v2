import { closeDatabase } from '../lib/db/connection.js';

async function resetConnections() {
  try {
    console.log('Resetting database connections...');
    await closeDatabase();
    console.log('Database connections reset successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error resetting connections:', error);
    process.exit(1);
  }
}

resetConnections();
