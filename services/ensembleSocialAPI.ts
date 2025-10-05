import axios from 'axios';

// Your API configuration
const baseUrl = process.env.NEXT_PUBLIC_ENSEMBLE_API_URL || 'https://ensembledata.com/apis';
const token = process.env.ENSEMBLE_TOKEN || 'GhpwNfDujiw8enkp';

interface YouTubeSearchParams { 
  keyword: string;
  depth?: number;
  start_cursor?: string;
  period?: 'overall' | 'day' | 'week' | 'month' | 'year';
  sorting?: 'relevance' | 'date' | 'viewCount' | 'rating';
  get_additional_info?: boolean;
}

interface YouTubeHashtagParams {
  name: string;
  depth?: number;
  only_shorts?: boolean;
}

interface TikTokHashtagParams {
  name: string;
  cursor?: number;
}

interface TikTokKeywordParams {
  name: string;
  cursor?: number;
  period?: number;
  sorting?: number;
  country?: string;
  match_exactly?: boolean;
  get_author_stats?: boolean;
}

interface InstagramSearchParams {
  text: string;
}

interface ThreadsKeywordParams {
  name: string;
  sorting?: number;
}

interface YouTubeVideo {
  videoId: string;
  title: string;
  thumbnail: string;
  views: number;
  duration?: string;
  publishedAt: string;
  channelTitle: string;
  description: string;
  url: string;
  isShorts?: boolean;
}

interface TikTokPost {
  id: string;
  text: string;
  videoUrl: string;
  thumbnail: string;
  views: number;
  likes: number;
  comments: number;
  shares: number;
  publishedAt: string;
  author: {
    username: string;
    displayName: string;
    avatar: string;
    followers: number;
  };
  hashtags: string[];
  url: string;
}

interface InstagramData {
  hashtags: any[];
  users: any[];
  places: any[];
  error: string | null;
}

interface ThreadsPost {
  id: string;
  text: string;
  imageUrl?: string;
  videoUrl?: string;
  likes: number;
  comments: number;
  shares: number;
  publishedAt: string;
  author: {
    username: string;
    displayName: string;
    avatar: string;
    followers: number;
  };
  hashtags: string[];
  url: string;
}

interface RedditPost {
  id: string;
  title: string;
  text: string;
  url: string;
  subreddit: string;
  author: string;
  score: number;
  upvotes: number;
  downvotes: number;
  comments: number;
  publishedAt: string;
  thumbnail: string;
  flair: string;
  nsfw: boolean;
  awards: number;
}

interface TwitterPost {
  id: string;
  text: string;
  url: string;
  author: {
    username: string;
    displayName: string;
    avatar: string;
    followers: number;
    verified: boolean;
  };
  likes: number;
  retweets: number;
  replies: number;
  publishedAt: string;
  hashtags: string[];
  mentions: string[];
  media: any[];
  isRetweet: boolean;
  originalTweet: any;
}

interface LinkedInPost {
  id: string;
  text: string;
  url: string;
  author: {
    name: string;
    title: string;
    company: string;
    avatar: string;
    followers: number;
  };
  likes: number;
  comments: number;
  shares: number;
  publishedAt: string;
  hashtags: string[];
  media: any[];
  engagement: number;
}

interface FacebookPost {
  id: string;
  text: string;
  url: string;
  author: {
    name: string;
    avatar: string;
    followers: number;
  };
  likes: number;
  comments: number;
  shares: number;
  publishedAt: string;
  media: any[];
  reactions: any;
  privacy: string;
}

