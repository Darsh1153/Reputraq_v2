export interface ProcessedSocialContent {
  id: string;
  platform: string;
  content: string;
  author: {
    name: string;
    username: string;
    followers?: number;
    verified?: boolean;
    avatar?: string;
  };
  engagement: {
    likes: number;
    shares: number;
    comments: number;
    views: number;
    total: number;
  };
  hashtags: string[];
  mentions: string[];
  publishedAt: string;
  url: string;
  media: {
    type: 'image' | 'video' | 'text' | 'carousel';
    url?: string;
    thumbnail?: string;
    duration?: number;
  };
  sentiment: {
    score: number; // -100 to 100
    label: 'positive' | 'negative' | 'neutral';
    confidence: number;
  };
  reach: {
    estimated: number;
    viral: boolean;
  };
  language: string;
  location?: string;
  music?: {
    title: string;
    artist: string;
    duration: number;
  };
}

export interface HashtagMetrics {
  hashtag: string;
  count: number;
  platforms: string[];
  engagement: {
    total: number;
    likes: number;
    shares: number;
    comments: number;
    views: number;
  };
  sentiment: {
    positive: number;
    negative: number;
    neutral: number;
  };
  trend: {
    direction: 'up' | 'down' | 'stable';
    change: number;
    period: string;
  };
  reach: {
    estimated: number;
    viral: boolean;
  };
  lastSeen: string;
  topContent: ProcessedSocialContent[];
}

export interface PlatformMetrics {
  platform: string;
  totalContent: number;
  totalEngagement: number;
  avgEngagement: number;
  topHashtags: HashtagMetrics[];
  sentiment: {
    positive: number;
    negative: number;
    neutral: number;
  };
  engagementRate: number;
  reach: number;
}

export class SocialDataProcessors {
  // TikTok Data Processor
  static processTikTokData(data: any): ProcessedSocialContent[] {
    if (!data.data || !Array.isArray(data.data)) return [];
    
    return data.data.map((item: any) => {
      const author = item.author || {};
      const stats = item.statistics || {};
      const music = item.added_sound_music_info || {};
      
      return {
        id: item.id || item.aweme_id || '',
        platform: 'TikTok',
        content: item.desc || '',
        author: {
          name: author.nickname || '',
          username: author.unique_id || '',
          followers: author.follower_count || 0,
          verified: author.verified || false,
          avatar: author.avatar_thumb?.url_list?.[0] || ''
        },
        engagement: {
          likes: stats.digg_count || 0,
          shares: stats.share_count || 0,
          comments: stats.comment_count || 0,
          views: stats.play_count || 0,
          total: (stats.digg_count || 0) + (stats.share_count || 0) + (stats.comment_count || 0)
        },
        hashtags: this.extractHashtags(item.desc || ''),
        mentions: this.extractMentions(item.desc || ''),
        publishedAt: new Date((item.create_time || 0) * 1000).toISOString(),
        url: `https://www.tiktok.com/@${author.unique_id}/video/${item.aweme_id}`,
        media: {
          type: item.video ? 'video' : 'image',
          url: item.video?.play_addr?.url_list?.[0] || item.image?.url_list?.[0],
          thumbnail: item.video?.cover?.url_list?.[0] || item.image?.url_list?.[0],
          duration: item.video?.duration || 0
        },
        sentiment: this.analyzeSentiment(item.desc || ''),
        reach: {
          estimated: stats.play_count || 0,
          viral: (stats.play_count || 0) > 100000
        },
        language: this.detectLanguage(item.desc || ''),
        music: music.title ? {
          title: music.title,
          artist: music.author,
          duration: music.duration || 0
        } : undefined
      };
    });
  }

