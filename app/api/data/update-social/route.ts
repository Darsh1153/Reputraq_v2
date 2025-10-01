import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { users } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import axios from 'axios';

const headers = {
    Accept: "application/json",
    Authorization:
        "Basic NWU2ZDkwZjYtYmMxZS00OTc5LWJlYmEtY2YzOTA5ZjgxZGMxOjg1ZTZiY2UzLTA1MmMtNGJmYy1hNDJhLTY5NmFhM2ZhMjk0OQ==",
};

// Helper function to get user ID from request headers
function getUserIdFromRequest(request: Request): number | null {
  const authHeader = request.headers.get('authorization');
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7);
    try {
      const payload = JSON.parse(atob(token));
      return payload.userId;
    } catch {
      return null;
    }
  }
  return null;
}

export async function POST(request: Request) {
  try {
    const userId = getUserIdFromRequest(request);
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const database = await db;
    
    // Get user's current monitoring data
    const user = await database
      .select({
        id: users.id,
        monitoringData: users.monitoringData
      })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (user.length === 0) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    const currentData = Array.isArray(user[0]?.monitoringData) ? user[0].monitoringData : [];
    let updated = false;

    // Check each keyword's social data status
    for (let i = 0; i < currentData.length; i++) {
      const item = currentData[i];
      
      if (item.socialSearchId && item.socialData?.metadata?.message?.includes('timed out')) {
        try {
          // Check status
          const status_response = await axios.get(
            `https://api.staging.insightiq.ai/v1/social/creators/contents/search/${item.socialSearchId}`,
            { headers }
          );
          
          if (status_response.data.status === "SUCCESS") {
            // Get social insights
            const getSocial_insight = await axios.get(
              `https://api.staging.insightiq.ai/v1/social/creators/contents/search/${item.socialSearchId}/fetch`,
              { headers }
            );
            
            // Update the data
            currentData[i] = {
              ...item,
              socialData: getSocial_insight.data,
              timestamp: new Date().toISOString()
            };
            
            updated = true;
            console.log(`Updated social data for keyword: ${item.keyword}`);
          }
        } catch (error) {
          console.error(`Error updating social data for ${item.keyword}:`, error);
        }
      }
    }

    if (updated) {
      // Save updated data
      await database
        .update(users)
        .set({
          monitoringData: currentData,
          updatedAt: new Date()
        })
        .where(eq(users.id, userId));
    }

    return NextResponse.json({
      message: 'Social data update completed',
      updated: updated,
      data: currentData
    });
  } catch (error) {
    console.error('Error updating social data:', error);
    return NextResponse.json(
      { error: 'Failed to update social data' },
      { status: 500 }
    );
  }
}
