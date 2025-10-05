// Export utilities for different dashboard sections
import { ExportData, ExportColumn } from '@/services/exportService';

// Keywords Management Export
export const createKeywordsExportData = (keywords: any[]): ExportData => ({
  title: 'Keywords Management Report',
  data: keywords,
  columns: [
    { key: 'keyword', label: 'Keyword', type: 'string' },
    { key: 'status', label: 'Status', type: 'string' },
    { key: 'createdAt', label: 'Created Date', type: 'date' },
    { key: 'lastChecked', label: 'Last Checked', type: 'date' },
    { key: 'mentions', label: 'Mentions', type: 'number' },
    { key: 'sentiment', label: 'Sentiment', type: 'string' },
    { key: 'priority', label: 'Priority', type: 'string' }
  ],
  metadata: {
    generatedAt: new Date().toISOString(),
    section: 'Keywords Management',
    totalRecords: keywords.length
  }
});

// News Monitoring Export
export const createNewsExportData = (articles: any[]): ExportData => ({
  metadata: {
    exportDate: new Date().toISOString(),
    totalRecords: articles.length,
    filters: {},
    generatedBy: 'Reputraq System',
    section: 'News Blog Monitoring',
    generatedAt: new Date().toISOString()
  }
});

// YouTube Search Export
export const createYouTubeExportData = (videos: any[]): ExportData => ({
  title: 'YouTube Search Results',
  data: videos,
  columns: [
    { key: 'title', label: 'Video Title', type: 'string' },
    { key: 'url', label: 'URL', type: 'url' },
    { key: 'duration_raw', label: 'Duration', type: 'string' },
    { key: 'views', label: 'Views', type: 'number', format: (value) => value.toLocaleString() },
    { key: 'publishedAt', label: 'Published', type: 'string' },
    { key: 'description', label: 'Description', type: 'string' }
  ],
  metadata: {
    generatedAt: new Date().toISOString(),
    section: 'YouTube Search',
    totalRecords: videos.length
  }
});

// Social Analytics Export
export const createSocialAnalyticsExportData = (analytics: any[]): ExportData => ({
  title: 'Social Analytics Report',
  data: analytics,
  columns: [
    { key: 'platform', label: 'Platform', type: 'string' },
    { key: 'metric', label: 'Metric', type: 'string' },
    { key: 'value', label: 'Value', type: 'number' },
    { key: 'change', label: 'Change', type: 'string' },
    { key: 'date', label: 'Date', type: 'date' },
    { key: 'trend', label: 'Trend', type: 'string' }
  ],
  metadata: {
    generatedAt: new Date().toISOString(),
    section: 'Social Analytics',
    totalRecords: analytics.length
  }
});

// Competitor Analysis Export
export const createCompetitorExportData = (competitors: any[]): ExportData => ({
  title: 'Competitor Analysis Report',
  data: competitors,
  columns: [
    { key: 'name', label: 'Competitor Name', type: 'string' },
    { key: 'website', label: 'Website', type: 'url' },
    { key: 'industry', label: 'Industry', type: 'string' },
    { key: 'mentions', label: 'Mentions', type: 'number' },
    { key: 'sentiment', label: 'Sentiment', type: 'string' },
    { key: 'marketShare', label: 'Market Share', type: 'number', format: (value) => `${value}%` },
    { key: 'lastAnalyzed', label: 'Last Analyzed', type: 'date' }
  ],
  metadata: {
    generatedAt: new Date().toISOString(),
    section: 'Competitor Analysis',
    totalRecords: competitors.length
  }
});

// Hashtag Tracker Export
export const createHashtagExportData = (hashtags: any[]): ExportData => ({
  title: 'Hashtag Tracking Report',
  data: hashtags,
  columns: [
    { key: 'hashtag', label: 'Hashtag', type: 'string' },
    { key: 'platform', label: 'Platform', type: 'string' },
    { key: 'mentions', label: 'Mentions', type: 'number' },
    { key: 'reach', label: 'Reach', type: 'number' },
    { key: 'engagement', label: 'Engagement', type: 'number' },
    { key: 'trend', label: 'Trend', type: 'string' },
    { key: 'lastUpdated', label: 'Last Updated', type: 'date' }
  ],
  metadata: {
    generatedAt: new Date().toISOString(),
    section: 'Hashtag Tracker',
    totalRecords: hashtags.length
  }
});

