'use client';

import React, { useState, useEffect } from 'react';
import { useAppSelector } from '@/lib/hooks/redux';
import { Calendar, Clock, TrendingUp, BarChart3, Filter, RefreshCw } from 'lucide-react';
import DateRangeSlider from './DateRangeSlider';
import styles from './HistoricalDataDisplay.module.scss';

// Debounce utility function
function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

interface HistoricalDataItem {
  id: number;
  keyword: string;
  title: string;
  description?: string;
  url: string;
  publishedAt: string;
  collectedAt: string;
  sentimentScore?: number;
  sentimentLabel?: string;
  sourceName?: string;
  platformName?: string;
  image?: string;
  engagement?: any;
}

interface HistoricalDataProps {
  userId: number;
  keywords: string[];
  className?: string;
}

export function HistoricalDataDisplay({ userId, keywords, className = '' }: HistoricalDataProps) {
  // Access Redux data as fallback
  const { articles: reduxArticles } = useAppSelector((state) => state.news);
  
  const [historicalData, setHistoricalData] = useState<{
    news: HistoricalDataItem[];
    social: HistoricalDataItem[];
    totalNews: number;
    totalSocial: number;
  }>({
    news: [],
    social: [],
    totalNews: 0,
    totalSocial: 0
  });
  
  const [loading, setLoading] = useState(true); // Start with loading true
  const [error, setError] = useState<string | null>(null);
  const [selectedKeyword, setSelectedKeyword] = useState<string>('');
  const [dataType, setDataType] = useState<'all' | 'news' | 'social'>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(20);
  const [initialized, setInitialized] = useState(false);
  const [usingReduxFallback, setUsingReduxFallback] = useState(false);

  // Initial data fetch - prioritize Redux data, fallback to localStorage
  useEffect(() => {
    if (!initialized) {
      console.log('🔍 Historical Data Component - Checking Redux data...');
      console.log('📊 Redux articles:', reduxArticles);
      console.log('📊 Redux articles length:', reduxArticles?.length || 0);
      
      // First, try to use Redux data if available
      if (reduxArticles && reduxArticles.length > 0) {
        console.log('📊 Using Redux data directly (no API call)');
        console.log('📋 Redux articles found:', reduxArticles.map(a => a.title));
        const transformedData = transformReduxToHistorical(reduxArticles);
        console.log('🔄 Transformed data:', transformedData);
        setHistoricalData(transformedData);
        setUsingReduxFallback(true);
        setLoading(false);
        setInitialized(true);
        return;
      }
      
      console.log('❌ No Redux data found, checking localStorage...');
      
      // Try localStorage as fallback
      try {
        const localArticles = localStorage.getItem('reduxArticles');
        if (localArticles) {
          const articles = JSON.parse(localArticles);
          if (articles && articles.length > 0) {
            console.log('📊 Using localStorage data directly (no API call)');
            console.log('📋 LocalStorage articles found:', articles.map(a => a.title));
            const transformedData = transformReduxToHistorical(articles);
            console.log('🔄 Transformed data:', transformedData);
            setHistoricalData(transformedData);
            setUsingReduxFallback(true);
            setLoading(false);
            setInitialized(true);
            return;
          }
        }
      } catch (error) {
        console.log('❌ Error reading localStorage:', error);
      }
      
      console.log('❌ No localStorage data found, trying API...');
      
      // If no data anywhere, try API
      const today = new Date();
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(today.getDate() - 30);
      
      fetchHistoricalData(
        thirtyDaysAgo.toISOString().split('T')[0],
        today.toISOString().split('T')[0],
        ''
      );
      setInitialized(true);
    }
  }, [initialized, reduxArticles]);

  // Monitor Redux articles changes
  useEffect(() => {
    console.log('🔄 Redux articles changed:', reduxArticles?.length || 0, 'articles');
    if (reduxArticles && reduxArticles.length > 0) {
      console.log('📋 Available articles:', reduxArticles.map(a => `${a.title} (${a.keyword})`));
    }
  }, [reduxArticles]);

  // Try Redux fallback when Redux articles are available
  useEffect(() => {
    if (reduxArticles && reduxArticles.length > 0 && historicalData.news.length === 0 && historicalData.social.length === 0) {
      console.log('📊 Redux articles available, trying fallback...');
      const transformedData = transformReduxToHistorical(reduxArticles);
      setHistoricalData(transformedData);
      setUsingReduxFallback(true);
      setLoading(false);
    }
  }, [reduxArticles, historicalData.news.length, historicalData.social.length]);

  // Transform Redux articles to historical data format
  const transformReduxToHistorical = (articles: any[]) => {
    const news: HistoricalDataItem[] = [];
    const social: HistoricalDataItem[] = [];
    
    articles.forEach(article => {
      const historicalItem: HistoricalDataItem = {
        id: article.id || Math.random(),
        keyword: article.keyword || 'unknown',
        title: article.title || 'No title',
        description: article.description || '',
        url: article.url || '#',
        publishedAt: article.publishedAt || new Date().toISOString(),
        collectedAt: article.createdAt || new Date().toISOString(),
        sentimentScore: article.sentimentScore || 0,
        sentimentLabel: article.sentimentLabel || 'neutral',
        sourceName: article.sourceName || 'Unknown Source',
        platformName: article.platformName || 'Unknown Platform',
        image: article.image || null,
        engagement: article.engagement || {},
        rawData: article.rawData || article
      };
      
      // Determine if it's news or social based on available fields
      if (article.sourceName || article.sourceLogo) {
        news.push(historicalItem);
      } else if (article.platformName || article.platformLogo) {
        social.push(historicalItem);
      } else {
        // Default to news if unclear
        news.push(historicalItem);
      }
    });
    
    return {
      news,
      social,
      totalNews: news.length,
      totalSocial: social.length
    };
  };

  // Debounced fetch function to prevent rapid API calls
  const debouncedFetch = React.useCallback(
    debounce((startDate: string, endDate: string, keyword: string) => {
      fetchHistoricalData(startDate, endDate, keyword);
    }, 300),
    []
  );

  const fetchHistoricalData = async (startDate: string, endDate: string, keyword: string = '') => {
    setLoading(true);
    setError(null);

    try {
      const token = btoa(JSON.stringify({ userId }));
      const params = new URLSearchParams({
        startDate,
        endDate,
        type: dataType,
        limit: itemsPerPage.toString(),
        offset: ((currentPage - 1) * itemsPerPage).toString()
      });

      if (keyword) {
        params.append('keyword', keyword);
      }

      const response = await fetch(`/api/historical-data?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch historical data');
      }

      const result = await response.json();
      console.log('📊 Historical data API response:', result);
      const apiData = result.data || { news: [], social: [], totalNews: 0, totalSocial: 0 };
      
      // Check if API returned empty data but Redux has data
      if ((apiData.news?.length || 0) === 0 && (apiData.social?.length || 0) === 0 && 
          reduxArticles && reduxArticles.length > 0) {
        console.log('📊 API returned empty data, using Redux fallback...');
        const transformedData = transformReduxToHistorical(reduxArticles);
        setHistoricalData(transformedData);
        setUsingReduxFallback(true);
      } else {
        setHistoricalData(apiData);
        setUsingReduxFallback(false);
      }
    } catch (err) {
      console.log('❌ API failed, trying Redux fallback...', err);
      
      // Fallback to Redux data
      if (reduxArticles && reduxArticles.length > 0) {
        console.log('📊 Using Redux fallback data:', reduxArticles.length, 'articles');
        const transformedData = transformReduxToHistorical(reduxArticles);
        setHistoricalData(transformedData);
        setUsingReduxFallback(true);
        setError(null); // Clear error since we have fallback data
      } else {
        setError(err instanceof Error ? err.message : 'An error occurred');
        setUsingReduxFallback(false);
      }
    } finally {
      setLoading(false);
    }
  };

  // Filter Redux data locally instead of making API calls
  const filterReduxData = (articles: any[], keyword: string, type: 'all' | 'news' | 'social') => {
    let filtered = articles;
    
    // Filter by keyword
    if (keyword) {
      filtered = filtered.filter(article => 
        article.keyword?.toLowerCase().includes(keyword.toLowerCase())
      );
    }
    
    // Filter by type
    if (type === 'news') {
      filtered = filtered.filter(article => 
        article.sourceName || article.sourceLogo
      );
    } else if (type === 'social') {
      filtered = filtered.filter(article => 
        article.platformName || article.platformLogo
      );
    }
    
    return filtered;
  };

  const handleDateRangeChange = (startDate: string, endDate: string) => {
    setCurrentPage(1);
    
    // If using Redux data, filter locally
    if (usingReduxFallback && reduxArticles && reduxArticles.length > 0) {
      const filtered = filterReduxData(reduxArticles, selectedKeyword, dataType);
      const transformedData = transformReduxToHistorical(filtered);
      setHistoricalData(transformedData);
    } else {
      // Otherwise, use API
      debouncedFetch(startDate, endDate, selectedKeyword);
    }
  };

  const handleKeywordChange = (keyword: string) => {
    setSelectedKeyword(keyword);
    setCurrentPage(1);
    
    // If using Redux data, filter locally
    if (usingReduxFallback && reduxArticles && reduxArticles.length > 0) {
      const filtered = filterReduxData(reduxArticles, keyword, dataType);
      const transformedData = transformReduxToHistorical(filtered);
      setHistoricalData(transformedData);
    } else {
      // Otherwise, use API
      const today = new Date();
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(today.getDate() - 30);
      debouncedFetch(
        thirtyDaysAgo.toISOString().split('T')[0],
        today.toISOString().split('T')[0],
        keyword
      );
    }
  };

  const handleDataTypeChange = (type: 'all' | 'news' | 'social') => {
    setDataType(type);
    setCurrentPage(1);
    
    // If using Redux data, filter locally
    if (usingReduxFallback && reduxArticles && reduxArticles.length > 0) {
      const filtered = filterReduxData(reduxArticles, selectedKeyword, type);
      const transformedData = transformReduxToHistorical(filtered);
      setHistoricalData(transformedData);
    } else {
      // Otherwise, use API
      const today = new Date();
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(today.getDate() - 30);
      debouncedFetch(
        thirtyDaysAgo.toISOString().split('T')[0],
        today.toISOString().split('T')[0],
        selectedKeyword
      );
    }
  };

  const getSentimentColor = (score?: number) => {
    if (!score) return '#6b7280';
    if (score > 0) return '#10b981'; // positive - green
    if (score < 0) return '#ef4444'; // negative - red
    return '#6b7280'; // neutral - gray
  };

  const getSentimentLabel = (score?: number) => {
    if (!score) return 'Neutral';
    if (score > 20) return 'Very Positive';
    if (score > 0) return 'Positive';
    if (score < -20) return 'Very Negative';
    if (score < 0) return 'Negative';
    return 'Neutral';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const renderDataItem = (item: HistoricalDataItem, type: 'news' | 'social') => (
    <div key={item.id} className={styles.dataItem}>
      <div className={styles.itemHeader}>
        <div className={styles.itemTitle}>
          <a 
            href={item.url} 
            target="_blank" 
            rel="noopener noreferrer"
            className={styles.itemLink}
          >
            {item.title}
          </a>
        </div>
        <div className={styles.itemMeta}>
          <span className={styles.keyword}>{item.keyword}</span>
          <span className={styles.source}>
            {type === 'news' ? item.sourceName : item.platformName}
          </span>
        </div>
      </div>
      
      {item.description && (
        <div className={styles.itemDescription}>
          {item.description.length > 200 
            ? `${item.description.substring(0, 200)}...` 
            : item.description
          }
        </div>
      )}

      <div className={styles.itemFooter}>
        <div className={styles.itemDates}>
          <span className={styles.publishedDate}>
            Published: {formatDate(item.publishedAt)}
          </span>
          <span className={styles.collectedDate}>
            Collected: {formatDate(item.collectedAt)}
          </span>
        </div>
        
        {item.sentimentScore !== undefined && (
          <div 
            className={styles.sentiment}
            style={{ color: getSentimentColor(item.sentimentScore) }}
          >
            {getSentimentLabel(item.sentimentScore)} ({item.sentimentScore})
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className={`${styles.historicalDataDisplay} ${className}`}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.title}>
          <BarChart3 className="w-6 h-6" />
          <span>Historical Data</span>
        </div>
        <div className={styles.stats}>
          <div className={styles.stat}>
            <TrendingUp className="w-4 h-4" />
            <span>{historicalData.totalNews} News</span>
          </div>
          <div className={styles.stat}>
            <Calendar className="w-4 h-4" />
            <span>{historicalData.totalSocial} Social</span>
          </div>
        </div>
      </div>

      {/* Date Range Slider */}
      <DateRangeSlider
        onDateRangeChange={handleDateRangeChange}
        onKeywordChange={handleKeywordChange}
        keywords={keywords}
      />

      {/* Data Type Filter */}
      <div className={styles.dataTypeFilter}>
        <div className={styles.filterLabel}>Data Type:</div>
        <div className={styles.filterButtons}>
          {[
            { key: 'all', label: 'All Data', icon: <BarChart3 className="w-4 h-4" /> },
            { key: 'news', label: 'News Only', icon: <TrendingUp className="w-4 h-4" /> },
            { key: 'social', label: 'Social Only', icon: <Calendar className="w-4 h-4" /> }
          ].map(({ key, label, icon }) => (
            <button
              key={key}
              className={`${styles.filterButton} ${
                dataType === key ? styles.active : ''
              }`}
              onClick={() => handleDataTypeChange(key as 'all' | 'news' | 'social')}
            >
              {icon}
              <span>{label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className={styles.loading}>
          <RefreshCw className="w-6 h-6 animate-spin" />
          <span>Loading historical data...</span>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className={styles.error}>
          <span>Error: {error}</span>
        </div>
      )}

      {/* Debug Info */}
      {!loading && !error && (
        <div style={{ background: '#f8f9fa', padding: '10px', margin: '10px 0', borderRadius: '5px', fontSize: '12px' }}>
          <strong>Debug Info:</strong><br/>
          News: {historicalData.news?.length || 0} articles<br/>
          Social: {historicalData.social?.length || 0} posts<br/>
          Data Type: {dataType}<br/>
          Selected Keyword: {selectedKeyword || 'all'}<br/>
          Total News: {historicalData.totalNews || 0}<br/>
          Total Social: {historicalData.totalSocial || 0}<br/>
          {usingReduxFallback && <span style={{ color: '#007bff', fontWeight: 'bold' }}>🔄 Using Store Data (No API)</span>}
          {!usingReduxFallback && <span style={{ color: '#28a745' }}>✅ Using API Data</span>}
        </div>
      )}

      {/* Data Display */}
      {!loading && !error && (
        <div className={styles.dataContainer}>
          {/* News Data */}
          {(dataType === 'all' || dataType === 'news') && historicalData.news && historicalData.news.length > 0 && (
            <div className={styles.dataSection}>
              <div className={styles.sectionHeader}>
                <TrendingUp className="w-5 h-5" />
                <span>News Articles ({historicalData.news.length})</span>
              </div>
              <div className={styles.dataList}>
                {historicalData.news.map(item => renderDataItem(item, 'news'))}
              </div>
            </div>
          )}

          {/* Social Data */}
          {(dataType === 'all' || dataType === 'social') && historicalData.social && historicalData.social.length > 0 && (
            <div className={styles.dataSection}>
              <div className={styles.sectionHeader}>
                <Calendar className="w-5 h-5" />
                <span>Social Posts ({historicalData.social.length})</span>
              </div>
              <div className={styles.dataList}>
                {historicalData.social.map(item => renderDataItem(item, 'social'))}
              </div>
            </div>
          )}

          {/* Empty State */}
          {(!historicalData.news || historicalData.news.length === 0) && (!historicalData.social || historicalData.social.length === 0) && (
            <div className={styles.emptyState}>
              <Filter className="w-12 h-12" />
              <h3>No Data Found</h3>
              <p>No historical data found for the selected date range and filters.</p>
              <div style={{ marginTop: '10px', fontSize: '12px', color: '#666' }}>
                Debug: News={historicalData.news?.length || 0}, Social={historicalData.social?.length || 0}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default HistoricalDataDisplay;
