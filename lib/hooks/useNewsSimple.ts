import { useState, useEffect } from 'react';
import { useAppSelector, useAppDispatch } from '@/lib/hooks/redux';
import { 
  setLoading, 
  setLoadingMessage,
  setError, 
  setArticles, 
  addArticles,
  addSocialPosts,
  updateFilters,
  clearData 
} from '@/lib/store/slices/newsSlice';

interface NewsFilters {
  keyword?: string;
  source?: string;
  sentiment?: string;
  sortBy?: string;
  page?: number;
  limit?: number;
}

interface StoreNewsData {
  userId: number;
  keyword: string;
  newsData: any;
  socialData: any;
}

// Simple fetch function without React Query
export const useNewsArticles = (filters: NewsFilters = {}) => {
  const dispatch = useAppDispatch();
  const { articles, loading, error } = useAppSelector((state) => state.news);
  const { user } = useAppSelector((state) => state.user);
  const [isLoading, setIsLoading] = useState(false);

  const fetchArticles = async () => {
    if (!user?.id) {
      console.log('No user ID available for fetching articles');
      return;
    }

    try {
      setIsLoading(true);
      dispatch(setLoadingMessage('Loading articles from database...'));
      dispatch(setError(null));

      const searchParams = new URLSearchParams();
      searchParams.set('userId', user.id.toString());
      if (filters.keyword) searchParams.set('keyword', filters.keyword);
      if (filters.source) searchParams.set('source', filters.source);
      if (filters.sentiment) searchParams.set('sentiment', filters.sentiment);
      if (filters.sortBy) searchParams.set('sortBy', filters.sortBy);
      if (filters.page) searchParams.set('page', filters.page.toString());
      if (filters.limit) searchParams.set('limit', filters.limit.toString());

      const response = await fetch(`/api/news?${searchParams.toString()}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch news articles');
      }

      const data = await response.json();
      
      // Update Redux store
      if (filters.page === 1 || !filters.page) {
        dispatch(setArticles(data.articles));
      } else {
        dispatch(addArticles(data.articles));
      }
      
      dispatch(setLoading(false));
      return data;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      dispatch(setError(errorMessage));
      dispatch(setLoading(false));
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    data: { articles, pagination: { page: 1, limit: 20, total: articles.length, hasMore: false } },
    isLoading: loading || isLoading,
    error: error,
    refetch: fetchArticles,
  };
};

// Store news data
export const useStoreNewsData = () => {
  const dispatch = useAppDispatch();
  const [isPending, setIsPending] = useState(false);

  const mutateAsync = async (data: StoreNewsData) => {
    try {
      setIsPending(true);
      dispatch(setLoading(true));
      dispatch(setError(null));

      const response = await fetch('/api/news', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('Failed to store news data');
      }

      const result = await response.json();
      dispatch(setLoading(false));
      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      dispatch(setError(errorMessage));
      dispatch(setLoading(false));
      throw error;
    } finally {
      setIsPending(false);
    }
  };

  return {
    mutateAsync,
    isPending,
  };
};

// Collect and store data from pipeline
export const useCollectNewsData = () => {
  const dispatch = useAppDispatch();
  const [isPending, setIsPending] = useState(false);

  const mutateAsync = async (userId: number) => {
    try {
      console.log('useCollectNewsData - Starting data collection for user:', userId);
      setIsPending(true);
      dispatch(setError(null));

      // Step 1: Collect data from pipeline
      console.log('useCollectNewsData - Setting loading message: Connecting to data sources...');
      dispatch(setLoadingMessage('Connecting to data sources...'));
      
      const collectResponse = await fetch('/api/data/collect', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${btoa(JSON.stringify({ userId }))}`,
        },
      });

      if (!collectResponse.ok) {
        const errorText = await collectResponse.text();
        console.error('Pipeline collection failed:', errorText);
        throw new Error(`Failed to collect data from pipeline: ${errorText}`);
      }

      dispatch(setLoadingMessage('Processing collected data...'));
      const collectedData = await collectResponse.json();

      // Step 2: Store data in database with retry logic
      dispatch(setLoadingMessage('Saving data to database...'));
      
      const storePromises = collectedData.data.map(async (item: any, index: number) => {
        dispatch(setLoadingMessage(`Saving data for keyword: ${item.keyword}...`));
        
        // Retry logic for database operations
        let retries = 3;
        while (retries > 0) {
          try {
            const response = await fetch('/api/news', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                userId,
                keyword: item.keyword,
                newsData: item.newsData,
                socialData: item.socialData,
              }),
            });

            if (!response.ok) {
              const errorText = await response.text();
              throw new Error(`Database error: ${errorText}`);
            }

            return await response.json();
          } catch (error) {
            retries--;
            console.error(`Database operation failed, retries left: ${retries}`, error);
            
            if (retries === 0) {
              throw error;
            }
            
            // Wait before retry
            await new Promise(resolve => setTimeout(resolve, 1000));
          }
        }
      });

      const storeResults = await Promise.all(storePromises);

      // Update Redux state with collected data
      const allArticles = storeResults.flatMap(result => result.data?.newsArticles || []);
      const allSocialPosts = storeResults.flatMap(result => result.data?.socialPosts || []);
      
      if (allArticles.length > 0) {
        dispatch(addArticles(allArticles));
        console.log(`Added ${allArticles.length} articles to Redux state`);
      }
      
      if (allSocialPosts.length > 0) {
        dispatch(addSocialPosts(allSocialPosts));
        console.log(`Added ${allSocialPosts.length} social posts to Redux state`);
      }

      dispatch(setLoadingMessage('Data collection completed!'));
      
      // Small delay to show completion message
      setTimeout(() => {
        dispatch(setLoading(false));
      }, 1000);

      return storeResults;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('Data collection failed:', errorMessage);
      dispatch(setError(errorMessage));
      dispatch(setLoading(false));
      throw error;
    } finally {
      setIsPending(false);
    }
  };

  return {
    mutateAsync,
    isPending,
  };
};

// Update filters
export const useUpdateFilters = () => {
  const dispatch = useAppDispatch();

  return (filters: Partial<NewsFilters>) => {
    dispatch(updateFilters(filters));
  };
};

// Clear all data
export const useClearNewsData = () => {
  const dispatch = useAppDispatch();

  return () => {
    dispatch(clearData());
  };
};
