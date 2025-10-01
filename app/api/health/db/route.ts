import { NextResponse } from 'next/server';
import { sql } from 'drizzle-orm';
import { getDatabase, isDatabaseHealthy } from '@/lib/db/connection';

export async function GET() {
  try {
    // Simple query to test database connection
    const startTime = Date.now();
    const db = await getDatabase();
    await db.execute(sql`SELECT 1 as test`);
    const responseTime = Date.now() - startTime;
    
    // Get connection info
    const connectionInfo = await db.execute(sql`
      SELECT 
        count(*) as active_connections,
        state,
        application_name
      FROM pg_stat_activity 
      WHERE datname = current_database()
      GROUP BY state, application_name
    `);
    
    // Additional health check
    const isHealthy = await isDatabaseHealthy();
    
    return NextResponse.json({
      status: 'healthy',
      database: 'connected',
      healthCheck: isHealthy,
      responseTime: `${responseTime}ms`,
      connections: connectionInfo,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Database health check failed:', error);
    
    return NextResponse.json({
      status: 'unhealthy',
      database: 'disconnected',
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}
