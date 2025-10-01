'use client';

import { useState, useEffect } from 'react';
import styles from './DataVisualization.module.scss';

interface Mention {
  id: string;
  title: string;
  description: string;
  url: string;
  source: string;
  publishedAt: string;
  sentiment: 'positive' | 'negative' | 'neutral';
  influenceScore: number;
  engagement?: {
    likes?: number;
    views?: number;
    shares?: number;
    comments?: number;
  };
  type: 'news' | 'social' | 'web';
}

interface DataVisualizationProps {
  monitoringData: any[];
  keywords: string[];
}

export function DataVisualization({ monitoringData, keywords }: DataVisualizationProps) {
  const [selectedKeyword, setSelectedKeyword] = useState<string>('all');
  const [selectedSource, setSelectedSource] = useState<string>('all');
  const [selectedSentiment, setSelectedSentiment] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('relevant');
  const [dateRange, setDateRange] = useState<string>('30');
  const [mentions, setMentions] = useState<Mention[]>([]);
  const [filteredMentions, setFilteredMentions] = useState<Mention[]>([]);

  // Process monitoring data into mentions
  useEffect(() => {
    const processedMentions: Mention[] = [];
    
    monitoringData.forEach((data) => {
      // Process news data
      if (data.newsData?.results) {
        data.newsData.results.forEach((article: any, index: number) => {
          processedMentions.push({
            id: `news-${data.keyword}-${index}`,
            title: article.title || 'No title',
            description: article.description || article.body || 'No description',
            url: article.href || '#',
            source: article.source?.name || 'Unknown News Source',
            publishedAt: article.published_at || new Date().toISOString(),
            sentiment: getSentimentFromScore(article.sentiment?.overall?.score || 0),
            influenceScore: Math.floor(Math.random() * 10) + 1,
            type: 'news',
            engagement: {
              views: article.views || 0,
              shares: article.shares || 0,
              comments: article.comments || 0
            }
          });
        });
      }

      // Process social data
      if (data.socialData?.data) {
        data.socialData.data.forEach((post: any, index: number) => {
          processedMentions.push({
            id: `social-${data.keyword}-${index}`,
            title: post.title || 'Social Media Post',
            description: post.description || 'No description',
            url: post.url || '#',
            source: post.work_platform?.name || 'Social Media',
            publishedAt: post.published_at || new Date().toISOString(),
            sentiment: getSentimentFromScore(Math.random() - 0.5), // Random sentiment for social
            influenceScore: Math.floor(Math.random() * 10) + 1,
            type: 'social',
            engagement: {
              likes: post.engagement?.like_count || 0,
              views: post.engagement?.view_count || 0,
              shares: post.engagement?.share_count || 0,
              comments: post.engagement?.comment_count || 0
            }
          });
        });
      }
    });

    setMentions(processedMentions);
    setFilteredMentions(processedMentions);
  }, [monitoringData]);

  // Filter mentions based on selected criteria
  useEffect(() => {
    let filtered = [...mentions];

    // Filter by keyword
    if (selectedKeyword !== 'all') {
      filtered = filtered.filter(mention => 
        mention.title.toLowerCase().includes(selectedKeyword.toLowerCase()) ||
        mention.description.toLowerCase().includes(selectedKeyword.toLowerCase())
      );
    }

    // Filter by source
    if (selectedSource !== 'all') {
      filtered = filtered.filter(mention => 
        mention.source.toLowerCase().includes(selectedSource.toLowerCase())
      );
    }

    // Filter by sentiment
    if (selectedSentiment !== 'all') {
      filtered = filtered.filter(mention => mention.sentiment === selectedSentiment);
    }

    // Sort mentions
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'relevant':
          return b.influenceScore - a.influenceScore;
        case 'date':
          return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime();
        case 'engagement':
          const aEngagement = (a.engagement?.likes || 0) + (a.engagement?.views || 0) + (a.engagement?.shares || 0);
          const bEngagement = (b.engagement?.likes || 0) + (b.engagement?.views || 0) + (b.engagement?.shares || 0);
          return bEngagement - aEngagement;
        default:
          return 0;
      }
    });

    setFilteredMentions(filtered);
  }, [mentions, selectedKeyword, selectedSource, selectedSentiment, sortBy]);

  const getSentimentFromScore = (score: number): 'positive' | 'negative' | 'neutral' => {
    if (score > 0.1) return 'positive';
    if (score < -0.1) return 'negative';
    return 'neutral';
  };

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'positive': return '#48bb78';
      case 'negative': return '#f56565';
      default: return '#a0aec0';
    }
  };

  const getSourceIcon = (type: string) => {
    switch (type) {
      case 'news': return '📰';
      case 'social': return '📱';
      default: return '🌐';
    }
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const totalMentions = filteredMentions.length;
  const totalReach = filteredMentions.reduce((sum, mention) => 
    sum + (mention.engagement?.views || 0), 0
  );
  const sentimentBreakdown = {
    positive: filteredMentions.filter(m => m.sentiment === 'positive').length,
    negative: filteredMentions.filter(m => m.sentiment === 'negative').length,
    neutral: filteredMentions.filter(m => m.sentiment === 'neutral').length
  };

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <h1 className={styles.title}>Mentions & Analytics</h1>
          <p className={styles.subtitle}>
            {totalMentions} mentions found across {keywords.length} keywords
          </p>
        </div>
        <div className={styles.headerRight}>
          <select 
            value={dateRange} 
            onChange={(e) => setDateRange(e.target.value)}
            className={styles.dateRange}
          >
            <option value="7">Last 7 days</option>
            <option value="30">Last 30 days</option>
            <option value="90">Last 90 days</option>
          </select>
        </div>
      </div>

      {/* Stats Cards */}
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={styles.statIcon}>📊</div>
          <div className={styles.statContent}>
            <div className={styles.statNumber}>{totalMentions}</div>
            <div className={styles.statLabel}>Total Mentions</div>
          </div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statIcon}>👁️</div>
          <div className={styles.statContent}>
            <div className={styles.statNumber}>{formatNumber(totalReach)}</div>
            <div className={styles.statLabel}>Total Reach</div>
          </div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statIcon}>😊</div>
          <div className={styles.statContent}>
            <div className={styles.statNumber}>{sentimentBreakdown.positive}</div>
            <div className={styles.statLabel}>Positive</div>
          </div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statIcon}>😐</div>
          <div className={styles.statContent}>
            <div className={styles.statNumber}>{sentimentBreakdown.neutral}</div>
            <div className={styles.statLabel}>Neutral</div>
          </div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statIcon}>😞</div>
          <div className={styles.statContent}>
            <div className={styles.statNumber}>{sentimentBreakdown.negative}</div>
            <div className={styles.statLabel}>Negative</div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className={styles.filters}>
        <div className={styles.filterGroup}>
          <label>Keyword:</label>
          <select 
            value={selectedKeyword} 
            onChange={(e) => setSelectedKeyword(e.target.value)}
            className={styles.filterSelect}
          >
            <option value="all">All Keywords</option>
            {keywords.map(keyword => (
              <option key={keyword} value={keyword}>{keyword}</option>
            ))}
          </select>
        </div>
        
        <div className={styles.filterGroup}>
          <label>Source:</label>
          <select 
            value={selectedSource} 
            onChange={(e) => setSelectedSource(e.target.value)}
            className={styles.filterSelect}
          >
            <option value="all">All Sources</option>
            <option value="news">News</option>
            <option value="social">Social Media</option>
            <option value="web">Web</option>
          </select>
        </div>
        
        <div className={styles.filterGroup}>
          <label>Sentiment:</label>
          <select 
            value={selectedSentiment} 
            onChange={(e) => setSelectedSentiment(e.target.value)}
            className={styles.filterSelect}
          >
            <option value="all">All Sentiments</option>
            <option value="positive">Positive</option>
            <option value="neutral">Neutral</option>
            <option value="negative">Negative</option>
          </select>
        </div>
        
        <div className={styles.filterGroup}>
          <label>Sort by:</label>
          <select 
            value={sortBy} 
            onChange={(e) => setSortBy(e.target.value)}
            className={styles.filterSelect}
          >
            <option value="relevant">Most Relevant</option>
            <option value="date">Most Recent</option>
            <option value="engagement">Most Engaged</option>
          </select>
        </div>
      </div>

      {/* Mentions List */}
      <div className={styles.mentionsSection}>
        <div className={styles.mentionsHeader}>
          <h2>Mentions ({filteredMentions.length})</h2>
          <div className={styles.mentionsActions}>
            <button className={styles.actionButton}>Export</button>
            <button className={styles.actionButton}>Generate Report</button>
          </div>
        </div>

        {filteredMentions.length === 0 ? (
          <div className={styles.emptyState}>
            <p>No mentions found with the current filters.</p>
            <p>Try adjusting your filters or collect more data.</p>
          </div>
        ) : (
          <div className={styles.mentionsList}>
            {filteredMentions.map((mention) => (
              <div key={mention.id} className={styles.mentionCard}>
                <div className={styles.mentionHeader}>
                  <div className={styles.mentionTitle}>
                    <span className={styles.sourceIcon}>
                      {getSourceIcon(mention.type)}
                    </span>
                    <h3>{mention.title}</h3>
                  </div>
                  <div className={styles.mentionMeta}>
                    <span 
                      className={styles.sentimentBadge}
                      style={{ backgroundColor: getSentimentColor(mention.sentiment) }}
                    >
                      {mention.sentiment}
                    </span>
                    <span className={styles.influenceScore}>
                      Influence: {mention.influenceScore}/10
                    </span>
                  </div>
                </div>
                
                <div className={styles.mentionContent}>
                  <p className={styles.mentionDescription}>
                    {mention.description}
                  </p>
                  
                  <div className={styles.mentionDetails}>
                    <div className={styles.mentionSource}>
                      <strong>Source:</strong> {mention.source}
                    </div>
                    <div className={styles.mentionDate}>
                      <strong>Published:</strong> {formatDate(mention.publishedAt)}
                    </div>
                    {mention.engagement && (
                      <div className={styles.engagementStats}>
                        <span>👁️ {formatNumber(mention.engagement.views || 0)} views</span>
                        <span>❤️ {formatNumber(mention.engagement.likes || 0)} likes</span>
                        <span>🔄 {formatNumber(mention.engagement.shares || 0)} shares</span>
                        <span>💬 {formatNumber(mention.engagement.comments || 0)} comments</span>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className={styles.mentionActions}>
                  <button className={styles.actionBtn}>
                    <span>🔗</span> Visit
                  </button>
                  <button className={styles.actionBtn}>
                    <span>🏷️</span> Tag
                  </button>
                  <button className={styles.actionBtn}>
                    <span>📄</span> Add to Report
                  </button>
                  <button className={styles.actionBtn}>
                    <span>🔇</span> Mute
                  </button>
                  <button className={styles.actionBtn}>
                    <span>⋯</span> More
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
