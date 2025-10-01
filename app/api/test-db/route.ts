import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { newsArticles } from '@/lib/db/schema';
import { sql } from 'drizzle-orm';

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
    console.log('🧪 Database test request received');
    
    const userId = getUserIdFromRequest(request);
    console.log('👤 User ID from request:', userId);
    
    if (!userId) {
      console.log('❌ No user ID found in request');
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const database = await db;
    
    // Test 1: Try to create the news_articles table
    console.log('🔧 Test 1: Creating news_articles table...');
    try {
      await database.execute(sql`
        CREATE TABLE IF NOT EXISTS "news_articles" (
          "id" serial PRIMARY KEY NOT NULL,
          "user_id" integer NOT NULL,
          "keyword" varchar(255) NOT NULL,
          "article_id" varchar(50) NOT NULL,
          "title" text NOT NULL,
          "description" text,
          "url" text NOT NULL,
          "published_at" timestamp NOT NULL,
          "source_name" varchar(255) NOT NULL,
          "source_logo" text,
          "image" text,
          "sentiment_score" integer,
          "sentiment_label" varchar(50),
          "read_time" integer,
          "is_breaking" boolean DEFAULT false,
          "categories" jsonb,
          "topics" jsonb,
          "engagement" jsonb,
          "raw_data" jsonb,
          "created_at" timestamp DEFAULT now() NOT NULL,
          "updated_at" timestamp DEFAULT now() NOT NULL
        );
      `);
      console.log('✅ Test 1: Table creation successful');
    } catch (createError) {
      console.error('❌ Test 1: Table creation failed:', createError);
      return NextResponse.json({
        success: false,
        test: 'table_creation',
        error: createError.message,
        details: createError
      });
    }

    // Test 2: Try to query the table
    console.log('🔍 Test 2: Querying news_articles table...');
    try {
      const queryResult = await database
        .select({ count: sql`count(*)` })
        .from(newsArticles)
        .where(sql`user_id = ${userId}`)
        .limit(1);
      console.log('✅ Test 2: Query successful:', queryResult);
    } catch (queryError) {
      console.error('❌ Test 2: Query failed:', queryError);
      return NextResponse.json({
        success: false,
        test: 'table_query',
        error: queryError.message,
        details: queryError
      });
    }

    // Test 3: Try to insert a test article
    console.log('➕ Test 3: Inserting test article...');
    try {
      const testArticle = {
        userId: parseInt(userId.toString()),
        keyword: 'test',
        articleId: 'test_' + Date.now(),
        title: 'Test Article',
        description: 'This is a test article',
        url: 'https://example.com/test',
        publishedAt: new Date(),
        sourceName: 'Test Source',
        sourceLogo: '',
        image: '',
        sentimentScore: 0,
        sentimentLabel: 'neutral',
        readTime: 1,
        isBreaking: false,
        categories: [],
        topics: [],
        engagement: {},
        rawData: { test: true }
      };

      const [insertedArticle] = await database
        .insert(newsArticles)
        .values(testArticle)
        .returning();
      
      console.log('✅ Test 3: Insert successful:', insertedArticle);

      // Test 4: Try to delete the test article
      console.log('🗑️ Test 4: Deleting test article...');
      await database
        .delete(newsArticles)
        .where(sql`id = ${insertedArticle.id}`);
      
      console.log('✅ Test 4: Delete successful');

      return NextResponse.json({
        success: true,
        message: 'All database tests passed!',
        tests: {
          table_creation: 'PASSED',
          table_query: 'PASSED',
          article_insert: 'PASSED',
          article_delete: 'PASSED'
        },
        insertedArticle: insertedArticle
      });

    } catch (insertError) {
      console.error('❌ Test 3: Insert failed:', insertError);
      return NextResponse.json({
        success: false,
        test: 'article_insert',
        error: insertError.message,
        details: insertError
      });
    }

  } catch (error) {
    console.error('❌ Database test error:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Database test failed', 
        details: error.message 
      },
      { status: 500 }
    );
  }
}