  // YouTube Data Processor
  static processYouTubeData(data: any): ProcessedSocialContent[] {
    if (!data.items || !Array.isArray(data.items)) return [];
    
    return data.items.map((item: any) => {
      const snippet = item.snippet || {};
      const statistics = item.statistics || {};
      
      return {
        id: item.id?.videoId || item.id,
        platform: 'YouTube',
        content: snippet.description || snippet.title || '',
        author: {
          name: snippet.channelTitle || '',
          username: snippet.channelId || '',
          followers: 0, // Not available in basic API
          verified: false,
          avatar: snippet.thumbnails?.default?.url || ''
        },
        engagement: {
          likes: parseInt(statistics.likeCount || '0'),
          shares: 0, // Not available in basic API
          comments: parseInt(statistics.commentCount || '0'),
          views: parseInt(statistics.viewCount || '0'),
          total: parseInt(statistics.likeCount || '0') + parseInt(statistics.commentCount || '0')
        },
        hashtags: this.extractHashtags(snippet.description || ''),
        mentions: this.extractMentions(snippet.description || ''),
        publishedAt: snippet.publishedAt || '',
        url: `https://www.youtube.com/watch?v=${item.id?.videoId || item.id}`,
        media: {
          type: 'video',
          url: `https://www.youtube.com/watch?v=${item.id?.videoId || item.id}`,
          thumbnail: snippet.thumbnails?.high?.url || snippet.thumbnails?.default?.url,
          duration: 0 // Would need additional API call
        },
        sentiment: this.analyzeSentiment(snippet.description || snippet.title || ''),
        reach: {
          estimated: parseInt(statistics.viewCount || '0'),
          viral: parseInt(statistics.viewCount || '0') > 1000000
        },
        language: snippet.defaultLanguage || 'en',
        location: snippet.country
      };
    });
  }

  // Instagram Data Processor
  static processInstagramData(data: any): ProcessedSocialContent[] {
    if (!data.data || !Array.isArray(data.data)) return [];
    
    return data.data.map((item: any) => {
      const user = item.user || {};
      const counts = item.counts || {};
      
      return {
        id: item.id || '',
        platform: 'Instagram',
        content: item.caption || '',
        author: {
          name: user.full_name || '',
          username: user.username || '',
          followers: user.followed_by_count || 0,
          verified: user.is_verified || false,
          avatar: user.profile_picture || ''
        },
        engagement: {
          likes: counts.likes || 0,
          shares: 0, // Not available in basic API
          comments: counts.comments || 0,
          views: counts.views || 0,
          total: (counts.likes || 0) + (counts.comments || 0)
        },
        hashtags: this.extractHashtags(item.caption || ''),
        mentions: this.extractMentions(item.caption || ''),
        publishedAt: item.created_time || '',
        url: item.link || '',
        media: {
          type: item.type === 'video' ? 'video' : 'image',
          url: item.images?.standard_resolution?.url || item.videos?.standard_resolution?.url,
          thumbnail: item.images?.thumbnail?.url || item.videos?.thumbnail?.url,
          duration: 0
        },
        sentiment: this.analyzeSentiment(item.caption || ''),
        reach: {
          estimated: counts.likes || 0,
          viral: (counts.likes || 0) > 10000
        },
        language: this.detectLanguage(item.caption || ''),
        location: item.location?.name
      };
    });
  }

