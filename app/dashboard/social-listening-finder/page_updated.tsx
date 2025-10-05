'use client';

import { useState, useEffect } from 'react';
import {
  Search,
  Filter,
  RefreshCw,
  Youtube,
  Users,
  Calendar,
  Eye,
  TrendingUp,
  AlertCircle,
  Sparkles,
  Play
} from 'lucide-react';
import { useSelector } from 'react-redux';
import { RootState } from '../../../lib/store';
import styles from './page.module.scss';

interface SearchResult {
  platform: string;
  success: boolean;
  data?: any;
  error?: string;
  keyword: string;
}

interface SearchFilters {
  sorting: 'relevance' | 'date' | 'views';
  period: '24h' | '7d' | '30d' | 'overall';
  depth: string;
}

export default function SocialListeningFinderPage() {
  const { user } = useSelector((state: RootState) => state.user);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const [filters, setFilters] = useState<SearchFilters>({
    sorting: 'relevance',
    period: 'overall',
    depth: '1'
  });

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
          depth: filters.depth
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.success) {
        setSearchResults(data); // The API returns a single result object, not an array
      } else {
        setSearchResults([]);
      }
    } catch (error) {
      console.error('Search error:', error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
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
          Failed to fetch YouTube data: {result.error || 'Unknown error'}
        </div>
      );
    }

    const data = result.data;
    console.log('YouTube API Response:', data); // Debug log
    
    // Handle YouTube API data structure - looking at the actual response
    let content = [];
    
    if (data && data.posts && Array.isArray(data.posts)) {
      // YouTube API returns data in posts array
      content = data.posts;
    } else if (data && data.data && data.data.data && Array.isArray(data.data.data)) {
      // Alternative structure: data.data.data
      content = data.data.data;
    } else {
      console.error('Unexpected data structure:', data);
      return (
        <div className={styles.errorMessage}>
          <AlertCircle className={styles.errorIcon} />
          Unexpected data format from YouTube API. Check console for details.
        </div>
      );
    }
    
    console.log('Content to render:', content); // Debug log
    
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
    
    // Render YouTube content
    return videoItems.map((item: any) => renderYouTubeContent(item));
  };

  const totalResults = searchResults.length > 0 && searchResults[0].success && searchResults[0].data?.posts ? searchResults[0].data.posts.filter((item: any) => item.videoRenderer).length : 0;

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.titleSection}>
          <h1 className={styles.title}>
            <Sparkles className={styles.titleIcon} />
            Social Listening Finder
          </div>
          <p className={styles.subtitle}>
            Discover trending YouTube content and viral videos
          </p>
        </div>

        <div className={styles.searchSection}>
          <div className={styles.searchInput}>
            <Search className={styles.searchIcon} />
            <form onSubmit={handleSearch} className={styles.searchForm}>
              <input
                type="text"
                placeholder="Search for YouTube videos (e.g., 'AI trends', 'cooking tutorials')"
                className={styles.inputField}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <button type="submit" className={styles.searchButton} disabled={isSearching}>
                {isSearching ? <RefreshCw className={styles.spinner} /> : 'Search'}
              </button>
            </form>
          </div>
          <button className={styles.filterButton} onClick={() => setShowFilters(!showFilters)}>
            <Filter className={styles.filterIcon} />
            Filters
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
            <h2>YouTube Videos</h2>
            <span className={styles.resultsCount}>
              Found {totalResults} videos
            </span>
          </div>
        </div>
      )}

      <div className={styles.resultsContainer}>
        {searchResults.length > 0 && searchResults[0].success ? (
          <div className={styles.platformSection}>
            <div className={styles.platformHeader}>
              <Youtube className={styles.platformIcon} style={{ color: '#FF0000' }} />
              <h3>
                YouTube Videos
                <span className={styles.resultCount}>
                  ({totalResults} results)
                </span>
              </h3>
            </div>
            
            <div className={styles.contentGrid}>
              {renderContent(searchResults[0])}
            </div>
          </div>
        ) : searchResults.length > 0 ? (
          <div className={styles.noResults}>
            <AlertCircle className={styles.noResultsIcon} />
            <h3>No YouTube videos found</h3>
            <p>Try searching with different keywords.</p>
          </div>
        ) : (
          !isSearching && (
            <div className={styles.welcomeSection}>
              <Sparkles className={styles.welcomeIcon} />
              <h2>Welcome to Social Listening Finder</h2>
              <p>Search YouTube to discover trending videos, viral content, and popular channels.</p>
              <div className={styles.features}>
                <div className={styles.feature}>
                  <Youtube className={styles.featureIcon} />
                  <h4>YouTube Video Search</h4>
                  <p>Find trending videos and channels</p>
                </div>
                <div className={styles.feature}>
                  <Users className={styles.featureIcon} />
                  <h4>Channel Discovery</h4>
                  <p>Explore creators and their content</p>
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
      </div>

      {isSearching && (
        <div className={styles.loadingState}>
          <div className={styles.loadingSpinner}>
            <RefreshCw className={styles.spinner} />
          </div>
          <p>Searching YouTube for videos...</p>
        </div>
      )}
    </div>
  );
}

