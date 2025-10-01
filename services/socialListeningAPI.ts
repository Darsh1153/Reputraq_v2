import axios from 'axios';
import { ProcessedSocialContent, HashtagMetrics, PlatformMetrics } from './socialDataProcessors';

const API_BASE_URL = 'https://api.staging.insightiq.ai/v1';
const AUTH_HEADER = 'Basic NWU2ZDkwZjYtYmMxZS00OTc5LWJlYmEtY2YzOTA5ZjgxZGMxOjg1ZTZiY2UzLTA1MmMtNGJmYy1hNDJhLTY5NmFhM2ZhMjk0OQ==';

export interface SocialListeningSearchParams {
  keyword: string;
  platforms?: string[];
  timeRange?: '24h' | '7d' | '30d' | '90d' | 'all';
  sentiment?: 'all' | 'positive' | 'negative' | 'neutral';
  engagement?: 'all' | 'high' | 'medium' | 'low';
  contentType?: 'all' | 'text' | 'image' | 'video' | 'carousel';
  language?: string;
  minFollowers?: number;
  viral?: boolean;
  limit?: number;
  offset?: number;
}

export interface SocialListeningResponse {
  content: ProcessedSocialContent[];
  hashtags: HashtagMetrics[];
  platforms: PlatformMetrics[];
  total: number;
  hasMore: boolean;
  nextCursor?: string;
  searchId: string;
  timestamp: string;
}

export interface HashtagSearchParams {
  query?: string;
  platforms?: string[];
  timeRange?: '24h' | '7d' | '30d' | '90d' | 'all';
  engagement?: 'all' | 'high' | 'medium' | 'low';
  sentiment?: 'all' | 'positive' | 'negative' | 'neutral';
  trend?: 'all' | 'up' | 'down' | 'stable';
  minMentions?: number;
  viral?: boolean;
  limit?: number;
  offset?: number;
}

export interface HashtagSearchResponse {
  hashtags: HashtagMetrics[];
  trending: Array<{
    hashtag: string;
    change: number;
    direction: 'up' | 'down' | 'stable';
    confidence: number;
    period: string;
  }>;
  total: number;
  hasMore: boolean;
  nextCursor?: string;
  timestamp: string;
}

export interface PlatformData {
  id: string;
  name: string;
  category: string;
  status: 'ACTIVE' | 'INACTIVE';
  supportedFeatures: string[];
}

class SocialListeningAPI {
  private async makeRequest(method: 'GET' | 'POST', url: string, data?: any, retries = 3): Promise<any> {
    for (let attempt = 0; attempt < retries; attempt++) {
      try {
        const response = await axios({
          method,
          url: `${API_BASE_URL}${url}`,
          headers: {
            'Accept': 'application/json',
            'Authorization': AUTH_HEADER,
            'Content-Type': 'application/json',
          },
          data,
          timeout: 30000, // 30 second timeout
        });
        return response.data;
      } catch (error: any) {
        // If it's a rate limit error and we have retries left, wait and retry
        if (error.response?.status === 429 && attempt < retries - 1) {
          const waitTime = Math.pow(2, attempt) * 1000; // Exponential backoff: 1s, 2s, 4s
          console.log(`Rate limited, waiting ${waitTime}ms before retry ${attempt + 1}/${retries}`);
          await new Promise(resolve => setTimeout(resolve, waitTime));
          continue;
        }
        
        console.error('API Request failed:', error);
        throw error;
      }
    }
  }

  // Get all available platforms
  async getPlatforms(): Promise<PlatformData[]> {
    try {
      const response = await this.makeRequest('GET', '/work-platforms');
      return response.data || [];
    } catch (error) {
      console.error('Failed to fetch platforms:', error);
      return [];
    }
  }

