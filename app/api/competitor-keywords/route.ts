import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { competitorKeywords, users } from '@/lib/db/schema';
import { eq, and, sql } from 'drizzle-orm';
import { 
  canAddCompetitorKeyword, 
  getPlanLimits, 
  getCompetitorKeywordUpgradeMessage 
} from '@/lib/constants/plans';

function getUserIdFromRequest(request: Request): number | null {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return null;
    }

    const token = authHeader.substring(7);
    const decoded = JSON.parse(atob(token));
    return decoded.userId;
  } catch (error) {
    return null;
  }
}

export async function GET(request: Request) {
  try {
    console.log('🔍 Competitor Keywords GET request received');
    
    const userId = getUserIdFromRequest(request);
    console.log('👤 User ID from request:', userId);
    
    if (!userId) {
      console.log('❌ No user ID found in request');
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    console.log('🗄️ Getting database connection...');
    const database = await db;
    console.log('✅ Database connection established');
    
    // Try to create the table if it doesn't exist
    try {
      console.log('🏗️ Creating competitor_keywords table if not exists...');
      await database.execute(sql`
        CREATE TABLE IF NOT EXISTS "competitor_keywords" (
          "id" serial PRIMARY KEY NOT NULL,
          "user_id" integer NOT NULL,
          "keyword" varchar(255) NOT NULL,
          "created_at" timestamp DEFAULT now() NOT NULL
        );
      `);
      console.log('✅ Table creation/verification completed');
    } catch (createError) {
      console.log('⚠️ Table creation error (might already exist):', createError);
    }
    
    console.log('🔍 Fetching competitor keywords for user:', userId);
    const userKeywords = await database
      .select()
      .from(competitorKeywords)
      .where(eq(competitorKeywords.userId, parseInt(userId.toString())));

    console.log('📊 Found competitor keywords:', userKeywords);
    return NextResponse.json(userKeywords);
  } catch (error) {
    console.error('❌ Error fetching competitor keywords:', error);
    return NextResponse.json(
      { error: 'Failed to fetch competitor keywords', details: error.message },
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

    // Try to create the table if it doesn't exist
    try {
      await database.execute(sql`
        CREATE TABLE IF NOT EXISTS "competitor_keywords" (
          "id" serial PRIMARY KEY NOT NULL,
          "user_id" integer NOT NULL,
          "keyword" varchar(255) NOT NULL,
          "created_at" timestamp DEFAULT now() NOT NULL
        );
      `);
    } catch (createError) {
      console.log('Table might already exist or creation failed:', createError);
    }

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

    // Check current competitor keyword count
    const currentKeywords = await database
      .select()
      .from(competitorKeywords)
      .where(eq(competitorKeywords.userId, parseInt(userId.toString())));

    // Check if user can add more competitor keywords based on their plan
    if (!canAddCompetitorKeyword(currentKeywords?.length || 0, userPlan)) {
      const planLimits = getPlanLimits(userPlan);
      const upgradeMessage = getCompetitorKeywordUpgradeMessage(userPlan);
      
      return NextResponse.json(
        { 
          message: `You have reached the maximum number of competitor keywords for your ${planLimits.name} plan (${planLimits.competitorKeywords} competitor keywords). ${upgradeMessage}`,
          currentKeywords: currentKeywords.length,
          maxKeywords: planLimits.competitorKeywords,
          plan: userPlan,
          upgradeMessage
        },
        { status: 403 }
      );
    }

    // Check if keyword already exists for this user
    const existingKeyword = await database
      .select()
      .from(competitorKeywords)
      .where(and(eq(competitorKeywords.userId, parseInt(userId.toString())), eq(competitorKeywords.keyword, keyword.trim())))
      .limit(1);

    if (existingKeyword.length > 0) {
      return NextResponse.json(
        { message: 'Competitor keyword already exists' },
        { status: 409 }
      );
    }

    // Add the new competitor keyword
    const newKeyword = await database
      .insert(competitorKeywords)
      .values({
        userId: parseInt(userId.toString()),
        keyword: keyword.trim(),
      })
      .returning();

    return NextResponse.json(newKeyword[0], { status: 201 });
  } catch (error) {
    console.error('Error adding competitor keyword:', error);
    return NextResponse.json(
      { error: 'Failed to add competitor keyword' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const userId = getUserIdFromRequest(request);
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const keywordId = searchParams.get('id');

    if (!keywordId) {
      return NextResponse.json(
        { message: 'Keyword ID is required' },
        { status: 400 }
      );
    }

    const database = await db;

    // Try to create the table if it doesn't exist
    try {
      await database.execute(sql`
        CREATE TABLE IF NOT EXISTS "competitor_keywords" (
          "id" serial PRIMARY KEY NOT NULL,
          "user_id" integer NOT NULL,
          "keyword" varchar(255) NOT NULL,
          "created_at" timestamp DEFAULT now() NOT NULL
        );
      `);
    } catch (createError) {
      console.log('Table might already exist or creation failed:', createError);
    }

    // Verify the keyword belongs to the user
    const keyword = await database
      .select()
      .from(competitorKeywords)
      .where(and(
        eq(competitorKeywords.id, parseInt(keywordId)),
        eq(competitorKeywords.userId, parseInt(userId.toString()))
      ))
      .limit(1);

    if (keyword.length === 0) {
      return NextResponse.json(
        { message: 'Competitor keyword not found' },
        { status: 404 }
      );
    }

    // Delete the keyword
    await database
      .delete(competitorKeywords)
      .where(eq(competitorKeywords.id, parseInt(keywordId)));

    return NextResponse.json({ message: 'Competitor keyword deleted successfully' });
  } catch (error) {
    console.error('Error deleting competitor keyword:', error);
    return NextResponse.json(
      { error: 'Failed to delete competitor keyword' },
      { status: 500 }
    );
  }
}
