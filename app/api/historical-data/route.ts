import { NextResponse } from 'next/server';
import { getDatabase } from '@/lib/db/connection';
import { historicalNewsData, historicalSocialData } from '@/lib/db/schema';
import { eq, and, gte, lte, desc } from 'drizzle-orm';

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

// Get historical data with date filtering
export async function GET(request: Request) {
  try {
    const userId = getUserIdFromRequest(request);

    if (!userId) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const keyword = searchParams.get('keyword');
    const dataType = searchParams.get('type') || 'all'; // 'news', 'social', 'all'
    const limit = parseInt(searchParams.get('limit') || '100');
    const offset = parseInt(searchParams.get('offset') || '0');

    const db = await getDatabase();
    
    // Build date filters for news and social data
    let newsDateFilter = {};
    let socialDateFilter = {};
    
    if (startDate && endDate) {
      newsDateFilter = {
        collectedAt: and(
          gte(historicalNewsData.collectedAt, new Date(startDate)),
          lte(historicalNewsData.collectedAt, new Date(endDate))
        )
      };
      socialDateFilter = {
        collectedAt: and(
          gte(historicalSocialData.collectedAt, new Date(startDate)),
          lte(historicalSocialData.collectedAt, new Date(endDate))
        )
      };
    } else if (startDate) {
      newsDateFilter = {
        collectedAt: gte(historicalNewsData.collectedAt, new Date(startDate))
      };
      socialDateFilter = {
        collectedAt: gte(historicalSocialData.collectedAt, new Date(startDate))
      };
    } else if (endDate) {
      newsDateFilter = {
        collectedAt: lte(historicalNewsData.collectedAt, new Date(endDate))
      };
      socialDateFilter = {
        collectedAt: lte(historicalSocialData.collectedAt, new Date(endDate))
      };
    }

    // Build keyword filter
    let keywordFilter = {};
    if (keyword) {
      keywordFilter = { keyword };
    }

    const results: any = {
      news: [],
      social: [],
      totalNews: 0,
      totalSocial: 0,
      dateRange: { startDate, endDate },
      filters: { keyword, dataType }
    };

    // Get news data
    if (dataType === 'all' || dataType === 'news') {
      const newsQuery = db
        .select()
        .from(historicalNewsData)
        .where(
          and(
            eq(historicalNewsData.userId, userId),
            ...Object.values({ ...newsDateFilter, ...keywordFilter })
          )
        )
        .orderBy(desc(historicalNewsData.collectedAt))
        .limit(limit)
        .offset(offset);

      results.news = await newsQuery;

      // Get total count for pagination
      const newsCountQuery = db
        .select({ count: historicalNewsData.id })
        .from(historicalNewsData)
        .where(
          and(
            eq(historicalNewsData.userId, userId),
            ...Object.values({ ...newsDateFilter, ...keywordFilter })
          )
        );

      const newsCount = await newsCountQuery;
      results.totalNews = newsCount.length;
    }

    // Get social data
    if (dataType === 'all' || dataType === 'social') {
      const socialQuery = db
        .select()
        .from(historicalSocialData)
        .where(
          and(
            eq(historicalSocialData.userId, userId),
            ...Object.values({ ...socialDateFilter, ...keywordFilter })
          )
        )
        .orderBy(desc(historicalSocialData.collectedAt))
        .limit(limit)
        .offset(offset);

      results.social = await socialQuery;

      // Get total count for pagination
      const socialCountQuery = db
        .select({ count: historicalSocialData.id })
        .from(historicalSocialData)
        .where(
          and(
            eq(historicalSocialData.userId, userId),
            ...Object.values({ ...socialDateFilter, ...keywordFilter })
          )
        );

      const socialCount = await socialCountQuery;
      results.totalSocial = socialCount.length;
    }

    return NextResponse.json({
      data: results,
      message: "Historical data retrieved successfully"
    });

  } catch (error) {
    console.error("Error getting historical data:", error);
    return NextResponse.json(
      { error: "Failed to get historical data" },
      { status: 500 }
    );
  }
}

// Get data summary/statistics
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
    const { action, startDate, endDate, keyword } = body;

    const db = await getDatabase();

    if (action === 'getSummary') {
      // Get data summary for the last 30 days
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const newsDateFilter = startDate && endDate 
        ? and(
            gte(historicalNewsData.collectedAt, new Date(startDate)),
            lte(historicalNewsData.collectedAt, new Date(endDate))
          )
        : gte(historicalNewsData.collectedAt, thirtyDaysAgo);

      const socialDateFilter = startDate && endDate 
        ? and(
            gte(historicalSocialData.collectedAt, new Date(startDate)),
            lte(historicalSocialData.collectedAt, new Date(endDate))
          )
        : gte(historicalSocialData.collectedAt, thirtyDaysAgo);

      const newsKeywordFilter = keyword ? eq(historicalNewsData.keyword, keyword) : undefined;
      const socialKeywordFilter = keyword ? eq(historicalSocialData.keyword, keyword) : undefined;

      // Get news summary
      const newsSummary = await db
        .select({
          keyword: historicalNewsData.keyword,
          count: historicalNewsData.id,
          avgSentiment: historicalNewsData.sentimentScore,
          latestCollected: historicalNewsData.collectedAt
        })
        .from(historicalNewsData)
        .where(
          and(
            eq(historicalNewsData.userId, userId),
            newsDateFilter,
            newsKeywordFilter
          )
        );

      // Get social summary
      const socialSummary = await db
        .select({
          keyword: historicalSocialData.keyword,
          count: historicalSocialData.id,
          avgSentiment: historicalSocialData.sentimentScore,
          latestCollected: historicalSocialData.collectedAt
        })
        .from(historicalSocialData)
        .where(
          and(
            eq(historicalSocialData.userId, userId),
            socialDateFilter,
            socialKeywordFilter
          )
        );

      return NextResponse.json({
        summary: {
          news: newsSummary,
          social: socialSummary,
          totalNews: newsSummary.reduce((sum, item) => sum + item.count, 0),
          totalSocial: socialSummary.reduce((sum, item) => sum + item.count, 0),
          dateRange: { startDate, endDate },
          keyword
        },
        message: "Data summary retrieved successfully"
      });
    }

    return NextResponse.json(
      { error: "Invalid action" },
      { status: 400 }
    );

  } catch (error) {
    console.error("Error getting data summary:", error);
    return NextResponse.json(
      { error: "Failed to get data summary" },
      { status: 500 }
    );
  }
}
