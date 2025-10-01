'use client';

import { useState, useEffect } from 'react';
import { useAppSelector, useAppDispatch } from '@/lib/hooks/redux';
import { useNewsArticles, useUpdateFilters, useCollectNewsData } from '@/lib/hooks/useNews';
import { setUser } from '@/lib/store/slices/userSlice';
import styles from './NewsMonitoring.module.scss';

interface NewsArticle {
  id: number;
  title: string;
  description: string;
  url: string;
  publishedAt: string;
  source: {
    name: string;
    logo?: string;
  };
  sentiment: {
    overall: {
      score: number;
      label: string;
    };
  };
  image?: string;
  readTime: number;
  categories: string[];
  topics: string[];
  isBreaking: boolean;
  engagement?: {
    views?: number;
    shares?: number;
    comments?: number;
  };
}

interface NewsMonitoringProps {
  monitoringData: any[];
  keywords: string[];
}

export function NewsMonitoring({ monitoringData, keywords }: NewsMonitoringProps) {
  const [selectedKeyword, setSelectedKeyword] = useState<string>('all');
  const [selectedSource, setSelectedSource] = useState<string>('all');
  const [selectedSentiment, setSelectedSentiment] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('date');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [filteredArticles, setFilteredArticles] = useState<NewsArticle[]>([]);

  // Process monitoring data into articles
  useEffect(() => {
    const processedArticles: NewsArticle[] = [];
    
    monitoringData.forEach((data) => {
      if (data.newsData?.results) {
        data.newsData.results.forEach((article: any) => {
          processedArticles.push({
            id: article.id,
            title: article.title || 'No title',
            description: article.description || article.body || 'No description',
            url: article.href || '#',
            publishedAt: article.published_at || new Date().toISOString(),
            source: {
              name: article.source?.name || 'Unknown Source',
              logo: article.source?.logo
            },
            sentiment: article.sentiment || { overall: { score: 0, label: 'neutral' } },
            image: article.image,
            readTime: article.read_time || 1,
            categories: article.categories || [],
            topics: article.topics || [],
            isBreaking: article.is_breaking || false,
            engagement: {
              views: article.views || 0,
              shares: article.shares || 0,
              comments: article.comments || 0
            }
          });
        });
      }
    });

    setArticles(processedArticles);
    setFilteredArticles(processedArticles);
  }, [monitoringData]);

  // Filter and sort articles
  useEffect(() => {
    let filtered = [...articles];

    // Filter by keyword
    if (selectedKeyword !== 'all') {
      filtered = filtered.filter(article => 
        article.title.toLowerCase().includes(selectedKeyword.toLowerCase()) ||
        article.description.toLowerCase().includes(selectedKeyword.toLowerCase())
      );
    }

    // Filter by source
    if (selectedSource !== 'all') {
      filtered = filtered.filter(article => 
        article.source.name.toLowerCase().includes(selectedSource.toLowerCase())
      );
    }

    // Filter by sentiment
    if (selectedSentiment !== 'all') {
      filtered = filtered.filter(article => {
        const score = article.sentiment.overall.score;
        if (selectedSentiment === 'positive') return score > 0.1;
        if (selectedSentiment === 'negative') return score < -0.1;
        return score >= -0.1 && score <= 0.1;
      });
    }

    // Sort articles
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'date':
          return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime();
        case 'sentiment':
          return b.sentiment.overall.score - a.sentiment.overall.score;
        case 'title':
          return a.title.localeCompare(b.title);
        case 'source':
          return a.source.name.localeCompare(b.source.name);
        default:
          return 0;
      }
    });

    setFilteredArticles(filtered);
  }, [articles, selectedKeyword, selectedSource, selectedSentiment, sortBy]);

  const getSentimentColor = (score: number) => {
    if (score > 0.1) return '#48bb78'; // positive - green
    if (score < -0.1) return '#f56565'; // negative - red
    return '#a0aec0'; // neutral - gray
  };

  const getSentimentLabel = (score: number) => {
    if (score > 0.1) return 'Positive';
    if (score < -0.1) return 'Negative';
    return 'Neutral';
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

  const totalArticles = filteredArticles.length;
  const breakingNews = filteredArticles.filter(article => article.isBreaking).length;
  const sentimentBreakdown = {
    positive: filteredArticles.filter(article => article.sentiment.overall.score > 0.1).length,
    negative: filteredArticles.filter(article => article.sentiment.overall.score < -0.1).length,
    neutral: filteredArticles.filter(article => 
      article.sentiment.overall.score >= -0.1 && article.sentiment.overall.score <= 0.1
    ).length
  };

  const uniqueSources = [...new Set(articles.map(article => article.source.name))];

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <h1 className={styles.title}>News Blog Monitoring</h1>
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
              <span>⊞</span>
            </button>
            <button 
              className={`${styles.toggleBtn} ${viewMode === 'list' ? styles.active : ''}`}
              onClick={() => setViewMode('list')}
            >
              <span>☰</span>
            </button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={styles.statIcon}>📰</div>
          <div className={styles.statContent}>
            <div className={styles.statNumber}>{totalArticles}</div>
            <div className={styles.statLabel}>Total Articles</div>
          </div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statIcon}>🔥</div>
          <div className={styles.statContent}>
            <div className={styles.statNumber}>{breakingNews}</div>
            <div className={styles.statLabel}>Breaking News</div>
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
            {uniqueSources.map(source => (
              <option key={source} value={source}>{source}</option>
            ))}
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
            <option value="date">Most Recent</option>
            <option value="sentiment">Most Positive</option>
            <option value="title">Title A-Z</option>
            <option value="source">Source A-Z</option>
          </select>
        </div>
      </div>

      {/* Articles */}
      <div className={styles.articlesSection}>
        {filteredArticles.length === 0 ? (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>📰</div>
            <h3>No articles found</h3>
            <p>Try adjusting your filters or collect more data.</p>
          </div>
        ) : (
          <div className={`${styles.articlesContainer} ${viewMode === 'list' ? styles.listView : styles.gridView}`}>
            {filteredArticles.map((article) => (
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
                      <span className={styles.sourceName}>{article.source.name}</span>
                      <span className={styles.publishTime}>{formatDate(article.publishedAt)}</span>
                    </div>
                    <div 
                      className={styles.sentimentBadge}
                      style={{ backgroundColor: getSentimentColor(article.sentiment.overall.score) }}
                    >
                      {getSentimentLabel(article.sentiment.overall.score)}
                    </div>
                  </div>
                  
                  <h3 className={styles.articleTitle}>
                    <a href={article.url} target="_blank" rel="noopener noreferrer">
                      {article.title}
                    </a>
                  </h3>
                  
                  <p className={styles.articleDescription}>
                    {article.description.length > 200 
                      ? `${article.description.substring(0, 200)}...` 
                      : article.description
                    }
                  </p>
                  
                  <div className={styles.articleMeta}>
                    <div className={styles.readTime}>
                      <span>⏱️</span>
                      {article.readTime} min read
                    </div>
                    
                    {article.categories.length > 0 && (
                      <div className={styles.categories}>
                        {article.categories.slice(0, 3).map((category, index) => (
                          <span key={index} className={styles.categoryTag}>
                            {category}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  
                  {article.engagement && (
                    <div className={styles.engagementStats}>
                      <span>👁️ {formatNumber(article.engagement.views || 0)}</span>
                      <span>🔄 {formatNumber(article.engagement.shares || 0)}</span>
                      <span>💬 {formatNumber(article.engagement.comments || 0)}</span>
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
