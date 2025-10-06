'use client';

import { useState, useEffect, useRef } from 'react';
import {
  Search,
  Filter,
  RefreshCw,
  Youtube,
  Instagram,
  Music,
  Users,
  Calendar,
  Eye,
  TrendingUp,
  AlertCircle,
  Sparkles,
  Play,
  CheckCircle,
  BarChart3,
  TrendingUp as TrendingUpIcon,
  TrendingDown,
  Minus,
  Brain,
  Target,
  Zap,
  Activity
} from 'lucide-react';
import { useSelector } from 'react-redux';
import { RootState } from '../../../lib/store';
import { 
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  Legend, LineChart, Line, AreaChart, Area, ScatterChart, Scatter
} from 'recharts';
import ExportButton from '../../../components/ExportButton';
import { createSocialListeningFinderExportData, createSentimentAnalysisExportData } from '../../../utils/exportUtils';
import styles from './page.module.scss';

interface SearchResult {
  platform: string;
  success: boolean;
  data?: any;
  error?: string;
  keyword: string;
  note?: string;
}

interface SearchFilters {
  sorting: 'relevance' | 'date' | 'views';
  period: '24h' | '7d' | '30d' | 'overall';
  depth: string;
  platform: 'youtube' | 'instagram' | 'tiktok';
}

interface SentimentInsights {
  keyword: string;
  totalContent: number;
  overallSentiment: number;
  sentimentDistribution: {
    positive: { count: number; percentage: number };
    negative: { count: number; percentage: number };
    neutral: { count: number; percentage: number };
  };
  confidence: number;
  topWords: Array<{ word: string; count: number }>;
  insights: {
    sentimentTrend: 'positive' | 'negative' | 'neutral';
    confidenceLevel: 'high' | 'medium' | 'low';
    dominantSentiment: 'positive' | 'negative' | 'neutral';
  };
}

interface PlatformSentimentResult {
  data?: any;
  sentimentResults: Array<{
    score: number;
    category: 'positive' | 'negative' | 'neutral';
    confidence: number;
    words: { positive: string[]; negative: string[]; neutral: string[] };
    platform: string;
    originalText: string;
  }>;
  contentCount: number;
  error?: string;
}

interface SentimentAnalysisResponse {
  success: boolean;
  keyword: string;
  platforms: string[];
  insights: SentimentInsights;
  platformResults: { [key: string]: PlatformSentimentResult };
  timestamp: string;
}

