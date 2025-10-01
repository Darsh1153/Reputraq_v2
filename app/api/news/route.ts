import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { newsArticles, socialPosts } from '@/lib/db/schema';
import { eq, and, desc, asc, like, or } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const keyword = searchParams.get('keyword');
    const source = searchParams.get('source');
    const sentiment = searchParams.get('sentiment');
    const sortBy = searchParams.get('sortBy') || 'date';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = (page - 1) * limit;

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    // Build where conditions
    const whereConditions = [eq(newsArticles.userId, parseInt(userId))];
    
    if (keyword && keyword !== 'all') {
      whereConditions.push(eq(newsArticles.keyword, keyword));
    }
    
    if (source && source !== 'all') {
      whereConditions.push(like(newsArticles.sourceName, `%${source}%`));
    }
    
    if (sentiment && sentiment !== 'all') {
      if (sentiment === 'positive') {
        whereConditions.push(eq(newsArticles.sentimentScore, 1));
      } else if (sentiment === 'negative') {
        whereConditions.push(eq(newsArticles.sentimentScore, -1));
      } else if (sentiment === 'neutral') {
        whereConditions.push(eq(newsArticles.sentimentScore, 0));
      }
    }

    // Build order by
    let orderBy;
    switch (sortBy) {
      case 'title':
        orderBy = asc(newsArticles.title);
        break;
      case 'source':
        orderBy = asc(newsArticles.sourceName);
        break;
      case 'sentiment':
        orderBy = desc(newsArticles.sentimentScore);
        break;
      case 'date':
      default:
        orderBy = desc(newsArticles.publishedAt);
        break;
    }

    const database = await db;
    
    // Get articles
    const articles = await database
      .select()
      .from(newsArticles)
      .where(and(...whereConditions))
      .orderBy(orderBy)
      .limit(limit)
      .offset(offset);

    // Get total count
    const totalResult = await database
      .select({ count: newsArticles.id })
      .from(newsArticles)
      .where(and(...whereConditions));

    const total = totalResult.length;

    return NextResponse.json({
      articles,
      pagination: {
        page,
        limit,
        total,
        hasMore: offset + limit < total,
      },
    });
  } catch (error) {
    console.error('Error fetching news articles:', error);
    return NextResponse.json(
      { error: 'Failed to fetch news articles' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, keyword, newsData, socialData } = body;

    if (!userId || !keyword) {
      return NextResponse.json({ error: 'User ID and keyword are required' }, { status: 400 });
    }

    const database = await db;
    
    const results = {
      newsArticles: [],
      socialPosts: [],
    };

    // Process and store news articles in batch
    if (newsData?.results && Array.isArray(newsData.results) && newsData.results.length > 0) {
      try {
        const articleValues = newsData.results.map((article: any) => ({
          userId: parseInt(userId),
          keyword,
          articleId: String(article.id || Math.random().toString(36).substr(2, 9)),
          title: article.title || 'No title',
          description: article.description || article.body,
          url: article.href || '#',
          publishedAt: new Date(article.published_at || new Date()),
          sourceName: article.source?.name || 'Unknown Source',
          sourceLogo: article.source?.logo,
          image: article.image,
          sentimentScore: article.sentiment?.overall?.score ? 
            Math.round(article.sentiment.overall.score * 100) : 0,
          sentimentLabel: article.sentiment?.overall?.label || 'neutral',
          readTime: article.read_time || 1,
          isBreaking: article.is_breaking || false,
          categories: article.categories || [],
          topics: article.topics || [],
          engagement: {
            views: article.views || 0,
            shares: article.shares || 0,
            comments: article.comments || 0,
          },
          rawData: article,
        }));

        const insertedArticles = await database
          .insert(newsArticles)
          .values(articleValues)
          .returning();

        results.newsArticles = insertedArticles;
      } catch (error) {
        console.error('Error inserting articles batch:', error);
        // Try individual inserts as fallback
        for (const article of newsData.results) {
          try {
            const [insertedArticle] = await db
              .insert(newsArticles)
              .values({
                userId: parseInt(userId),
                keyword,
                articleId: String(article.id || Math.random().toString(36).substr(2, 9)),
                title: article.title || 'No title',
                description: article.description || article.body,
                url: article.href || '#',
                publishedAt: new Date(article.published_at || new Date()),
                sourceName: article.source?.name || 'Unknown Source',
                sourceLogo: article.source?.logo,
                image: article.image,
                sentimentScore: article.sentiment?.overall?.score ? 
                  Math.round(article.sentiment.overall.score * 100) : 0,
                sentimentLabel: article.sentiment?.overall?.label || 'neutral',
                readTime: article.read_time || 1,
                isBreaking: article.is_breaking || false,
                categories: article.categories || [],
                topics: article.topics || [],
                engagement: {
                  views: article.views || 0,
                  shares: article.shares || 0,
                  comments: article.comments || 0,
                },
                rawData: article,
              })
              .returning();

            results.newsArticles.push(insertedArticle);
          } catch (individualError) {
            console.error('Error inserting individual article:', individualError);
            // Continue with other articles
          }
        }
      }
    }

    // Process and store social posts in batch
    if (socialData?.data && Array.isArray(socialData.data) && socialData.data.length > 0) {
      try {
        const socialPostValues = socialData.data.map(post => ({
          userId: parseInt(userId),
          keyword,
          postId: post.id || post.post_id || Math.random().toString(),
          title: post.title,
          description: post.description,
          url: post.url,
          publishedAt: new Date(post.published_at || new Date()),
          platformName: post.work_platform?.name || 'Social Media',
          platformLogo: post.work_platform?.logo_url,
          image: post.image,
          sentimentScore: post.sentiment_score ? 
            Math.round(post.sentiment_score * 100) : 0,
          sentimentLabel: post.sentiment_label || 'neutral',
          engagement: {
            views: post.engagement?.view_count || 0,
            shares: post.engagement?.share_count || 0,
            comments: post.engagement?.comment_count || 0,
            likes: post.engagement?.like_count || 0,
          },
          rawData: post,
        }));

        const insertedSocialPosts = await db
          .insert(socialPosts)
          .values(socialPostValues)
          .returning();

        results.socialPosts = insertedSocialPosts;
      } catch (error) {
        console.error('Error inserting social posts batch:', error);
        // Try individual inserts as fallback
        for (const post of socialData.data) {
          try {
            const [insertedPost] = await db
              .insert(socialPosts)
              .values({
                userId: parseInt(userId),
                keyword,
                postId: post.id || post.post_id || Math.random().toString(),
                title: post.title,
                description: post.description,
                url: post.url,
                publishedAt: new Date(post.published_at || new Date()),
                platformName: post.work_platform?.name || 'Social Media',
                platformLogo: post.work_platform?.logo_url,
                image: post.image,
                sentimentScore: post.sentiment_score ? 
                  Math.round(post.sentiment_score * 100) : 0,
                sentimentLabel: post.sentiment_label || 'neutral',
                engagement: {
                  views: post.engagement?.view_count || 0,
                  shares: post.engagement?.share_count || 0,
                  comments: post.engagement?.comment_count || 0,
                  likes: post.engagement?.like_count || 0,
                },
                rawData: post,
              })
              .returning();

            results.socialPosts.push(insertedPost);
          } catch (individualError) {
            console.error('Error inserting individual social post:', individualError);
            // Continue with other posts
          }
        }
      }
    }

    return NextResponse.json({
      success: true,
      data: results,
      message: `Stored ${results.newsArticles.length} articles and ${results.socialPosts.length} social posts`,
    });
  } catch (error) {
    console.error('Error storing news data:', error);
    return NextResponse.json(
      { error: 'Failed to store news data' },
      { status: 500 }
    );
  }
}
