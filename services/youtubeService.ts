interface YouTubeVideo {
  id: {
    videoId: string;
  };
  url: string;
  title: string;
  description: string;
  duration_raw: string;
  snippet: {
    url: string;
    duration: string;
    publishedAt: string;
    thumbnails: {
      id: string;
      url: string;
      default: {
        url: string;
        width: number;
        height: number;
      };
      high: {
        url: string;
        width: number;
        height: number;
      };
      height: number;
      width: number;
    };
    title: string;
  };
  views: number;
}

interface YouTubeSearchResponse {
  success: boolean;
  data: YouTubeVideo[];
  query: string;
  duration: string;
  count: number;
}

interface YouTubeSearchOptions {
  duration?: 'under' | 'between' | 'over';
}

class YouTubeService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = '/api/youtube';
  }

  /**
   * Search for YouTube videos
   * @param query - Search query string
   * @param options - Search options including duration filter
   * @returns Promise with search results
   */
  async searchVideos(query: string, options: YouTubeSearchOptions = {}): Promise<YouTubeSearchResponse> {
    try {
      const params = new URLSearchParams({
        q: query,
        ...(options.duration && { duration: options.duration })
      });

      const response = await fetch(`${this.baseUrl}?${params}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to search YouTube videos');
      }

      return await response.json();
    } catch (error) {
      console.error('YouTube search error:', error);
      throw error;
    }
  }

  /**
   * Search for YouTube videos using POST method
   * @param query - Search query string
   * @param options - Search options including duration filter
   * @returns Promise with search results
   */
  async searchVideosPost(query: string, options: YouTubeSearchOptions = {}): Promise<YouTubeSearchResponse> {
    try {
      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query,
          duration: options.duration
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to search YouTube videos');
      }

      return await response.json();
    } catch (error) {
      console.error('YouTube search error:', error);
      throw error;
    }
  }

  /**
   * Format video duration from raw format to readable format
   * @param durationRaw - Raw duration string (e.g., "2:01")
   * @returns Formatted duration string
   */
  formatDuration(durationRaw: string): string {
    return durationRaw;
  }

  /**
   * Format view count to readable format
   * @param views - View count (string or number)
   * @returns Formatted view count
   */
  formatViews(views: string | number): string {
    let viewCount: number;
    
    if (typeof views === 'number') {
      viewCount = views;
    } else {
      // Handle string views - remove commas and parse
      viewCount = parseInt(views.replace(/,/g, ''));
    }
    
    if (isNaN(viewCount)) {
      return '0 views';
    }
    
    if (viewCount >= 1000000) {
      return `${(viewCount / 1000000).toFixed(1)}M views`;
    } else if (viewCount >= 1000) {
      return `${(viewCount / 1000).toFixed(1)}K views`;
    }
    return `${viewCount} views`;
  }

  /**
   * Get video thumbnail URL with specified quality
   * @param video - YouTube video object
   * @param quality - Thumbnail quality ('default' | 'high')
   * @returns Thumbnail URL
   */
  getThumbnailUrl(video: YouTubeVideo, quality: 'default' | 'high' = 'high'): string {
    return video.snippet.thumbnails[quality].url;
  }

  /**
   * Extract video ID from YouTube URL
   * @param url - YouTube video URL
   * @returns Video ID or null if invalid
   */
  extractVideoId(url: string): string | null {
    const regex = /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/;
    const match = url.match(regex);
    return match ? match[1] : null;
  }

  /**
   * Generate YouTube embed URL
   * @param videoId - YouTube video ID
   * @returns Embed URL
   */
  getEmbedUrl(videoId: string): string {
    return `https://www.youtube.com/embed/${videoId}`;
  }
}

export const youtubeService = new YouTubeService();
export type { YouTubeVideo, YouTubeSearchResponse, YouTubeSearchOptions };
