'use client';

import { useState, useEffect } from 'react';
import { Hash, TrendingUp, BarChart3, Calendar, Users, MessageCircle, Heart, Share, Eye, RefreshCw, Filter, Download } from 'lucide-react';
import { useSelector } from 'react-redux';
import { RootState } from '../../../lib/store';
import { dataManager } from '../../../services/dataManager';
import RefreshButton from '../../../components/RefreshButton';
import styles from './page.module.scss';

interface HashtagData {
  hashtag: string;
  count: number;
  platforms: string[];
  lastSeen: string;
  trend: 'up' | 'down' | 'stable';
  engagement: {
    total: number;
    likes: number;
    shares: number;
    comments: number;
    views: number;
  };
}

interface SocialContent {
  hashtags: string[] | null;
  engagement: {
    like_count: number | null;
    view_count: number | null;
    share_count: number | null;
    comment_count: number | null;
  };
  published_at: string;
  work_platform: {
    name: string;
  };
}

export default function HashtagTrackerPage() {
  const { user } = useSelector((state: RootState) => state.user);
  const [hashtags, setHashtags] = useState<HashtagData[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPlatform, setSelectedPlatform] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'count' | 'trend' | 'engagement' | 'alphabetical'>('count');
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | 'all'>('30d');
  const [hashtagData, setHashtagData] = useState(dataManager.getHashtagData());

  useEffect(() => {
    // Subscribe to hashtag data updates
    const handleHashtagUpdate = (data: any) => {
      setHashtagData(data);
      if (data.hashtags && data.hashtags.length > 0) {
        setHashtags(data.hashtags);
      }
    };

    dataManager.subscribe('hashtag', handleHashtagUpdate);
    loadHashtagData();

    // Cleanup subscription
    return () => {
      dataManager.unsubscribe('hashtag', handleHashtagUpdate);
    };
  }, []);

  const loadHashtagData = async () => {
    try {
      setLoading(true);
      
      // Get social listening data from localStorage or API
      const socialData = localStorage.getItem('socialListeningData');
      let hashtagMap = new Map<string, HashtagData>();

      if (socialData) {
        const data = JSON.parse(socialData);
        processSocialData(data, hashtagMap);
      }

      // Convert map to array and sort
      const hashtagArray = Array.from(hashtagMap.values());
      setHashtags(hashtagArray);
    } catch (error) {
      console.error('Error loading hashtag data:', error);
    } finally {
      setLoading(false);
    }
  };

  const processSocialData = (data: any, hashtagMap: Map<string, HashtagData>) => {
    if (data.results) {
      data.results.forEach((platformResult: any) => {
        if (platformResult.content) {
          platformResult.content.forEach((content: SocialContent) => {
            if (content.hashtags && content.hashtags.length > 0) {
              content.hashtags.forEach(hashtag => {
                const normalizedHashtag = hashtag.toLowerCase();
                
                if (hashtagMap.has(normalizedHashtag)) {
                  const existing = hashtagMap.get(normalizedHashtag)!;
                  existing.count += 1;
                  existing.engagement.total += (content.engagement.like_count || 0) + (content.engagement.share_count || 0) + (content.engagement.comment_count || 0);
                  existing.engagement.likes += content.engagement.like_count || 0;
                  existing.engagement.shares += content.engagement.share_count || 0;
                  existing.engagement.comments += content.engagement.comment_count || 0;
                  existing.engagement.views += content.engagement.view_count || 0;
                  
                  if (!existing.platforms.includes(content.work_platform.name)) {
                    existing.platforms.push(content.work_platform.name);
                  }
                  
                  // Update last seen
                  const contentDate = new Date(content.published_at);
                  const lastSeenDate = new Date(existing.lastSeen);
                  if (contentDate > lastSeenDate) {
                    existing.lastSeen = content.published_at;
                  }
                } else {
                  hashtagMap.set(normalizedHashtag, {
                    hashtag: hashtag,
                    count: 1,
                    platforms: [content.work_platform.name],
                    lastSeen: content.published_at,
                    trend: 'stable',
                    engagement: {
                      total: (content.engagement.like_count || 0) + (content.engagement.share_count || 0) + (content.engagement.comment_count || 0),
                      likes: content.engagement.like_count || 0,
                      shares: content.engagement.share_count || 0,
                      comments: content.engagement.comment_count || 0,
                      views: content.engagement.view_count || 0,
                    }
                  });
                }
              });
            }
          });
        }
      });
    }
  };

  const filteredHashtags = hashtags.filter(hashtag => 
    selectedPlatform === 'all' || hashtag.platforms.includes(selectedPlatform)
  );

  const sortedHashtags = [...filteredHashtags].sort((a, b) => {
    switch (sortBy) {
      case 'count':
        return b.count - a.count;
      case 'engagement':
        return b.engagement.total - a.engagement.total;
      case 'alphabetical':
        return a.hashtag.localeCompare(b.hashtag);
      case 'trend':
        const trendOrder = { up: 3, stable: 2, down: 1 };
        return trendOrder[b.trend] - trendOrder[a.trend];
      default:
        return 0;
    }
  });

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up':
        return <TrendingUp className={styles.trendUp} />;
      case 'down':
        return <TrendingUp className={styles.trendDown} />;
      default:
        return <BarChart3 className={styles.trendStable} />;
    }
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return '1 day ago';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.ceil(diffDays / 7)} weeks ago`;
    return `${Math.ceil(diffDays / 30)} months ago`;
  };

  if (loading || hashtagData.isLoading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>
          <RefreshCw className={styles.spinner} />
          <h3>Loading Hashtag Data...</h3>
          <p>Analyzing social media content for hashtag trends</p>
          <RefreshButton size="sm" variant="ghost" />
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <div className={styles.headerText}>
            <h1>Hashtag Tracker</h1>
            <p>Monitor hashtag performance and trends from your social media data</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className={styles.filters}>
        <div className={styles.filterGroup}>
          <label>Platform</label>
          <select 
            value={selectedPlatform} 
            onChange={(e) => setSelectedPlatform(e.target.value)}
            className={styles.filterSelect}
          >
            <option value="all">All Platforms</option>
            <option value="TikTok">TikTok</option>
            <option value="X">X (Twitter)</option>
            <option value="Instagram">Instagram</option>
            <option value="Facebook">Facebook</option>
          </select>
        </div>
        
        <div className={styles.filterGroup}>
          <label>Sort By</label>
          <select 
            value={sortBy} 
            onChange={(e) => setSortBy(e.target.value as any)}
            className={styles.filterSelect}
          >
            <option value="count">Mention Count</option>
            <option value="engagement">Engagement</option>
            <option value="trend">Trend</option>
            <option value="alphabetical">Alphabetical</option>
          </select>
        </div>

        <div className={styles.filterGroup}>
          <label>Time Range</label>
          <select 
            value={timeRange} 
            onChange={(e) => setTimeRange(e.target.value as any)}
            className={styles.filterSelect}
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
            <option value="all">All time</option>
          </select>
        </div>
      </div>

      {/* Stats Summary */}
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={styles.statIcon}>
            <Hash />
          </div>
          <div className={styles.statContent}>
            <div className={styles.statValue}>{hashtags.length}</div>
            <div className={styles.statLabel}>Total Hashtags</div>
          </div>
        </div>
        
        <div className={styles.statCard}>
          <div className={styles.statIcon}>
            <TrendingUp />
          </div>
          <div className={styles.statContent}>
            <div className={styles.statValue}>
              {hashtags.filter(h => h.trend === 'up').length}
            </div>
            <div className={styles.statLabel}>Trending Up</div>
          </div>
        </div>
        
        <div className={styles.statCard}>
          <div className={styles.statIcon}>
            <MessageCircle />
          </div>
          <div className={styles.statContent}>
            <div className={styles.statValue}>
              {formatNumber(hashtags.reduce((sum, h) => sum + h.count, 0))}
            </div>
            <div className={styles.statLabel}>Total Mentions</div>
          </div>
        </div>
        
        <div className={styles.statCard}>
          <div className={styles.statIcon}>
            <Heart />
          </div>
          <div className={styles.statContent}>
            <div className={styles.statValue}>
              {formatNumber(hashtags.reduce((sum, h) => sum + h.engagement.total, 0))}
            </div>
            <div className={styles.statLabel}>Total Engagement</div>
          </div>
        </div>
      </div>

      {/* Hashtag List */}
      <div className={styles.hashtagList}>
        <div className={styles.listHeader}>
          <h2>Hashtag Performance</h2>
          <button className={styles.exportButton}>
            <Download />
            Export Data
          </button>
        </div>

        {sortedHashtags.length === 0 ? (
          <div className={styles.emptyState}>
            <Hash className={styles.emptyIcon} />
            <h3>No Hashtags Found</h3>
            <p>Start social listening to collect hashtag data from your keywords</p>
          </div>
        ) : (
          <div className={styles.hashtagGrid}>
            {sortedHashtags.map((hashtag, index) => (
              <div key={index} className={styles.hashtagCard}>
                <div className={styles.hashtagHeader}>
                  <div className={styles.hashtagName}>
                    <Hash className={styles.hashtagIcon} />
                    {hashtag.hashtag}
                  </div>
                  <div className={styles.trendIndicator}>
                    {getTrendIcon(hashtag.trend)}
                  </div>
                </div>
                
                <div className={styles.hashtagStats}>
                  <div className={styles.statRow}>
                    <span className={styles.statLabel}>Mentions</span>
                    <span className={styles.statValue}>{hashtag.count}</span>
                  </div>
                  
                  <div className={styles.statRow}>
                    <span className={styles.statLabel}>Engagement</span>
                    <span className={styles.statValue}>{formatNumber(hashtag.engagement.total)}</span>
                  </div>
                  
                  <div className={styles.statRow}>
                    <span className={styles.statLabel}>Platforms</span>
                    <span className={styles.statValue}>{hashtag.platforms.length}</span>
                  </div>
                  
                  <div className={styles.statRow}>
                    <span className={styles.statLabel}>Last Seen</span>
                    <span className={styles.statValue}>{formatDate(hashtag.lastSeen)}</span>
                  </div>
                </div>
                
                <div className={styles.platformTags}>
                  {hashtag.platforms.map((platform, idx) => (
                    <span key={idx} className={styles.platformTag}>
                      {platform}
                    </span>
                  ))}
                </div>
                
                <div className={styles.engagementBreakdown}>
                  <div className={styles.engagementItem}>
                    <Heart className={styles.engagementIcon} />
                    <span>{formatNumber(hashtag.engagement.likes)}</span>
                  </div>
                  <div className={styles.engagementItem}>
                    <Share className={styles.engagementIcon} />
                    <span>{formatNumber(hashtag.engagement.shares)}</span>
                  </div>
                  <div className={styles.engagementItem}>
                    <MessageCircle className={styles.engagementIcon} />
                    <span>{formatNumber(hashtag.engagement.comments)}</span>
                  </div>
                  <div className={styles.engagementItem}>
                    <Eye className={styles.engagementIcon} />
                    <span>{formatNumber(hashtag.engagement.views)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
