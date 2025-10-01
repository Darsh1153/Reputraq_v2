'use client';

import { useState, useEffect, useRef } from 'react';
import { useAppSelector, useAppDispatch } from '@/lib/hooks/redux';
import { useNewsArticles, useUpdateFilters, useCollectNewsData } from '@/lib/hooks/useNewsSimple';
import { setUser } from '@/lib/store/slices/userSlice';
import { setLoadingMessage } from '@/lib/store/slices/newsSlice';
import { 
  Newspaper, 
  Zap, 
  Grid3X3, 
  List, 
  TrendingUp, 
  TrendingDown, 
  Minus,
  Eye,
  Share2,
  MessageSquare,
  Clock,
  Tag,
  ExternalLink
} from 'lucide-react';
import { InteractiveGraphs } from './InteractiveGraphs';
import ExportButton from './ExportButton';
import { createNewsExportData } from '@/utils/exportUtils';
import styles from './NewsMonitoring.module.scss';

interface NewsMonitoringProps {
  keywords: string[];
}

export function NewsMonitoringRedux({ keywords }: NewsMonitoringProps) {
  const dispatch = useAppDispatch();
  const { articles, loading, error, filters } = useAppSelector((state) => state.news);
  const { user } = useAppSelector((state) => state.user);
  
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [page, setPage] = useState(1);
  const [cronEnabled, setCronEnabled] = useState(false);
  const [lastCollectionTime, setLastCollectionTime] = useState<string | null>(null);
  const newsSectionRef = useRef<HTMLDivElement>(null);
  
  const updateFilters = useUpdateFilters();
  const collectNewsData = useCollectNewsData();
  
  // User is now loaded in the parent component

  // Check cron job status
  useEffect(() => {
    const checkCronStatus = async () => {
      if (user) {
        try {
          const token = btoa(JSON.stringify({ userId: user.id }));
          const response = await fetch('/api/cron', {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });

          if (response.ok) {
            const result = await response.json();
            const settings = result.settings;
            setCronEnabled(settings.isEnabled);
            setLastCollectionTime(settings.lastRunAt);
          }
        } catch (error) {
          console.error('Error checking cron status:', error);
        }
      }
    };

    checkCronStatus();
  }, [user]);

  // Articles are now loaded from Redux state (no need to fetch)
  const isLoading = false; // No loading since we're using Redux state
  const queryError = null; // No query errors since we're not fetching

  // Handle filter changes
  const handleFilterChange = (filterType: string, value: string) => {
    updateFilters({ [filterType]: value });
    setPage(1); // Reset to first page when filters change
  };

  // Handle data collection
  const handleCollectData = async () => {
    if (user) {
      console.log('Starting data collection for user:', user.id);
      try {
        await collectNewsData.mutateAsync(user.id);
        console.log('Data collection completed');
        // Data will be automatically updated in Redux state
      } catch (error) {
        console.error('Failed to collect data:', error);
      }
    } else {
      console.log('No user found for data collection');
    }
  };

  const getSentimentColor = (score: number) => {
    if (score > 10) return '#10b981'; // positive - green
    if (score < -10) return '#ef4444'; // negative - red
    return '#6b7280'; // neutral - gray
  };

  const getSentimentLabel = (score: number) => {
    if (score > 10) return 'Positive';
    if (score < -10) return 'Negative';
    return 'Neutral';
  };

  const getSentimentIcon = (score: number) => {
    if (score > 10) return <TrendingUp size={16} />;
    if (score < -10) return <TrendingDown size={16} />;
    return <Minus size={16} />;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInHours < 48) return 'Yesterday';
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
    });
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const totalArticles = articles.length;
  const breakingNews = articles.filter(article => article.isBreaking).length;
  const sentimentBreakdown = {
    positive: articles.filter(article => (article.sentimentScore || 0) > 10).length,
    negative: articles.filter(article => (article.sentimentScore || 0) < -10).length,
    neutral: articles.filter(article => 
      (article.sentimentScore || 0) >= -10 && (article.sentimentScore || 0) <= 10
    ).length
  };

  const uniqueSources = [...new Set(articles.map(article => article.sourceName))];

  if (isLoading && articles.length === 0) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>
          <div className={styles.spinner}></div>
          <p>Loading news data...</p>
        </div>
      </div>
    );
  }

  if (error || queryError) {
    return (
      <div className={styles.container}>
        <div className={styles.error}>
          <h2>Error Loading Data</h2>
          <p>{error || queryError?.message || 'Failed to load news data'}</p>
          <button onClick={handleCollectData} className={styles.retryButton}>
            Collect Data
          </button>
        </div>
      </div>
    );
  }

  return (
    <div ref={newsSectionRef} className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <div className={styles.titleSection}>
            <Newspaper size={24} className={styles.titleIcon} />
            <h1 className={styles.title}>News Blog Monitoring</h1>
          </div>
          <p className={styles.subtitle}>
            {totalArticles} articles found across {keywords.length} keywords
          </p>
        </div>
        <div className={styles.headerRight}>
          <div className={styles.viewModeToggle}>
            <button 
              className={`${styles.toggleBtn} ${viewMode === 'grid' ? styles.active : ''}`}
              onClick={() => setViewMode('grid')}
            >
              <Grid3X3 size={16} />
            </button>
            <button 
              className={`${styles.toggleBtn} ${viewMode === 'list' ? styles.active : ''}`}
              onClick={() => setViewMode('list')}
            >
              <List size={16} />
            </button>
          </div>
          {articles.length > 0 && (
            <div className={styles.exportSection}>
              <ExportButton
                data={createNewsExportData(articles)}
                variant="primary"
                size="medium"
                showLabel={true}
                targetElementRef={newsSectionRef}
              />
            </div>
          )}
          {cronEnabled ? (
            <div className={styles.automationStatus}>
              <div className={styles.automationIcon}>
                <Clock size={16} />
              </div>
              <div className={styles.automationContent}>
                <div className={styles.automationTitle}>Auto Collection</div>
                <div className={styles.automationSubtitle}>
                  {lastCollectionTime 
                    ? `Last: ${new Date(lastCollectionTime).toLocaleString()}`
                    : 'Every 24 hours'
                  }
                </div>
              </div>
            </div>
          ) : (
            <button 
              onClick={handleCollectData}
              disabled={collectNewsData.isPending}
              className={styles.collectButton}
            >
              <Zap size={16} />
              {collectNewsData.isPending ? 'Collecting...' : 'Collect New Data'}
            </button>
          )}
          <button 
            onClick={() => {
              console.log('Test loading button clicked');
              dispatch(setLoadingMessage('Test loading message...'));
            }}
            style={{ marginLeft: '10px', padding: '8px 16px', background: '#ff6b6b', color: 'white', border: 'none', borderRadius: '4px' }}
          >
            Test Loading
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={styles.statIcon}>
            <Newspaper size={20} />
          </div>
          <div className={styles.statContent}>
            <div className={styles.statNumber}>{totalArticles}</div>
            <div className={styles.statLabel}>Total Articles</div>
          </div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statIcon}>
            <Zap size={20} />
          </div>
          <div className={styles.statContent}>
            <div className={styles.statNumber}>{breakingNews}</div>
            <div className={styles.statLabel}>Breaking News</div>
          </div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statIcon}>
            <TrendingUp size={20} />
          </div>
          <div className={styles.statContent}>
            <div className={styles.statNumber}>{sentimentBreakdown.positive}</div>
            <div className={styles.statLabel}>Positive</div>
          </div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statIcon}>
            <Minus size={20} />
          </div>
          <div className={styles.statContent}>
            <div className={styles.statNumber}>{sentimentBreakdown.neutral}</div>
            <div className={styles.statLabel}>Neutral</div>
          </div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statIcon}>
            <TrendingDown size={20} />
          </div>
          <div className={styles.statContent}>
            <div className={styles.statNumber}>{sentimentBreakdown.negative}</div>
            <div className={styles.statLabel}>Negative</div>
          </div>
        </div>
      </div>

      {/* Interactive Graphs */}
      <div className={styles.graphsSection}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Data Analytics & Insights</h2>
        </div>
        <InteractiveGraphs articles={articles} keywords={keywords} />
      </div>

      {/* Filters */}
      <div className={styles.filters}>
        <div className={styles.filterGroup}>
          <label>Keyword:</label>
          <select 
            value={filters.keyword} 
            onChange={(e) => handleFilterChange('keyword', e.target.value)}
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
            value={filters.source} 
            onChange={(e) => handleFilterChange('source', e.target.value)}
            className={styles.filterSelect}
          >
            <option value="all">All Sources</option>
            {uniqueSources.map(source => (
              <option key={source} value={source}>{source}</option>
            ))}
          </select>
        </div>
        
        <div className={styles.filterGroup}>
          <label>Sentiment:</label>
          <select 
            value={filters.sentiment} 
            onChange={(e) => handleFilterChange('sentiment', e.target.value)}
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
            value={filters.sortBy} 
            onChange={(e) => handleFilterChange('sortBy', e.target.value)}
            className={styles.filterSelect}
          >
            <option value="date">Most Recent</option>
            <option value="sentiment">Most Positive</option>
            <option value="title">Title A-Z</option>
            <option value="source">Source A-Z</option>
          </select>
        </div>
      </div>

      {/* Articles */}
      <div className={styles.articlesSection}>
        {articles.length === 0 ? (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>📰</div>
            <h3>No articles found</h3>
            <p>Try collecting data or adjusting your filters.</p>
            <button onClick={handleCollectData} className={styles.collectButton}>
              Collect New Data
            </button>
          </div>
        ) : (
          <div className={`${styles.articlesContainer} ${viewMode === 'list' ? styles.listView : styles.gridView}`}>
            {articles.map((article) => (
              <div key={article.id} className={styles.articleCard}>
                {article.isBreaking && (
                  <div className={styles.breakingBadge}>BREAKING</div>
                )}
                
                {article.image && (
                  <div className={styles.articleImage}>
                    <img src={article.image} alt={article.title} />
                  </div>
                )}
                
                <div className={styles.articleContent}>
                  <div className={styles.articleHeader}>
                    <div className={styles.sourceInfo}>
                      <span className={styles.sourceName}>{article.sourceName}</span>
                      <span className={styles.publishTime}>{formatDate(article.publishedAt)}</span>
                    </div>
                    <div 
                      className={styles.sentimentBadge}
                      style={{ backgroundColor: getSentimentColor(article.sentimentScore || 0) }}
                    >
                      {getSentimentLabel(article.sentimentScore || 0)}
                    </div>
                  </div>
                  
                  <h3 className={styles.articleTitle}>
                    <a href={article.url} target="_blank" rel="noopener noreferrer">
                      {article.title}
                      <ExternalLink size={14} className={styles.externalLink} />
                    </a>
                  </h3>
                  
                  <p className={styles.articleDescription}>
                    {article.description && article.description.length > 200 
                      ? `${article.description.substring(0, 200)}...` 
                      : article.description || 'No description available'
                    }
                  </p>
                  
                  <div className={styles.articleMeta}>
                    <div className={styles.readTime}>
                      <Clock size={14} />
                      {article.readTime || 1} min read
                    </div>
                    
                    {article.categories && article.categories.length > 0 && (
                      <div className={styles.categories}>
                        {article.categories.slice(0, 3).map((category, index) => {
                          // Debug logging
                          console.log('Category item:', category, 'Type:', typeof category);
                          return (
                            <span key={index} className={styles.categoryTag}>
                              {typeof category === 'string' ? category : category.name || category.id || 'Category'}
                            </span>
                          );
                        })}
                      </div>
                    )}
                  </div>
                  
                  {article.engagement && (
                    <div className={styles.engagementStats}>
                      <span><Eye size={14} /> {formatNumber(article.engagement.views || 0)}</span>
                      <span><Share2 size={14} /> {formatNumber(article.engagement.shares || 0)}</span>
                      <span><MessageSquare size={14} /> {formatNumber(article.engagement.comments || 0)}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