// Trending Mentions Export
export const createTrendingMentionsExportData = (mentions: any[]): ExportData => ({
  title: 'Trending Mentions Report',
  data: mentions,
  columns: [
    { key: 'keyword', label: 'Keyword', type: 'string' },
    { key: 'platform', label: 'Platform', type: 'string' },
    { key: 'mentions', label: 'Mentions', type: 'number' },
    { key: 'growth', label: 'Growth %', type: 'number', format: (value) => `${value}%` },
    { key: 'sentiment', label: 'Sentiment', type: 'string' },
    { key: 'topContent', label: 'Top Content', type: 'string' },
    { key: 'timestamp', label: 'Timestamp', type: 'date' }
  ],
  metadata: {
    generatedAt: new Date().toISOString(),
    section: 'Trending Mentions',
    totalRecords: mentions.length
  }
});

// Social Listening Export
export const createSocialListeningExportData = (listening: any[]): ExportData => ({
  title: 'Social Listening Report',
  data: listening,
  columns: [
    { key: 'content', label: 'Content', type: 'string' },
    { key: 'platform', label: 'Platform', type: 'string' },
    { key: 'author', label: 'Author', type: 'string' },
    { key: 'sentiment', label: 'Sentiment', type: 'string' },
    { key: 'engagement', label: 'Engagement', type: 'number' },
    { key: 'url', label: 'URL', type: 'url' },
    { key: 'timestamp', label: 'Timestamp', type: 'date' }
  ],
  metadata: {
    generatedAt: new Date().toISOString(),
    section: 'Social Listening',
    totalRecords: listening.length
  }
});

// Dashboard Analytics Export
export const createDashboardAnalyticsExportData = (analytics: any[]): ExportData => ({
  metadata: {
    exportDate: new Date().toISOString(),
    totalRecords: analytics.length,
    filters: {},
    generatedBy: 'Reputraq System',
    section: 'Dashboard Analytics',
    generatedAt: new Date().toISOString()
  }
});

// AI Chatbot Export
export const createAIChatbotExportData = (conversations: any[]): ExportData => ({
  title: 'AI Chatbot Conversations',
  data: conversations,
  columns: [
    { key: 'timestamp', label: 'Timestamp', type: 'date' },
    { key: 'userMessage', label: 'User Message', type: 'string' },
    { key: 'botResponse', label: 'Bot Response', type: 'string' },
    { key: 'intent', label: 'Intent', type: 'string' },
    { key: 'confidence', label: 'Confidence', type: 'number', format: (value) => `${(value * 100).toFixed(1)}%` },
    { key: 'sessionId', label: 'Session ID', type: 'string' }
  ],
  metadata: {
    generatedAt: new Date().toISOString(),
    section: 'AI Chatbot',
    totalRecords: conversations.length
  }
});

