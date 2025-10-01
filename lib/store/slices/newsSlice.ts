import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface NewsArticle {
  id: number;
  userId: number;
  keyword: string;
  articleId: number;
  title: string;
  description?: string;
  url: string;
  publishedAt: string;
  sourceName: string;
  sourceLogo?: string;
  image?: string;
  sentimentScore?: number;
  sentimentLabel?: string;
  readTime?: number;
  isBreaking: boolean;
  categories?: (string | { id?: string; name?: string; score?: number; taxonomy?: string; links?: any })[];
  topics?: (string | { id?: string; name?: string; score?: number; taxonomy?: string; links?: any })[];
  engagement?: {
    views?: number;
    shares?: number;
    comments?: number;
    likes?: number;
  };
  rawData?: any;
  createdAt: string;
  updatedAt: string;
}

export interface SocialPost {
  id: number;
  userId: number;
  keyword: string;
  postId: string;
  title?: string;
  description?: string;
  url?: string;
  publishedAt: string;
  platformName: string;
  platformLogo?: string;
  image?: string;
  sentimentScore?: number;
  sentimentLabel?: string;
  engagement?: {
    views?: number;
    shares?: number;
    comments?: number;
    likes?: number;
  };
  rawData?: any;
  createdAt: string;
  updatedAt: string;
}

interface NewsState {
  articles: NewsArticle[];
  socialPosts: SocialPost[];
  loading: boolean;
  loadingMessage: string;
  error: string | null;
  lastUpdated: string | null;
  filters: {
    keyword: string;
    source: string;
    sentiment: string;
    sortBy: string;
  };
  pagination: {
    page: number;
    limit: number;
    total: number;
    hasMore: boolean;
  };
}

const initialState: NewsState = {
  articles: [],
  socialPosts: [],
  loading: false,
  loadingMessage: '',
  error: null,
  lastUpdated: null,
  filters: {
    keyword: 'all',
    source: 'all',
    sentiment: 'all',
    sortBy: 'date',
  },
  pagination: {
    page: 1,
    limit: 20,
    total: 0,
    hasMore: false,
  },
};

const newsSlice = createSlice({
  name: 'news',
  initialState,
  reducers: {
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
      if (!action.payload) {
        state.loadingMessage = '';
      }
    },
    setLoadingMessage: (state, action: PayloadAction<string>) => {
      state.loadingMessage = action.payload;
      state.loading = true;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    setArticles: (state, action: PayloadAction<NewsArticle[]>) => {
      state.articles = action.payload;
      state.lastUpdated = new Date().toISOString();
    },
    addArticles: (state, action: PayloadAction<NewsArticle[]>) => {
      // Avoid duplicates by checking articleId
      const existingIds = new Set(state.articles.map(article => article.articleId));
      const newArticles = action.payload.filter(article => !existingIds.has(article.articleId));
      state.articles = [...state.articles, ...newArticles];
      state.lastUpdated = new Date().toISOString();
    },
    setSocialPosts: (state, action: PayloadAction<SocialPost[]>) => {
      state.socialPosts = action.payload;
    },
    addSocialPosts: (state, action: PayloadAction<SocialPost[]>) => {
      // Avoid duplicates by checking postId
      const existingIds = new Set(state.socialPosts.map(post => post.postId));
      const newPosts = action.payload.filter(post => !existingIds.has(post.postId));
      state.socialPosts = [...state.socialPosts, ...newPosts];
    },
    updateFilters: (state, action: PayloadAction<Partial<NewsState['filters']>>) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    updatePagination: (state, action: PayloadAction<Partial<NewsState['pagination']>>) => {
      state.pagination = { ...state.pagination, ...action.payload };
    },
    clearData: (state) => {
      state.articles = [];
      state.socialPosts = [];
      state.error = null;
      state.lastUpdated = null;
    },
    removeArticle: (state, action: PayloadAction<number>) => {
      state.articles = state.articles.filter(article => article.id !== action.payload);
    },
    updateArticle: (state, action: PayloadAction<{ id: number; updates: Partial<NewsArticle> }>) => {
      const index = state.articles.findIndex(article => article.id === action.payload.id);
      if (index !== -1) {
        state.articles[index] = { ...state.articles[index], ...action.payload.updates };
      }
    },
  },
});

export const {
  setLoading,
  setLoadingMessage,
  setError,
  setArticles,
  addArticles,
  setSocialPosts,
  addSocialPosts,
  updateFilters,
  updatePagination,
  clearData,
  removeArticle,
  updateArticle,
} = newsSlice.actions;

export default newsSlice.reducer;
