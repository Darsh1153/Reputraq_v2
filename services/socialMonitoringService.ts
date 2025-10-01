import axios from 'axios';

const API_BASE_URL = 'https://api.staging.insightiq.ai/v1';
const AUTH_HEADER = 'Basic NWU2ZDkwZjYtYmMxZS00OTc5LWJlYmEtY2YzOTA5ZjgxZGMxOjg1ZTZiY2UzLTA1MmMtNGJmYy1hNDJhLTY5NmFhM2ZhMjk0OQ==';

export interface SocialPlatform {
  id: string;
  name: string;
  logo_url: string;
  created_at: string;
  updated_at: string;
  category: string;
  status: string;
  url: string;
}

export interface SocialContent {
  work_platform: {
    id: string;
    name: string;
    logo_url: string;
  };
  profile: {
    platform_username: string;
    url: string;
    image_url: string | null;
  };
  title: string;
  description: string;
  format: string;
  type: string;
  url: string;
  media_url: string;
  thumbnail_url: string;
  published_at: string;
  platform_content_id: string;
  duration: number;
  engagement: {
    like_count: number | null;
    view_count: number | null;
    share_count: number | null;
    comment_count: number | null;
  };
  audio_track_info: {
    id: string;
    title: string;
    artist: string;
    original: boolean;
  } | null;
  mentions: string[] | null;
  hashtags: string[] | null;
  media_urls: string[] | null;
}

export interface SearchJob {
  id: string;
  keyword: string;
  hashtag: string | null;
  mention: string | null;
  from_date: string | null;
  to_date: string | null;
  items_limit: number;
  audio_track_info: any;
  status: 'IN_PROGRESS' | 'SUCCESS' | 'FAILED';
  work_platform: {
    id: string;
    name: string;
    logo_url: string;
  };
  error: string | null;
}

class SocialMonitoringService {
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

  // Step 1: Get all available social media platforms
  async getWorkPlatforms(): Promise<SocialPlatform[]> {
    const response = await this.makeRequest('GET', '/work-platforms');
    return response.data;
  }

  // Step 2: Create search job for a specific platform and keyword
  async createSearchJob(workPlatformId: string, keyword: string): Promise<SearchJob> {
    const response = await this.makeRequest('POST', '/social/creators/contents/search', {
      work_platform_id: workPlatformId,
      keyword: keyword,
    });
    return response;
  }

  // Step 3: Check job status
  async getJobStatus(jobId: string): Promise<SearchJob> {
    const response = await this.makeRequest('GET', `/social/creators/contents/search/${jobId}`);
    return response;
  }

  // Step 4: Fetch results when job is successful
  async fetchJobResults(jobId: string): Promise<{ data: SocialContent[] }> {
    const response = await this.makeRequest('GET', `/social/creators/contents/search/${jobId}/fetch`);
    return response;
  }

  // Complete workflow: Search across all platforms for a keyword
  async searchKeywordAcrossAllPlatforms(keyword: string): Promise<{
    platforms: SocialPlatform[];
    results: { platform: SocialPlatform; content: SocialContent[] }[];
    errors: { platform: SocialPlatform; error: string }[];
  }> {
    try {
      // Step 1: Get all platforms
      const platforms = await this.getWorkPlatforms();
      // Filter to all active social platforms
      const socialPlatforms = platforms.filter(p => 
        p.category === 'SOCIAL' && 
        p.status === 'ACTIVE'
      );

      const results: { platform: SocialPlatform; content: SocialContent[] }[] = [];
      const errors: { platform: SocialPlatform; error: string }[] = [];

      // Step 2: Create search jobs for each platform with sequential processing to avoid rate limits
      for (let i = 0; i < socialPlatforms.length; i++) {
        const platform = socialPlatforms[i];
        
        try {
          // Add delay between requests to avoid rate limiting
          if (i > 0) {
            await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2 seconds between requests
          }
          
          const job = await this.createSearchJob(platform.id, keyword);
          
          // Step 3: Poll job status and fetch results immediately for this platform
          try {
            let currentJob = job;
            let attempts = 0;
            const maxAttempts = 15; // Increased max attempts
            
            while (currentJob.status === 'IN_PROGRESS' && attempts < maxAttempts) {
              await new Promise(resolve => setTimeout(resolve, 3000)); // Wait 3 seconds between status checks
              currentJob = await this.getJobStatus(job.id);
              attempts++;
            }

            if (currentJob.status === 'SUCCESS') {
              const content = await this.fetchJobResults(job.id);
              results.push({ platform, content: content.data });
            } else if (currentJob.status === 'FAILED') {
              errors.push({ platform, error: currentJob.error || 'Job failed' });
            } else {
              errors.push({ platform, error: 'Job timed out or is still in progress' });
            }
          } catch (pollError: any) {
            let errorMessage = 'Unknown error while polling job';
            
            if (pollError.response) {
              const status = pollError.response.status;
              if (status === 429) {
                errorMessage = 'Rate limit exceeded while checking job status';
              } else if (status === 404) {
                errorMessage = 'Job not found or expired';
              } else {
                errorMessage = `Request failed with status ${status}`;
              }
            } else if (pollError.message) {
              errorMessage = pollError.message;
            }
            
            errors.push({ platform, error: errorMessage });
          }
        } catch (error: any) {
          let errorMessage = 'Unknown error';
          
          if (error.response) {
            const status = error.response.status;
            if (status === 429) {
              errorMessage = 'Rate limit exceeded - too many requests';
            } else if (status === 404) {
              errorMessage = 'Platform not available or endpoint not found';
            } else if (status === 401) {
              errorMessage = 'Authentication failed';
            } else if (status === 403) {
              errorMessage = 'Access forbidden';
            } else {
              errorMessage = `Request failed with status ${status}`;
            }
          } else if (error.message) {
            errorMessage = error.message;
          }
          
          errors.push({ platform, error: errorMessage });
        }
      }

      return {
        platforms: socialPlatforms,
        results,
        errors,
      };
    } catch (error) {
      console.error('Search failed:', error);
      throw error;
    }
  }
}

export const socialMonitoringService = new SocialMonitoringService();
