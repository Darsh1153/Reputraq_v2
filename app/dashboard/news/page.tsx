'use client';

import { useState, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/lib/hooks/redux';
import { setUser } from '@/lib/store/slices/userSlice';
import { setArticles } from '@/lib/store/slices/newsSlice';
import { useNewsArticles } from '@/lib/hooks/useNewsSimple';
import { NewsMonitoringRedux } from '@/components/NewsMonitoringRedux';
import { dataManager } from '../../../services/dataManager';
import RefreshButton from '../../../components/RefreshButton';

interface User {
  id: number;
  name: string;
  email: string;
  plan: string;
  status: string;
  keywords?: string[];
}


export default function NewsPage() {
  const dispatch = useAppDispatch();
  const { user: reduxUser } = useAppSelector((state) => state.user);
  const { articles, loading: newsLoading, error: newsError } = useAppSelector((state) => state.news);
  const [user, setUser] = useState<User | null>(null);
  const [keywords, setKeywords] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [newsData, setNewsData] = useState(dataManager.getNewsData());

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
      console.log('NewsPage - User data from localStorage:', userData);
      
      if (userData) {
        try {
          const parsedUser = JSON.parse(userData);
          console.log('NewsPage - Parsed user:', parsedUser);
          setUser(parsedUser);
          
          // Update Redux store with user data
          dispatch(setUser(parsedUser));
          console.log('NewsPage - User dispatched to Redux');

          // Load keywords - prioritize user data from localStorage
          console.log('NewsPage - Loading keywords...');
          console.log('NewsPage - Parsed user data:', parsedUser);
          console.log('NewsPage - User keywords from parsedUser:', parsedUser.keywords);
          
          if (parsedUser.keywords && Array.isArray(parsedUser.keywords) && parsedUser.keywords.length > 0) {
            console.log('NewsPage - Using keywords from user data:', parsedUser.keywords);
            setKeywords(parsedUser.keywords);
          } else {
            console.log('NewsPage - No keywords in user data, trying API...');
            
            try {
              // Try API call as fallback
              const token = btoa(JSON.stringify({ userId: parsedUser.id }));
              const response = await fetch('/api/keywords', {
                method: 'GET',
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${token}`,
                },
              });

              console.log('NewsPage - Keywords API response status:', response.status);
              
              if (response.ok) {
                const keywordsData = await response.json();
                console.log('NewsPage - Keywords loaded from API:', keywordsData);
                if (Array.isArray(keywordsData)) {
                  const keywordStrings = keywordsData.map((kw: any) => kw.keyword);
                  console.log('NewsPage - Extracted keyword strings:', keywordStrings);
                  setKeywords(keywordStrings);
                } else {
                  console.log('NewsPage - API data is not an array:', keywordsData);
                  setKeywords([]);
                }
              } else {
                console.log('NewsPage - API call failed, no keywords available');
                setKeywords([]);
              }
            } catch (error) {
              console.error('NewsPage - Error loading keywords from API:', error);
              setKeywords([]);
            }
          }
          
          // Initialize data if not already loaded
          if (!newsData.lastFetched) {
            console.log('NewsPage - Initializing news data...');
            await dataManager.refreshAllData();
          }
        } catch (error) {
          console.error('NewsPage - Error parsing user data:', error);
        }
      } else {
        console.log('NewsPage - No user data found in localStorage');
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
    if (user && user.keywords && Array.isArray(user.keywords) && user.keywords.length > 0) {
      console.log('NewsPage - User changed, reloading keywords:', user.keywords);
      setKeywords(user.keywords);
    }
  }, [user]);

  // Show loading state for initial load or when data is being refreshed
  if (loading || newsData.isLoading) {
    return (
      <div style={{ 
        display: 'flex', 
        flexDirection: 'column',
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '50vh',
        fontSize: '1.2rem',
        color: '#718096'
      }}>
        <div style={{ marginBottom: '1rem' }}>Loading news data...</div>
        <RefreshButton size="sm" variant="ghost" />
      </div>
    );
  }

  if (!user) {
    return (
      <div style={{ 
        display: 'flex', 
        flexDirection: 'column',
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '50vh',
        textAlign: 'center'
      }}>
        <h2 style={{ color: '#e53e3e', marginBottom: '1rem' }}>Access Denied</h2>
        <p style={{ color: '#718096' }}>Please sign in to access news monitoring.</p>
      </div>
    );
  }

  if (newsError) {
    return (
      <div style={{ 
        display: 'flex', 
        flexDirection: 'column',
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '50vh',
        textAlign: 'center'
      }}>
        <h2 style={{ color: '#e53e3e', marginBottom: '1rem' }}>Error Loading News</h2>
        <p style={{ color: '#718096', marginBottom: '2rem' }}>
          {newsError.message || 'Failed to load news data'}
        </p>
        <a 
          href="/dashboard" 
          style={{
            background: '#3182ce',
            color: 'white',
            padding: '0.75rem 1.5rem',
            borderRadius: '8px',
            textDecoration: 'none',
            fontWeight: '600'
          }}
        >
          Go to Dashboard
        </a>
      </div>
    );
  }

  // Check if we have news data to display from Redux state
  const hasNewsData = articles && articles.length > 0;
  
  console.log('NewsPage - Debug info:', {
    keywords: keywords,
    keywordsLength: keywords.length,
    articles: articles,
    articlesLength: articles?.length,
    hasNewsData: hasNewsData,
    user: user,
    userKeywords: user?.keywords
  });
  
  // Only show "No Keywords" message if we have no news data AND no keywords
  if (keywords.length === 0 && !hasNewsData) {
    return (
      <div style={{ 
        display: 'flex', 
        flexDirection: 'column',
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '50vh',
        textAlign: 'center'
      }}>
        <h2 style={{ color: '#2d3748', marginBottom: '1rem' }}>No Keywords Added</h2>
        <p style={{ color: '#718096', marginBottom: '2rem' }}>
          Add keywords to start monitoring news articles.
        </p>
        <a 
          href="/dashboard/keywords" 
          style={{
            background: '#3182ce',
            color: 'white',
            padding: '0.75rem 1.5rem',
            borderRadius: '8px',
            textDecoration: 'none',
            fontWeight: '600',
            transition: 'background 0.2s ease'
          }}
          onMouseOver={(e) => e.currentTarget.style.background = '#2c5aa0'}
          onMouseOut={(e) => e.currentTarget.style.background = '#3182ce'}
        >
          Add Keywords
        </a>
      </div>
    );
  }

  // If we have news data, show it regardless of keywords
  if (hasNewsData) {
    return (
      <div>
        <div style={{ 
          marginBottom: '2rem',
          padding: '0 1rem'
        }}>
          <h1 style={{ 
            fontSize: '2rem', 
            fontWeight: 'bold', 
            color: '#2d3748',
            margin: 0
          }}>
            News Monitoring
          </h1>
        </div>
        <NewsMonitoringRedux 
          keywords={keywords} 
        />
      </div>
    );
  }
  
  // If no news data, show message to collect data
  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column',
      justifyContent: 'center', 
      alignItems: 'center', 
      height: '50vh',
      textAlign: 'center'
    }}>
      <h2 style={{ color: '#2d3748', marginBottom: '1rem' }}>No News Data Available</h2>
      <p style={{ color: '#718096', marginBottom: '2rem' }}>
        No news articles have been collected yet. Go to the dashboard and click "Collect Real Data" to fetch news articles.
      </p>
      <a 
        href="/dashboard" 
        style={{
          background: '#3182ce',
          color: 'white',
          padding: '0.75rem 1.5rem',
          borderRadius: '8px',
          textDecoration: 'none',
          fontWeight: '600',
          transition: 'background 0.2s ease'
        }}
        onMouseOver={(e) => e.currentTarget.style.background = '#2c5aa0'}
        onMouseOut={(e) => e.currentTarget.style.background = '#3182ce'}
      >
        Go to Dashboard
      </a>
    </div>
  );

}
