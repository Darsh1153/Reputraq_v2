'use client';

import { useState, useEffect } from 'react';
import { Search, Play, Clock, Eye, Calendar, Filter, Loader2 } from 'lucide-react';
import { youtubeService, YouTubeVideo, YouTubeSearchOptions } from '@/services/youtubeService';
import ExportButton from '@/components/ExportButton';
import { createYouTubeExportData } from '@/utils/exportUtils';
import styles from './page.module.scss';

interface SearchFilters {
  duration: 'under' | 'between' | 'over' | 'all';
}

export default function YouTubeSearchPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [videos, setVideos] = useState<YouTubeVideo[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<SearchFilters>({ duration: 'all' });
  const [searchHistory, setSearchHistory] = useState<string[]>([]);

  // Load search history from localStorage
  useEffect(() => {
    const savedHistory = localStorage.getItem('youtube-search-history');
    if (savedHistory) {
      setSearchHistory(JSON.parse(savedHistory));
    }
  }, []);

  // Save search history to localStorage
  const saveSearchHistory = (query: string) => {
    if (query.trim() && !searchHistory.includes(query.trim())) {
      const newHistory = [query.trim(), ...searchHistory].slice(0, 10); // Keep last 10 searches
      setSearchHistory(newHistory);
      localStorage.setItem('youtube-search-history', JSON.stringify(newHistory));
    }
  };

  const handleSearch = async (query: string = searchQuery) => {
    if (!query.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const searchOptions: YouTubeSearchOptions = {};
      if (filters.duration !== 'all') {
        searchOptions.duration = filters.duration;
      }

      const response = await youtubeService.searchVideos(query.trim(), searchOptions);
      setVideos(response.data);
      saveSearchHistory(query.trim());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to search videos');
      setVideos([]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handleFilterChange = (duration: SearchFilters['duration']) => {
    setFilters({ duration });
    if (searchQuery.trim()) {
      handleSearch();
    }
  };

  const formatDuration = (duration: string) => {
    return duration;
  };

  const formatViews = (views: number) => {
    return youtubeService.formatViews(views);
  };

  const formatPublishedDate = (publishedAt: string) => {
    return publishedAt;
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <div className={styles.titleSection}>
            <h1 className={styles.title}>
              <Play className={styles.titleIcon} />
              YouTube Search
            </h1>
            <p className={styles.subtitle}>
              Search and discover YouTube videos without API keys
            </p>
          </div>
          {videos.length > 0 && (
            <div className={styles.exportSection}>
              <ExportButton
                data={createYouTubeExportData(videos)}
                variant="primary"
                size="medium"
                showLabel={true}
              />
            </div>
          )}
        </div>
      </div>

      {/* Search Section */}
      <div className={styles.searchSection}>
        <div className={styles.searchContainer}>
          <div className={styles.searchInputContainer}>
            <Search className={styles.searchIcon} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Search for videos..."
              className={styles.searchInput}
              disabled={loading}
            />
            <button
              onClick={() => handleSearch()}
              disabled={loading || !searchQuery.trim()}
              className={styles.searchButton}
            >
              {loading ? (
                <Loader2 className={styles.loadingIcon} />
              ) : (
                <Search className={styles.searchButtonIcon} />
              )}
            </button>
          </div>

          {/* Duration Filter */}
          <div className={styles.filtersContainer}>
            <Filter className={styles.filterIcon} />
            <span className={styles.filterLabel}>Duration:</span>
            <div className={styles.durationFilters}>
              {[
                { value: 'all', label: 'All' },
                { value: 'under', label: 'Under 4 min' },
                { value: 'between', label: '4-20 min' },
                { value: 'over', label: 'Over 20 min' }
              ].map((filter) => (
                <button
                  key={filter.value}
                  onClick={() => handleFilterChange(filter.value as SearchFilters['duration'])}
                  className={`${styles.durationFilter} ${
                    filters.duration === filter.value ? styles.active : ''
                  }`}
                  disabled={loading}
                >
                  {filter.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Search History */}
        {searchHistory.length > 0 && (
          <div className={styles.searchHistory}>
            <span className={styles.historyLabel}>Recent searches:</span>
            <div className={styles.historyItems}>
              {searchHistory.slice(0, 5).map((query, index) => (
                <button
                  key={index}
                  onClick={() => {
                    setSearchQuery(query);
                    handleSearch(query);
                  }}
                  className={styles.historyItem}
                  disabled={loading}
                >
                  {query}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <div className={styles.errorMessage}>
          <p>{error}</p>
        </div>
      )}

      {/* Results Section */}
      <div className={styles.resultsSection}>
        {videos.length > 0 && (
          <div className={styles.resultsHeader}>
            <h2>Search Results ({videos.length} videos)</h2>
            <p>Query: "{searchQuery}" • Duration: {filters.duration === 'all' ? 'All' : filters.duration}</p>
          </div>
        )}

        <div className={styles.videosGrid}>
          {videos.map((video) => (
            <div key={video.id.videoId} className={styles.videoCard}>
              <div className={styles.videoThumbnail}>
                <img
                  src={youtubeService.getThumbnailUrl(video, 'high')}
                  alt={video.title}
                  className={styles.thumbnailImage}
                />
                <div className={styles.durationBadge}>
                  <Clock className={styles.durationIcon} />
                  {formatDuration(video.duration_raw)}
                </div>
                <div className={styles.playOverlay}>
                  <Play className={styles.playIcon} />
                </div>
              </div>

              <div className={styles.videoInfo}>
                <h3 className={styles.videoTitle} title={video.title}>
                  {video.title}
                </h3>
                
                <div className={styles.videoStats}>
                  <div className={styles.statItem}>
                    <Eye className={styles.statIcon} />
                    <span>{formatViews(video.views)}</span>
                  </div>
                  <div className={styles.statItem}>
                    <Calendar className={styles.statIcon} />
                    <span>{formatPublishedDate(video.snippet.publishedAt)}</span>
                  </div>
                </div>

                {video.description && (
                  <p className={styles.videoDescription} title={video.description}>
                    {video.description.length > 100 
                      ? `${video.description.substring(0, 100)}...` 
                      : video.description
                    }
                  </p>
                )}

                <div className={styles.videoActions}>
                  <a
                    href={video.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.watchButton}
                  >
                    <Play className={styles.watchIcon} />
                    Watch on YouTube
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>

        {!loading && videos.length === 0 && searchQuery && (
          <div className={styles.noResults}>
            <Play className={styles.noResultsIcon} />
            <h3>No videos found</h3>
            <p>Try adjusting your search terms or filters</p>
          </div>
        )}

        {!loading && !searchQuery && (
          <div className={styles.placeholder}>
            <Search className={styles.placeholderIcon} />
            <h3>Start searching for videos</h3>
            <p>Enter a search term above to discover YouTube content</p>
          </div>
        )}
      </div>
    </div>
  );
}