// YouTube Keyword Search API
export const searchYouTube = async (params: YouTubeSearchParams) => {
  try {
    console.log(`Searching YouTube for: ${params.keyword}`);
    
    const response = await axios.get(`${baseUrl}/youtube/search`, {
      params: {
        keyword: params.keyword,
        depth: params.depth || 1,
        start_cursor: params.start_cursor || '',
        period: params.period || 'overall',
        sorting: params.sorting || 'relevance',
        get_additional_info: params.get_additional_info || false,
        token: token
      },
      timeout: 30000
    });

    console.log('YouTube search response:', response.data);
    return processYouTubeData(response.data, params.keyword);
  } catch (error) {
    console.error('YouTube search error:', error);
    throw new Error(`YouTube search failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

// YouTube Hashtag Search API
export const searchYouTubeHashtag = async (params: YouTubeHashtagParams) => {
  try {
    console.log(`Searching YouTube hashtag: ${params.name}`);
    
    const response = await axios.get(`${baseUrl}/youtube/hashtag/search`, {
      params: {
        name: params.name,
        depth: params.depth || 1,
        only_shorts: params.only_shorts || false,
        token: token
      },
      timeout: 30000
    });

    console.log('YouTube hashtag response:', response.data);
    return processYouTubeHashtagData(response.data, params.name);
  } catch (error) {
    console.error('YouTube hashtag search error:', error);
    throw new Error(`YouTube hashtag search failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

// TikTok Hashtag Search API
export const searchTikTokHashtag = async (params: TikTokHashtagParams) => {
  try {
    console.log(`Searching TikTok hashtag: ${params.name}`);
    
    const response = await axios.get(`${baseUrl}/tt/hashtag/posts`, {
      params: {
        name: params.name,
        cursor: params.cursor || 0,
        token: token
      },
      timeout: 30000
    });

    console.log('TikTok hashtag response:', response.data);
    return processTikTokData(response.data, params.name);
  } catch (error) {
    console.error('TikTok hashtag search error:', error);
    throw new Error(`TikTok hashtag search failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

// TikTok Keyword Search API
export const searchTikTokKeyword = async (params: TikTokKeywordParams) => {
  try {
    console.log(`Searching TikTok keyword: ${params.name}`);
    
    const response = await axios.get(`${baseUrl}/tt/keyword/search`, {
      params: {
        name: params.name,
        cursor: params.cursor || 0,
        period: params.period || 1,
        sorting: params.sorting || 0,
        country: params.country || 'us',
        match_exactly: params.match_exactly || false,
        get_author_stats: params.get_author_stats || false,
        token: token
      },
      timeout: 30000
    });

    console.log('TikTok keyword response:', response.data);
    return processTikTokData(response.data, params.name);
  } catch (error) {
    console.error('TikTok keyword search error:', error);
    throw new Error(`TikTok keyword search failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

// Instagram Search API
export const searchInstagram = async (params: InstagramSearchParams) => {
  try {
    console.log(`Searching Instagram for: ${params.text}`);
    
    const response = await axios.get(`${baseUrl}/instagram/search`, {
      params: {
        text: params.text,
        token: token
      },
      timeout: 30000
    });

    console.log('Instagram search response:', response.data);
    return processInstagramData(response.data, params.text);
  } catch (error) {
    console.error('Instagram search error:', error);
    throw new Error(`Instagram search failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

// Threads Keyword Search API
export const searchThreadsKeyword = async (params: ThreadsKeywordParams) => {
  try {
    console.log(`Searching Threads keyword: ${params.name}`);
    
    const response = await axios.get(`${baseUrl}/threads/keyword/search`, {
      params: {
        name: params.name,
        sorting: params.sorting || 0,
        token: token
      },
      timeout: 30000
    });

    console.log('Threads keyword response:', response.data);
    return processThreadsData(response.data, params.name);
  } catch (error) {
    console.error('Threads keyword search error:', error);
    throw new Error(`Threads keyword search failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

// Reddit Search API
export const searchReddit = async (params: { keyword: string; subreddit?: string; limit?: number }) => {
  try {
    console.log(`Searching Reddit for: ${params.keyword}`);
    
    const response = await axios.get(`${baseUrl}/reddit/search`, {
      params: {
        keyword: params.keyword,
        subreddit: params.subreddit || '',
        limit: params.limit || 10,
        token: token
      },
      timeout: 30000
    });

    console.log('Reddit search response:', response.data);
    return processRedditData(response.data, params.keyword);
  } catch (error) {
    console.error('Reddit search error:', error);
    throw new Error(`Reddit search failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

// Twitter/X Search API
export const searchTwitter = async (params: { keyword: string; limit?: number }) => {
  try {
    console.log(`Searching Twitter/X for: ${params.keyword}`);
    
    const response = await axios.get(`${baseUrl}/twitter/search`, {
      params: {
        keyword: params.keyword,
        limit: params.limit || 10,
        token: token
      },
      timeout: 30000
    });

    console.log('Twitter search response:', response.data);
    return processTwitterData(response.data, params.keyword);
  } catch (error) {
    console.error('Twitter search error:', error);
    throw new Error(`Twitter search failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

// LinkedIn Search API
export const searchLinkedIn = async (params: { keyword: string; limit?: number }) => {
  try {
    console.log(`Searching LinkedIn for: ${params.keyword}`);
    
    const response = await axios.get(`${baseUrl}/linkedin/search`, {
      params: {
        keyword: params.keyword,
        limit: params.limit || 10,
        token: token
      },
      timeout: 30000
    });

    console.log('LinkedIn search response:', response.data);
    return processLinkedInData(response.data, params.keyword);
  } catch (error) {
    console.error('LinkedIn search error:', error);
    throw new Error(`LinkedIn search failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

// Facebook Search API
export const searchFacebook = async (params: { keyword: string; limit?: number }) => {
  try {
    console.log(`Searching Facebook for: ${params.keyword}`);
    
    const response = await axios.get(`${baseUrl}/facebook/search`, {
      params: {
        keyword: params.keyword,
        limit: params.limit || 10,
        token: token
      },
      timeout: 30000
    });

    console.log('Facebook search response:', response.data);
    return processFacebookData(response.data, params.keyword);
  } catch (error) {
    console.error('Facebook search error:', error);
    throw new Error(`Facebook search failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

// Process YouTube search data
const processYouTubeData = (data: any, keyword: string): YouTubeVideo[] => {
  const videos: YouTubeVideo[] = [];
  
  // Handle different response structures
  if (data?.data?.posts) {
    data.data.posts.forEach((post: any) => {
      if (post.gridShelfViewModel?.contents) {
        post.gridShelfViewModel.contents.forEach((content: any) => {
          if (content.shortsLockupViewModel) {
            const short = content.shortsLockupViewModel;
            const videoId = short.onTap?.innertubeCommand?.reelWatchEndpoint?.videoId || 
                           short.onTap?.innertubeCommand?.watchEndpoint?.videoId;
            
            if (videoId) {
              videos.push({
                videoId: videoId,
                title: short.accessibilityText?.split(' - ')[0] || `Video about ${keyword}`,
                thumbnail: short.thumbnail?.sources?.[0]?.url || '',
                views: extractViews(short.accessibilityText) || 0,
                publishedAt: new Date().toISOString(),
                channelTitle: 'YouTube Creator',
                description: `Content about ${keyword}`,
                url: `https://youtube.com/shorts/${videoId}`,
                isShorts: true
              });
            }
          }
        });
      }
    });
  }
  
  // Handle direct video data structure
  if (data?.data?.videos) {
    data.data.videos.forEach((video: any) => {
      videos.push({
        videoId: video.id || video.videoId || `video_${Math.random()}`,
        title: video.title || `Video about ${keyword}`,
        thumbnail: video.thumbnail || video.thumbnails?.[0]?.url || '',
        views: video.views || video.viewCount || 0,
        duration: video.duration || '',
        publishedAt: video.publishedAt || video.published_at || new Date().toISOString(),
        channelTitle: video.channelTitle || video.channel?.title || 'YouTube Creator',
        description: video.description || `Content about ${keyword}`,
        url: video.url || `https://youtube.com/watch?v=${video.id || video.videoId}`,
        isShorts: video.isShorts || false
      });
    });
  }
  
  return videos;
};

// Process YouTube hashtag data
const processYouTubeHashtagData = (data: any, hashtag: string): YouTubeVideo[] => {
  return processYouTubeData(data, hashtag);
};

// Process TikTok data
const processTikTokData = (data: any, searchTerm: string): TikTokPost[] => {
  const posts: TikTokPost[] = [];
  
  if (data?.data?.posts) {
    data.data.posts.forEach((post: any, index: number) => {
      posts.push({
        id: post.id || `tiktok_${searchTerm}_${index}`,
        text: post.desc || post.text || `TikTok post about ${searchTerm}`,
        videoUrl: post.video?.playAddr || post.videoUrl || '',
        thumbnail: post.video?.cover || post.thumbnail || '',
        views: post.stats?.playCount || post.views || 0,
        likes: post.stats?.diggCount || post.likes || 0,
        comments: post.stats?.commentCount || post.comments || 0,
        shares: post.stats?.shareCount || post.shares || 0,
        publishedAt: post.createTime ? new Date(post.createTime * 1000).toISOString() : 
                     post.publishedAt || post.published_at || new Date().toISOString(),
        author: {
          username: post.author?.uniqueId || post.author?.username || 'tiktok_user',
          displayName: post.author?.nickname || post.author?.displayName || 'TikTok User',
          avatar: post.author?.avatarMedium || post.author?.avatar || '',
          followers: post.author?.stats?.followerCount || post.author?.followers || 0
        },
        hashtags: extractHashtags(post.desc || post.text || '') || [`#${searchTerm}`],
        url: post.url || `https://tiktok.com/@${post.author?.uniqueId || post.author?.username}/video/${post.id}`
      });
    });
  }
  
  return posts;
};

// Process Instagram data (hashtags, users, places)
const processInstagramData = (data: any, searchText: string): InstagramData => {
  return {
    hashtags: data?.data?.hashtags || [],
    users: data?.data?.users || [],
    places: data?.data?.places || [],
    error: null
  };
};

// Process Threads data
const processThreadsData = (data: any, searchTerm: string): ThreadsPost[] => {
  const posts: ThreadsPost[] = [];
  
  if (data?.data?.posts) {
    data.data.posts.forEach((post: any, index: number) => {
      posts.push({
        id: post.id || `threads_${searchTerm}_${index}`,
        text: post.text || post.content || `Threads post about ${searchTerm}`,
        imageUrl: post.imageUrl || post.image_url || '',
        videoUrl: post.videoUrl || post.video_url || '',
        likes: post.likes || post.likeCount || 0,
        comments: post.comments || post.commentCount || 0,
        shares: post.shares || post.shareCount || 0,
        publishedAt: post.publishedAt || post.published_at || new Date().toISOString(),
        author: {
          username: post.author?.username || 'threads_user',
          displayName: post.author?.displayName || post.author?.name || 'Threads User',
          avatar: post.author?.avatar || '',
          followers: post.author?.followers || 0
        },
        hashtags: extractHashtags(post.text || post.content || '') || [`#${searchTerm}`],
        url: post.url || `https://threads.net/@${post.author?.username}/post/${post.id}`
      });
    });
  }
  
  return posts;
};

// Helper function to extract views from accessibility text
const extractViews = (text: string): number => {
  if (!text) return 0;
  
  const viewMatch = text.match(/(\d+(?:\.\d+)?)\s*(thousand|million|billion|k|m|b)?\s*views/i);
  if (viewMatch) {
    let views = parseFloat(viewMatch[1]);
    const unit = viewMatch[2]?.toLowerCase();
    
    if (unit === 'thousand' || unit === 'k') views *= 1000;
    else if (unit === 'million' || unit === 'm') views *= 1000000;
    else if (unit === 'billion' || unit === 'b') views *= 1000000000;
    
    return Math.floor(views);
  }
  
  return 0;
};

// Helper function to extract hashtags from text
const extractHashtags = (text: string): string[] => {
  if (!text) return [];
  
  const hashtagRegex = /#[\w\u0590-\u05ff]+/g;
  return text.match(hashtagRegex) || [];
};

// Helper function to extract mentions from text
const extractMentions = (text: string): string[] => {
  if (!text) return [];
  
  const mentionRegex = /@[\w\u0590-\u05ff]+/g;
  return text.match(mentionRegex) || [];
};

// Process Reddit data
const processRedditData = (data: any, searchTerm: string): RedditPost[] => {
  const posts: RedditPost[] = [];
  
  if (data?.data?.posts) {
    data.data.posts.forEach((post: any, index: number) => {
      posts.push({
        id: post.id || `reddit_${searchTerm}_${index}`,
        title: post.title || `Reddit post about ${searchTerm}`,
        text: post.selftext || post.text || '',
        url: post.url || `https://reddit.com${post.permalink}`,
        subreddit: post.subreddit || 'unknown',
        author: post.author || 'reddit_user',
        score: post.score || 0,
        upvotes: post.ups || 0,
        downvotes: post.downs || 0,
        comments: post.num_comments || 0,
        publishedAt: post.created_utc ? new Date(post.created_utc * 1000).toISOString() : 
                     post.publishedAt || post.published_at || new Date().toISOString(),
        thumbnail: post.thumbnail || '',
        flair: post.link_flair_text || '',
        nsfw: post.over_18 || false,
        awards: post.total_awards_received || 0
      });
    });
  }
  
  return posts;
};

// Process Twitter data
const processTwitterData = (data: any, searchTerm: string): TwitterPost[] => {
  const posts: TwitterPost[] = [];
  
  if (data?.data?.tweets) {
    data.data.tweets.forEach((tweet: any, index: number) => {
      posts.push({
        id: tweet.id || `twitter_${searchTerm}_${index}`,
        text: tweet.text || tweet.full_text || `Tweet about ${searchTerm}`,
        url: tweet.url || `https://twitter.com/${tweet.user?.screen_name}/status/${tweet.id}`,
        author: {
          username: tweet.user?.screen_name || 'twitter_user',
          displayName: tweet.user?.name || 'Twitter User',
          avatar: tweet.user?.profile_image_url || '',
          followers: tweet.user?.followers_count || 0,
          verified: tweet.user?.verified || false
        },
        likes: tweet.favorite_count || 0,
        retweets: tweet.retweet_count || 0,
        replies: tweet.reply_count || 0,
        publishedAt: tweet.created_at || new Date().toISOString(),
        hashtags: extractHashtags(tweet.text || tweet.full_text || '') || [`#${searchTerm.replace(/\s+/g, '')}`],
        mentions: extractMentions(tweet.text || tweet.full_text || ''),
        media: tweet.entities?.media || [],
        isRetweet: tweet.retweeted_status ? true : false,
        originalTweet: tweet.retweeted_status || null
      });
    });
  }
  
  return posts;
};

// Process LinkedIn data
const processLinkedInData = (data: any, searchTerm: string): LinkedInPost[] => {
  const posts: LinkedInPost[] = [];
  
  if (data?.data?.posts) {
    data.data.posts.forEach((post: any, index: number) => {
      posts.push({
        id: post.id || `linkedin_${searchTerm}_${index}`,
        text: post.text || post.content || `LinkedIn post about ${searchTerm}`,
        url: post.url || `https://linkedin.com/posts/${post.id}`,
        author: {
          name: post.author?.name || 'LinkedIn User',
          title: post.author?.title || '',
          company: post.author?.company || '',
          avatar: post.author?.avatar || '',
          followers: post.author?.followers || 0
        },
        likes: post.likes || 0,
        comments: post.comments || 0,
        shares: post.shares || 0,
        publishedAt: post.publishedAt || post.published_at || new Date().toISOString(),
        hashtags: extractHashtags(post.text || post.content || '') || [`#${searchTerm.replace(/\s+/g, '')}`],
        media: post.media || [],
        engagement: post.engagement || 0
      });
    });
  }
  
  return posts;
};

// Process Facebook data
const processFacebookData = (data: any, searchTerm: string): FacebookPost[] => {
  const posts: FacebookPost[] = [];
  
  if (data?.data?.posts) {
    data.data.posts.forEach((post: any, index: number) => {
      posts.push({
        id: post.id || `facebook_${searchTerm}_${index}`,
        text: post.message || post.text || `Facebook post about ${searchTerm}`,
        url: post.url || `https://facebook.com/posts/${post.id}`,
        author: {
          name: post.author?.name || 'Facebook User',
          avatar: post.author?.avatar || '',
          followers: post.author?.followers || 0
        },
        likes: post.likes || 0,
        comments: post.comments || 0,
        shares: post.shares || 0,
        publishedAt: post.created_time || post.publishedAt || new Date().toISOString(),
        media: post.media || [],
        reactions: post.reactions || {},
        privacy: post.privacy || 'public'
      });
    });
  }
  
  return posts;
};

// Main function to search all platforms
export const searchAllPlatforms = async (keyword: string) => {
  console.log(`Starting comprehensive search for: ${keyword}`);
  
  const results = {
    keyword,
    timestamp: new Date().toISOString(),
    platforms: {
      youtube: { 
        videos: [] as YouTubeVideo[], 
        hashtags: [] as YouTubeVideo[], 
        error: null as string | null 
      },
      tiktok: { 
        posts: [] as TikTokPost[], 
        error: null as string | null 
      },
      instagram: { 
        hashtags: [] as any[], 
        users: [] as any[], 
        places: [] as any[], 
        error: null as string | null 
      },
      threads: { 
        posts: [] as ThreadsPost[], 
        error: null as string | null 
      },
      reddit: { 
        posts: [] as RedditPost[], 
        error: null as string | null 
      },
      twitter: { 
        posts: [] as TwitterPost[], 
        error: null as string | null 
      },
      linkedin: { 
        posts: [] as LinkedInPost[], 
        error: null as string | null 
      },
      facebook: { 
        posts: [] as FacebookPost[], 
        error: null as string | null 
      }
    }
  };

  // Search YouTube keyword
  try {
    const youtubeVideos = await searchYouTube({ keyword });
    results.platforms.youtube.videos = youtubeVideos;
  } catch (error) {
    results.platforms.youtube.error = error instanceof Error ? error.message : 'Unknown error';
  }

  // Search YouTube hashtag
  try {
    const youtubeHashtags = await searchYouTubeHashtag({ name: keyword });
    results.platforms.youtube.hashtags = youtubeHashtags;
  } catch (error) {
    console.warn('YouTube hashtag search failed:', error);
  }

  // Search TikTok hashtag
  try {
    const tiktokHashtagPosts = await searchTikTokHashtag({ name: keyword });
    results.platforms.tiktok.posts = [...results.platforms.tiktok.posts, ...tiktokHashtagPosts];
  } catch (error) {
    console.warn('TikTok hashtag search failed:', error);
  }

  // Search TikTok keyword
  try {
    const tiktokKeywordPosts = await searchTikTokKeyword({ name: keyword });
    results.platforms.tiktok.posts = [...results.platforms.tiktok.posts, ...tiktokKeywordPosts];
  } catch (error) {
    console.warn('TikTok keyword search failed:', error);
  }

  // Search Instagram
  try {
    const instagramData = await searchInstagram({ text: keyword });
    results.platforms.instagram = instagramData;
  } catch (error) {
    results.platforms.instagram.error = error instanceof Error ? error.message : 'Unknown error';
  }

  // Search Threads
  try {
    const threadsPosts = await searchThreadsKeyword({ name: keyword });
    results.platforms.threads.posts = threadsPosts;
  } catch (error) {
    results.platforms.threads.error = error instanceof Error ? error.message : 'Unknown error';
  }

  // Search Reddit
  try {
    const redditPosts = await searchReddit({ keyword });
    results.platforms.reddit.posts = redditPosts;
  } catch (error) {
    results.platforms.reddit.error = error instanceof Error ? error.message : 'Unknown error';
  }

  // Search Twitter/X
  try {
    const twitterPosts = await searchTwitter({ keyword });
    results.platforms.twitter.posts = twitterPosts;
  } catch (error) {
    results.platforms.twitter.error = error instanceof Error ? error.message : 'Unknown error';
  }

  // Search LinkedIn
  try {
    const linkedinPosts = await searchLinkedIn({ keyword });
    results.platforms.linkedin.posts = linkedinPosts;
  } catch (error) {
    results.platforms.linkedin.error = error instanceof Error ? error.message : 'Unknown error';
  }

  // Search Facebook
  try {
    const facebookPosts = await searchFacebook({ keyword });
    results.platforms.facebook.posts = facebookPosts;
  } catch (error) {
    results.platforms.facebook.error = error instanceof Error ? error.message : 'Unknown error';
  }

  console.log('Comprehensive search completed:', results);
  return results;
};

export default {
  searchYouTube,
  searchYouTubeHashtag,
  searchTikTokHashtag,
  searchTikTokKeyword,
  searchInstagram,
  searchThreadsKeyword,
  searchReddit,
  searchTwitter,
  searchLinkedIn,
  searchFacebook,
  searchAllPlatforms
};