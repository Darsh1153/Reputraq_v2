import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { users, historicalNewsData, historicalSocialData, dataCollectionJobs } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

// Force dynamic rendering
export const dynamic = 'force-dynamic';

// Helper function to get user ID from request headers
function getUserIdFromRequest(request: Request): number | null {
  const authHeader = request.headers.get("authorization");
  if (authHeader && authHeader.startsWith("Bearer ")) {
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
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const database = await db;
    
    // Get user's monitoring data
    const user = await database
      .select({
        id: users.id,
        monitoringData: users.monitoringData,
      })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (user.length === 0) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    const monitoringData = user[0].monitoringData;
    
    if (!monitoringData || !Array.isArray(monitoringData) || monitoringData.length === 0) {
      return NextResponse.json(
        { error: "No monitoring data found for user" },
        { status: 400 }
      );
    }

    console.log(`🔄 Starting migration for user ${userId}, ${monitoringData.length} keywords`);

    // Create a migration collection job record
    const [collectionJob] = await database
      .insert(dataCollectionJobs)
      .values({
        userId: userId,
        status: 'completed',
        startedAt: new Date(),
        completedAt: new Date(),
        totalKeywords: monitoringData.length,
        processedKeywords: monitoringData.length,
        totalArticles: monitoringData.reduce((sum, item) => sum + (item.newsData?.results?.length || 0), 0),
        totalSocialPosts: monitoringData.reduce((sum, item) => sum + (item.socialData?.data?.length || 0), 0),
      })
      .returning();

    console.log(`📝 Created migration collection job: ${collectionJob.id}`);

    let migratedNews = 0;
    let migratedSocial = 0;

    // Process each keyword's data
    for (const keywordData of monitoringData) {
      console.log(`🔄 Processing keyword: ${keywordData.keyword}`);

      // Migrate news data
      if (keywordData.newsData?.results && Array.isArray(keywordData.newsData.results)) {
        for (const article of keywordData.newsData.results) {
          try {
            await database.insert(historicalNewsData).values({
              userId: userId,
              keyword: keywordData.keyword,
              collectionJobId: collectionJob.id,
              articleId: article.id?.toString() || Math.random().toString(),
              title: article.title || 'No title',
              description: article.description || '',
              url: article.url || '#',
              publishedAt: new Date(article.publishedAt || new Date()),
              sourceName: article.source?.name || 'Unknown Source',
              sourceLogo: article.source?.logo || null,
              image: article.image || null,
              sentimentScore: article.sentiment?.score || 0,
              sentimentLabel: article.sentiment?.label || 'neutral',
              readTime: article.readTime || 1,
              isBreaking: article.isBreaking || false,
              categories: article.categories || [],
              topics: article.topics || [],
              engagement: article.engagement || {},
              rawData: article,
              collectedAt: new Date(),
            });
            migratedNews++;
          } catch (error) {
            console.error(`❌ Error migrating news article for keyword ${keywordData.keyword}:`, error);
          }
        }
      }

      // Migrate social data
      if (keywordData.socialData?.data && Array.isArray(keywordData.socialData.data)) {
        for (const post of keywordData.socialData.data) {
          try {
            await database.insert(historicalSocialData).values({
              userId: userId,
              keyword: keywordData.keyword,
              collectionJobId: collectionJob.id,
              postId: post.id?.toString() || Math.random().toString(),
              title: post.title || null,
              description: post.description || null,
              url: post.url || null,
              publishedAt: new Date(post.publishedAt || new Date()),
              platformName: post.platform?.name || 'Unknown Platform',
              platformLogo: post.platform?.logo || null,
              image: post.image || null,
              sentimentScore: post.sentiment?.score || 0,
              sentimentLabel: post.sentiment?.label || 'neutral',
              engagement: post.engagement || {},
              rawData: post,
              collectedAt: new Date(),
            });
            migratedSocial++;
          } catch (error) {
            console.error(`❌ Error migrating social post for keyword ${keywordData.keyword}:`, error);
          }
        }
      }
    }

    console.log(`✅ Migration completed: ${migratedNews} news articles, ${migratedSocial} social posts`);

    return NextResponse.json({
      message: "Migration completed successfully",
      migrationJobId: collectionJob.id,
      migratedData: {
        keywords: monitoringData.length,
        newsArticles: migratedNews,
        socialPosts: migratedSocial,
      },
    });

  } catch (error) {
    console.error("Error during migration:", error);
    return NextResponse.json(
      { error: "Failed to migrate data" },
      { status: 500 }
    );
  }
}
