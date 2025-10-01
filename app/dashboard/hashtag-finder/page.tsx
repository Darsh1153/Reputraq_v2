'use client';

import { useState, useEffect } from 'react';
import { 
  Hash, 
  TrendingUp, 
  TrendingDown,
  BarChart3, 
  PieChart, 
  Calendar, 
  Users, 
  MessageCircle, 
  Heart, 
  Share2, 
  Eye, 
  Target,
  Zap,
  Activity,
  Search,
  Filter,
  Download,
  RefreshCw,
  Star,
  Globe,
  Clock,
  ArrowUp,
  ArrowDown,
  Minus,
  Plus,
  ExternalLink,
  Copy,
  Check,
  Sparkles
} from 'lucide-react';
import { useSelector } from 'react-redux';
import { RootState } from '../../../lib/store';
import { SocialDataProcessors, HashtagMetrics, ProcessedSocialContent } from '../../../services/socialDataProcessors';
import styles from './page.module.scss';

interface HashtagFilters {
  platforms: string[];
  timeRange: '24h' | '7d' | '30d' | '90d' | 'all';
  engagement: 'all' | 'high' | 'medium' | 'low';
  sentiment: 'all' | 'positive' | 'negative' | 'neutral';
  trend: 'all' | 'up' | 'down' | 'stable';
  minMentions: number;
  viral: boolean;
}

interface HashtagTrend {
  hashtag: string;
  period: string;
  change: number;
  direction: 'up' | 'down' | 'stable';
  confidence: number;
}

interface HashtagComparison {
  hashtag1: string;
  hashtag2: string;
  metrics: {
    mentions: { h1: number; h2: number };
    engagement: { h1: number; h2: number };
    reach: { h1: number; h2: number };
    sentiment: { h1: number; h2: number };
  };
}