  // X (Twitter) Data Processor
  static processXData(data: any): ProcessedSocialContent[] {
    if (!data.data || !Array.isArray(data.data)) return [];
    
    return data.data.map((item: any) => {
      const user = item.user || {};
      const public_metrics = item.public_metrics || {};
      
      return {
        id: item.id || '',
        platform: 'X',
        content: item.text || '',
        author: {
          name: user.name || '',
          username: user.username || '',
          followers: user.public_metrics?.followers_count || 0,
          verified: user.verified || false,
          avatar: user.profile_image_url || ''
        },
        engagement: {
          likes: public_metrics.like_count || 0,
          shares: public_metrics.retweet_count || 0,
          comments: public_metrics.reply_count || 0,
          views: public_metrics.impression_count || 0,
          total: (public_metrics.like_count || 0) + (public_metrics.retweet_count || 0) + (public_metrics.reply_count || 0)
        },
        hashtags: this.extractHashtags(item.text || ''),
        mentions: this.extractMentions(item.text || ''),
        publishedAt: item.created_at || '',
        url: `https://twitter.com/${user.username}/status/${item.id}`,
        media: {
          type: item.attachments?.media_keys ? 'image' : 'text',
          url: item.attachments?.media_keys?.[0] || '',
          thumbnail: '',
          duration: 0
        },
        sentiment: this.analyzeSentiment(item.text || ''),
        reach: {
          estimated: public_metrics.impression_count || 0,
          viral: (public_metrics.retweet_count || 0) > 1000
        },
        language: item.lang || 'en',
        location: user.location
      };
    });
  }

  // Reddit Data Processor
  static processRedditData(data: any): ProcessedSocialContent[] {
    if (!data.data?.children || !Array.isArray(data.data.children)) return [];
    
    return data.data.children.map((item: any) => {
      const post = item.data || {};
      
      return {
        id: post.id || '',
        platform: 'Reddit',
        content: post.selftext || post.title || '',
        author: {
          name: post.author || '',
          username: post.author || '',
          followers: 0,
          verified: false,
          avatar: ''
        },
        engagement: {
          likes: post.ups || 0,
          shares: 0,
          comments: post.num_comments || 0,
          views: post.view_count || 0,
          total: (post.ups || 0) + (post.num_comments || 0)
        },
        hashtags: this.extractHashtags(post.selftext || post.title || ''),
        mentions: this.extractMentions(post.selftext || post.title || ''),
        publishedAt: new Date(post.created_utc * 1000).toISOString(),
        url: `https://www.reddit.com${post.permalink}`,
        media: {
          type: post.is_video ? 'video' : post.url ? 'image' : 'text',
          url: post.url || '',
          thumbnail: post.thumbnail || '',
          duration: 0
        },
        sentiment: this.analyzeSentiment(post.selftext || post.title || ''),
        reach: {
          estimated: post.ups || 0,
          viral: (post.ups || 0) > 1000
        },
        language: 'en',
        location: post.subreddit
      };
    });
  }

  // Threads Data Processor
  static processThreadsData(data: any): ProcessedSocialContent[] {
    // Threads API structure would be similar to Instagram
    if (!data.data || !Array.isArray(data.data)) return [];
    
    return data.data.map((item: any) => {
      const user = item.user || {};
      
      return {
        id: item.id || '',
        platform: 'Threads',
        content: item.text || '',
        author: {
          name: user.name || '',
          username: user.username || '',
          followers: user.followers_count || 0,
          verified: user.is_verified || false,
          avatar: user.profile_picture || ''
        },
        engagement: {
          likes: item.likes_count || 0,
          shares: item.reposts_count || 0,
          comments: item.replies_count || 0,
          views: item.views_count || 0,
          total: (item.likes_count || 0) + (item.reposts_count || 0) + (item.replies_count || 0)
        },
        hashtags: this.extractHashtags(item.text || ''),
        mentions: this.extractMentions(item.text || ''),
        publishedAt: item.created_at || '',
        url: item.url || '',
        media: {
          type: item.media ? 'image' : 'text',
          url: item.media?.url || '',
          thumbnail: item.media?.thumbnail || '',
          duration: 0
        },
        sentiment: this.analyzeSentiment(item.text || ''),
        reach: {
          estimated: item.views_count || 0,
          viral: (item.likes_count || 0) > 1000
        },
        language: this.detectLanguage(item.text || ''),
        location: user.location
      };
    });
  }

  // Utility Methods
  static extractHashtags(text: string): string[] {
    const hashtagRegex = /#[\w\u0590-\u05ff]+/g;
    return text.match(hashtagRegex) || [];
  }

