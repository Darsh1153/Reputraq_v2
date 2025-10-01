import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { users, keywords, historicalNewsData, historicalSocialData, dataCollectionJobs } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { collectAllData } from "@/services/dataPipeline";

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
        { status: 401 },
      );
    }

    const database = await db;
    
    // Get user's keywords
    const userKeywords = await database
      .select()
      .from(keywords)
      .where(eq(keywords.userId, userId));

    if (userKeywords.length === 0) {
      return NextResponse.json(
        { error: "No keywords found for user" },
        { status: 400 },
      );
    }

    const keywordStrings = userKeywords.map((k) => k.keyword);

    console.log("Keywords to process:", keywordStrings);

    // Collect data for all keywords
    console.log("Starting data collection process...");
    const collectedData = await collectAllData(keywordStrings);
    console.log("Data collection completed. Results:", collectedData.length, "keywords processed");

    // Create a data collection job record
    const [collectionJob] = await database
      .insert(dataCollectionJobs)
      .values({
        userId: userId,
        status: 'completed',
        startedAt: new Date(),
        completedAt: new Date(),
        totalKeywords: keywordStrings.length,
        processedKeywords: collectedData.length,
        totalArticles: collectedData.reduce((sum, item) => sum + (item.newsData?.results?.length || 0), 0),
        totalSocialPosts: collectedData.reduce((sum, item) => sum + (item.socialData?.data?.length || 0), 0),
      })
      .returning();

    console.log("Created collection job:", collectionJob.id);

    // Save news data to historical table
    for (const keywordData of collectedData) {
      if (keywordData.newsData?.results) {
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
          } catch (error) {
            console.error(`Error saving news article for keyword ${keywordData.keyword}:`, error);
          }
        }
      }

      // Save social data to historical table
      if (keywordData.socialData?.data) {
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
          } catch (error) {
            console.error(`Error saving social post for keyword ${keywordData.keyword}:`, error);
          }
        }
      }
    }

    console.log("Saved data to historical tables");

    // Save the collected data to user's monitoring data
    await database
      .update(users)
      .set({
        monitoringData: collectedData,
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId));

    return NextResponse.json({
      message: "Data collected successfully",
      data: collectedData,
      collectionJobId: collectionJob.id,
    });
  } catch (error) {
    console.error("Error collecting data:", error);
    return NextResponse.json(
      { error: "Failed to collect data" },
      { status: 500 },
    );
  }
}
