'use client';

import { useState, useEffect } from 'react';
import { 
  BarChart3, 
  PieChart, 
  TrendingUp, 
  TrendingDown,
  Users,
  MessageCircle,
  Heart,
  Share2,
  Eye,
  Hash,
  Calendar,
  Filter,
  Download,
  RefreshCw,
  Target,
  Zap,
  Activity
} from 'lucide-react';
import { ProcessedSocialContent, HashtagMetrics, PlatformMetrics } from '../services/socialDataProcessors';
import styles from './SocialListeningCharts.module.scss';

interface SocialListeningChartsProps {
  content: ProcessedSocialContent[];
  hashtags: HashtagMetrics[];
  platforms: PlatformMetrics[];
  loading?: boolean;
  onRefresh?: () => void;
}

export function SocialListeningCharts({ 
  content, 
  hashtags, 
  platforms, 
  loading = false,
  onRefresh 
}: SocialListeningChartsProps) {
  const [selectedTimeRange, setSelectedTimeRange] = useState<'24h' | '7d' | '30d' | '90d'>('7d');
  const [selectedPlatform, setSelectedPlatform] = useState<string>('all');
  const [chartType, setChartType] = useState<'engagement' | 'sentiment' | 'platforms' | 'hashtags'>('engagement');

  // Filter content based on time range and platform
  const filteredContent = content.filter(item => {
    const itemDate = new Date(item.publishedAt);
    const now = new Date();
    const timeDiff = now.getTime() - itemDate.getTime();
    const daysDiff = timeDiff / (1000 * 3600 * 24);
    
    let timeFilter = true;
    switch (selectedTimeRange) {
      case '24h':
        timeFilter = daysDiff <= 1;
        break;
      case '7d':
        timeFilter = daysDiff <= 7;
        break;
      case '30d':
        timeFilter = daysDiff <= 30;
        break;
      case '90d':
        timeFilter = daysDiff <= 90;
        break;
    }
    
    const platformFilter = selectedPlatform === 'all' || item.platform === selectedPlatform;
    
    return timeFilter && platformFilter;
  });

  // Calculate metrics
  const totalContent = filteredContent.length;
  const totalEngagement = filteredContent.reduce((sum, item) => sum + item.engagement.total, 0);
  const totalReach = filteredContent.reduce((sum, item) => sum + item.reach.estimated, 0);
  const avgEngagement = totalContent > 0 ? totalEngagement / totalContent : 0;
  const engagementRate = totalReach > 0 ? (totalEngagement / totalReach) * 100 : 0;

  // Sentiment analysis
  const sentimentData = {
    positive: filteredContent.filter(item => item.sentiment.label === 'positive').length,
    negative: filteredContent.filter(item => item.sentiment.label === 'negative').length,
    neutral: filteredContent.filter(item => item.sentiment.label === 'neutral').length
  };

  // Platform distribution
  const platformData = platforms.map(platform => ({
    name: platform.platform,
    content: platform.totalContent,
    engagement: platform.totalEngagement,
    reach: platform.reach,
    engagementRate: platform.engagementRate
  }));

  // Hashtag performance
  const topHashtags = hashtags.slice(0, 10);

  // Time series data (last 7 days)
  const timeSeriesData = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - i));
    const dateStr = date.toISOString().split('T')[0];
    
    const dayContent = filteredContent.filter(item => 
      new Date(item.publishedAt).toISOString().split('T')[0] === dateStr
    );
    
    return {
      date: dateStr,
      content: dayContent.length,
      engagement: dayContent.reduce((sum, item) => sum + item.engagement.total, 0),
      reach: dayContent.reduce((sum, item) => sum + item.reach.estimated, 0)
    };
  });

  const formatNumber = (num: number) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <RefreshCw className={styles.spinner} />
        <h3>Loading Social Media Data...</h3>
        <p>Analyzing content across all platforms</p>
      </div>
    );
  }

  return (
    <div className={styles.chartsContainer}>
      {/* Header Controls */}
      <div className={styles.headerControls}>
        <div className={styles.titleSection}>
          <h2>Social Listening Analytics</h2>
          <p>Real-time insights from your social media monitoring</p>
        </div>
        
        <div className={styles.controls}>
          <div className={styles.controlGroup}>
            <label>Time Range</label>
            <select 
              value={selectedTimeRange} 
              onChange={(e) => setSelectedTimeRange(e.target.value as any)}
              className={styles.controlSelect}
            >
              <option value="24h">Last 24 Hours</option>
              <option value="7d">Last 7 Days</option>
              <option value="30d">Last 30 Days</option>
              <option value="90d">Last 90 Days</option>
            </select>
          </div>
          
          <div className={styles.controlGroup}>
            <label>Platform</label>
            <select 
              value={selectedPlatform} 
              onChange={(e) => setSelectedPlatform(e.target.value)}
              className={styles.controlSelect}
            >
              <option value="all">All Platforms</option>
              {platforms.map(platform => (
                <option key={platform.platform} value={platform.platform}>
                  {platform.platform}
                </option>
              ))}
            </select>
          </div>
          
          <div className={styles.controlGroup}>
            <label>Chart Type</label>
            <select 
              value={chartType} 
              onChange={(e) => setChartType(e.target.value as any)}
              className={styles.controlSelect}
            >
              <option value="engagement">Engagement</option>
              <option value="sentiment">Sentiment</option>
              <option value="platforms">Platforms</option>
              <option value="hashtags">Hashtags</option>
            </select>
          </div>
          
          <button 
            className={styles.refreshButton}
            onClick={onRefresh}
            disabled={loading}
          >
            <RefreshCw className={loading ? styles.spinning : ''} />
            Refresh
          </button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className={styles.metricsGrid}>
        <div className={styles.metricCard}>
          <div className={styles.metricIcon}>
            <MessageCircle />
          </div>
          <div className={styles.metricContent}>
            <div className={styles.metricValue}>{formatNumber(totalContent)}</div>
            <div className={styles.metricLabel}>Total Posts</div>
          </div>
        </div>
        
        <div className={styles.metricCard}>
          <div className={styles.metricIcon}>
            <Heart />
          </div>
          <div className={styles.metricContent}>
            <div className={styles.metricValue}>{formatNumber(totalEngagement)}</div>
            <div className={styles.metricLabel}>Total Engagement</div>
          </div>
        </div>
        
        <div className={styles.metricCard}>
          <div className={styles.metricIcon}>
            <Eye />
          </div>
          <div className={styles.metricContent}>
            <div className={styles.metricValue}>{formatNumber(totalReach)}</div>
            <div className={styles.metricLabel}>Total Reach</div>
          </div>
        </div>
        
        <div className={styles.metricCard}>
          <div className={styles.metricIcon}>
            <Target />
          </div>
          <div className={styles.metricContent}>
            <div className={styles.metricValue}>{engagementRate.toFixed(1)}%</div>
            <div className={styles.metricLabel}>Engagement Rate</div>
          </div>
        </div>
      </div>

      {/* Main Charts */}
      <div className={styles.mainCharts}>
        {/* Time Series Chart */}
        <div className={styles.chartCard}>
          <div className={styles.chartHeader}>
            <h3>Engagement Over Time</h3>
            <Calendar />
          </div>
          <div className={styles.timeSeriesChart}>
            <div className={styles.chartContainer}>
              <svg viewBox="0 0 800 300" className={styles.chartSvg}>
                {/* Grid lines */}
                {Array.from({ length: 6 }, (_, i) => (
                  <line
                    key={i}
                    x1="50"
                    y1={50 + (i * 40)}
                    x2="750"
                    y2={50 + (i * 40)}
                    stroke="#e5e7eb"
                    strokeWidth="1"
                  />
                ))}
                
                {/* Engagement line */}
                <polyline
                  points={timeSeriesData.map((item, index) => {
                    const x = 50 + (index * 100);
                    const maxEngagement = Math.max(...timeSeriesData.map(d => d.engagement));
                    const y = 250 - ((item.engagement / maxEngagement) * 200);
                    return `${x},${y}`;
                  }).join(' ')}
                  fill="none"
                  stroke="#3b82f6"
                  strokeWidth="3"
                />
                
                {/* Data points */}
                {timeSeriesData.map((item, index) => {
                  const x = 50 + (index * 100);
                  const maxEngagement = Math.max(...timeSeriesData.map(d => d.engagement));
                  const y = 250 - ((item.engagement / maxEngagement) * 200);
                  return (
                    <circle
                      key={index}
                      cx={x}
                      cy={y}
                      r="4"
                      fill="#3b82f6"
                    />
                  );
                })}
                
                {/* X-axis labels */}
                {timeSeriesData.map((item, index) => {
                  const x = 50 + (index * 100);
                  return (
                    <text
                      key={index}
                      x={x}
                      y="290"
                      textAnchor="middle"
                      className={styles.axisLabel}
                    >
                      {formatDate(item.date)}
                    </text>
                  );
                })}
              </svg>
            </div>
          </div>
        </div>

        {/* Sentiment Analysis */}
        {chartType === 'sentiment' && (
          <div className={styles.chartCard}>
            <div className={styles.chartHeader}>
              <h3>Sentiment Analysis</h3>
              <PieChart />
            </div>
            <div className={styles.sentimentChart}>
              <div className={styles.pieChart}>
                <svg viewBox="0 0 200 200" className={styles.pieSvg}>
                  <circle
                    cx="100"
                    cy="100"
                    r="80"
                    fill="none"
                    stroke="#e5e7eb"
                    strokeWidth="20"
                  />
                  <circle
                    cx="100"
                    cy="100"
                    r="80"
                    fill="none"
                    stroke="#10b981"
                    strokeWidth="20"
                    strokeDasharray={`${(sentimentData.positive / totalContent) * 502.4} 502.4`}
                    strokeDashoffset="0"
                    transform="rotate(-90 100 100)"
                  />
                  <circle
                    cx="100"
                    cy="100"
                    r="80"
                    fill="none"
                    stroke="#ef4444"
                    strokeWidth="20"
                    strokeDasharray={`${(sentimentData.negative / totalContent) * 502.4} 502.4`}
                    strokeDashoffset={`-${(sentimentData.positive / totalContent) * 502.4}`}
                    transform="rotate(-90 100 100)"
                  />
                  <circle
                    cx="100"
                    cy="100"
                    r="80"
                    fill="none"
                    stroke="#6b7280"
                    strokeWidth="20"
                    strokeDasharray={`${(sentimentData.neutral / totalContent) * 502.4} 502.4`}
                    strokeDashoffset={`-${((sentimentData.positive + sentimentData.negative) / totalContent) * 502.4}`}
                    transform="rotate(-90 100 100)"
                  />
                </svg>
              </div>
              <div className={styles.sentimentLegend}>
                <div className={styles.legendItem}>
                  <div className={styles.legendColor} style={{ backgroundColor: '#10b981' }}></div>
                  <span>Positive ({sentimentData.positive})</span>
                </div>
                <div className={styles.legendItem}>
                  <div className={styles.legendColor} style={{ backgroundColor: '#ef4444' }}></div>
                  <span>Negative ({sentimentData.negative})</span>
                </div>
                <div className={styles.legendItem}>
                  <div className={styles.legendColor} style={{ backgroundColor: '#6b7280' }}></div>
                  <span>Neutral ({sentimentData.neutral})</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Platform Performance */}
        {chartType === 'platforms' && (
          <div className={styles.chartCard}>
            <div className={styles.chartHeader}>
              <h3>Platform Performance</h3>
              <BarChart3 />
            </div>
            <div className={styles.platformChart}>
              {platformData.map((platform, index) => {
                const maxEngagement = Math.max(...platformData.map(p => p.engagement));
                const width = (platform.engagement / maxEngagement) * 100;
                return (
                  <div key={platform.name} className={styles.platformBar}>
                    <div className={styles.platformLabel}>{platform.name}</div>
                    <div className={styles.platformBarContainer}>
                      <div 
                        className={styles.platformBarFill}
                        style={{ 
                          width: `${width}%`,
                          backgroundColor: `hsl(${index * 60}, 70%, 50%)`
                        }}
                      ></div>
                      <div className={styles.platformValue}>
                        {formatNumber(platform.engagement)}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Hashtag Performance */}
        {chartType === 'hashtags' && (
          <div className={styles.chartCard}>
            <div className={styles.chartHeader}>
              <h3>Top Hashtags</h3>
              <Hash />
            </div>
            <div className={styles.hashtagChart}>
              {topHashtags.map((hashtag, index) => {
                const maxEngagement = Math.max(...topHashtags.map(h => h.engagement.total));
                const width = (hashtag.engagement.total / maxEngagement) * 100;
                return (
                  <div key={hashtag.hashtag} className={styles.hashtagBar}>
                    <div className={styles.hashtagLabel}>{hashtag.hashtag}</div>
                    <div className={styles.hashtagBarContainer}>
                      <div 
                        className={styles.hashtagBarFill}
                        style={{ 
                          width: `${width}%`,
                          backgroundColor: `hsl(${index * 40}, 70%, 50%)`
                        }}
                      ></div>
                      <div className={styles.hashtagValue}>
                        {formatNumber(hashtag.engagement.total)}
                      </div>
                    </div>
                    <div className={styles.hashtagStats}>
                      <span>{hashtag.count} mentions</span>
                      <span>{hashtag.platforms.length} platforms</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Export Button */}
      <div className={styles.exportSection}>
        <button className={styles.exportButton}>
          <Download />
          Export Analytics Data
        </button>
      </div>
    </div>
  );
}