  // Search social media content
  async searchSocialContent(params: SocialListeningSearchParams): Promise<SocialListeningResponse> {
    try {
      // Step 1: Create search jobs for each platform
      const platforms = await this.getPlatforms();
      const activePlatforms = platforms.filter(p => p.status === 'ACTIVE' && p.category === 'SOCIAL');
      
      const searchJobs = await Promise.allSettled(
        activePlatforms.map(platform => 
          this.createSearchJob(platform.id, params.keyword)
        )
      );

      const successfulJobs = searchJobs
        .filter((result): result is PromiseFulfilledResult<any> => result.status === 'fulfilled')
        .map(result => result.value);

      // Step 2: Wait for jobs to complete and fetch results
      const allContent: ProcessedSocialContent[] = [];
      const errors: string[] = [];

      for (const job of successfulJobs) {
        try {
          const content = await this.waitForJobCompletion(job.id);
          allContent.push(...content);
        } catch (error) {
          errors.push(`Failed to fetch content for job ${job.id}: ${error}`);
        }
      }

      // Step 3: Apply filters
      let filteredContent = this.applyContentFilters(allContent, params);

      // Step 4: Generate metrics
      const hashtags = this.generateHashtagMetrics(filteredContent);
      const platformMetrics = this.generatePlatformMetrics(filteredContent);

      // Step 5: Apply pagination
      const { limit = 50, offset = 0 } = params;
      const paginatedContent = filteredContent.slice(offset, offset + limit);
      const hasMore = offset + limit < filteredContent.length;

      return {
        content: paginatedContent,
        hashtags,
        platforms: platformMetrics,
        total: filteredContent.length,
        hasMore,
        nextCursor: hasMore ? (offset + limit).toString() : undefined,
        searchId: `search_${Date.now()}`,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('Social content search failed:', error);
      throw new Error('Failed to search social content');
    }
  }

  // Search hashtags
  async searchHashtags(params: HashtagSearchParams): Promise<HashtagSearchResponse> {
    try {
      // First, get all social content to analyze hashtags
      const socialParams: SocialListeningSearchParams = {
        keyword: params.query || '',
        platforms: params.platforms,
        timeRange: params.timeRange,
        sentiment: params.sentiment,
        engagement: params.engagement,
        viral: params.viral,
        limit: 1000 // Get more content for hashtag analysis
      };

      const socialResponse = await this.searchSocialContent(socialParams);
      
      // Filter hashtags based on criteria
      let hashtags = socialResponse.hashtags;

      if (params.minMentions && params.minMentions > 0) {
        hashtags = hashtags.filter(h => h.count >= params.minMentions);
      }

      if (params.trend && params.trend !== 'all') {
        hashtags = hashtags.filter(h => h.trend.direction === params.trend);
      }

      // Generate trending hashtags
      const trending = this.generateTrendingHashtags(hashtags);

      // Apply pagination
      const { limit = 50, offset = 0 } = params;
      const paginatedHashtags = hashtags.slice(offset, offset + limit);
      const hasMore = offset + limit < hashtags.length;

      return {
        hashtags: paginatedHashtags,
        trending,
        total: hashtags.length,
        hasMore,
        nextCursor: hasMore ? (offset + limit).toString() : undefined,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('Hashtag search failed:', error);
      throw new Error('Failed to search hashtags');
    }
  }

  // Create a search job for a specific platform
  private async createSearchJob(platformId: string, keyword: string): Promise<any> {
    const response = await this.makeRequest('POST', '/social/creators/contents/search', {
      work_platform_id: platformId,
      keyword: keyword,
    });
    return response;
  }

  // Wait for a job to complete and fetch results
  private async waitForJobCompletion(jobId: string, maxAttempts = 20): Promise<ProcessedSocialContent[]> {
    let attempts = 0;
    
    while (attempts < maxAttempts) {
      try {
        const statusResponse = await this.makeRequest('GET', `/social/creators/contents/search/${jobId}`);
        
        if (statusResponse.status === 'SUCCESS') {
          const resultsResponse = await this.makeRequest('GET', `/social/creators/contents/search/${jobId}/fetch`);
          return this.processPlatformData(resultsResponse.data);
        } else if (statusResponse.status === 'FAILED') {
          throw new Error(`Job failed: ${statusResponse.error || 'Unknown error'}`);
        }
        
        // Wait before next attempt
        await new Promise(resolve => setTimeout(resolve, 3000));
        attempts++;
      } catch (error) {
        console.error(`Error checking job status (attempt ${attempts + 1}):`, error);
        attempts++;
        if (attempts >= maxAttempts) {
          throw error;
        }
        await new Promise(resolve => setTimeout(resolve, 3000));
      }
    }
    
    throw new Error('Job timed out');
  }

  // Process platform-specific data
  private processPlatformData(data: any): ProcessedSocialContent[] {
    // This would use the SocialDataProcessors based on the platform
    // For now, return empty array as we're using mock data
    return [];
  }

  // Apply content filters
  private applyContentFilters(content: ProcessedSocialContent[], params: SocialListeningSearchParams): ProcessedSocialContent[] {
    let filtered = [...content];

    // Platform filter
    if (params.platforms && params.platforms.length > 0) {
      filtered = filtered.filter(item => params.platforms!.includes(item.platform));
    }

    // Sentiment filter
    if (params.sentiment && params.sentiment !== 'all') {
      filtered = filtered.filter(item => item.sentiment.label === params.sentiment);
    }

    // Engagement filter
    if (params.engagement && params.engagement !== 'all') {
      filtered = filtered.filter(item => {
        const engagement = item.engagement.total;
        switch (params.engagement) {
          case 'high': return engagement > 1000;
          case 'medium': return engagement > 100 && engagement <= 1000;
          case 'low': return engagement <= 100;
          default: return true;
        }
      });
    }

    // Content type filter
    if (params.contentType && params.contentType !== 'all') {
      filtered = filtered.filter(item => item.media.type === params.contentType);
    }

    // Language filter
    if (params.language && params.language !== 'all') {
      filtered = filtered.filter(item => item.language === params.language);
    }

    // Min followers filter
    if (params.minFollowers && params.minFollowers > 0) {
      filtered = filtered.filter(item => (item.author.followers || 0) >= params.minFollowers!);
    }

    // Viral filter
    if (params.viral) {
      filtered = filtered.filter(item => item.reach.viral);
    }

    // Time range filter
    if (params.timeRange && params.timeRange !== 'all') {
      const now = new Date();
      const timeRanges = {
        '24h': 24 * 60 * 60 * 1000,
        '7d': 7 * 24 * 60 * 60 * 1000,
        '30d': 30 * 24 * 60 * 60 * 1000,
        '90d': 90 * 24 * 60 * 60 * 1000,
      };
      
      const timeLimit = timeRanges[params.timeRange];
      filtered = filtered.filter(item => {
        const itemDate = new Date(item.publishedAt);
        return now.getTime() - itemDate.getTime() <= timeLimit;
      });
    }

    return filtered;
  }

  // Generate hashtag metrics from content
  private generateHashtagMetrics(content: ProcessedSocialContent[]): HashtagMetrics[] {
    const hashtagMap = new Map<string, HashtagMetrics>();
    
    content.forEach(item => {
      item.hashtags.forEach(hashtag => {
        const normalized = hashtag.toLowerCase();
        
        if (hashtagMap.has(normalized)) {
          const existing = hashtagMap.get(normalized)!;
          existing.count += 1;
          existing.engagement.total += item.engagement.total;
          existing.engagement.likes += item.engagement.likes;
          existing.engagement.shares += item.engagement.shares;
          existing.engagement.comments += item.engagement.comments;
          existing.engagement.views += item.engagement.views;
          
          if (!existing.platforms.includes(item.platform)) {
            existing.platforms.push(item.platform);
          }
          
          // Update sentiment
          if (item.sentiment.label === 'positive') existing.sentiment.positive++;
          else if (item.sentiment.label === 'negative') existing.sentiment.negative++;
          else existing.sentiment.neutral++;
          
          // Update reach
          existing.reach.estimated += item.reach.estimated;
          if (item.reach.viral) existing.reach.viral = true;
          
          // Update last seen
          const itemDate = new Date(item.publishedAt);
          const lastSeenDate = new Date(existing.lastSeen);
          if (itemDate > lastSeenDate) {
            existing.lastSeen = item.publishedAt;
          }
          
          // Add to top content (keep top 5)
          existing.topContent.push(item);
          existing.topContent.sort((a, b) => b.engagement.total - a.engagement.total);
          existing.topContent = existing.topContent.slice(0, 5);
        } else {
          hashtagMap.set(normalized, {
            hashtag: hashtag,
            count: 1,
            platforms: [item.platform],
            engagement: { ...item.engagement },
            sentiment: {
              positive: item.sentiment.label === 'positive' ? 1 : 0,
              negative: item.sentiment.label === 'negative' ? 1 : 0,
              neutral: item.sentiment.label === 'neutral' ? 1 : 0
            },
            trend: {
              direction: 'stable',
              change: 0,
              period: '7d'
            },
            reach: { ...item.reach },
            lastSeen: item.publishedAt,
            topContent: [item]
          });
        }
      });
    });
    
    // Calculate percentages and return sorted array
    return Array.from(hashtagMap.values())
      .map(hashtag => {
        const totalSentiment = hashtag.sentiment.positive + hashtag.sentiment.negative + hashtag.sentiment.neutral;
        if (totalSentiment > 0) {
          hashtag.sentiment.positive = Math.round((hashtag.sentiment.positive / totalSentiment) * 100);
          hashtag.sentiment.negative = Math.round((hashtag.sentiment.negative / totalSentiment) * 100);
          hashtag.sentiment.neutral = Math.round((hashtag.sentiment.neutral / totalSentiment) * 100);
        }
        
        return hashtag;
      })
      .sort((a, b) => b.engagement.total - a.engagement.total);
  }

  // Generate platform metrics from content
  private generatePlatformMetrics(content: ProcessedSocialContent[]): PlatformMetrics[] {
    const platformMap = new Map<string, PlatformMetrics>();
    
    content.forEach(item => {
      if (!platformMap.has(item.platform)) {
        platformMap.set(item.platform, {
          platform: item.platform,
          totalContent: 0,
          totalEngagement: 0,
          avgEngagement: 0,
          topHashtags: [],
          sentiment: { positive: 0, negative: 0, neutral: 0 },
          engagementRate: 0,
          reach: 0
        });
      }
      
      const platform = platformMap.get(item.platform)!;
      platform.totalContent += 1;
      platform.totalEngagement += item.engagement.total;
      platform.reach += item.reach.estimated;
      
      if (item.sentiment.label === 'positive') platform.sentiment.positive++;
      else if (item.sentiment.label === 'negative') platform.sentiment.negative++;
      else platform.sentiment.neutral++;
    });
    
    // Calculate averages and percentages
    platformMap.forEach(platform => {
      platform.avgEngagement = platform.totalContent > 0 ? platform.totalEngagement / platform.totalContent : 0;
      platform.engagementRate = platform.reach > 0 ? (platform.totalEngagement / platform.reach) * 100 : 0;
      
      const totalSentiment = platform.sentiment.positive + platform.sentiment.negative + platform.sentiment.neutral;
      if (totalSentiment > 0) {
        platform.sentiment.positive = Math.round((platform.sentiment.positive / totalSentiment) * 100);
        platform.sentiment.negative = Math.round((platform.sentiment.negative / totalSentiment) * 100);
        platform.sentiment.neutral = Math.round((platform.sentiment.neutral / totalSentiment) * 100);
      }
    });
    
    return Array.from(platformMap.values()).sort((a, b) => b.totalEngagement - a.totalEngagement);
  }

  // Generate trending hashtags
  private generateTrendingHashtags(hashtags: HashtagMetrics[]): Array<{
    hashtag: string;
    change: number;
    direction: 'up' | 'down' | 'stable';
    confidence: number;
    period: string;
  }> {
    // This would typically compare with historical data
    // For now, return mock trending data
    return hashtags
      .filter(h => h.trend.direction === 'up')
      .slice(0, 10)
      .map(hashtag => ({
        hashtag: hashtag.hashtag,
        change: hashtag.trend.change,
        direction: hashtag.trend.direction,
        confidence: 0.8 + Math.random() * 0.2, // Mock confidence
        period: hashtag.trend.period
      }));
  }

  // Export data in various formats
  async exportData(data: any, format: 'csv' | 'json' | 'xlsx'): Promise<Blob> {
    // This would implement actual export functionality
    // For now, return a mock blob
    const jsonData = JSON.stringify(data, null, 2);
    return new Blob([jsonData], { type: 'application/json' });
  }

  // Get real-time updates for a search
  async subscribeToSearch(searchId: string, callback: (data: SocialListeningResponse) => void): Promise<void> {
    // This would implement WebSocket or polling for real-time updates
    // For now, just log the subscription
    console.log(`Subscribed to search ${searchId}`);
  }

  // Unsubscribe from search updates
  async unsubscribeFromSearch(searchId: string): Promise<void> {
    console.log(`Unsubscribed from search ${searchId}`);
  }
}

export const socialListeningAPI = new SocialListeningAPI();