export default function SocialListeningFinderPage() {
  const { user } = useSelector((state: RootState) => state.user);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const [sentimentAnalysis, setSentimentAnalysis] = useState<SentimentAnalysisResponse | null>(null);
  const [isAnalyzingSentiment, setIsAnalyzingSentiment] = useState(false);
  const [showSentimentInsights, setShowSentimentInsights] = useState(false);
  const [filters, setFilters] = useState<SearchFilters>({
    sorting: 'relevance',
    period: 'overall',
    depth: '1',
    platform: 'youtube'
  });

  // Refs for PDF export
  const resultsSectionRef = useRef<HTMLDivElement>(null);
  const sentimentSectionRef = useRef<HTMLDivElement>(null);

  // Load search history from localStorage on component mount
  useEffect(() => {
    const savedHistory = localStorage.getItem('socialSearchHistory');
    if (savedHistory) {
      setSearchHistory(JSON.parse(savedHistory));
    }
  }, []);

  // Save search history to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('socialSearchHistory', JSON.stringify(searchHistory));
  }, [searchHistory]);

  const saveToSearchHistory = (query: string) => {
    if (query && !searchHistory.includes(query)) {
      setSearchHistory(prev => [query, ...prev.slice(0, 9)]); // Keep last 10 searches
    }
  };

  // Sentiment Analysis Function
  const performSentimentAnalysis = async (keyword: string) => {
    if (!keyword.trim()) return;

    setIsAnalyzingSentiment(true);
    try {
      const response = await fetch('/api/sentiment-analysis', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          keyword: keyword.trim(),
          platforms: ['youtube', 'instagram', 'tiktok']
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.success) {
        setSentimentAnalysis(data);
        setShowSentimentInsights(true);
      } else {
        console.error('Sentiment analysis failed:', data.error);
        setSentimentAnalysis(null);
        setShowSentimentInsights(false);
      }
    } catch (error) {
      console.error('Sentiment analysis error:', error);
      setSentimentAnalysis(null);
      setShowSentimentInsights(false);
    } finally {
      setIsAnalyzingSentiment(false);
    }
  };

  const handleSearch = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    saveToSearchHistory(searchQuery.trim());

    try {
      const response = await fetch('/api/ensemble/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          keyword: searchQuery.trim(),
          sorting: filters.sorting,
          period: filters.period,
          depth: filters.depth,
          platform: filters.platform
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.success) {
        setSearchResults([data]); // Wrap the single result in an array
        
        // Trigger sentiment analysis
        await performSentimentAnalysis(searchQuery.trim());
      } else {
        setSearchResults([]);
        setSentimentAnalysis(null);
        setShowSentimentInsights(false);
      }
    } catch (error) {
      console.error('Search error:', error);
      setSearchResults([]);
      setSentimentAnalysis(null);
      setShowSentimentInsights(false);
    } finally {
      setIsSearching(false);
    }
  };

  const renderInstagramContent = (item: any) => {
    // Handle Instagram user/hashtag structure from the API
    if (item.user) {
      // This is a user result
      const user = item.user;
      const username = user.username || 'Unknown User';
      const fullName = user.full_name || username;
      const profilePic = user.profile_pic_url || user.profile_picture_url;
      const isVerified = user.is_verified || false;
      const userId = user.pk || user.id;
      const profileUrl = `https://instagram.com/${username}/`;
      
      return (
        <article key={userId || Math.random()} className={styles.instagramCard}>
          <div className={styles.cardContent}>
                  <div className={styles.postMedia}>
                    <div className={styles.profileFallback}>
                      <span className={styles.fallbackText}>
                        {username.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  </div>
            
            <div className={styles.postInfo}>
              <div className={styles.userInfo}>
                <div className={styles.userDetails}>
                  <h4 className={styles.username}>
                    @{username}
                    {isVerified && <span className={styles.verifiedBadge}>✓</span>}
                  </h4>
                  <p className={styles.fullName}>{fullName}</p>
                </div>
              </div>
              
              <div className={styles.postCaption}>
                <p className={styles.captionText}>
                  Instagram Profile
                </p>
              </div>
              
              <a 
                href={profileUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className={styles.postLink}
              >
                View Profile
              </a>
            </div>
          </div>
        </article>
      );
    } else if (item.hashtag) {
      // This is a hashtag result
      const hashtag = item.hashtag;
      const name = hashtag.name || 'Unknown Hashtag';
      const mediaCount = hashtag.media_count || 0;
      const hashtagId = hashtag.id;
      const hashtagUrl = `https://instagram.com/explore/tags/${name}/`;
      
      return (
        <article key={hashtagId || Math.random()} className={styles.instagramCard}>
          <div className={styles.cardContent}>
            <div className={styles.postMedia}>
              <div className={styles.hashtagIcon}>#</div>
            </div>
            
            <div className={styles.postInfo}>
              <div className={styles.userInfo}>
                <div className={styles.userDetails}>
                  <h4 className={styles.username}>#{name}</h4>
                  <p className={styles.fullName}>Hashtag</p>
                </div>
              </div>
              
              <div className={styles.postCaption}>
                <p className={styles.captionText}>
                  {mediaCount.toLocaleString()} posts
                </p>
              </div>
              
              <a 
                href={hashtagUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className={styles.postLink}
              >
                View Hashtag
              </a>
            </div>
          </div>
        </article>
      );
    } else {
      // Fallback for other data structures
      return (
        <article key={Math.random()} className={styles.instagramCard}>
          <div className={styles.cardContent}>
            <div className={styles.postInfo}>
              <div className={styles.userInfo}>
                <div className={styles.userDetails}>
                  <h4 className={styles.username}>Instagram Result</h4>
                </div>
              </div>
              
              <div className={styles.postCaption}>
                <p className={styles.captionText}>
                  {JSON.stringify(item, null, 2).substring(0, 200)}...
                </p>
              </div>
            </div>
          </div>
        </article>
      );
    }
  };

  const renderTikTokContent = (item: any) => {
    // Handle TikTok video structure from the API
    const video = item.aweme_info || item;
    const videoId = video.aweme_id || video.id || 'unknown';
    const description = video.desc || video.description || 'No description available';
    const author = video.author || {};
    const authorName = author.nickname || author.unique_id || 'Unknown User';
    const authorUsername = author.unique_id || author.nickname || 'unknown_user';
    const authorAvatar = author.avatar_larger?.url_list?.[0] || author.avatar_thumb?.url_list?.[0] || author.avatar_url;
    const videoUrl = video.share_url || video.web_video_url || video.play_url || video.video?.play_addr?.url_list?.[0];
    const coverImage = video.video?.cover?.url_list?.[0] || video.video?.origin_cover?.url_list?.[0] || video.cover_url;
    const stats = video.statistics || {};
    const likeCount = stats.digg_count || stats.like_count || 0;
    const commentCount = stats.comment_count || 0;
    const shareCount = stats.share_count || 0;
    const playCount = stats.play_count || stats.view_count || 0;
    const duration = video.video?.duration || 0;
    
    return (
      <article key={videoId} className={styles.tiktokCard}>
        <div className={styles.cardContent}>
          <div className={styles.postMedia}>
            {coverImage ? (
              <img 
                src={coverImage} 
                alt={description.substring(0, 50)}
                className={styles.mediaImage}
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                  const fallback = target.nextElementSibling as HTMLElement;
                  if (fallback) fallback.style.display = 'flex';
                }}
              />
            ) : null}
            <div 
              className={styles.videoFallback}
              style={{ display: coverImage ? 'none' : 'flex' }}
            >
              <Music className={styles.fallbackIcon} />
            </div>
            <div className={styles.playOverlay}>
              <Play className={styles.playIcon} />
            </div>
          </div>
          
          <div className={styles.postInfo}>
            <div className={styles.userInfo}>
              <div className={styles.userAvatar}>
                {authorAvatar ? (
                  <img 
                    src={authorAvatar} 
                    alt={authorName}
                    className={styles.avatarImage}
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                      const fallback = target.nextElementSibling as HTMLElement;
                      if (fallback) fallback.style.display = 'flex';
                    }}
                  />
                ) : null}
                <div 
                  className={styles.avatarFallback}
                  style={{ display: authorAvatar ? 'none' : 'flex' }}
                >
                  <span className={styles.avatarText}>
                    {authorName.charAt(0).toUpperCase()}
                  </span>
                </div>
              </div>
              <div className={styles.userDetails}>
                <h4 className={styles.username}>@{authorUsername}</h4>
                <p className={styles.fullName}>{authorName}</p>
              </div>
            </div>
            
            <div className={styles.postCaption}>
              <p className={styles.captionText}>
                {description.length > 150 ? `${description.substring(0, 150)}...` : description}
              </p>
            </div>
            
            <div className={styles.postStats}>
              <div className={styles.statItem}>
                <Eye className={styles.statIcon} />
                <span className={styles.statValue}>{playCount.toLocaleString()}</span>
                <span className={styles.statLabel}>views</span>
              </div>
              <div className={styles.statItem}>
                <TrendingUp className={styles.statIcon} />
                <span className={styles.statValue}>{likeCount.toLocaleString()}</span>
                <span className={styles.statLabel}>likes</span>
              </div>
              <div className={styles.statItem}>
                <Users className={styles.statIcon} />
                <span className={styles.statValue}>{commentCount.toLocaleString()}</span>
                <span className={styles.statLabel}>comments</span>
              </div>
            </div>
            
            {videoUrl && (
              <a 
                href={videoUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className={styles.postLink}
              >
                Watch on TikTok
              </a>
            )}
          </div>
        </div>
      </article>
    );
  };

  const renderYouTubeContent = (item: any) => {
    // Handle the videoRenderer structure from the API
    let videoInfo = item;

    // Extract video info from videoRenderer if present
    if (item.videoRenderer) {
      videoInfo = item.videoRenderer;
    }

    // Extract video data with fallbacks
    const videoId = videoInfo.videoId;
    const title = videoInfo.title?.runs?.[0]?.text || 'YouTube Video';
    const channelName = videoInfo.longBylineText?.runs?.[0]?.text ||
                       videoInfo.shortBylineText?.runs?.[0]?.text ||
                       'Unknown Channel';
    const thumbnail = videoInfo.thumbnail?.thumbnails?.[0]?.url;
    const channelAvatar = videoInfo.channelThumbnailSupportedRenderers?.channelThumbnailWithLinkRenderer?.thumbnail?.thumbnails?.[0]?.url;
    const publishedTime = videoInfo.publishedTimeText?.simpleText;
    const viewCount = videoInfo.viewCountText?.simpleText || videoInfo.shortViewCountText?.simpleText;
    const duration = videoInfo.lengthText?.simpleText;
    
    return (
      <article key={videoId || Math.random()} className={styles.youtubeCard}>
        <div className={styles.cardContent}>
          <div className={styles.videoThumbnail}>
            {thumbnail && (
              <img 
                src={thumbnail} 
                alt={title}
                className={styles.thumbnailImage}
              />
            )}
            <div className={styles.playButton}>
              <Play className={styles.playIcon} />
            </div>
            {duration && (
              <div className={styles.videoDuration}>
                {duration}
              </div>
            )}
          </div>
          
          <div className={styles.videoInfo}>
            <div className={styles.channelInfo}>
              {channelAvatar && (
                <img 
                  src={channelAvatar} 
                  alt={channelName}
                  className={styles.channelAvatar}
                />
              )}
              <div className={styles.channelDetails}>
                <h4 className={styles.channelName}>{channelName}</h4>
                <div className={styles.videoStats}>
                  <span className={styles.views}>{viewCount}</span>
                  <span className={styles.sep}>•</span>
                  <span className={styles.date}>{publishedTime}</span>
                </div>
              </div>
            </div>
            
            <h3 className={styles.videoTitle}>
              <a 
                href={`https://youtube.com/watch?v=${videoId}`} 
                target="_blank" 
                rel="noopener noreferrer"
                className={styles.videoLink}
              >
                {title}
              </a>
            </h3>
            
            {/* Video badges if available */}
            {videoInfo.badges && videoInfo.badges.length > 0 && (
              <div className={styles.videoBadges}>
                {videoInfo.badges.map((badge: any, index: number) => (
                  <span key={index} className={styles.badge}>
                    {badge.metadataBadgeRenderer?.label || badge.label}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </article>
    );
  };

  const renderContent = (result: SearchResult) => {
    if (!result.success || !result.data) {
      return (
        <div className={styles.errorMessage}>
          <AlertCircle className={styles.errorIcon} />
          Failed to fetch {filters.platform} data: {result.error || 'Unknown error'}
        </div>
      );
    }

    const data = result.data;
    let content = [];
    
    if (filters.platform === 'youtube') {
      // Handle YouTube API data structure - the structure is: data.data.posts
    if (data && data.data && data.data.posts && Array.isArray(data.data.posts)) {
      content = data.data.posts;
    } else {
      console.error('Expected data.data.posts structure not found:', data);
      return (
        <div className={styles.errorMessage}>
          <AlertCircle className={styles.errorIcon} />
          Expected 'posts' array not found in API response.
        </div>
      );
    }
    
    if (!Array.isArray(content) || content.length === 0) {
      return (
        <div className={styles.noResults}>
          <AlertCircle className={styles.noResultsIcon} />
          <h3>No YouTube videos found</h3>
          <p>Try searching with different keywords.</p>
        </div>
      );
    }
    
    // Filter only videoRenderer items for proper rendering
    const videoItems = content.filter(item => item.videoRenderer);
    
    // Render YouTube content - pass the videoRenderer object directly
    return videoItems.map((item: any) => renderYouTubeContent(item.videoRenderer));
    } else if (filters.platform === 'instagram') {
      // Handle Instagram API data structure - extract users and hashtags
      let users = [];
      let hashtags = [];
      
      if (data && data.data) {
        if (data.data.users && Array.isArray(data.data.users)) {
          users = data.data.users.map((user: any) => ({ user: user.user }));
        }
        if (data.data.hashtags && Array.isArray(data.data.hashtags)) {
          hashtags = data.data.hashtags.map((hashtag: any) => ({ hashtag: hashtag.hashtag }));
        }
      }
      
      content = [...users, ...hashtags];
      
      if (!Array.isArray(content) || content.length === 0) {
        return (
          <div className={styles.noResults}>
            <AlertCircle className={styles.noResultsIcon} />
            <h3>No Instagram results found</h3>
            <p>Try searching with different keywords.</p>
          </div>
        );
      }
      
      // Render Instagram content
      return content.map((item: any) => renderInstagramContent(item));
    } else if (filters.platform === 'tiktok') {
      // Handle TikTok API data structure - extract videos
      if (data && data.data && data.data.data && Array.isArray(data.data.data)) {
        content = data.data.data;
      } else {
        console.error('Expected data.data.data structure not found:', data);
        return (
          <div className={styles.errorMessage}>
            <AlertCircle className={styles.errorIcon} />
            Expected 'data' array not found in API response.
          </div>
        );
      }
      
      if (!Array.isArray(content) || content.length === 0) {
        return (
          <div className={styles.noResults}>
            <AlertCircle className={styles.noResultsIcon} />
            <h3>No TikTok videos found</h3>
            <p>Try searching with different keywords.</p>
          </div>
        );
      }
      
      // Render TikTok content
      return content.map((item: any) => renderTikTokContent(item));
    }
    
    return null;
  };

  const totalResults = searchResults.length > 0 && searchResults[0].success ? 
    (filters.platform === 'youtube' ? 
      (searchResults[0].data?.data?.posts ? searchResults[0].data.data.posts.filter((item: any) => item.videoRenderer).length : 0) :
      filters.platform === 'instagram' ?
      (() => {
        const data = searchResults[0].data;
        if (data && data.data) {
          const users = data.data.users ? data.data.users.length : 0;
          const hashtags = data.data.hashtags ? data.data.hashtags.length : 0;
          return users + hashtags;
        }
        return 0;
      })() :
      filters.platform === 'tiktok' ?
      (searchResults[0].data?.data?.data ? searchResults[0].data.data.data.length : 0) :
      0
    ) : 0;
  
  const hasResults = searchResults.length > 0 && searchResults[0].success;

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.titleSection}>
          <h1 className={styles.title}>
            <Sparkles className={styles.titleIcon} />
            Social Listening Finder
          </h1>
          <p className={styles.subtitle}>
            Discover trending content and viral posts across social platforms
          </p>
        </div>

        <div className={styles.searchSection}>
          <div className={styles.platformSelector}>
            <label className={styles.platformLabel}>Platform:</label>
            <select
              value={filters.platform}
              onChange={(e) => setFilters(prev => ({ ...prev, platform: e.target.value as any }))}
              className={styles.platformDropdown}
            >
              <option value="youtube">YouTube</option>
              <option value="instagram">Instagram</option>
              <option value="tiktok">TikTok</option>
            </select>
          </div>
          <form onSubmit={handleSearch} className={styles.searchInput}>
            <Search className={styles.searchIcon} />
            <input
              type="text"
              placeholder={`Search for ${filters.platform === 'youtube' ? 'YouTube videos' : filters.platform === 'instagram' ? 'Instagram posts' : 'TikTok videos'} (e.g., 'AI trends', 'cooking tutorials')`}
              className={styles.inputField}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button type="submit" className={styles.searchButton} disabled={isSearching}>
              {isSearching ? <RefreshCw className={styles.spinner} /> : 'Search'}
            </button>
          </form>
          <button className={styles.filterButton} onClick={() => setShowFilters(!showFilters)}>
            <Filter className={styles.filterIcon} />
            Filters
          </button>
          <button 
            className={styles.sentimentButton} 
            onClick={() => performSentimentAnalysis(searchQuery)}
            disabled={!searchQuery.trim() || isAnalyzingSentiment}
          >
            <Brain className={styles.sentimentIcon} />
            {isAnalyzingSentiment ? 'Analyzing...' : 'Sentiment Analysis'}
          </button>
        </div>

        {showFilters && (
          <div className={styles.filtersPanel}>
            <h3>Search Filters</h3>
            <div className={styles.filterGroup}>
              <label>Sorting:</label>
              <select
                value={filters.sorting}
                onChange={(e) => setFilters(prev => ({ ...prev, sorting: e.target.value as any }))}
                className={styles.selectDropdown}
              >
                <option value="relevance">Relevance</option>
                <option value="date">Date</option>
                <option value="views">Views</option>
              </select>
            </div>
            <div className={styles.filterGroup}>
              <label>Time Period:</label>
              <select
                value={filters.period}
                onChange={(e) => setFilters(prev => ({ ...prev, period: e.target.value as any }))}
                className={styles.selectDropdown}
              >
                <option value="24h">Last 24 Hours</option>
                <option value="7d">Last 7 Days</option>
                <option value="30d">Last 30 Days</option>
                <option value="overall">Overall</option>
              </select>
            </div>
            <div className={styles.filterGroup}>
              <label>Search Depth:</label>
              <select
                value={filters.depth}
                onChange={(e) => setFilters(prev => ({ ...prev, depth: e.target.value }))}
                className={styles.selectDropdown}
              >
                <option value="1">Surface (1)</option>
                <option value="2">Deep (2)</option>
                <option value="3">Comprehensive (3)</option>
              </select>
            </div>
          </div>
        )}
        
        {hasResults && totalResults > 0 && (
          <div className={styles.searchSuccess}>
            <CheckCircle className={styles.successIcon} />
            <span>Found {totalResults} {filters.platform === 'youtube' ? 'YouTube videos' : filters.platform === 'instagram' ? 'Instagram posts' : 'TikTok videos'} for "{searchQuery}"</span>
          </div>
        )}
        
        {hasResults && searchResults[0].note && (
          <div className={styles.mockDataNotice}>
            <span>📝 {searchResults[0].note}</span>
          </div>
        )}
      </div>

      {searchHistory.length > 0 && (
        <div className={styles.historySection}>
          <h3>Recent Searches</h3>
          <div className={styles.historyTags}>
            {searchHistory.map((query, index) => (
              <span key={index} className={styles.historyTag} onClick={() => setSearchQuery(query)}>
                {query}
              </span>
            ))}
          </div>
        </div>
      )}

      {searchResults.length > 0 && (
        <div className={styles.resultsHeader}>
          <div className={styles.resultsInfo}>
            <h2>{filters.platform === 'youtube' ? 'YouTube Videos' : filters.platform === 'instagram' ? 'Instagram Posts' : 'TikTok Videos'}</h2>
            <span className={styles.resultsCount}>
              Found {totalResults} {filters.platform === 'youtube' ? 'videos' : filters.platform === 'instagram' ? 'posts' : 'videos'}
            </span>
          </div>
          <div className={styles.exportSection}>
            <ExportButton
              data={createSocialListeningFinderExportData(searchResults, searchQuery, filters.platform)}
              variant="primary"
              size="medium"
              showLabel={true}
              targetElementRef={resultsSectionRef}
            />
          </div>
        </div>
      )}

      <div ref={resultsSectionRef} className={styles.resultsContainer}>
        {searchResults.length > 0 && searchResults[0].success ? (
          <div className={styles.platformSection}>
            <div className={styles.platformHeader}>
              {filters.platform === 'youtube' ? (
              <Youtube className={styles.platformIcon} style={{ color: '#FF0000' }} />
              ) : filters.platform === 'instagram' ? (
                <Instagram className={styles.platformIcon} style={{ color: '#E4405F' }} />
              ) : (
                <Music className={styles.platformIcon} style={{ color: '#000000' }} />
              )}
              <h3>
                {filters.platform === 'youtube' ? 'YouTube Videos' : filters.platform === 'instagram' ? 'Instagram Posts' : 'TikTok Videos'}
                <span className={styles.resultCount}>
                  ({totalResults} results)
                </span>
              </h3>
            </div>
            
            <div className={styles.contentGrid}>
              {renderContent(searchResults[0])}
            </div>
          </div>
        ) : searchResults.length > 0 && !searchResults[0].success ? (
          <div className={styles.noResults}>
            <AlertCircle className={styles.noResultsIcon} />
            <h3>No {filters.platform === 'youtube' ? 'YouTube videos' : filters.platform === 'instagram' ? 'Instagram posts' : 'TikTok videos'} found</h3>
            <p>Try searching with different keywords.</p>
          </div>
        ) : (
          !isSearching && (
            <div className={styles.welcomeSection}>
              <Sparkles className={styles.welcomeIcon} />
              <h2>Welcome to Social Listening Finder</h2>
              <p>Search across social platforms to discover trending content, viral posts, and popular creators.</p>
              <div className={styles.features}>
                <div className={styles.feature}>
                  <Youtube className={styles.featureIcon} />
                  <h4>YouTube Video Search</h4>
                  <p>Find trending videos and channels</p>
                </div>
                <div className={styles.feature}>
                  <Instagram className={styles.featureIcon} />
                  <h4>Instagram Post Search</h4>
                  <p>Discover viral posts and influencers</p>
                </div>
                <div className={styles.feature}>
                  <TrendingUp className={styles.featureIcon} />
                  <h4>Trend Analysis</h4>
                  <p>Track viral content and engagement</p>
                </div>
              </div>
            </div>
          )
        )}

        {/* Sentiment Analysis & Insights Dashboard */}
        {showSentimentInsights && sentimentAnalysis && (
          <div ref={sentimentSectionRef} className={styles.sentimentDashboard}>
            <div className={styles.sentimentHeader}>
              <Brain className={styles.sentimentIcon} />
              <h3>Sentiment Analysis & Insights for "{sentimentAnalysis.keyword}"</h3>
              <div className={styles.sentimentScore}>
                <span className={styles.scoreLabel}>Overall Sentiment:</span>
                <span className={`${styles.scoreValue} ${sentimentAnalysis.insights.overallSentiment > 0 ? styles.positive : sentimentAnalysis.insights.overallSentiment < 0 ? styles.negative : styles.neutral}`}>
                  {sentimentAnalysis.insights.overallSentiment > 0 ? (
                    <>
                      <TrendingUpIcon className={styles.trendIcon} />
                      Positive ({Math.round(sentimentAnalysis.insights.overallSentiment * 100)}%)
                    </>
                  ) : sentimentAnalysis.insights.overallSentiment < 0 ? (
                    <>
                      <TrendingDown className={styles.trendIcon} />
                      Negative ({Math.round(Math.abs(sentimentAnalysis.insights.overallSentiment) * 100)}%)
                    </>
                  ) : (
                    <>
                      <Minus className={styles.trendIcon} />
                      Neutral
                    </>
                  )}
                </span>
              </div>
              <div className={styles.sentimentExportSection}>
                <ExportButton
                  data={createSentimentAnalysisExportData(sentimentAnalysis)}
                  variant="secondary"
                  size="small"
                  showLabel={true}
                  targetElementRef={sentimentSectionRef}
                />
              </div>
            </div>

            {/* Key Metrics Cards */}
            <div className={styles.metricsGrid}>
              <div className={styles.metricCard}>
                <div className={styles.metricIcon}>
                  <Target className={styles.positiveIcon} />
                </div>
                <div className={styles.metricContent}>
                  <h4>Total Content Analyzed</h4>
                  <p className={styles.metricNumber}>{sentimentAnalysis.insights.totalContent}</p>
                  <p className={styles.metricSubtext}>across all platforms</p>
                </div>
              </div>
              
              <div className={styles.metricCard}>
                <div className={styles.metricIcon}>
                  <Zap className={styles.confidenceIcon} />
                </div>
                <div className={styles.metricContent}>
                  <h4>Analysis Confidence</h4>
                  <p className={styles.metricNumber}>{Math.round(sentimentAnalysis.insights.confidence * 100)}%</p>
                  <p className={styles.metricSubtext}>
                    {sentimentAnalysis.insights.insights.confidenceLevel} confidence
                  </p>
                </div>
              </div>
              
              <div className={styles.metricCard}>
                <div className={styles.metricIcon}>
                  <Activity className={styles.trendIcon} />
                </div>
                <div className={styles.metricContent}>
                  <h4>Sentiment Trend</h4>
                  <p className={styles.metricNumber}>
                    {sentimentAnalysis.insights.insights.sentimentTrend.charAt(0).toUpperCase() + 
                     sentimentAnalysis.insights.insights.sentimentTrend.slice(1)}
                  </p>
                  <p className={styles.metricSubtext}>
                    {sentimentAnalysis.insights.insights.dominantSentiment} dominant
                  </p>
                </div>
              </div>
            </div>

            {/* Charts Section */}
            <div className={styles.chartsSection}>
              {/* Sentiment Distribution Pie Chart */}
              <div className={styles.chartCard}>
                <h4>Sentiment Distribution</h4>
                <div className={styles.pieChartContainer}>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={[
                          { name: 'Positive', value: sentimentAnalysis.insights.sentimentDistribution.positive.count, color: '#0093DD' },
                          { name: 'Negative', value: sentimentAnalysis.insights.sentimentDistribution.negative.count, color: '#dc2626' },
                          { name: 'Neutral', value: sentimentAnalysis.insights.sentimentDistribution.neutral.count, color: '#6b7280' }
                        ]}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {[
                          { name: 'Positive', value: sentimentAnalysis.insights.sentimentDistribution.positive.count, color: '#0093DD' },
                          { name: 'Negative', value: sentimentAnalysis.insights.sentimentDistribution.negative.count, color: '#dc2626' },
                          { name: 'Neutral', value: sentimentAnalysis.insights.sentimentDistribution.neutral.count, color: '#6b7280' }
                        ].map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Platform Comparison Bar Chart */}
              <div className={styles.chartCard}>
                <h4>Sentiment by Platform</h4>
                <div className={styles.barChartContainer}>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={Object.entries(sentimentAnalysis.platformResults).map(([platform, result]) => ({
                      platform: platform.charAt(0).toUpperCase() + platform.slice(1),
                      positive: (result.sentimentResults || []).filter(r => r.category === 'positive').length,
                      negative: (result.sentimentResults || []).filter(r => r.category === 'negative').length,
                      neutral: (result.sentimentResults || []).filter(r => r.category === 'neutral').length
                    }))}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="platform" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="positive" stackId="a" fill="#0093DD" name="Positive" />
                      <Bar dataKey="negative" stackId="a" fill="#dc2626" name="Negative" />
                      <Bar dataKey="neutral" stackId="a" fill="#6b7280" name="Neutral" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* Word Cloud Section */}
            <div className={styles.wordCloudSection}>
              <h4>Trending Keywords</h4>
              <div className={styles.wordCloud}>
                {sentimentAnalysis.insights.topWords.slice(0, 30).map((word, index) => (
                  <span
                    key={index}
                    className={styles.wordCloudItem}
                    style={{
                      fontSize: `${Math.min(24, Math.max(12, word.count * 2))}px`,
                      opacity: Math.min(1, word.count / 10),
                      color: index % 3 === 0 ? '#0093DD' : index % 3 === 1 ? '#004163' : '#0093DD'
                    }}
                  >
                    {word.word}
                  </span>
                ))}
              </div>
            </div>

            {/* Detailed Platform Analysis */}
            <div className={styles.platformAnalysis}>
              <h4>Platform Analysis</h4>
              <div className={styles.platformCards}>
                {Object.entries(sentimentAnalysis.platformResults).map(([platform, result]) => (
                  <div key={platform} className={styles.platformCard}>
                    <div className={styles.platformHeader}>
                      {platform === 'youtube' && <Youtube className={styles.platformIcon} />}
                      {platform === 'instagram' && <Instagram className={styles.platformIcon} />}
                      {platform === 'tiktok' && <Music className={styles.platformIcon} />}
                      <h5>{platform.charAt(0).toUpperCase() + platform.slice(1)}</h5>
                    </div>
                    <div className={styles.platformMetrics}>
                      <div className={styles.platformMetric}>
                        <span className={styles.metricLabel}>Content Analyzed:</span>
                        <span className={styles.metricValue}>{result.contentCount}</span>
                      </div>
                      <div className={styles.platformMetric}>
                        <span className={styles.metricLabel}>Positive:</span>
                        <span className={styles.positiveValue}>
                          {(result.sentimentResults || []).filter(r => r.category === 'positive').length}
                        </span>
                      </div>
                      <div className={styles.platformMetric}>
                        <span className={styles.metricLabel}>Negative:</span>
                        <span className={styles.negativeValue}>
                          {(result.sentimentResults || []).filter(r => r.category === 'negative').length}
                        </span>
                      </div>
                      <div className={styles.platformMetric}>
                        <span className={styles.metricLabel}>Neutral:</span>
                        <span className={styles.neutralValue}>
                          {(result.sentimentResults || []).filter(r => r.category === 'neutral').length}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {isSearching && (
        <div className={styles.loadingState}>
          <div className={styles.loadingSpinner}>
            <RefreshCw className={styles.spinner} />
          </div>
          <p>Searching {filters.platform === 'youtube' ? 'YouTube for videos' : filters.platform === 'instagram' ? 'Instagram for posts' : 'TikTok for videos'}...</p>
        </div>
      )}
    </div>
  );
}
