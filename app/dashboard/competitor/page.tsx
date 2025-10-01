'use client';

import { useState, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/lib/hooks/redux';
import { setUser } from '@/lib/store/slices/userSlice';
import { setArticles } from '@/lib/store/slices/newsSlice';
import { dataManager } from '../../../services/dataManager';
import { 
  getPlanLimits, 
  canAddCompetitorKeyword, 
  getRemainingCompetitorKeywords,
  getCompetitorKeywordUpgradeMessage 
} from '@/lib/constants/plans';
import { PlanIndicator } from '@/components/PlanIndicator';
import { 
  Search, 
  Filter, 
  TrendingUp, 
  Calendar, 
  ExternalLink, 
  Eye, 
  MessageSquare,
  Share2,
  Heart,
  BarChart3,
  Target,
  Users,
  Building2,
  Plus,
  Trash2,
  AlertCircle,
  CheckCircle,
  Crown,
  Star,
  Zap,
  Hash,
  Sparkles
} from 'lucide-react';
import styles from './page.module.scss';

interface User {
  id: number;
  name: string;
  email: string;
  plan: string;
  status: string;
  keywords?: string[];
}

interface Keyword {
  id: number;
  userId: number;
  keyword: string;
  createdAt: string;
}

interface CompetitorKeyword {
  id: number;
  userId: number;
  keyword: string;
  createdAt: string;
}

export default function CompetitorPage() {
  const dispatch = useAppDispatch();
  const { user: reduxUser } = useAppSelector((state) => state.user);
  const { articles, loading: newsLoading, error: newsError } = useAppSelector((state) => state.news);
  const [user, setUser] = useState<User | null>(null);
  const [keywords, setKeywords] = useState<Keyword[]>([]);
  const [competitorKeywords, setCompetitorKeywords] = useState<CompetitorKeyword[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedKeyword, setSelectedKeyword] = useState<string>('');
  const [newsData, setNewsData] = useState(dataManager.getNewsData());
  const [competitorArticles, setCompetitorArticles] = useState<any[]>([]);
  const [competitorLoading, setCompetitorLoading] = useState(false);
  const [collectingData, setCollectingData] = useState(false);
  const [newCompetitorKeyword, setNewCompetitorKeyword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [planError, setPlanError] = useState<string | null>(null);
  const [collectionMessage, setCollectionMessage] = useState<string | null>(null);

  // Fetch competitor keywords
  const fetchCompetitorKeywords = async () => {
    try {
      console.log('🔍 Fetching competitor keywords...');
      const user = localStorage.getItem('user');
      if (!user) {
        console.log('❌ No user found in localStorage');
        return;
      }

      const userData = JSON.parse(user);
      console.log('👤 User data:', userData);
      const token = btoa(JSON.stringify({ userId: userData.id }));
      console.log('🔑 Auth token created');

      console.log('📡 Making API request to /api/competitor-keywords...');
      const response = await fetch('/api/competitor-keywords', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      console.log('📊 Response status:', response.status);
      console.log('📊 Response ok:', response.ok);

      if (response.ok) {
        const keywordsData = await response.json();
        console.log('✅ Competitor keywords fetched:', keywordsData);
        setCompetitorKeywords(keywordsData);
      } else {
        const errorData = await response.json();
        console.error('❌ Failed to fetch competitor keywords:', errorData);
      }
    } catch (error) {
      console.error('❌ Error fetching competitor keywords:', error);
    }
  };

  // Add competitor keyword
  const addCompetitorKeyword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newCompetitorKeyword.trim()) {
      return;
    }

    // Check plan limits before submitting
    const userPlan = user?.plan || 'free';
    if (!canAddCompetitorKeyword(competitorKeywords.length, userPlan)) {
      const planLimits = getPlanLimits(userPlan);
      setPlanError(`You have reached the maximum number of competitor keywords for your ${planLimits.name} plan (${planLimits.competitorKeywords} competitor keywords). Please upgrade your plan to add more competitor keywords.`);
      return;
    }

    setSubmitting(true);
    setError(null);
    setPlanError(null);

    try {
      const user = localStorage.getItem('user');
      if (!user) {
        setError('Please sign in to add competitor keywords');
        setSubmitting(false);
        return;
      }

      const userData = JSON.parse(user);
      const token = btoa(JSON.stringify({ userId: userData.id }));

      const response = await fetch('/api/competitor-keywords', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ keyword: newCompetitorKeyword.trim() }),
      });

      if (response.ok) {
        const newKeywordData = await response.json();
        setCompetitorKeywords(prev => [...prev, newKeywordData]);
        setNewCompetitorKeyword('');
        // Refresh competitor articles after adding a keyword
        setTimeout(() => fetchCompetitorArticles(), 100);
      } else {
        const errorData = await response.json();
        if (response.status === 403) {
          setPlanError(errorData.message);
        } else {
          setError(errorData.message || 'Failed to add competitor keyword');
        }
      }
    } catch (error) {
      setError('Failed to add competitor keyword');
    } finally {
      setSubmitting(false);
    }
  };

  // Delete competitor keyword
  const deleteCompetitorKeyword = async (keywordId: number) => {
    try {
      const user = localStorage.getItem('user');
      if (!user) return;

      const userData = JSON.parse(user);
      const token = btoa(JSON.stringify({ userId: userData.id }));

      const response = await fetch(`/api/competitor-keywords?id=${keywordId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        setCompetitorKeywords(prev => prev.filter(kw => kw.id !== keywordId));
        // Refresh competitor articles after deleting a keyword
        await fetchCompetitorArticles();
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Failed to delete competitor keyword');
      }
    } catch (error) {
      setError('Failed to delete competitor keyword');
    }
  };

  // Collect competitor data
  const collectCompetitorData = async () => {
    if (!selectedKeyword) {
      setError('Please select a competitor keyword first');
      return;
    }

    setCollectingData(true);
    setError(null);
    setCollectionMessage(null);

    try {
      console.log('🚀 Collecting competitor data for:', selectedKeyword);
      
      const user = localStorage.getItem('user');
      if (!user) {
        setError('Please sign in to collect competitor data');
        setCollectingData(false);
        return;
      }

      const userData = JSON.parse(user);
      const token = btoa(JSON.stringify({ userId: userData.id }));

      const response = await fetch('/api/competitor-data/collect', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ competitorKeyword: selectedKeyword }),
      });

      const data = await response.json();
      console.log('📊 Collection response:', data);

      if (response.ok) {
        setCollectionMessage(data.message);
        
        // Set the articles from the collection response
        const collectedArticles = data.articles || [];
        setCompetitorArticles(collectedArticles);
        
        console.log(`✅ Collected ${data.articlesCollected} articles, inserted ${data.articlesInserted} articles, stored ${data.articlesStored} articles`);
        console.log(`📊 Articles returned to UI: ${collectedArticles.length}`);
        
        // Show success message with more details
        setCollectionMessage(`${data.message}\n\nArticles collected: ${data.articlesCollected}\nArticles inserted: ${data.articlesInserted}\nArticles available: ${data.articlesStored}\nArticles displayed: ${collectedArticles.length}`);
        
        // Only refresh from database if we have stored articles, otherwise keep the collected articles
        if (data.articlesStored > 0) {
          console.log('🔄 Refreshing from database since articles were stored');
          setTimeout(() => {
            fetchCompetitorArticles();
          }, 1000);
        } else {
          console.log('📋 Keeping collected articles since none were stored in database');
        }
      } else {
        setError(data.error || 'Failed to collect competitor data');
      }
    } catch (error) {
      console.error('❌ Error collecting competitor data:', error);
      setError('Failed to collect competitor data');
    } finally {
      setCollectingData(false);
    }
  };

  // Fetch competitor-specific articles from database
  const fetchCompetitorArticles = async () => {
    if (competitorKeywords.length === 0) {
      setCompetitorArticles([]);
      return;
    }

    setCompetitorLoading(true);
    try {
      console.log('📰 Fetching competitor articles for keywords:', competitorKeywords.map(k => k.keyword));
      
      const user = localStorage.getItem('user');
      if (!user) return;

      const userData = JSON.parse(user);
      const token = btoa(JSON.stringify({ userId: userData.id }));

      // Fetch articles from database for all competitor keywords using the same API as normal keywords
      const allCompetitorArticles = [];
      
      for (const keyword of competitorKeywords) {
        try {
          const url = `/api/news?userId=${userData.id}&keyword=${encodeURIComponent(keyword.keyword)}&limit=50`;
          console.log(`📡 Fetching articles from: ${url}`);
          
          const response = await fetch(url, {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          
          console.log(`📊 Response status for ${keyword.keyword}: ${response.status}`);
          
          if (response.ok) {
            const data = await response.json();
            console.log(`📊 Response data for ${keyword.keyword}:`, data);
            
            if (data.articles && Array.isArray(data.articles)) {
              allCompetitorArticles.push(...data.articles);
              console.log(`✅ Found ${data.articles.length} articles for competitor: ${keyword.keyword}`);
            } else {
              console.log(`⚠️ No articles array found in response for ${keyword.keyword}`);
            }
          } else {
            const errorData = await response.json();
            console.log(`❌ Failed to fetch articles for ${keyword.keyword}:`, response.status, errorData);
          }
        } catch (error) {
          console.log(`❌ Error fetching articles for ${keyword.keyword}:`, error);
        }
      }
      
      console.log('🎯 Total competitor articles found:', allCompetitorArticles.length);
      setCompetitorArticles(allCompetitorArticles);
      
    } catch (error) {
      console.error('❌ Error fetching competitor articles:', error);
      setCompetitorArticles([]);
    } finally {
      setCompetitorLoading(false);
    }
  };

  useEffect(() => {
    // Subscribe to news data updates
    const handleNewsUpdate = (data: any) => {
      setNewsData(data);
      if (data.articles && data.articles.length > 0) {
        dispatch(setArticles(data.articles));
      }
    };

    dataManager.subscribe('news', handleNewsUpdate);

    const loadUserAndData = async () => {
      // Get user data from localStorage
      const userData = localStorage.getItem("user");
      console.log('CompetitorPage - User data from localStorage:', userData);
      
      if (userData) {
        try {
          const parsedUser = JSON.parse(userData);
          console.log('CompetitorPage - Parsed user:', parsedUser);
          setUser(parsedUser);
          
          // Update Redux store with user data
          dispatch(setUser(parsedUser));
          console.log('CompetitorPage - User dispatched to Redux');

          // Load keywords using the same logic as Social Listening
          try {
            console.log('CompetitorPage - Loading keywords...');
            console.log('CompetitorPage - Parsed user data:', parsedUser);
            console.log('CompetitorPage - User keywords from parsedUser:', parsedUser.keywords);
            
            // First, try to use keywords from Redux store (which is working)
            if (parsedUser.keywords && parsedUser.keywords.length > 0) {
              console.log('CompetitorPage - Using keywords from Redux store:', parsedUser.keywords);
              setKeywords(parsedUser.keywords);
            } else {
              console.log('CompetitorPage - No keywords in parsedUser, trying API...');
              
              // Fallback: try API call
              const token = btoa(JSON.stringify({ userId: parsedUser.id }));
              const response = await fetch('/api/keywords', {
                method: 'GET',
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${token}`,
                },
              });

              console.log('CompetitorPage - Keywords API response status:', response.status);
              
              if (response.ok) {
                const keywordsData = await response.json();
                console.log('CompetitorPage - Keywords loaded from API:', keywordsData);
                if (Array.isArray(keywordsData)) {
                  const keywordStrings = keywordsData.map((kw: any) => kw.keyword);
                  console.log('CompetitorPage - Extracted keyword strings:', keywordStrings);
                  setKeywords(keywordStrings);
                } else {
                  console.log('CompetitorPage - API data is not an array:', keywordsData);
                  setKeywords([]);
                }
              } else {
                const errorData = await response.json();
                console.error('CompetitorPage - Failed to load keywords:', errorData);
                
                // Final fallback: try to get keywords from localStorage
                const userData = localStorage.getItem('user');
                if (userData) {
                  const parsedUser = JSON.parse(userData);
                  console.log('CompetitorPage - localStorage user data:', parsedUser);
                  if (parsedUser.keywords && parsedUser.keywords.length > 0) {
                    console.log('CompetitorPage - Using keywords from localStorage as fallback:', parsedUser.keywords);
                    setKeywords(parsedUser.keywords);
                  } else {
                    console.log('CompetitorPage - No keywords found in localStorage either');
                    setKeywords([]);
                  }
                } else {
                  console.log('CompetitorPage - No user data in localStorage');
                  setKeywords([]);
                }
              }
            }
          } catch (error) {
            console.error('CompetitorPage - Error loading keywords:', error);
            
            // Final fallback: try to get keywords from localStorage
            const userData = localStorage.getItem('user');
            if (userData) {
              const parsedUser = JSON.parse(userData);
              if (parsedUser.keywords && parsedUser.keywords.length > 0) {
                console.log('CompetitorPage - Using keywords from localStorage as fallback:', parsedUser.keywords);
                setKeywords(parsedUser.keywords);
              } else {
                console.log('CompetitorPage - No keywords found in localStorage fallback');
                setKeywords([]);
              }
            } else {
              console.log('CompetitorPage - No user data in localStorage fallback');
              setKeywords([]);
            }
          }
          
          // Initialize data if not already loaded
          if (!newsData.lastFetched) {
            console.log('CompetitorPage - Initializing news data...');
            await dataManager.refreshAllData();
          }

          // Load competitor keywords
          await fetchCompetitorKeywords();
        } catch (error) {
          console.error('CompetitorPage - Error parsing user data:', error);
        }
      } else {
        console.log('CompetitorPage - No user data found in localStorage');
      }

      setLoading(false);
    };

    loadUserAndData();

    // Cleanup subscription
    return () => {
      dataManager.unsubscribe('news', handleNewsUpdate);
    };
  }, [dispatch, newsData.lastFetched]);

  // Separate useEffect for keyword loading when user changes
  useEffect(() => {
    if (user && user.keywords && user.keywords.length > 0) {
      console.log('CompetitorPage - User changed, reloading keywords:', user.keywords);
      setKeywords(user.keywords);
    }
  }, [user]);

  // Separate useEffect for competitor keywords loading
  useEffect(() => {
    if (user) {
      console.log('CompetitorPage - User available, fetching competitor keywords...');
      fetchCompetitorKeywords();
    }
  }, [user]);

  // Fetch competitor articles when competitor keywords change
  useEffect(() => {
    if (competitorKeywords.length > 0) {
      console.log('CompetitorPage - Competitor keywords changed, fetching articles...');
      fetchCompetitorArticles();
    } else {
      setCompetitorArticles([]);
    }
  }, [competitorKeywords]);

  // Show loading state for initial load or when data is being refreshed
  if (loading || newsData.isLoading || competitorLoading || collectingData) {
    return (
      <div className={styles.loading}>
        <div className={styles.spinner}></div>
        <h3>Loading Competitor Analysis...</h3>
        <p>
          {collectingData ? 'Collecting competitor data...' : 
           competitorLoading ? 'Fetching competitor articles...' : 
           'Analyzing competitor data and insights'}
        </p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className={styles.error}>
        <h2>Access Denied</h2>
        <p>Please sign in to access competitor analysis.</p>
      </div>
    );
  }

  if (newsError) {
    return (
      <div className={styles.error}>
        <h2>Error Loading Data</h2>
        <p>{newsError.message || 'Failed to load competitor data'}</p>
      </div>
    );
  }

  // Debug logging
  console.log('CompetitorPage - Debug info:', {
    keywords: keywords,
    keywordsLength: keywords.length,
    selectedKeyword: selectedKeyword,
    articles: articles,
    articlesLength: articles?.length,
    user: user,
    userKeywords: user?.keywords
  });

  // Filter competitor articles based on selected competitor keyword
  const filteredArticles = selectedKeyword 
    ? competitorArticles.filter(article => 
        article.title?.toLowerCase().includes(selectedKeyword.toLowerCase()) ||
        article.description?.toLowerCase().includes(selectedKeyword.toLowerCase()) ||
        article.content?.toLowerCase().includes(selectedKeyword.toLowerCase())
      )
    : competitorArticles;

  // Plan limits for competitor keywords
  const userPlan = user?.plan || 'free';
  const planLimits = getPlanLimits(userPlan);
  const remainingCompetitorKeywords = getRemainingCompetitorKeywords(competitorKeywords.length, userPlan);
  const canAddMore = canAddCompetitorKeyword(competitorKeywords.length, userPlan);

  // Calculate competitor insights
  const totalArticles = filteredArticles.length;
  const breakingNews = filteredArticles.filter(article => article.isBreaking).length;
  const sentimentBreakdown = {
    positive: filteredArticles.filter(article => article.sentiment === 'positive').length,
    negative: filteredArticles.filter(article => article.sentiment === 'negative').length,
    neutral: filteredArticles.filter(article => article.sentiment === 'neutral').length,
  };

  const topSources = filteredArticles.reduce((acc, article) => {
    const source = article.source || 'Unknown';
    acc[source] = (acc[source] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const topSourcesArray = Object.entries(topSources)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 5);

  return (
    <div className={styles.container}>
      {/* Plan Indicator */}
      <PlanIndicator 
        currentKeywords={competitorKeywords.length} 
        maxKeywords={planLimits.competitorKeywords}
        showUpgrade={true}
        keywordType="competitor"
      />

      <div className={styles.header}>
        <div className={styles.headerContent}>
          <div className={styles.headerText}>
            <h1>Competitor Analysis</h1>
            <p>Monitor competitor mentions and analyze market positioning</p>
          </div>
        </div>
      </div>

      {/* Competitor Keywords Management */}
      <div className={styles.keywordsSection}>
        <div className={styles.keywordsHeader}>
          <div className={styles.keywordsTitle}>
            <div className={styles.titleIconWrapper}>
              <Target size={24} className={styles.titleIcon} />
              <Sparkles size={16} className={styles.sparkleIcon} />
            </div>
            <div className={styles.titleContent}>
              <h2>Competitor Keywords</h2>
              <p>Manage keywords for competitor analysis</p>
            </div>
          </div>
          <div className={styles.keywordsStats}>
            <span className={styles.keywordsCount}>
              {competitorKeywords.length} / {planLimits.competitorKeywords}
            </span>
            <span className={styles.keywordsRemaining}>
              {remainingCompetitorKeywords} remaining
            </span>
            <button 
              onClick={() => {
                fetchCompetitorKeywords();
                fetchCompetitorArticles();
              }}
              className={styles.refreshButton}
              title="Refresh competitor keywords and articles"
            >
              <Search size={16} />
            </button>
          </div>
        </div>

        {error && (
          <div className={styles.errorAlert}>
            <AlertCircle size={16} />
            {error}
          </div>
        )}

        {planError && (
          <div className={styles.planErrorAlert}>
            <AlertCircle size={16} />
            {planError}
          </div>
        )}

        {/* Add Keyword Form */}
        <form onSubmit={addCompetitorKeyword} className={styles.addKeywordForm}>
          <div className={styles.inputGroup}>
            <input
              type="text"
              value={newCompetitorKeyword}
              onChange={(e) => setNewCompetitorKeyword(e.target.value)}
              placeholder="Enter competitor keyword (e.g., 'Tesla', 'Apple', 'Microsoft')"
              className={styles.keywordInput}
              disabled={submitting || !canAddMore}
            />
            <button
              type="submit"
              disabled={submitting || !canAddMore || !newCompetitorKeyword.trim()}
              className={styles.addButton}
            >
              {submitting ? (
                <div className={styles.spinner}></div>
              ) : (
                <Plus size={16} />
              )}
              Add Keyword
            </button>
          </div>
        </form>

        {/* Debug Info */}
        <div className={styles.debugInfo}>
          <h4>Debug Info:</h4>
          <p>Competitor Keywords Count: {competitorKeywords.length}</p>
          <p>Competitor Articles Count: {competitorArticles.length}</p>
          <p>Filtered Articles Count: {filteredArticles.length}</p>
          <p>User Plan: {userPlan}</p>
          <p>Plan Limits: {planLimits.competitorKeywords}</p>
          <p>Can Add More: {canAddMore ? 'Yes' : 'No'}</p>
          <p>Selected Keyword: {selectedKeyword || 'None'}</p>
          <p>Keywords Data: {JSON.stringify(competitorKeywords)}</p>
        </div>

        {/* Keywords List */}
        <div className={styles.keywordsList}>
          {competitorKeywords.length === 0 ? (
            <div className={styles.emptyState}>
              <Target className={styles.emptyIcon} />
              <h3>No Competitor Keywords</h3>
              <p>Add competitor keywords to start monitoring their mentions</p>
            </div>
          ) : (
            <div className={styles.keywordsGrid}>
              {competitorKeywords.map((keyword) => (
                <div key={keyword.id} className={styles.keywordCard}>
                  <div className={styles.keywordContent}>
                    <div className={styles.keywordIcon}>
                      <Target size={16} />
                    </div>
                    <span className={styles.keywordText}>{keyword.keyword}</span>
                  </div>
                  <button
                    onClick={() => deleteCompetitorKeyword(keyword.id)}
                    className={styles.deleteButton}
                    title="Delete keyword"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Keyword Filter */}
      <div className={styles.filterSection}>
        <div className={styles.filterBar}>
          <div className={styles.keywordSelector}>
            <Search className={styles.searchIcon} />
            <select
              value={selectedKeyword}
              onChange={(e) => setSelectedKeyword(e.target.value)}
              className={styles.keywordSelect}
            >
              <option value="">Select Competitor Keyword</option>
              {competitorKeywords.map((keyword) => (
                <option key={keyword.id} value={keyword.keyword}>
                  {keyword.keyword}
                </option>
              ))}
            </select>
          </div>
          <div className={styles.filterInfo}>
            <span className={styles.filterLabel}>
              {selectedKeyword ? `Selected: ${selectedKeyword}` : 'Select a competitor keyword to collect data'}
            </span>
          </div>
        </div>
      </div>

      {/* Data Collection Section */}
      <div className={styles.collectionSection}>
        <div className={styles.collectionHeader}>
          <div className={styles.collectionTitle}>
            <Target size={24} className={styles.collectionIcon} />
            <div className={styles.collectionContent}>
              <h2>Collect Competitor Data</h2>
              <p>Select a competitor keyword above and collect fresh data</p>
            </div>
          </div>
          <button
            onClick={collectCompetitorData}
            disabled={!selectedKeyword || collectingData}
            className={styles.collectButton}
          >
            {collectingData ? (
              <>
                <div className={styles.spinner}></div>
                Collecting...
              </>
            ) : (
              <>
                <Search size={16} />
                Collect Data
              </>
            )}
          </button>
        </div>

        {collectionMessage && (
          <div className={styles.collectionMessage}>
            <CheckCircle size={16} />
            {collectionMessage}
          </div>
        )}

        {error && (
          <div className={styles.errorAlert}>
            <AlertCircle size={16} />
            {error}
          </div>
        )}
      </div>

      {/* Competitor Insights */}
      <div className={styles.insightsGrid}>
        <div className={styles.insightCard}>
          <div className={styles.insightIcon}>
            <Target size={24} />
          </div>
          <div className={styles.insightContent}>
            <div className={styles.insightValue}>{totalArticles}</div>
            <div className={styles.insightLabel}>Total Mentions</div>
          </div>
        </div>
        
        <div className={styles.insightCard}>
          <div className={styles.insightIcon}>
            <TrendingUp size={24} />
          </div>
          <div className={styles.insightContent}>
            <div className={styles.insightValue}>{breakingNews}</div>
            <div className={styles.insightLabel}>Breaking News</div>
          </div>
        </div>
        
        <div className={styles.insightCard}>
          <div className={styles.insightIcon}>
            <BarChart3 size={24} />
          </div>
          <div className={styles.insightContent}>
            <div className={styles.insightValue}>{sentimentBreakdown.positive}</div>
            <div className={styles.insightLabel}>Positive Mentions</div>
          </div>
        </div>
        
        <div className={styles.insightCard}>
          <div className={styles.insightIcon}>
            <Users size={24} />
          </div>
          <div className={styles.insightContent}>
            <div className={styles.insightValue}>{topSourcesArray.length}</div>
            <div className={styles.insightLabel}>Sources</div>
          </div>
        </div>
      </div>

      {/* Sentiment Analysis */}
      <div className={styles.sentimentSection}>
        <h2>Sentiment Analysis</h2>
        <div className={styles.sentimentGrid}>
          <div className={styles.sentimentItem}>
            <div className={styles.sentimentBar}>
              <div 
                className={styles.sentimentFillPositive} 
                style={{ width: `${(sentimentBreakdown.positive / totalArticles) * 100}%` }}
              ></div>
            </div>
            <span className={styles.sentimentLabel}>Positive ({sentimentBreakdown.positive})</span>
          </div>
          <div className={styles.sentimentItem}>
            <div className={styles.sentimentBar}>
              <div 
                className={styles.sentimentFillNeutral} 
                style={{ width: `${(sentimentBreakdown.neutral / totalArticles) * 100}%` }}
              ></div>
            </div>
            <span className={styles.sentimentLabel}>Neutral ({sentimentBreakdown.neutral})</span>
          </div>
          <div className={styles.sentimentItem}>
            <div className={styles.sentimentBar}>
              <div 
                className={styles.sentimentFillNegative} 
                style={{ width: `${(sentimentBreakdown.negative / totalArticles) * 100}%` }}
              ></div>
            </div>
            <span className={styles.sentimentLabel}>Negative ({sentimentBreakdown.negative})</span>
          </div>
        </div>
      </div>

      {/* Top Sources */}
      <div className={styles.sourcesSection}>
        <h2>Top Sources</h2>
        <div className={styles.sourcesList}>
          {topSourcesArray.map(([source, count], index) => (
            <div key={index} className={styles.sourceItem}>
              <div className={styles.sourceInfo}>
                <Building2 size={16} />
                <span className={styles.sourceName}>{source}</span>
              </div>
              <span className={styles.sourceCount}>{count} mentions</span>
            </div>
          ))}
        </div>
      </div>

      {/* Articles List */}
      <div className={styles.articlesSection}>
        <h2>Competitor Mentions</h2>
        <p className={styles.articlesSubtitle}>
          {selectedKeyword 
            ? `Showing collected data for competitor: ${selectedKeyword}`
            : 'Select a competitor keyword and collect data to see mentions'
          }
        </p>
        {filteredArticles.length === 0 ? (
          <div className={styles.emptyState}>
            <Target className={styles.emptyIcon} />
            <h3>No Competitor Data Collected</h3>
            <p>
              {competitorKeywords.length === 0 
                ? 'Add competitor keywords to start monitoring their mentions'
                : !selectedKeyword
                  ? 'Select a competitor keyword above and click "Collect Data" to gather fresh information'
                  : 'Click "Collect Data" to gather fresh information about this competitor'
              }
            </p>
          </div>
        ) : (
          <div className={styles.articlesGrid}>
            {filteredArticles.map((article, index) => (
              <div key={index} className={styles.articleCard}>
                <div className={styles.articleHeader}>
                  <div className={styles.articleMeta}>
                    <span className={styles.articleSource}>{article.source}</span>
                    <span className={styles.articleDate}>
                      <Calendar size={12} />
                      {new Date(article.publishedAt).toLocaleDateString()}
                    </span>
                  </div>
                  <div className={styles.articleSentiment}>
                    <span className={`${styles.sentimentBadge} ${styles[article.sentiment]}`}>
                      {article.sentiment}
                    </span>
                  </div>
                </div>
                
                <h3 className={styles.articleTitle}>{article.title}</h3>
                <p className={styles.articleDescription}>{article.description}</p>
                
                <div className={styles.articleFooter}>
                  <div className={styles.articleActions}>
                    <a 
                      href={article.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className={styles.readMoreButton}
                    >
                      <ExternalLink size={14} />
                      Read More
                    </a>
                  </div>
                  <div className={styles.articleStats}>
                    <div className={styles.statItem}>
                      <Eye size={12} />
                      <span>{article.views || 0}</span>
                    </div>
                    <div className={styles.statItem}>
                      <MessageSquare size={12} />
                      <span>{article.comments || 0}</span>
                    </div>
                    <div className={styles.statItem}>
                      <Share2 size={12} />
                      <span>{article.shares || 0}</span>
                    </div>
                    <div className={styles.statItem}>
                      <Heart size={12} />
                      <span>{article.likes || 0}</span>
                    </div>
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
