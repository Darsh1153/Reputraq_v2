import { NextRequest, NextResponse } from 'next/server';
import { cronManager } from '@/services/cronManager';

export async function POST(request: NextRequest) {
  try {
    // Initialize cron manager on server side
    await cronManager.start();
    
    return NextResponse.json({
      success: true,
      message: 'Cron manager initialized successfully'
    });
  } catch (error) {
    console.error('Failed to initialize cron manager:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to initialize cron manager',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Cron initialization endpoint',
    usage: 'POST /api/cron/init - Initialize cron manager'
  });
}
