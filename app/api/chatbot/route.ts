import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { users, newsArticles, socialPosts, keywords } from '@/lib/db/schema';
import { eq, desc, and } from 'drizzle-orm';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

const GEMINI_API_KEY = 'AIzaSyCwrKeSW9CCbhodXfG6waFQXnScqDiZD4s';
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

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
    console.error('Error decoding auth token:', error);
    return null;
  }
}

async function getRelevantData(userId: number, query: string) {
  try {
    const database = await db;
    
    // Get user's keywords
    const userKeywords = await database
      .select()
      .from(keywords)
      .where(eq(keywords.userId, userId));

    if (!Array.isArray(userKeywords) || userKeywords.length === 0) {
      return { keywords: [], newsArticles: [], socialPosts: [] };
    }

    const keywordStrings = Array.isArray(userKeywords) ? userKeywords.map(k => k.keyword) : [];

    // Get recent news articles (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const recentNews = await database
      .select()
      .from(newsArticles)
      .where(
        and(
          eq(newsArticles.userId, userId),
          // Add date filter if needed
        )
      )
      .orderBy(desc(newsArticles.publishedAt))
      .limit(50);

    // Get recent social posts (last 30 days)
    const recentSocial = await database
      .select()
      .from(socialPosts)
      .where(
        and(
          eq(socialPosts.userId, userId),
          // Add date filter if needed
        )
      )
      .orderBy(desc(socialPosts.publishedAt))
      .limit(50);

    // Get user's monitoring data
    const user = await database
      .select()
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    const monitoringData = user[0]?.monitoringData || [];

    return {
      keywords: keywordStrings,
      newsArticles: recentNews,
      socialPosts: recentSocial,
      monitoringData,
      user: user[0] || null
    };
  } catch (error) {
    console.error('Error fetching relevant data:', error);
    return { keywords: [], newsArticles: [], socialPosts: [], monitoringData: [] };
  }
}

function formatDataForPrompt(data: any) {
  const { keywords, newsArticles, socialPosts, monitoringData, user } = data;
  
  let context = `User: ${user?.name || 'Unknown'}\n`;
  context += `Keywords being monitored: ${Array.isArray(keywords) ? keywords.join(', ') : 'None'}\n\n`;
  
  if (Array.isArray(newsArticles) && newsArticles.length > 0) {
    context += `Recent News Articles (${newsArticles.length} articles):\n`;
    newsArticles.slice(0, 10).forEach((article: any, index: number) => {
      context += `${index + 1}. ${article.title}\n`;
      context += `   Source: ${article.sourceName}\n`;
      context += `   Published: ${article.publishedAt}\n`;
      context += `   Sentiment: ${article.sentimentLabel || 'neutral'} (${article.sentimentScore || 0})\n`;
      if (article.description) {
        context += `   Description: ${article.description.substring(0, 200)}...\n`;
      }
      context += `   URL: ${article.url}\n\n`;
    });
  }

  if (Array.isArray(socialPosts) && socialPosts.length > 0) {
    context += `Recent Social Media Posts (${socialPosts.length} posts):\n`;
    socialPosts.slice(0, 10).forEach((post: any, index: number) => {
      context += `${index + 1}. ${post.title || 'Social Post'}\n`;
      context += `   Platform: ${post.platformName}\n`;
      context += `   Published: ${post.publishedAt}\n`;
      context += `   Sentiment: ${post.sentimentLabel || 'neutral'} (${post.sentimentScore || 0})\n`;
      if (post.description) {
        context += `   Content: ${post.description.substring(0, 200)}...\n`;
      }
      context += `   URL: ${post.url}\n\n`;
    });
  }

  if (Array.isArray(monitoringData) && monitoringData.length > 0) {
    context += `Monitoring Data Summary:\n`;
    monitoringData.forEach((data: any, index: number) => {
      context += `Keyword: ${data.keyword}\n`;
      if (data.newsData?.results) {
        context += `  - News articles found: ${data.newsData.results?.length || 0}\n`;
      }
      if (data.socialData?.data) {
        context += `  - Social posts found: ${data.socialData.data?.length || 0}\n`;
      }
      context += `  - Last updated: ${data.timestamp}\n\n`;
    });
  }

  return context;
}