export default function HashtagFinderPage() {
  const { user } = useSelector((state: RootState) => state.user);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [hashtagMetrics, setHashtagMetrics] = useState<HashtagMetrics[]>([]);
  const [trendingHashtags, setTrendingHashtags] = useState<HashtagTrend[]>([]);
  const [selectedHashtag, setSelectedHashtag] = useState<HashtagMetrics | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [showComparison, setShowComparison] = useState(false);
  const [comparisonData, setComparisonData] = useState<HashtagComparison | null>(null);
  const [filters, setFilters] = useState<HashtagFilters>({
    platforms: [],
    timeRange: '7d',
    engagement: 'all',
    sentiment: 'all',
    trend: 'all',
    minMentions: 0,
    viral: false
  });

  // Mock data for demonstration
  const mockHashtagMetrics: HashtagMetrics[] = [
    {
      hashtag: '#innovation',
      count: 1250,
      platforms: ['TikTok', 'Instagram', 'X', 'YouTube'],
      engagement: {
        total: 45000,
        likes: 25000,
        shares: 8000,
        comments: 7000,
        views: 50000
      },
      sentiment: {
        positive: 75,
        negative: 10,
        neutral: 15
      },
      trend: {
        direction: 'up',
        change: 25,
        period: '7d'
      },
      reach: {
        estimated: 150000,
        viral: true
      },
      lastSeen: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      topContent: []
    },
    {
      hashtag: '#tech',
      count: 890,
      platforms: ['X', 'LinkedIn', 'Reddit'],
      engagement: {
        total: 32000,
        likes: 18000,
        shares: 6000,
        comments: 8000,
        views: 75000
      },
      sentiment: {
        positive: 60,
        negative: 20,
        neutral: 20
      },
      trend: {
        direction: 'stable',
        change: 5,
        period: '7d'
      },
      reach: {
        estimated: 100000,
        viral: false
      },
      lastSeen: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
      topContent: []
    },
    {
      hashtag: '#sustainability',
      count: 650,
      platforms: ['Instagram', 'TikTok', 'YouTube'],
      engagement: {
        total: 28000,
        likes: 15000,
        shares: 5000,
        comments: 8000,
        views: 60000
      },
      sentiment: {
        positive: 85,
        negative: 5,
        neutral: 10
      },
      trend: {
        direction: 'up',
        change: 40,
        period: '7d'
      },
      reach: {
        estimated: 80000,
        viral: true
      },
      lastSeen: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
      topContent: []
    },
    {
      hashtag: '#fashion',
      count: 2100,
      platforms: ['Instagram', 'TikTok', 'Pinterest'],
      engagement: {
        total: 85000,
        likes: 50000,
        shares: 15000,
        comments: 20000,
        views: 200000
      },
      sentiment: {
        positive: 70,
        negative: 15,
        neutral: 15
      },
      trend: {
        direction: 'down',
        change: -15,
        period: '7d'
      },
      reach: {
        estimated: 300000,
        viral: true
      },
      lastSeen: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
      topContent: []
    }
  ];

  const mockTrendingHashtags: HashtagTrend[] = [
    { hashtag: '#AI', period: '24h', change: 150, direction: 'up', confidence: 0.95 },
    { hashtag: '#climate', period: '24h', change: 120, direction: 'up', confidence: 0.88 },
    { hashtag: '#crypto', period: '24h', change: -30, direction: 'down', confidence: 0.75 },
    { hashtag: '#fitness', period: '24h', change: 80, direction: 'up', confidence: 0.82 },
    { hashtag: '#travel', period: '24h', change: 45, direction: 'up', confidence: 0.70 }
  ];

  useEffect(() => {
    setHashtagMetrics(mockHashtagMetrics);
    setTrendingHashtags(mockTrendingHashtags);
  }, []);

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    
    setIsSearching(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Generate dynamic hashtag results based on search query
      const searchTerm = searchQuery.toLowerCase();
      const generatedHashtags = generateHashtagsFromSearch(searchTerm);
      
      setHashtagMetrics(generatedHashtags);
    } catch (error) {
      console.error('Search failed:', error);
    } finally {
      setIsSearching(false);
    }
  };

  // Generate hashtags based on search query
  const generateHashtagsFromSearch = (searchTerm: string): HashtagMetrics[] => {
    const baseHashtags = [
      `#${searchTerm}`,
      `#${searchTerm.replace(/\s+/g, '')}`,
      `#${searchTerm.replace(/\s+/g, '_')}`,
      `#${searchTerm.replace(/\s+/g, '')}2024`,
      `#${searchTerm.replace(/\s+/g, '')}Tech`,
      `#${searchTerm.replace(/\s+/g, '')}AI`,
      `#${searchTerm.replace(/\s+/g, '')}Innovation`,
      `#${searchTerm.replace(/\s+/g, '')}Future`,
      `#${searchTerm.replace(/\s+/g, '')}Trend`,
      `#${searchTerm.replace(/\s+/g, '')}News`
    ];

    return baseHashtags.map((hashtag, index) => ({
      hashtag: hashtag,
      count: Math.floor(Math.random() * 2000) + 100,
      platforms: ['TikTok', 'Instagram', 'X', 'YouTube'].slice(0, Math.floor(Math.random() * 4) + 1),
      engagement: {
        total: Math.floor(Math.random() * 50000) + 1000,
        likes: Math.floor(Math.random() * 30000) + 500,
        shares: Math.floor(Math.random() * 10000) + 100,
        comments: Math.floor(Math.random() * 5000) + 50,
        views: Math.floor(Math.random() * 100000) + 1000
      },
      sentiment: {
        positive: Math.floor(Math.random() * 40) + 50,
        negative: Math.floor(Math.random() * 20) + 5,
        neutral: Math.floor(Math.random() * 30) + 10
      },
      trend: {
        direction: ['up', 'down', 'stable'][Math.floor(Math.random() * 3)] as 'up' | 'down' | 'stable',
        change: Math.floor(Math.random() * 100) - 50,
        period: '7d'
      },
      reach: {
        estimated: Math.floor(Math.random() * 200000) + 10000,
        viral: Math.random() > 0.7
      },
      lastSeen: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
      topContent: []
    })).sort((a, b) => b.engagement.total - a.engagement.total);
  };

  const handleFilterChange = (key: keyof HashtagFilters, value: any) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const applyFilters = () => {
    let filtered = [...mockHashtagMetrics];
    
    if (filters.platforms.length > 0) {
      filtered = filtered.filter(hashtag => 
        filters.platforms.some(platform => hashtag.platforms.includes(platform))
      );
    }
    
    if (filters.engagement !== 'all') {
      filtered = filtered.filter(hashtag => {
        const engagement = hashtag.engagement.total;
        switch (filters.engagement) {
          case 'high': return engagement > 50000;
          case 'medium': return engagement > 10000 && engagement <= 50000;
          case 'low': return engagement <= 10000;
          default: return true;
        }
      });
    }
    
    if (filters.sentiment !== 'all') {
      filtered = filtered.filter(hashtag => {
        const dominantSentiment = hashtag.sentiment.positive > hashtag.sentiment.negative 
          ? (hashtag.sentiment.positive > hashtag.sentiment.neutral ? 'positive' : 'neutral')
          : (hashtag.sentiment.negative > hashtag.sentiment.neutral ? 'negative' : 'neutral');
        return dominantSentiment === filters.sentiment;
      });
    }
    
    if (filters.trend !== 'all') {
      filtered = filtered.filter(hashtag => hashtag.trend.direction === filters.trend);
    }
    
    if (filters.minMentions > 0) {
      filtered = filtered.filter(hashtag => hashtag.count >= filters.minMentions);
    }
    
    if (filters.viral) {
      filtered = filtered.filter(hashtag => hashtag.reach.viral);
    }
    
    setHashtagMetrics(filtered);
  };

  const getTrendIcon = (direction: string) => {
    switch (direction) {
      case 'up':
        return <ArrowUp className={styles.trendUp} />;
      case 'down':
        return <ArrowDown className={styles.trendDown} />;
      default:
        return <Minus className={styles.trendStable} />;
    }
  };

  const getSentimentColor = (sentiment: { positive: number; negative: number; neutral: number }) => {
    const dominant = sentiment.positive > sentiment.negative 
      ? (sentiment.positive > sentiment.neutral ? 'positive' : 'neutral')
      : (sentiment.negative > sentiment.neutral ? 'negative' : 'neutral');
    
    switch (dominant) {
      case 'positive': return '#10b981';
      case 'negative': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffHours = Math.ceil(diffTime / (1000 * 60 * 60));
    
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.ceil(diffHours / 24);
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  const handleHashtagSelect = (hashtag: HashtagMetrics) => {
    setSelectedHashtag(hashtag);
  };

  const handleCompareHashtags = (hashtag1: string, hashtag2: string) => {
    const h1 = hashtagMetrics.find(h => h.hashtag === hashtag1);
    const h2 = hashtagMetrics.find(h => h.hashtag === hashtag2);
    
    if (h1 && h2) {
      setComparisonData({
        hashtag1,
        hashtag2,
        metrics: {
          mentions: { h1: h1.count, h2: h2.count },
          engagement: { h1: h1.engagement.total, h2: h2.engagement.total },
          reach: { h1: h1.reach.estimated, h2: h2.reach.estimated },
          sentiment: { h1: h1.sentiment.positive, h2: h2.sentiment.positive }
        }
      });
      setShowComparison(true);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        {/* Header */}
        <div className={styles.header}>
          <div className={styles.titleSection}>
            <div className={styles.titleIconWrapper}>
              <Hash size={28} className={styles.titleIcon} />
              <Sparkles size={16} className={styles.sparkleIcon} />
            </div>
            <div className={styles.titleContent}>
              <h1 className={styles.title}>Hashtag Finder</h1>
              <p className={styles.subtitle}>
                Discover trending hashtags and analyze their performance across platforms
              </p>
            </div>
          </div>
          <div className={styles.headerActions}>
            <button 
              className={styles.filterButton}
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter />
              Filters
            </button>
            <button className={styles.exportButton}>
              <Download />
              Export
            </button>
          </div>
        </div>

        {/* Search Section */}
        <div className={styles.searchSection}>
          <div className={styles.searchForm}>
            <div className={styles.formHeader}>
              <div className={styles.formTitle}>
                <Search size={20} className={styles.formIcon} />
                <h3>Search Hashtags</h3>
              </div>
              <p className={styles.formDescription}>
                Enter keywords or topics to discover relevant hashtags
              </p>
            </div>
            
            <div className={styles.searchInput}>
              <div className={styles.inputWrapper}>
                <Hash className={styles.inputIcon} />
                <input
                  type="text"
                  placeholder="e.g., #AI, artificial intelligence, machine learning"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  className={styles.searchField}
                />
              </div>
              <button 
                className={styles.searchButton}
                onClick={handleSearch}
                disabled={isSearching || !searchQuery.trim()}
              >
                {isSearching ? (
                  <RefreshCw className={styles.spinner} />
                ) : (
                  <>
                    <Search size={18} className={styles.buttonIcon} />
                    Search
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Filters */}
          {showFilters && (
            <div className={styles.filtersPanel}>
              <div className={styles.filterGrid}>
              <div className={styles.filterGroup}>
                <label>Platforms</label>
                <div className={styles.checkboxGroup}>
                  {['TikTok', 'Instagram', 'X', 'YouTube', 'Reddit', 'Threads'].map(platform => (
                    <label key={platform} className={styles.checkboxLabel}>
                      <input
                        type="checkbox"
                        checked={filters.platforms.includes(platform)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            handleFilterChange('platforms', [...filters.platforms, platform]);
                          } else {
                            handleFilterChange('platforms', filters.platforms.filter(p => p !== platform));
                          }
                        }}
                      />
                      <span>{platform}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className={styles.filterGroup}>
                <label>Time Range</label>
                <select 
                  value={filters.timeRange}
                  onChange={(e) => handleFilterChange('timeRange', e.target.value)}
                  className={styles.filterSelect}
                >
                  <option value="24h">Last 24 Hours</option>
                  <option value="7d">Last 7 Days</option>
                  <option value="30d">Last 30 Days</option>
                  <option value="90d">Last 90 Days</option>
                  <option value="all">All Time</option>
                </select>
              </div>

              <div className={styles.filterGroup}>
                <label>Engagement Level</label>
                <select 
                  value={filters.engagement}
                  onChange={(e) => handleFilterChange('engagement', e.target.value)}
                  className={styles.filterSelect}
                >
                  <option value="all">All Levels</option>
                  <option value="high">High (50K+)</option>
                  <option value="medium">Medium (10K-50K)</option>
                  <option value="low">Low (0-10K)</option>
                </select>
              </div>

              <div className={styles.filterGroup}>
                <label>Sentiment</label>
                <select 
                  value={filters.sentiment}
                  onChange={(e) => handleFilterChange('sentiment', e.target.value)}
                  className={styles.filterSelect}
                >
                  <option value="all">All Sentiments</option>
                  <option value="positive">Positive</option>
                  <option value="negative">Negative</option>
                  <option value="neutral">Neutral</option>
                </select>
              </div>

              <div className={styles.filterGroup}>
                <label>Trend Direction</label>
                <select 
                  value={filters.trend}
                  onChange={(e) => handleFilterChange('trend', e.target.value)}
                  className={styles.filterSelect}
                >
                  <option value="all">All Trends</option>
                  <option value="up">Trending Up</option>
                  <option value="down">Trending Down</option>
                  <option value="stable">Stable</option>
                </select>
              </div>

              <div className={styles.filterGroup}>
                <label>Min Mentions</label>
                <input
                  type="number"
                  value={filters.minMentions}
                  onChange={(e) => handleFilterChange('minMentions', parseInt(e.target.value) || 0)}
                  className={styles.filterInput}
                  placeholder="0"
                />
              </div>

              <div className={styles.filterGroup}>
                <label className={styles.checkboxLabel}>
                  <input
                    type="checkbox"
                    checked={filters.viral}
                    onChange={(e) => handleFilterChange('viral', e.target.checked)}
                  />
                  <span>Viral Hashtags Only</span>
                </label>
              </div>
            </div>
            
            <div className={styles.filterActions}>
              <button className={styles.applyButton} onClick={applyFilters}>
                Apply Filters
              </button>
              <button 
                className={styles.clearButton}
                onClick={() => setFilters({
                  platforms: [],
                  timeRange: '7d',
                  engagement: 'all',
                  sentiment: 'all',
                  trend: 'all',
                  minMentions: 0,
                  viral: false
                })}
              >
                Clear All
              </button>
              </div>
            </div>
          )}
        </div>

        {/* Trending Hashtags */}
        <div className={styles.trendingSection}>
          <div className={styles.sectionHeader}>
            <div className={styles.sectionTitle}>
              <TrendingUp size={20} className={styles.sectionIcon} />
              <h3>Trending Now</h3>
            </div>
          </div>
          <div className={styles.trendingGrid}>
            {trendingHashtags.map((trend, index) => (
              <div key={index} className={styles.trendingCard}>
                <div className={styles.trendingHeader}>
                  <Hash className={styles.hashtagIcon} />
                  <span className={styles.trendingHashtag}>{trend.hashtag}</span>
                  <div className={styles.trendingChange}>
                    {getTrendIcon(trend.direction)}
                    <span className={styles.changeValue}>{trend.change}%</span>
                  </div>
                </div>
                <div className={styles.trendingStats}>
                  <span className={styles.trendingPeriod}>{trend.period}</span>
                  <span className={styles.trendingConfidence}>
                    {Math.round(trend.confidence * 100)}% confidence
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Hashtag Metrics */}
        <div className={styles.metricsSection}>
          <div className={styles.sectionHeader}>
            <div className={styles.sectionTitle}>
              <BarChart3 size={20} className={styles.sectionIcon} />
              <h3>Hashtag Performance</h3>
            </div>
            <div className={styles.sectionActions}>
              <select className={styles.sortSelect}>
                <option value="engagement">Sort by Engagement</option>
                <option value="mentions">Sort by Mentions</option>
                <option value="trend">Sort by Trend</option>
                <option value="reach">Sort by Reach</option>
              </select>
            </div>
          </div>

          <div className={styles.hashtagGrid}>
            {hashtagMetrics.map((hashtag, index) => (
              <div 
                key={index} 
                className={styles.hashtagCard}
                onClick={() => handleHashtagSelect(hashtag)}
              >
              <div className={styles.hashtagHeader}>
                <div className={styles.hashtagInfo}>
                  <Hash className={styles.hashtagIcon} />
                  <span className={styles.hashtagName}>{hashtag.hashtag}</span>
                  {hashtag.reach.viral && <Star className={styles.viralIcon} />}
                </div>
                <div className={styles.trendIndicator}>
                  {getTrendIcon(hashtag.trend.direction)}
                  <span className={styles.trendValue}>{hashtag.trend.change}%</span>
                </div>
              </div>

              <div className={styles.hashtagStats}>
                <div className={styles.statRow}>
                  <MessageCircle className={styles.statIcon} />
                  <span className={styles.statLabel}>Mentions</span>
                  <span className={styles.statValue}>{formatNumber(hashtag.count)}</span>
                </div>
                
                <div className={styles.statRow}>
                  <Heart className={styles.statIcon} />
                  <span className={styles.statLabel}>Engagement</span>
                  <span className={styles.statValue}>{formatNumber(hashtag.engagement.total)}</span>
                </div>
                
                <div className={styles.statRow}>
                  <Eye className={styles.statIcon} />
                  <span className={styles.statLabel}>Reach</span>
                  <span className={styles.statValue}>{formatNumber(hashtag.reach.estimated)}</span>
                </div>
                
                <div className={styles.statRow}>
                  <Globe className={styles.statIcon} />
                  <span className={styles.statLabel}>Platforms</span>
                  <span className={styles.statValue}>{hashtag.platforms.length}</span>
                </div>
              </div>

              <div className={styles.platformTags}>
                {hashtag.platforms.map((platform, idx) => (
                  <span key={idx} className={styles.platformTag}>
                    {platform}
                  </span>
                ))}
              </div>

              <div className={styles.sentimentBar}>
                <div className={styles.sentimentLabel}>Sentiment</div>
                <div className={styles.sentimentBarContainer}>
                  <div 
                    className={styles.sentimentBarFill}
                    style={{ 
                      width: `${hashtag.sentiment.positive}%`,
                      backgroundColor: '#10b981'
                    }}
                  ></div>
                  <div 
                    className={styles.sentimentBarFill}
                    style={{ 
                      width: `${hashtag.sentiment.neutral}%`,
                      backgroundColor: '#6b7280'
                    }}
                  ></div>
                  <div 
                    className={styles.sentimentBarFill}
                    style={{ 
                      width: `${hashtag.sentiment.negative}%`,
                      backgroundColor: '#ef4444'
                    }}
                  ></div>
                </div>
                <div className={styles.sentimentValues}>
                  <span className={styles.sentimentValue} style={{ color: '#10b981' }}>
                    {hashtag.sentiment.positive}%
                  </span>
                  <span className={styles.sentimentValue} style={{ color: '#6b7280' }}>
                    {hashtag.sentiment.neutral}%
                  </span>
                  <span className={styles.sentimentValue} style={{ color: '#ef4444' }}>
                    {hashtag.sentiment.negative}%
                  </span>
                </div>
              </div>

              <div className={styles.hashtagFooter}>
                <div className={styles.lastSeen}>
                  <Clock className={styles.timeIcon} />
                  <span>{formatTimeAgo(hashtag.lastSeen)}</span>
                </div>
                <div className={styles.hashtagActions}>
                  <button 
                    className={styles.actionButton}
                    onClick={(e) => {
                      e.stopPropagation();
                      navigator.clipboard.writeText(hashtag.hashtag);
                    }}
                  >
                    <Copy />
                  </button>
                  <button 
                    className={styles.actionButton}
                    onClick={(e) => {
                      e.stopPropagation();
                      // Handle compare action
                    }}
                  >
                    <BarChart3 />
                  </button>
                </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Selected Hashtag Details */}
        {selectedHashtag && (
          <div className={styles.detailModal}>
            <div className={styles.modalContent}>
              <div className={styles.modalHeader}>
                <h3>{selectedHashtag.hashtag} Details</h3>
                <button 
                  className={styles.closeButton}
                  onClick={() => setSelectedHashtag(null)}
                >
                  ×
                </button>
              </div>
            
            <div className={styles.detailContent}>
              <div className={styles.detailMetrics}>
                <div className={styles.detailMetric}>
                  <div className={styles.metricValue}>{formatNumber(selectedHashtag.count)}</div>
                  <div className={styles.metricLabel}>Total Mentions</div>
                </div>
                <div className={styles.detailMetric}>
                  <div className={styles.metricValue}>{formatNumber(selectedHashtag.engagement.total)}</div>
                  <div className={styles.metricLabel}>Total Engagement</div>
                </div>
                <div className={styles.detailMetric}>
                  <div className={styles.metricValue}>{formatNumber(selectedHashtag.reach.estimated)}</div>
                  <div className={styles.metricLabel}>Estimated Reach</div>
                </div>
                <div className={styles.detailMetric}>
                  <div className={styles.metricValue}>{selectedHashtag.platforms.length}</div>
                  <div className={styles.metricLabel}>Platforms</div>
                </div>
              </div>
              
              <div className={styles.detailBreakdown}>
                <div className={styles.breakdownSection}>
                  <h4>Engagement Breakdown</h4>
                  <div className={styles.breakdownBars}>
                    <div className={styles.breakdownBar}>
                      <Heart />
                      <span>Likes: {formatNumber(selectedHashtag.engagement.likes)}</span>
                    </div>
                    <div className={styles.breakdownBar}>
                      <Share2 />
                      <span>Shares: {formatNumber(selectedHashtag.engagement.shares)}</span>
                    </div>
                    <div className={styles.breakdownBar}>
                      <MessageCircle />
                      <span>Comments: {formatNumber(selectedHashtag.engagement.comments)}</span>
                    </div>
                    <div className={styles.breakdownBar}>
                      <Eye />
                      <span>Views: {formatNumber(selectedHashtag.engagement.views)}</span>
                    </div>
                  </div>
                </div>
                
                <div className={styles.breakdownSection}>
                  <h4>Platform Distribution</h4>
                  <div className={styles.platformDistribution}>
                    {selectedHashtag.platforms.map(platform => (
                      <div key={platform} className={styles.platformItem}>
                        <span>{platform}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              </div>
            </div>
          </div>
        )}

        {/* Empty State */}
        {hashtagMetrics.length === 0 && !isSearching && (
          <div className={styles.emptyState}>
            <Hash className={styles.emptyIcon} />
            <h3>No Hashtags Found</h3>
            <p>Try adjusting your search criteria or filters to find relevant hashtags</p>
          </div>
        )}
      </div>
    </div>
  );
}
