import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '@/lib/store';
import { 
  setLoading, 
  setError, 
  setArticles, 
  addArticles,
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

// Fetch news articles
export const useNewsArticles = (filters: NewsFilters = {}) => {
  const dispatch = useDispatch<AppDispatch>();
  const queryClient = useQueryClient();

  return useQuery({
    queryKey: ['news-articles', filters],
    queryFn: async () => {
      dispatch(setLoading(true));
      dispatch(setError(null));

      const searchParams = new URLSearchParams();
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
    },
    onError: (error: Error) => {
      dispatch(setError(error.message));
      dispatch(setLoading(false));
    },
  });
};

// Store news data
export const useStoreNewsData = () => {
  const dispatch = useDispatch<AppDispatch>();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: StoreNewsData) => {
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
    },
    onSuccess: () => {
      // Invalidate and refetch news queries
      queryClient.invalidateQueries({ queryKey: ['news-articles'] });
    },
    onError: (error: Error) => {
      dispatch(setError(error.message));
      dispatch(setLoading(false));
    },
  });
};

// Collect and store data from pipeline
export const useCollectNewsData = () => {
  const dispatch = useDispatch<AppDispatch>();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (userId: number) => {
      dispatch(setLoading(true));
      dispatch(setError(null));

      // First, collect data from the pipeline
      const collectResponse = await fetch('/api/data/collect', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${btoa(JSON.stringify({ userId }))}`,
        },
      });

      if (!collectResponse.ok) {
        throw new Error('Failed to collect data from pipeline');
      }

      const collectedData = await collectResponse.json();

      // Then store the data in the database
      const storePromises = collectedData.data.map((item: any) => 
        fetch('/api/news', {
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
        })
      );

      const storeResponses = await Promise.all(storePromises);
      const storeResults = await Promise.all(
        storeResponses.map(response => response.json())
      );

      dispatch(setLoading(false));
      return storeResults;
    },
    onSuccess: () => {
      // Invalidate and refetch news queries
      queryClient.invalidateQueries({ queryKey: ['news-articles'] });
    },
    onError: (error: Error) => {
      dispatch(setError(error.message));
      dispatch(setLoading(false));
    },
  });
};

// Update filters
export const useUpdateFilters = () => {
  const dispatch = useDispatch<AppDispatch>();

  return (filters: Partial<NewsFilters>) => {
    dispatch(updateFilters(filters));
  };
};

// Clear all data
export const useClearNewsData = () => {
  const dispatch = useDispatch<AppDispatch>();
  const queryClient = useQueryClient();

  return () => {
    dispatch(clearData());
    queryClient.invalidateQueries({ queryKey: ['news-articles'] });
  };
};
