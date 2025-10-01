'use client';

import { useState, useEffect } from 'react';
import { Search, TrendingUp, Hash, Clock, BarChart3, ExternalLink, Filter, RefreshCw } from 'lucide-react';
import { TrendingService, TrendingKeyword } from '@/services/trendingService';
import styles from './page.module.scss';

interface TrendingHashtag extends TrendingKeyword {
  hashtag: string;
  relatedHashtags: string[];
}

export default function TrendingMentionsPage() {
  const [trendingHashtags, setTrendingHashtags] = useState<TrendingHashtag[]>([]);
  const [filteredHashtags, setFilteredHashtags] = useState<TrendingHashtag[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedRegion, setSelectedRegion] = useState('US');
  const [sortBy, setSortBy] = useState<'traffic' | 'growth' | 'time'>('traffic');
  const [showRelated, setShowRelated] = useState(false);

  const regions = [
    { code: 'US', name: 'United States' },
    { code: 'GB', name: 'United Kingdom' },
    { code: 'CA', name: 'Canada' },
    { code: 'AU', name: 'Australia' },
    { code: 'DE', name: 'Germany' },
    { code: 'FR', name: 'France' },
    { code: 'IN', name: 'India' },
    { code: 'JP', name: 'Japan' },
    { code: 'BR', name: 'Brazil' },
    { code: 'MX', name: 'Mexico' }
  ];

  useEffect(() => {
    fetchTrendingHashtags();
  }, [selectedRegion]);

  useEffect(() => {
    filterHashtags();
  }, [searchTerm, trendingHashtags, sortBy]);

  const fetchTrendingHashtags = async () => {
    try {
      setLoading(true);
      setError(null);
      const hashtags = await TrendingService.getAllTrendingHashtags(selectedRegion);
      setTrendingHashtags(hashtags);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch trending hashtags');
      console.error('Error fetching trending hashtags:', err);
    } finally {
      setLoading(false);
    }
  };

  const filterHashtags = () => {
    let filtered = [...trendingHashtags];

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(hashtag =>
        hashtag.keyword.toLowerCase().includes(searchTerm.toLowerCase()) ||
        hashtag.hashtag.toLowerCase().includes(searchTerm.toLowerCase()) ||
        hashtag.relatedKeywords.some(keyword =>
          keyword.toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    }

    // Sort by selected criteria
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'traffic':
          return parseInt(b.traffic.replace(/,/g, '')) - parseInt(a.traffic.replace(/,/g, ''));
        case 'growth':
          return parseFloat(b.trafficGrowthRate.replace('%', '')) - parseFloat(a.trafficGrowthRate.replace('%', ''));
        case 'time':
          return new Date(b.activeTime).getTime() - new Date(a.activeTime).getTime();
        default:
          return 0;
      }
    });

    setFilteredHashtags(filtered);
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleRegionChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedRegion(e.target.value);
  };

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSortBy(e.target.value as 'traffic' | 'growth' | 'time');
  };

  const formatTraffic = (traffic: string) => {
    const num = parseInt(traffic.replace(/,/g, ''));
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M`;
    } else if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}K`;
    }
    return traffic;
  };

  const getGrowthColor = (growthRate: string) => {
    const rate = parseFloat(growthRate.replace('%', ''));
    if (rate > 0) return '#10b981'; // green
    if (rate < 0) return '#ef4444'; // red
    return '#6b7280'; // gray
  };

  if (loading) {
    return (
      <div className={styles.loading}>
        <div className={styles.spinner}></div>
        <p>Loading trending mentions...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.error}>
        <h2>Error Loading Trends</h2>
        <p>{error}</p>
        <button onClick={fetchTrendingHashtags} className={styles.retryButton}>
          <RefreshCw size={16} />
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.titleSection}>
          <h1 className={styles.title}>
            <TrendingUp size={24} />
            Trending Mentions Finder
          </h1>
          <p className={styles.subtitle}>
            Discover trending hashtags and keywords from Google Trends
          </p>
        </div>
        
        <button onClick={fetchTrendingHashtags} className={styles.refreshButton}>
          <RefreshCw size={16} />
          Refresh
        </button>
      </div>

      <div className={styles.controls}>
        <div className={styles.searchSection}>
          <div className={styles.searchInputContainer}>
            <Search size={20} className={styles.searchIcon} />
            <input
              type="text"
              placeholder="Search trending hashtags..."
              value={searchTerm}
              onChange={handleSearch}
              className={styles.searchInput}
            />
          </div>
        </div>

        <div className={styles.filters}>
          <div className={styles.filterGroup}>
            <label htmlFor="region">Region:</label>
            <select
              id="region"
              value={selectedRegion}
              onChange={handleRegionChange}
              className={styles.select}
            >
              {regions.map(region => (
                <option key={region.code} value={region.code}>
                  {region.name}
                </option>
              ))}
            </select>
          </div>

          <div className={styles.filterGroup}>
            <label htmlFor="sort">Sort by:</label>
            <select
              id="sort"
              value={sortBy}
              onChange={handleSortChange}
              className={styles.select}
            >
              <option value="traffic">Traffic Volume</option>
              <option value="growth">Growth Rate</option>
              <option value="time">Most Recent</option>
            </select>
          </div>

          <div className={styles.filterGroup}>
            <label className={styles.checkboxLabel}>
              <input
                type="checkbox"
                checked={showRelated}
                onChange={(e) => setShowRelated(e.target.checked)}
                className={styles.checkbox}
              />
              Show Related Hashtags
            </label>
          </div>
        </div>
      </div>

      <div className={styles.stats}>
        <div className={styles.statCard}>
          <div className={styles.statNumber}>{filteredHashtags.length}</div>
          <div className={styles.statLabel}>Trending Hashtags</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statNumber}>
            {filteredHashtags.reduce((sum, hashtag) => 
              sum + parseInt(hashtag.traffic.replace(/,/g, '')), 0
            ).toLocaleString()}
          </div>
          <div className={styles.statLabel}>Total Traffic</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statNumber}>
            {filteredHashtags.length > 0 
              ? (filteredHashtags.reduce((sum, hashtag) => 
                  sum + parseFloat(hashtag.trafficGrowthRate.replace('%', '')), 0
                ) / filteredHashtags.length).toFixed(1) + '%'
              : '0%'
            }
          </div>
          <div className={styles.statLabel}>Avg Growth Rate</div>
        </div>
      </div>

      <div className={styles.hashtagsGrid}>
        {filteredHashtags.map((hashtag, index) => (
          <div key={`${hashtag.keyword}-${index}`} className={styles.hashtagCard}>
            <div className={styles.hashtagHeader}>
              <div className={styles.hashtagMain}>
                <Hash size={16} className={styles.hashIcon} />
                <span className={styles.hashtagText}>{hashtag.hashtag}</span>
              </div>
              <div className={styles.trafficBadge}>
                {formatTraffic(hashtag.traffic)}
              </div>
            </div>

            <div className={styles.hashtagContent}>
              <div className={styles.keywordInfo}>
                <span className={styles.keyword}>{hashtag.keyword}</span>
                <div className={styles.metrics}>
                  <div className={styles.metric}>
                    <BarChart3 size={14} />
                    <span>Traffic: {hashtag.traffic}</span>
                  </div>
                  <div className={styles.metric}>
                    <TrendingUp size={14} />
                    <span style={{ color: getGrowthColor(hashtag.trafficGrowthRate) }}>
                      {hashtag.trafficGrowthRate}
                    </span>
                  </div>
                  <div className={styles.metric}>
                    <Clock size={14} />
                    <span>{new Date(hashtag.activeTime).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>

              {showRelated && hashtag.relatedHashtags.length > 0 && (
                <div className={styles.relatedHashtags}>
                  <h4>Related Hashtags:</h4>
                  <div className={styles.relatedTags}>
                    {hashtag.relatedHashtags.slice(0, 5).map((relatedHashtag, idx) => (
                      <span key={idx} className={styles.relatedTag}>
                        {relatedHashtag}
                      </span>
                    ))}
                    {hashtag.relatedHashtags.length > 5 && (
                      <span className={styles.moreTags}>
                        +{hashtag.relatedHashtags.length - 5} more
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className={styles.hashtagActions}>
              <button 
                className={styles.actionButton}
                onClick={() => window.open(`https://trends.google.com/trends/explore?q=${encodeURIComponent(hashtag.keyword)}`, '_blank')}
              >
                <ExternalLink size={14} />
                View on Google Trends
              </button>
            </div>
          </div>
        ))}
      </div>

      {filteredHashtags.length === 0 && !loading && (
        <div className={styles.emptyState}>
          <Hash size={48} className={styles.emptyIcon} />
          <h3>No trending hashtags found</h3>
          <p>Try adjusting your search term or region settings</p>
        </div>
      )}
    </div>
  );
}
