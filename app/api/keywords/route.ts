import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { keywords, users } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';
import { canAddKeyword, getPlanLimits, getPlanUpgradeMessage } from '@/lib/constants/plans';

// Helper function to get user ID from request headers
function getUserIdFromRequest(request: Request): number | null {
  // In a real app, you'd get this from JWT token or session
  // For now, we'll get it from the Authorization header
  const authHeader = request.headers.get('authorization');
  console.log('Keywords API - Auth header:', authHeader);
  
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7);
    console.log('Keywords API - Token extracted:', token);
    
    try {
      // In production, verify JWT token here
      const payload = JSON.parse(atob(token));
      console.log('Keywords API - Token payload:', payload);
      console.log('Keywords API - User ID from payload:', payload.userId);
      return payload.userId;
    } catch (error) {
      console.log('Keywords API - Error parsing token:', error);
      return null;
    }
  }
  console.log('Keywords API - No valid auth header found');
  return null;
}

export async function GET(request: Request) {
  try {
    const userId = getUserIdFromRequest(request);
    console.log('Keywords API - User ID from request:', userId);
    
    if (!userId) {
      console.log('Keywords API - No user ID found, returning 401');
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const database = await db;
    console.log('Keywords API - Database connection established');
    
    const userKeywords = await database
      .select()
      .from(keywords)
      .where(eq(keywords.userId, parseInt(userId.toString())))
      .orderBy(keywords.createdAt);

    console.log('Keywords API - User keywords found:', userKeywords);
    console.log('Keywords API - User keywords count:', userKeywords.length);

    return NextResponse.json(userKeywords);
  } catch (error) {
    console.error('Keywords API - Error fetching keywords:', error);
    return NextResponse.json(
      { error: 'Failed to fetch keywords' },
      { status: 500 }
    );
  }
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

    const body = await request.json();
    const { keyword } = body;

    if (!keyword || !keyword.trim()) {
      return NextResponse.json(
        { message: 'Keyword is required' },
        { status: 400 }
      );
    }

    const database = await db;

    // Verify user exists and get their plan
    const user = await database
      .select()
      .from(users)
      .where(eq(users.id, parseInt(userId.toString())))
      .limit(1);

    if (user.length === 0) {
      return NextResponse.json(
        { message: 'User not found' },
        { status: 404 }
      );
    }

    const userPlan = user[0]?.plan || 'free';

    // Check current keyword count
    const currentKeywords = await database
      .select()
      .from(keywords)
      .where(eq(keywords.userId, parseInt(userId.toString())));

    // Check if user can add more keywords based on their plan
    if (!canAddKeyword(currentKeywords?.length || 0, userPlan)) {
      const planLimits = getPlanLimits(userPlan);
      const upgradeMessage = getPlanUpgradeMessage(userPlan);
      
      return NextResponse.json(
        { 
          message: `You have reached the maximum number of keywords for your ${planLimits.name} plan (${planLimits.keywords} keywords). ${upgradeMessage}`,
          currentKeywords: currentKeywords.length,
          maxKeywords: planLimits.keywords,
          plan: userPlan,
          upgradeMessage
        },
        { status: 403 }
      );
    }

    // Check if keyword already exists for this user
    const existingKeyword = await database
      .select()
      .from(keywords)
      .where(and(eq(keywords.userId, parseInt(userId.toString())), eq(keywords.keyword, keyword.trim())))
      .limit(1);

    if (existingKeyword.length > 0) {
      return NextResponse.json(
        { message: 'This keyword is already being monitored' },
        { status: 400 }
      );
    }

    const newKeyword = await database
      .insert(keywords)
      .values({
        userId: parseInt(userId.toString()),
        keyword: keyword.trim(),
      })
      .returning();

    return NextResponse.json(newKeyword[0]);
  } catch (error) {
    console.error('Error creating keyword:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}