export async function POST(request: NextRequest) {
  try {
    const userId = getUserIdFromRequest(request);
    
    if (!userId) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const { message, conversationHistory = [] } = await request.json();

    if (!message || typeof message !== 'string') {
      return NextResponse.json(
        { error: "Message is required" },
        { status: 400 }
      );
    }

    // Get relevant data for the user
    const relevantData = await getRelevantData(userId, message);
    const dataContext = formatDataForPrompt(relevantData);

    // Prepare the prompt for Gemini
    const systemPrompt = `You are an AI assistant for Reputraq, a reputation monitoring platform. You help users understand their collected data about specific keywords they're monitoring.

Your role:
- Answer questions about news articles, social media posts, and monitoring data
- Provide insights about sentiment analysis, trends, and patterns
- Help users understand their reputation data
- Be helpful, accurate, and professional
- If you don't have specific data about something, say so clearly

Current user data context:
${dataContext}

Instructions:
- Always base your responses on the actual data provided above
- If asked about specific keywords, focus on those keywords' data
- Provide specific examples from the data when relevant
- Use the sentiment scores and labels to give insights
- Mention specific sources and dates when relevant
- If the user asks about data that isn't available, explain what data is available instead

FORMATTING GUIDELINES:
- Use rich markdown formatting to make responses visually appealing and easy to read
- For headers and sections, use markdown headers: ## Section Title, ### Subsection
- For emphasis, use **bold** for important points and *italic* for highlights
- For data summaries, create tables using markdown format:
  | Metric | Value | Change |
  |--------|-------|--------|
  | Articles | 25 | +12% |
  | Sentiment | 7.2/10 | +0.5 |
- For code examples or data queries, use code blocks:
  \`\`\`sql
  SELECT * FROM articles WHERE sentiment > 0.7
  \`\`\`
- For inline code, use backticks: \`SELECT * FROM articles\`
- For key metrics, use this format: 📊 **Metric Name**: Value
- For sentiment analysis, use: 🎯 **Sentiment Analysis**: [detailed analysis]
- Use bullet points for lists of insights:
  - Key insight 1
  - Key insight 2
  - Key insight 3
- Use numbered lists for step-by-step processes:
  1. First step
  2. Second step
  3. Third step
- Use blockquotes for important callouts:
  > This is an important insight that needs attention
- Highlight important numbers and percentages with **bold**
- Use horizontal rules (---) to separate major sections
- Create clear visual hierarchy with headers and subheaders

Respond in a conversational, helpful tone. Use rich markdown formatting to create visually appealing, easy-to-scan responses.`;

    // Prepare conversation history for context
    let conversationContext = '';
    if (Array.isArray(conversationHistory) && conversationHistory.length > 0) {
      conversationContext = '\n\nPrevious conversation:\n';
      conversationHistory.forEach((msg: any) => {
        conversationContext += `${msg.role}: ${msg.content}\n`;
      });
    }

    const fullPrompt = `${systemPrompt}${conversationContext}\n\nUser: ${message}\n\nAssistant:`;

    // Call Gemini API
    const geminiResponse = await fetch(GEMINI_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-goog-api-key': GEMINI_API_KEY,
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: fullPrompt
              }
            ]
          }
        ],
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 1024,
        },
        safetySettings: [
          {
            category: "HARM_CATEGORY_HARASSMENT",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          },
          {
            category: "HARM_CATEGORY_HATE_SPEECH",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          },
          {
            category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          },
          {
            category: "HARM_CATEGORY_DANGEROUS_CONTENT",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          }
        ]
      })
    });

    if (!geminiResponse.ok) {
      const errorText = await geminiResponse.text();
      console.error('Gemini API error:', errorText);
      return NextResponse.json(
        { error: "Failed to get AI response" },
        { status: 500 }
      );
    }

    const geminiData = await geminiResponse.json();
    
    if (!geminiData.candidates || geminiData.candidates.length === 0) {
      return NextResponse.json(
        { error: "No response generated" },
        { status: 500 }
      );
    }

    const aiResponse = geminiData.candidates?.[0]?.content?.parts?.[0]?.text || 'No response generated';

    return NextResponse.json({
      response: aiResponse,
      timestamp: new Date().toISOString(),
      dataContext: {
        keywordsCount: Array.isArray(relevantData.keywords) ? relevantData.keywords.length : 0,
        newsArticlesCount: Array.isArray(relevantData.newsArticles) ? relevantData.newsArticles.length : 0,
        socialPostsCount: Array.isArray(relevantData.socialPosts) ? relevantData.socialPosts.length : 0,
        monitoringDataCount: Array.isArray(relevantData.monitoringData) ? relevantData.monitoringData.length : 0
      }
    });

  } catch (error) {
    console.error('Chatbot API error:', error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