// Social Listening Finder Export
export const createSocialListeningFinderExportData = (searchResults: any[], searchQuery: string, platform: string): ExportData => {
  const transformedData = searchResults.map((result, index) => {
    if (!result.success || !result.data) {
      return {
        id: `error_${index}`,
        platform: platform,
        title: 'Error',
        content: result.error || 'Unknown error',
        author: 'Unknown',
        url: '',
        engagement: 0,
        publishedAt: new Date().toISOString(),
        sentiment: 'neutral'
      };
    }

    const data = result.data;
    let items = [];

    if (platform === 'youtube') {
      if (data && data.data && data.data.posts && Array.isArray(data.data.posts)) {
        items = data.data.posts.filter((item: any) => item.videoRenderer).map((item: any) => {
          const video = item.videoRenderer;
          return {
            id: video.videoId || `youtube_${index}`,
            platform: 'YouTube',
            title: video.title?.runs?.[0]?.text || 'YouTube Video',
            content: video.title?.runs?.[0]?.text || '',
            author: video.longBylineText?.runs?.[0]?.text || video.shortBylineText?.runs?.[0]?.text || 'Unknown Channel',
            url: `https://youtube.com/watch?v=${video.videoId}`,
            engagement: parseInt(video.viewCountText?.simpleText?.replace(/[^\d]/g, '') || '0'),
            publishedAt: video.publishedTimeText?.simpleText || new Date().toISOString(),
            sentiment: 'neutral',
            duration: video.lengthText?.simpleText || '',
            thumbnail: video.thumbnail?.thumbnails?.[0]?.url || ''
          };
        });
      }
    } else if (platform === 'instagram') {
      let users = [];
      let hashtags = [];
      
      if (data && data.data) {
        if (data.data.users && Array.isArray(data.data.users)) {
          users = data.data.users.map((user: any) => ({
            id: user.user.pk || user.user.id || `instagram_user_${index}`,
            platform: 'Instagram',
            title: `@${user.user.username}`,
            content: `Instagram Profile: ${user.user.full_name || user.user.username}`,
            author: user.user.username,
            url: `https://instagram.com/${user.user.username}/`,
            engagement: user.user.follower_count || 0,
            publishedAt: new Date().toISOString(),
            sentiment: 'neutral',
            verified: user.user.is_verified || false
          }));
        }
        if (data.data.hashtags && Array.isArray(data.data.hashtags)) {
          hashtags = data.data.hashtags.map((hashtag: any) => ({
            id: hashtag.hashtag.id || `instagram_hashtag_${index}`,
            platform: 'Instagram',
            title: `#${hashtag.hashtag.name}`,
            content: `Hashtag: ${hashtag.hashtag.name}`,
            author: 'Instagram',
            url: `https://instagram.com/explore/tags/${hashtag.hashtag.name}/`,
            engagement: hashtag.hashtag.media_count || 0,
            publishedAt: new Date().toISOString(),
            sentiment: 'neutral',
            mediaCount: hashtag.hashtag.media_count || 0
          }));
        }
      }
      
      items = [...users, ...hashtags];
    } else if (platform === 'tiktok') {
      if (data && data.data && data.data.data && Array.isArray(data.data.data)) {
        items = data.data.data.map((item: any) => {
          const video = item.aweme_info || item;
          const author = video.author || {};
          return {
            id: video.aweme_id || video.id || `tiktok_${index}`,
            platform: 'TikTok',
            title: video.desc || video.description || 'TikTok Video',
            content: video.desc || video.description || '',
            author: author.nickname || author.unique_id || 'Unknown User',
            url: video.share_url || video.web_video_url || '',
            engagement: (video.statistics?.digg_count || 0) + (video.statistics?.comment_count || 0) + (video.statistics?.share_count || 0),
            publishedAt: new Date().toISOString(),
            sentiment: 'neutral',
            likes: video.statistics?.digg_count || 0,
            comments: video.statistics?.comment_count || 0,
            shares: video.statistics?.share_count || 0,
            views: video.statistics?.play_count || video.statistics?.view_count || 0
          };
        });
      }
    }

    return items;
  }).flat();

  return {
    title: `Social Listening Finder - ${platform.charAt(0).toUpperCase() + platform.slice(1)} Search Results`,
    data: transformedData,
    columns: [
      { key: 'id', label: 'ID', type: 'string' },
      { key: 'platform', label: 'Platform', type: 'string' },
      { key: 'title', label: 'Title', type: 'string' },
      { key: 'content', label: 'Content', type: 'string' },
      { key: 'author', label: 'Author', type: 'string' },
      { key: 'url', label: 'URL', type: 'url' },
      { key: 'engagement', label: 'Engagement', type: 'number' },
      { key: 'publishedAt', label: 'Published', type: 'date' },
      { key: 'sentiment', label: 'Sentiment', type: 'string' }
    ],
    metadata: {
      generatedAt: new Date().toISOString(),
      section: 'Social Listening Finder',
      totalRecords: transformedData.length,
      searchQuery: searchQuery,
      platform: platform
    }
  };
};

// Sentiment Analysis Export
export const createSentimentAnalysisExportData = (sentimentAnalysis: any): ExportData => {
  const transformedData = Object.entries(sentimentAnalysis.platformResults || {}).map(([platform, result]: [string, any]) => ({
    platform: platform.charAt(0).toUpperCase() + platform.slice(1),
    keyword: sentimentAnalysis.keyword,
    totalContent: result.contentCount || 0,
    positiveCount: result.sentimentResults?.filter((r: any) => r.category === 'positive').length || 0,
    negativeCount: result.sentimentResults?.filter((r: any) => r.category === 'negative').length || 0,
    neutralCount: result.sentimentResults?.filter((r: any) => r.category === 'neutral').length || 0,
    overallSentiment: sentimentAnalysis.insights?.overallSentiment || 0,
    confidence: sentimentAnalysis.insights?.confidence || 0,
    timestamp: sentimentAnalysis.timestamp || new Date().toISOString()
  }));

  return {
    title: 'Sentiment Analysis Report',
    data: transformedData,
    columns: [
      { key: 'platform', label: 'Platform', type: 'string' },
      { key: 'keyword', label: 'Keyword', type: 'string' },
      { key: 'totalContent', label: 'Total Content', type: 'number' },
      { key: 'positiveCount', label: 'Positive', type: 'number' },
      { key: 'negativeCount', label: 'Negative', type: 'number' },
      { key: 'neutralCount', label: 'Neutral', type: 'number' },
      { key: 'overallSentiment', label: 'Overall Sentiment', type: 'number', format: (value) => `${(value * 100).toFixed(1)}%` },
      { key: 'confidence', label: 'Confidence', type: 'number', format: (value) => `${(value * 100).toFixed(1)}%` },
      { key: 'timestamp', label: 'Analysis Date', type: 'date' }
    ],
    metadata: {
      generatedAt: new Date().toISOString(),
      section: 'Sentiment Analysis',
      totalRecords: transformedData.length,
      keyword: sentimentAnalysis.keyword
    }
  };
};