  static extractMentions(text: string): string[] {
    const mentionRegex = /@[\w\u0590-\u05ff]+/g;
    return text.match(mentionRegex) || [];
  }

  static analyzeSentiment(text: string): { score: number; label: 'positive' | 'negative' | 'neutral'; confidence: number } {
    // Simple sentiment analysis based on keywords
    const positiveWords = ['good', 'great', 'amazing', 'awesome', 'love', 'best', 'excellent', 'fantastic', 'wonderful', 'perfect'];
    const negativeWords = ['bad', 'terrible', 'awful', 'hate', 'worst', 'horrible', 'disgusting', 'annoying', 'stupid', 'ugly'];
    
    const words = text.toLowerCase().split(/\s+/);
    let positiveCount = 0;
    let negativeCount = 0;
    
    words.forEach(word => {
      if (positiveWords.includes(word)) positiveCount++;
      if (negativeWords.includes(word)) negativeCount++;
    });
    
    const totalWords = words.length;
    const positiveRatio = positiveCount / totalWords;
    const negativeRatio = negativeCount / totalWords;
    
    let score = 0;
    let label: 'positive' | 'negative' | 'neutral' = 'neutral';
    
    if (positiveRatio > negativeRatio) {
      score = Math.min(100, positiveRatio * 100);
      label = 'positive';
    } else if (negativeRatio > positiveRatio) {
      score = Math.max(-100, -negativeRatio * 100);
      label = 'negative';
    }
    
    const confidence = Math.abs(score) / 100;
    
    return { score, label, confidence };
  }

  static detectLanguage(text: string): string {
    // Simple language detection based on common patterns
    if (/[\u4e00-\u9fff]/.test(text)) return 'zh';
    if (/[\u3040-\u309f\u30a0-\u30ff]/.test(text)) return 'ja';
    if (/[\uac00-\ud7af]/.test(text)) return 'ko';
    if (/[\u0600-\u06ff]/.test(text)) return 'ar';
    if (/[\u0590-\u05ff]/.test(text)) return 'he';
    return 'en';
  }

  // Process all platforms data
  static processAllPlatformsData(data: any): ProcessedSocialContent[] {
    const allContent: ProcessedSocialContent[] = [];
    
    // Process each platform's data
    if (data.tiktok) {
      allContent.push(...this.processTikTokData(data.tiktok));
    }
    if (data.youtube) {
      allContent.push(...this.processYouTubeData(data.youtube));
    }
    if (data.instagram) {
      allContent.push(...this.processInstagramData(data.instagram));
    }
    if (data.x || data.twitter) {
      allContent.push(...this.processXData(data.x || data.twitter));
    }
    if (data.reddit) {
      allContent.push(...this.processRedditData(data.reddit));
    }
    if (data.threads) {
      allContent.push(...this.processThreadsData(data.threads));
    }
    
    return allContent;
  }

  // Generate hashtag metrics
  static generateHashtagMetrics(content: ProcessedSocialContent[]): HashtagMetrics[] {
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
    
    // Calculate trends and return sorted array
    return Array.from(hashtagMap.values())
      .map(hashtag => {
        // Simple trend calculation (would need historical data for real trends)
        const totalSentiment = hashtag.sentiment.positive + hashtag.sentiment.negative + hashtag.sentiment.neutral;
        hashtag.sentiment.positive = Math.round((hashtag.sentiment.positive / totalSentiment) * 100);
        hashtag.sentiment.negative = Math.round((hashtag.sentiment.negative / totalSentiment) * 100);
        hashtag.sentiment.neutral = Math.round((hashtag.sentiment.neutral / totalSentiment) * 100);
        
        return hashtag;
      })
      .sort((a, b) => b.engagement.total - a.engagement.total);
  }

  // Generate platform metrics
  static generatePlatformMetrics(content: ProcessedSocialContent[]): PlatformMetrics[] {
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
}


