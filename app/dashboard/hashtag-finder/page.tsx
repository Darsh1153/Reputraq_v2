'use client';

import { useState, useEffect, useRef } from 'react';
import {
  Search,
  Filter,
  RefreshCw,
  Youtube,
  Hash,
  Users,
  Calendar,
  Eye,
  TrendingUp,
  AlertCircle,
  Sparkles,
  Play,
  CheckCircle,
  Clock,
  ExternalLink,
  BarChart3,
  TrendingUp as TrendingUpIcon,
  TrendingDown,
  Minus,
  Brain,
  Target,
  Zap,
  Activity
} from 'lucide-react';
import {
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  Legend, LineChart, Line, AreaChart, Area, ScatterChart, Scatter
} from 'recharts';
import styles from './page.module.scss';
import ExportButton from '@/components/ExportButton';
import { createHashtagFinderExportData, createSentimentAnalysisExportData } from '@/utils/exportUtils';

interface Video {
  video_id: string;
  title: string;
  thumbnail: string;
  channel_name: string;
  view_count: number;
  published_time: string;
  duration: string;
  url: string;
}

interface HashtagData {
  hashtag_name: string;
  post_count: number;
  trending_score: number;
  videos: Video[];
}

interface ApiResponse {
  success: boolean;
  keyword: string;
  platform: string;
  totalResults: number;
  data: {
    data: {
      contents?: any[];
      posts?: any[];
    };
  };
  timestamp: string;
  note?: string;
  error?: string;
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

interface SearchFilters {
  sorting: 'relevance' | 'date' | 'views';
  period: '24h' | '7d' | '30d' | 'overall';
  depth: string;
  onlyShorts: boolean;
}

export default function HashtagFinderAPIPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<ApiResponse[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const [sentimentAnalysis, setSentimentAnalysis] = useState<SentimentAnalysisResponse | null>(null);
  const [isAnalyzingSentiment, setIsAnalyzingSentiment] = useState(false);
  const [showSentimentInsights, setShowSentimentInsights] = useState(false);
  const [filters, setFilters] = useState<SearchFilters>({
    sorting: 'relevance',
    period: 'overall',
    depth: '1',
    onlyShorts: false
  });

  // Refs for export functionality
  const resultsSectionRef = useRef<HTMLDivElement>(null);
  const sentimentSectionRef = useRef<HTMLDivElement>(null);
  const fullPageRef = useRef<HTMLDivElement>(null);

  // Load search history from localStorage on component mount
  useEffect(() => {
    const savedHistory = localStorage.getItem('hashtagSearchHistory');
    if (savedHistory) {
      setSearchHistory(JSON.parse(savedHistory));
    }
  }, []);

  // Save search history to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('hashtagSearchHistory', JSON.stringify(searchHistory));
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

    console.log('🔍 Frontend: Starting hashtag search for:', searchQuery.trim());

    setIsSearching(true);
    saveToSearchHistory(searchQuery.trim());

    const requestBody = {
      name: searchQuery.trim(),
      depth: filters.depth,
      onlyShorts: filters.onlyShorts.toString(),
    };

    console.log('📤 Frontend: Sending request body:', requestBody);

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
          platform: 'youtube' // Force YouTube for hashtag search
        }),
      });

      console.log('📡 Frontend: Response status:', response.status);
      console.log('📡 Frontend: Response headers:', Object.fromEntries(response.headers.entries()));

      const data = await response.json();
      console.log('📥 Frontend: Response data:', data);

      if (!response.ok) {
        console.error('❌ Frontend: API Error:', data);
        throw new Error(data.error || 'Failed to fetch hashtag data');
      }

      console.log('✅ Frontend: Successfully received data:', data);

      if (data.success) {
        setSearchResults([data]); // Wrap the single result in an array like social-listening-finder

        // Trigger sentiment analysis
        await performSentimentAnalysis(searchQuery.trim());
      } else {
        setSearchResults([]);
        setSentimentAnalysis(null);
        setShowSentimentInsights(false);
      }
    } catch (error) {
      console.error('❌ Frontend: Error occurred:', error);
      setSearchResults([]);
      setSentimentAnalysis(null);
      setShowSentimentInsights(false);
    } finally {
      setIsSearching(false);
    }
  };

  const formatViewCount = (count: number) => {
    if (count >= 1000000) {
      return `${(count / 1000000).toFixed(1)}M`;
    } else if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}K`;
    }
    return count.toString();
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

  const renderContent = () => {
    if (!searchResults || searchResults.length === 0) {
      return (
        <div className={styles.errorMessage}>
          <AlertCircle className={styles.errorIcon} />
          Failed to fetch hashtag data: No results found
        </div>
      );
    }

    const result = searchResults[0]; // Get the first (and only) result
    if (!result.success) {
      return (
        <div className={styles.errorMessage}>
          <AlertCircle className={styles.errorIcon} />
          Failed to fetch hashtag data: {result.error || 'Unknown error'}
        </div>
      );
    }

    // Handle YouTube API response structure (same as social-listening-finder)
    const data = result.data;
    if (!data || !data.data || (!data.data.contents && !data.data.posts)) {
      return (
        <div className={styles.noResults}>
          <AlertCircle className={styles.noResultsIcon} />
          <h3>No YouTube videos found</h3>
          <p>Try searching with different hashtags.</p>
        </div>
      );
    }

    // Handle both 'contents' and 'posts' structures
    const content = data.data.contents || data.data.posts;

    if (!content || !Array.isArray(content)) {
      return (
        <div className={styles.noResults}>
          <AlertCircle className={styles.noResultsIcon} />
          <h3>No YouTube videos found</h3>
          <p>Try searching with different hashtags.</p>
        </div>
      );
    }

    // Filter only videoRenderer items for proper rendering
    const videoItems = content.filter((item: any) => item.videoRenderer);

    if (videoItems.length === 0) {
      return (
        <div className={styles.noResults}>
          <AlertCircle className={styles.noResultsIcon} />
          <h3>No YouTube videos found</h3>
          <p>Try searching with different hashtags.</p>
        </div>
      );
    }

    // Render YouTube content - pass the videoRenderer object directly
    return videoItems.map((item: any) => renderYouTubeContent(item.videoRenderer));
  };

  const totalResults = searchResults?.[0]?.totalResults || 0;
  const hasResults = searchResults && searchResults.length > 0 && searchResults[0]?.success;
  const isMockData = searchResults?.[0]?.note?.includes('Mock data');

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.titleSection}>
          <h1 className={styles.title}>
            <Hash className={styles.titleIcon} />
            Hashtag Finder
          </h1>
          <p className={styles.subtitle}>
            Search YouTube hashtags and discover trending content
          </p>
        </div>

        <div className={styles.searchSection}>
          <div className={styles.platformSelector}>
            <label className={styles.platformLabel}>Platform:</label>
            <select
              value="youtube"
              className={styles.platformDropdown}
              disabled
            >
              <option value="youtube">YouTube</option>
            </select>
          </div>
          <form onSubmit={handleSearch} className={styles.searchInput}>
            <Search className={styles.searchIcon} />
            <input
              type="text"
              placeholder="Search for hashtags (e.g., 'barbie', 'tech', 'gaming')"
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
            <div className={styles.filterGroup}>
              <label className={styles.checkboxLabel}>
                <input
                  type="checkbox"
                  checked={filters.onlyShorts}
                  onChange={(e) => setFilters(prev => ({ ...prev, onlyShorts: e.target.checked }))}
                />
                <span className={styles.checkboxText}>
                  <Youtube className={styles.platformIcon} />
                  Shorts Only
                </span>
              </label>
            </div>
          </div>
        )}

        {hasResults && totalResults > 0 && (
          <div className={styles.searchSuccess}>
            <CheckCircle className={styles.successIcon} />
            <span>Found {totalResults} YouTube videos for "#{searchQuery}"</span>
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

      {/* Full Page Content Wrapper for PDF Export */}
      <div ref={fullPageRef} className={styles.fullPageContent}>
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
                  targetElementRef={fullPageRef}
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
                      {platform === 'instagram' && <Hash className={styles.platformIcon} />}
                      {platform === 'tiktok' && <Play className={styles.platformIcon} />}
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

        {hasResults && (
          <div className={styles.resultsHeader}>
            <div className={styles.resultsInfo}>
              <h2>YouTube Videos</h2>
              <span className={styles.resultsCount}>
                Found {totalResults} videos
              </span>
            </div>
            <div className={styles.exportSection}>
              <ExportButton
                data={createHashtagFinderExportData(searchResults, searchQuery)}
                variant="primary"
                size="medium"
                showLabel={true}
                targetElementRef={fullPageRef}
              />
            </div>
          </div>
        )}

        <div ref={resultsSectionRef} className={styles.resultsContainer}>
          {hasResults ? (
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

              {isMockData && (
                <div className={styles.mockDataNotice}>
                  <AlertCircle className={styles.noticeIcon} />
                  <span>Showing demo data - API limit reached. Contact hello@ensembledata.com for higher limits.</span>
                </div>
              )}

              <div className={styles.contentGrid}>
                {renderContent()}
              </div>
            </div>
          ) : (
            !isSearching && (
              <div className={styles.welcomeSection}>
                <Sparkles className={styles.welcomeIcon} />
                <h2>Welcome to Hashtag Finder</h2>
                <p>Search YouTube hashtags to discover trending content and viral videos.</p>
                <div className={styles.features}>
                  <div className={styles.feature}>
                    <Youtube className={styles.featureIcon} />
                    <h4>YouTube Hashtag Search</h4>
                    <p>Find trending videos by hashtag</p>
                  </div>
                  <div className={styles.feature}>
                    <Hash className={styles.featureIcon} />
                    <h4>Hashtag Analysis</h4>
                    <p>Discover popular hashtags and content</p>
                  </div>
                  <div className={styles.feature}>
                    <TrendingUp className={styles.featureIcon} />
                    <h4>Trend Discovery</h4>
                    <p>Track viral content and engagement</p>
                  </div>
                </div>
              </div>
            )
          )}
        </div>
      </div>

      {isSearching && (
        <div className={styles.loadingState}>
          <div className={styles.loadingSpinner}>
            <RefreshCw className={styles.spinner} />
          </div>
          <p>Searching YouTube for hashtag content...</p>
        </div>
      )}
    </div>
  );
}