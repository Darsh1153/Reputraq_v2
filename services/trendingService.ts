export interface TrendingKeyword {
  keyword: string;
  traffic: string;
  trafficGrowthRate: string;
  activeTime: string;
  relatedKeywords: string[];
  articleKeys: Array<[number, string, string]>;
}

export interface TrendingArticle {
  title: string;
  link: string;
  mediaCompany: string;
  pressDate: number[];
  image: string;
}

export interface InterestOverTimeData {
  keyword: string;
  dates: string[];
  values: number[];
}

export interface RealTimeTrend {
  allTrendingStories: any[];
  summary: string[];
}

export class TrendingService {
  private static async apiRequest(endpoint: string, params: Record<string, string> = {}) {
    const url = new URL(`/api/trending${endpoint}`, window.location.origin);
    Object.entries(params).forEach(([key, value]) => {
      url.searchParams.append(key, value);
    });

    const response = await fetch(url.toString());
    if (!response.ok) {
      throw new Error(`API request failed: ${response.statusText}`);
    }
    return response.json();
  }

  private static async apiPostRequest(endpoint: string, body: any) {
    const response = await fetch(`/api/trending${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.statusText}`);
    }
    return response.json();
  }

  /**
   * Get daily trending topics for a specific region
   */
  static async getDailyTrends(geo: string = 'US', hl: string = 'en') {
    try {
      const result = await this.apiRequest('', { type: 'daily', geo, hl });
      return result;
    } catch (error) {
      console.error('Error fetching daily trends:', error);
      throw error;
    }
  }

  /**
   * Get real-time trending topics
   */
  static async getRealTimeTrends(geo: string = 'US', trendingHours: number = 4) {
    try {
      const result = await this.apiRequest('', { 
        type: 'realtime', 
        geo, 
        trendingHours: trendingHours.toString() 
      });
      return result;
    } catch (error) {
      console.error('Error fetching real-time trends:', error);
      throw error;
    }
  }

  /**
   * Get trending articles for specific article keys
   */
  static async getTrendingArticles(articleKeys: Array<[number, string, string]>, articleCount: number = 5) {
    try {
      const result = await this.apiPostRequest('', {
        type: 'trending-articles',
        articleKeys,
        articleCount
      });
      return result;
    } catch (error) {
      console.error('Error fetching trending articles:', error);
      throw error;
    }
  }

  /**
   * Get interest over time data for a specific keyword
   */
  static async getInterestOverTime(keyword: string, geo: string = 'US') {
    try {
      const result = await this.apiRequest('', { 
        type: 'interest-over-time', 
        keyword, 
        geo 
      });
      return result;
    } catch (error) {
      console.error('Error fetching interest over time:', error);
      throw error;
    }
  }

  /**
   * Get autocomplete suggestions for a keyword
   */
  static async getAutocompleteSuggestions(keyword: string, language: string = 'en-US') {
    try {
      const suggestions = await this.apiRequest('', { 
        type: 'autocomplete', 
        keyword, 
        hl: language 
      });
      return suggestions;
    } catch (error) {
      console.error('Error fetching autocomplete suggestions:', error);
      throw error;
    }
  }

  /**
   * Get interest by region data
   */
  static async getInterestByRegion(
    keyword: string | string[],
    options: {
      startTime?: Date;
      endTime?: Date;
      geo?: string | string[];
      resolution?: 'COUNTRY' | 'REGION' | 'CITY' | 'DMA';
      hl?: string;
      timezone?: number;
      category?: number;
    } = {}
  ) {
    try {
      const params: Record<string, string> = {
        type: 'interest-by-region',
        keyword: Array.isArray(keyword) ? keyword.join(',') : keyword,
        geo: Array.isArray(options.geo) ? options.geo.join(',') : (options.geo || 'US'),
        resolution: options.resolution || 'REGION',
        hl: options.hl || 'en-US',
        timezone: (options.timezone || 0).toString(),
        category: (options.category || 0).toString()
      };

      if (options.startTime) {
        params.startTime = options.startTime.toISOString();
      }
      if (options.endTime) {
        params.endTime = options.endTime.toISOString();
      }

      const result = await this.apiRequest('', params);
      return result;
    } catch (error) {
      console.error('Error fetching interest by region:', error);
      throw error;
    }
  }

  /**
   * Search for trending keywords with hashtag formatting
   */
  static async searchTrendingKeywords(searchTerm: string, geo: string = 'US') {
    try {
      // Get daily trends
      const dailyTrends = await this.getDailyTrends(geo);
      
      if (dailyTrends.error || !dailyTrends.data) {
        throw new Error('Failed to fetch daily trends');
      }

      // Filter trends based on search term
      const filteredTrends = dailyTrends.data.filter(trend =>
        trend.keyword.toLowerCase().includes(searchTerm.toLowerCase()) ||
        trend.relatedKeywords.some(keyword => 
          keyword.toLowerCase().includes(searchTerm.toLowerCase())
        )
      );

      // Format as hashtags
      const hashtagTrends = filteredTrends.map(trend => ({
        ...trend,
        hashtag: `#${trend.keyword.replace(/\s+/g, '')}`,
        relatedHashtags: trend.relatedKeywords.map(keyword => 
          `#${keyword.replace(/\s+/g, '')}`
        )
      }));

      return hashtagTrends;
    } catch (error) {
      console.error('Error searching trending keywords:', error);
      throw error;
    }
  }

  /**
   * Get all trending hashtags for display
   */
  static async getAllTrendingHashtags(geo: string = 'US') {
    try {
      const dailyTrends = await this.getDailyTrends(geo);
      
      if (dailyTrends.error || !dailyTrends.data) {
        throw new Error('Failed to fetch daily trends');
      }

      // Format all trends as hashtags
      const hashtagTrends = dailyTrends.data.map(trend => ({
        ...trend,
        hashtag: `#${trend.keyword.replace(/\s+/g, '')}`,
        relatedHashtags: trend.relatedKeywords.map(keyword => 
          `#${keyword.replace(/\s+/g, '')}`
        )
      }));

      return hashtagTrends;
    } catch (error) {
      console.error('Error fetching all trending hashtags:', error);
      throw error;
    }
  }
}
