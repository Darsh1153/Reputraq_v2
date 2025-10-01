import { NextResponse } from 'next/server';
import { getDatabase } from '@/lib/db/connection';
import { cronJobSettings, dataCollectionJobs } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { cronManager } from '@/services/cronManager';

function getUserIdFromRequest(request: Request): number | null {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return null;
    }

    const token = authHeader.substring(7);
    const decoded = JSON.parse(atob(token));
    return decoded.userId || null;
  } catch (error) {
    console.error('Error parsing auth token:', error);
  }

  return null;
}

// Get cron job settings for a user
export async function GET(request: Request) {
  try {
    const userId = getUserIdFromRequest(request);

    if (!userId) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const db = await getDatabase();
    
    // Get user's cron settings
    const settings = await db
      .select()
      .from(cronJobSettings)
      .where(eq(cronJobSettings.userId, userId))
      .limit(1);

    if (settings.length === 0) {
      // Create default settings if none exist
      const [newSettings] = await db
        .insert(cronJobSettings)
        .values({
          userId,
          isEnabled: true,
          intervalHours: 24,
          timezone: 'UTC'
        })
        .returning();

      return NextResponse.json({
        settings: newSettings,
        message: "Default cron settings created"
      });
    }

    return NextResponse.json({
      settings: settings[0],
      message: "Cron settings retrieved successfully"
    });

  } catch (error) {
    console.error("Error getting cron settings:", error);
    return NextResponse.json(
      { error: "Failed to get cron settings" },
      { status: 500 }
    );
  }
}

// Update cron job settings
export async function PUT(request: Request) {
  try {
    const userId = getUserIdFromRequest(request);

    if (!userId) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { isEnabled, intervalHours, timezone } = body;

    // Validate input
    if (intervalHours && (intervalHours < 1 || intervalHours > 168)) {
      return NextResponse.json(
        { error: "Interval hours must be between 1 and 168 (1 week)" },
        { status: 400 }
      );
    }

    const db = await getDatabase();
    
    // Update settings
    const [updatedSettings] = await db
      .update(cronJobSettings)
      .set({
        isEnabled: isEnabled !== undefined ? isEnabled : undefined,
        intervalHours: intervalHours || undefined,
        timezone: timezone || undefined,
        updatedAt: new Date()
      })
      .where(eq(cronJobSettings.userId, userId))
      .returning();

    if (!updatedSettings) {
      return NextResponse.json(
        { error: "Cron settings not found" },
        { status: 404 }
      );
    }

    // Reschedule cron job
    if (isEnabled) {
      await cronManager.scheduleJobForUser(userId);
    } else {
      cronManager.cancelJobForUser(userId);
    }

    return NextResponse.json({
      settings: updatedSettings,
      message: "Cron settings updated successfully"
    });

  } catch (error) {
    console.error("Error updating cron settings:", error);
    return NextResponse.json(
      { error: "Failed to update cron settings" },
      { status: 500 }
    );
  }
}

// Get job history for a user
export async function POST(request: Request) {
  try {
    const userId = getUserIdFromRequest(request);

    if (!userId) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { action } = body;

    if (action === 'getJobHistory') {
      const jobs = await cronManager.getJobStatus(userId);
      
      return NextResponse.json({
        jobs,
        message: "Job history retrieved successfully"
      });
    }

    if (action === 'runNow') {
      // Trigger immediate data collection
      await cronManager.runDataCollection(userId);
      
      return NextResponse.json({
        message: "Data collection started"
      });
    }

    return NextResponse.json(
      { error: "Invalid action" },
      { status: 400 }
    );

  } catch (error) {
    console.error("Error in cron job action:", error);
    return NextResponse.json(
      { error: "Failed to perform action" },
      { status: 500 }
    );
  }
}