// Hashtag Finder API Export
export const createHashtagFinderExportData = (searchResults: any, searchQuery: string): ExportData => {
  console.log('🔍 createHashtagFinderExportData called with:', { searchResults, searchQuery });
  
  if (!searchResults || !searchResults.success || !searchResults.data?.hashtags?.[0]?.videos) {
    console.log('❌ No valid search results found');
    return {
      title: 'Hashtag Finder API - No Results',
      data: [],
      columns: [
        { key: 'error', label: 'Error', type: 'string' }
      ],
      metadata: {
        generatedAt: new Date().toISOString(),
        section: 'Hashtag Finder API',
        totalRecords: 0,
        searchQuery: searchQuery,
        platform: 'youtube'
      }
    };
  }

  const hashtagData = searchResults.data.hashtags[0];
  const videos = hashtagData.videos;
  
  console.log('📊 Processing hashtag data:', { hashtagData, videosCount: videos?.length });

  const transformedData = videos.map((video: any) => ({
    id: video.video_id || `video_${Math.random()}`,
    platform: 'YouTube',
    title: video.title || 'Untitled Video',
    content: video.title || '',
    author: video.channel_name || 'Unknown Channel',
    url: video.url || `https://youtube.com/watch?v=${video.video_id}`,
    engagement: video.view_count || 0,
    publishedAt: video.published_time || new Date().toISOString(),
    sentiment: 'neutral',
    duration: video.duration || '',
    thumbnail: video.thumbnail || '',
    hashtag: hashtagData.hashtag_name || searchQuery,
    trendingScore: hashtagData.trending_score || 0,
    postCount: hashtagData.post_count || 0
  }));

  console.log('✅ Transformed data:', { transformedDataCount: transformedData.length, sampleData: transformedData[0] });

  return {
    title: `Hashtag Finder API - YouTube Videos for #${searchQuery}`,
    data: transformedData,
    columns: [
      { key: 'id', label: 'Video ID', type: 'string' },
      { key: 'platform', label: 'Platform', type: 'string' },
      { key: 'title', label: 'Title', type: 'string' },
      { key: 'content', label: 'Content', type: 'string' },
      { key: 'author', label: 'Channel', type: 'string' },
      { key: 'url', label: 'URL', type: 'url' },
      { key: 'engagement', label: 'Views', type: 'number' },
      { key: 'publishedAt', label: 'Published', type: 'date' },
      { key: 'sentiment', label: 'Sentiment', type: 'string' },
      { key: 'duration', label: 'Duration', type: 'string' },
      { key: 'hashtag', label: 'Hashtag', type: 'string' },
      { key: 'trendingScore', label: 'Trending Score', type: 'number' },
      { key: 'postCount', label: 'Post Count', type: 'number' }
    ],
    metadata: {
      generatedAt: new Date().toISOString(),
      section: 'Hashtag Finder API',
      totalRecords: transformedData.length,
      searchQuery: searchQuery,
      platform: 'youtube'
    }
  };
};

// Generic data export creator
export const createGenericExportData = (
  title: string,
  data: any[],
  section: string,
  customColumns?: ExportColumn[]
): ExportData => {
  const defaultColumns: ExportColumn[] = customColumns || [
    { key: 'id', label: 'ID', type: 'string' },
    { key: 'name', label: 'Name', type: 'string' },
    { key: 'createdAt', label: 'Created', type: 'date' }
  ];

  return {
    title,
    data,
    columns: defaultColumns,
    metadata: {
      generatedAt: new Date().toISOString(),
      section,
      totalRecords: data.length
    }
  };
};
