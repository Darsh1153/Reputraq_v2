'use client';

import { useState, useEffect } from 'react';
import { Search, Filter, Download, RefreshCw, Play, Pause, Heart, MessageCircle, Share, Eye, Calendar, Hash, User, ExternalLink, Monitor } from 'lucide-react';
import { socialMonitoringService, SocialContent, SocialPlatform } from '../../../services/socialMonitoringService';
import { useSelector } from 'react-redux';
import { RootState } from '../../../lib/store';
import { dataManager } from '../../../services/dataManager';
import RefreshButton from '../../../components/RefreshButton';
import styles from './page.module.scss';

interface SearchResult {
  platform: SocialPlatform;
  content: SocialContent[];
  keyword?: string;
}

interface Keyword {
  id: number;
  userId: number;
  keyword: string;
  createdAt: string;
}

export default function SocialListeningPage() {
  const { user } = useSelector((state: RootState) => state.user);
  const [keywords, setKeywords] = useState<Keyword[]>([]);
  const [selectedKeyword, setSelectedKeyword] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [platforms, setPlatforms] = useState<SocialPlatform[]>([]);
  const [errors, setErrors] = useState<{ platform: SocialPlatform; error: string }[]>([]);
  const [selectedPlatform, setSelectedPlatform] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'date' | 'engagement' | 'platform'>('date');
  const [loadingKeywords, setLoadingKeywords] = useState(true);
  const [socialData, setSocialData] = useState(dataManager.getSocialData());

  // Handle image loading errors with fallback
  const handleImageError = (event: React.SyntheticEvent<HTMLImageElement, Event>) => {
    const target = event.target as HTMLImageElement;
    const fallbackImage = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0yMCAxMkMxNS41ODI5IDEyIDEyIDE1LjU4MjkgMTIgMjBDMTIgMjQuNDE3MSAxNS41ODI5IDI4IDIwIDI4QzI0LjQxNzEgMjggMjggMjQuNDE3MSAyOCAyMEMyOCAxNS41ODI5IDI0LjQxNzEgMTIgMjAgMTJaIiBmaWxsPSIjOUNBM0FGIi8+Cjwvc3ZnPgo=';
    target.src = fallbackImage;
  };

  // Handle thumbnail loading errors with fallback
  const handleThumbnailError = (event: React.SyntheticEvent<HTMLImageElement, Event>) => {
    const target = event.target as HTMLImageElement;
    const fallbackImage = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgdmlld0JveD0iMCAwIDQwMCAzMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI0MDAiIGhlaWdodD0iMzAwIiBmaWxsPSIjRjNGNEY2Ii8+Cjx0ZXh0IHg9IjIwMCIgeT0iMTUwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmb250LWZhbWlseT0iQXJpYWwsIHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMjQiIGZpbGw9IiM2QjcyODAiPkltYWdlPC90ZXh0Pgo8L3N2Zz4K';
    target.src = fallbackImage;
  };

  useEffect(() => {
    // Subscribe to social data updates
    const handleSocialUpdate = (data: any) => {
      setSocialData(data);
      if (data.results && data.results.length > 0) {
        setSearchResults(data.results);
      }
      if (data.errors && data.errors.length > 0) {
        setErrors(data.errors);
      }
    };

    dataManager.subscribe('social', handleSocialUpdate);
    loadPlatforms();

    // Cleanup subscription
    return () => {
      dataManager.unsubscribe('social', handleSocialUpdate);
    };
  }, []);

  useEffect(() => {
    if (user) {
      loadKeywords();
    }
  }, [user]);

  const loadPlatforms = async () => {
    try {
      const platformsData = await socialMonitoringService.getWorkPlatforms();
      setPlatforms(platformsData.filter(p => p.category === 'SOCIAL' && p.status === 'ACTIVE'));
    } catch (error) {
      console.error('Failed to load platforms:', error);
    }
  };

  // Process ensemble API data into the expected format
  const processEnsembleAPIData = (apiData: any, searchTerm: string): SearchResult[] => {
    console.log('Processing EnsembleData API response:', apiData);
    const results: SearchResult[] = [];
    
    // Process YouTube videos
    if (apiData.platforms?.youtube?.videos && apiData.platforms.youtube.videos.length > 0) {
      console.log('Processing YouTube videos:', apiData.platforms.youtube.videos);
      const youtubePlatform = {
        id: 'youtube',
        name: 'YouTube',
        logo_url: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0yMCAxMkMxNS41ODI5IDEyIDEyIDE1LjU4MjkgMTIgMjBDMTIgMjQuNDE3MSAxNS41ODI5IDI4IDIwIDI4QzI0LjQxNzEgMjggMjggMjQuNDE3MSAyOCAyMEMyOCAxNS41ODI5IDI0LjQxNzEgMTIgMjAgMTJaIiBmaWxsPSIjOUNBM0FGIi8+Cjwvc3ZnPgo=',
        category: 'SOCIAL',
        status: 'ACTIVE',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        url: 'https://youtube.com'
      };
      
      const youtubeContent: SocialContent[] = apiData.platforms.youtube.videos.map((video: any, index: number) => ({
        id: `youtube_${searchTerm}_${index}`,
        work_platform: {
          id: 'youtube',
          name: 'YouTube',
          logo_url: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0yMCAxMkMxNS41ODI5IDEyIDEyIDE1LjU4MjkgMTIgMjBDMTIgMjQuNDE3MSAxNS41ODI5IDI4IDIwIDI4QzI0LjQxNzEgMjggMjggMjQuNDE3MSAyOCAyMEMyOCAxNS41ODI5IDI0LjQxNzEgMTIgMjAgMTJaIiBmaWxsPSIjOUNBM0FGIi8+Cjwvc3ZnPgo='
        },
        type: 'video',
        title: video.title || `YouTube video about ${searchTerm}`,
        description: video.description || `Watch this video about ${searchTerm}`,
        url: video.url || `https://youtube.com/watch?v=${video.videoId}`,
        published_at: video.publishedAt || new Date().toISOString(),
        thumbnail_url: video.thumbnail || `https://img.youtube.com/vi/${video.videoId}/maxresdefault.jpg` || `data:image/svg+xml;base64,${btoa(`<svg width="400" height="300" viewBox="0 0 400 300" fill="none" xmlns="http://www.w3.org/2000/svg"><rect width="400" height="300" fill="#FF0000"/><text x="200" y="150" text-anchor="middle" font-family="Arial, sans-serif" font-size="24" fill="white">YouTube</text></svg>`)}`,
        media_url: video.thumbnail || `https://img.youtube.com/vi/${video.videoId}/maxresdefault.jpg` || `data:image/svg+xml;base64,${btoa(`<svg width="400" height="300" viewBox="0 0 400 300" fill="none" xmlns="http://www.w3.org/2000/svg"><rect width="400" height="300" fill="#FF0000"/><text x="200" y="150" text-anchor="middle" font-family="Arial, sans-serif" font-size="24" fill="white">YouTube</text></svg>`)}`,
        platform_content_id: video.videoId || `youtube_${searchTerm}_${index}`,
        format: video.isShorts ? 'VIDEO' : 'VIDEO',
        duration: video.duration || 0,
        audio_track_info: null,
        hashtags: [`#${searchTerm.replace(/\s+/g, '')}`, '#youtube'],
        mentions: [],
        media_urls: [],
        profile: {
          platform_username: video.channelTitle || 'YouTube Creator',
          url: `https://youtube.com/@${video.channelTitle || 'youtube_creator'}`,
          image_url: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0yMCAxMkMxNS41ODI5IDEyIDEyIDE1LjU4MjkgMTIgMjBDMTIgMjQuNDE3MSAxNS41ODI5IDI4IDIwIDI4QzI0LjQxNzEgMjggMjggMjQuNDE3MSAyOCAyMEMyOCAxNS41ODI5IDI0LjQxNzEgMTIgMjAgMTJaIiBmaWxsPSIjOUNBM0FGIi8+Cjwvc3ZnPgo=',
          platform_user_id: 'youtube_creator'
        },
        engagement: {
          like_count: 0,
          comment_count: 0,
          share_count: 0,
          view_count: video.views || 0
        }
      }));
      
      results.push({
        platform: youtubePlatform,
        content: youtubeContent
      });
    }
    
    // Process TikTok posts
    if (apiData.platforms?.tiktok?.posts && apiData.platforms.tiktok.posts.length > 0) {
      console.log('Processing TikTok posts:', apiData.platforms.tiktok.posts);
      const tiktokPlatform = {
        id: 'tiktok',
        name: 'TikTok',
        logo_url: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0yMCAxMkMxNS41ODI5IDEyIDEyIDE1LjU4MjkgMTIgMjBDMTIgMjQuNDE3MSAxNS41ODI5IDI4IDIwIDI4QzI0LjQxNzEgMjggMjggMjQuNDE3MSAyOCAyMEMyOCAxNS41ODI5IDI0LjQxNzEgMTIgMjAgMTJaIiBmaWxsPSIjOUNBM0FGIi8+Cjwvc3ZnPgo=',
        category: 'SOCIAL',
        status: 'ACTIVE',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        url: 'https://tiktok.com'
      };
      
      const tiktokContent: SocialContent[] = apiData.platforms.tiktok.posts.map((post: any, index: number) => ({
        id: `tiktok_${searchTerm}_${index}`,
        work_platform: {
          id: 'tiktok',
          name: 'TikTok',
          logo_url: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0yMCAxMkMxNS41ODI5IDEyIDEyIDE1LjU4MjkgMTIgMjBDMTIgMjQuNDE3MSAxNS41ODI5IDI4IDIwIDI4QzI0LjQxNzEgMjggMjggMjQuNDE3MSAyOCAyMEMyOCAxNS41ODI5IDI0LjQxNzEgMTIgMjAgMTJaIiBmaWxsPSIjOUNBM0FGIi8+Cjwvc3ZnPgo='
        },
        type: 'video',
        title: post.text || `TikTok video about ${searchTerm}`,
        description: post.text || `TikTok content about ${searchTerm}`,
        url: post.url || `https://tiktok.com/@${post.author.username}/video/${post.id}`,
        published_at: post.publishedAt || new Date().toISOString(),
        thumbnail_url: post.thumbnail || post.videoUrl || `data:image/svg+xml;base64,${btoa(`<svg width="400" height="300" viewBox="0 0 400 300" fill="none" xmlns="http://www.w3.org/2000/svg"><rect width="400" height="300" fill="#000000"/><text x="200" y="150" text-anchor="middle" font-family="Arial, sans-serif" font-size="24" fill="white">TikTok</text></svg>`)}`,
        media_url: post.videoUrl || post.thumbnail || `data:image/svg+xml;base64,${btoa(`<svg width="400" height="300" viewBox="0 0 400 300" fill="none" xmlns="http://www.w3.org/2000/svg"><rect width="400" height="300" fill="#000000"/><text x="200" y="150" text-anchor="middle" font-family="Arial, sans-serif" font-size="24" fill="white">TikTok</text></svg>`)}`,
        platform_content_id: post.id || `tiktok_${searchTerm}_${index}`,
        format: 'VIDEO',
        duration: post.duration || 0,
        audio_track_info: null,
        hashtags: post.hashtags || [`#${searchTerm.replace(/\s+/g, '')}`, '#tiktok'],
        mentions: [],
        media_urls: [],
        profile: {
          platform_username: post.author.username || 'tiktok_user',
          url: `https://tiktok.com/@${post.author.username || 'tiktok_user'}`,
          image_url: post.author.avatar || 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0yMCAxMkMxNS41ODI5IDEyIDEyIDE1LjU4MjkgMTIgMjBDMTIgMjQuNDE3MSAxNS41ODI5IDI4IDIwIDI4QzI0LjQxNzEgMjggMjggMjQuNDE3MSAyOCAyMEMyOCAxNS41ODI5IDI0LjQxNzEgMTIgMjAgMTJaIiBmaWxsPSIjOUNBM0FGIi8+Cjwvc3ZnPgo=',
          platform_user_id: post.author.username || 'tiktok_user'
        },
        engagement: {
          like_count: post.likes || 0,
          comment_count: post.comments || 0,
          share_count: post.shares || 0,
          view_count: post.views || 0
        }
      }));
      
      results.push({
        platform: tiktokPlatform,
        content: tiktokContent
      });
    }
    
    // Process Threads data
    if (apiData.platforms?.threads?.posts && apiData.platforms.threads.posts.length > 0) {
      const threadsPlatform = {
        id: 'threads',
        name: 'Threads',
        logo_url: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0yMCAxMkMxNS41ODI5IDEyIDEyIDE1LjU4MjkgMTIgMjBDMTIgMjQuNDE3MSAxNS41ODI5IDI4IDIwIDI4QzI0LjQxNzEgMjggMjggMjQuNDE3MSAyOCAyMEMyOCAxNS41ODI5IDI0LjQxNzEgMTIgMjAgMTJaIiBmaWxsPSIjOUNBM0FGIi8+Cjwvc3ZnPgo=',
        category: 'SOCIAL',
        status: 'ACTIVE',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        url: 'https://threads.net'
      };
      
      const threadsContent: SocialContent[] = apiData.platforms.threads.posts.map((post: any, index: number) => ({
        id: `threads_${searchTerm}_${index}`,
        work_platform: {
          id: 'threads',
          name: 'Threads',
          logo_url: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0yMCAxMkMxNS41ODI5IDEyIDEyIDE1LjU4MjkgMTIgMjBDMTIgMjQuNDE3MSAxNS41ODI5IDI4IDIwIDI4QzI0LjQxNzEgMjggMjggMjQuNDE3MSAyOCAyMEMyOCAxNS41ODI5IDI0LjQxNzEgMTIgMjAgMTJaIiBmaWxsPSIjOUNBM0FGIi8+Cjwvc3ZnPgo='
        },
        type: post.videoUrl ? 'video' : 'text',
        title: post.text || `Threads post about ${searchTerm}`,
        description: post.text || `Threads content about ${searchTerm}`,
        url: post.url || `https://threads.net/@${post.author.username}/post/${post.id}`,
        published_at: post.publishedAt || new Date().toISOString(),
        thumbnail_url: post.imageUrl || post.videoUrl || `data:image/svg+xml;base64,${btoa(`<svg width="400" height="300" viewBox="0 0 400 300" fill="none" xmlns="http://www.w3.org/2000/svg"><rect width="400" height="300" fill="#000000"/><text x="200" y="150" text-anchor="middle" font-family="Arial, sans-serif" font-size="24" fill="white">Threads</text></svg>`)}`,
        media_url: post.videoUrl || post.imageUrl || `data:image/svg+xml;base64,${btoa(`<svg width="400" height="300" viewBox="0 0 400 300" fill="none" xmlns="http://www.w3.org/2000/svg"><rect width="400" height="300" fill="#000000"/><text x="200" y="150" text-anchor="middle" font-family="Arial, sans-serif" font-size="24" fill="white">Threads</text></svg>`)}`,
        platform_content_id: post.id || `threads_${searchTerm}_${index}`,
        format: post.videoUrl ? 'VIDEO' : 'TEXT' as const,
        duration: 0,
        audio_track_info: null,
        hashtags: post.hashtags || [`#${searchTerm.replace(/\s+/g, '')}`, '#threads'],
        mentions: [],
        media_urls: [],
        profile: {
          platform_username: post.author.username || 'threads_user',
          url: `https://threads.net/@${post.author.username || 'threads_user'}`,
          image_url: post.author.avatar || 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0yMCAxMkMxNS41ODI5IDEyIDEyIDE1LjU4MjkgMTIgMjBDMTIgMjQuNDE3MSAxNS41ODI5IDI4IDIwIDI4QzI0LjQxNzEgMjggMjggMjQuNDE3MSAyOCAyMEMyOCAxNS41ODI5IDI0LjQxNzEgMTIgMjAgMTJaIiBmaWxsPSIjOUNBM0FGIi8+Cjwvc3ZnPgo=',
          platform_user_id: post.author.username || 'threads_user'
        },
        engagement: {
          like_count: post.likes || 0,
          comment_count: post.comments || 0,
          share_count: post.shares || 0,
          view_count: 0
        }
      }));
      
      results.push({
        platform: threadsPlatform,
        content: threadsContent
      });
    }

    // Process Reddit data
    if (apiData.platforms?.reddit?.posts && apiData.platforms.reddit.posts.length > 0) {
      const redditPlatform = {
        id: 'reddit',
        name: 'Reddit',
        logo_url: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0yMCAxMkMxNS41ODI5IDEyIDEyIDE1LjU4MjkgMTIgMjBDMTIgMjQuNDE3MSAxNS41ODI5IDI4IDIwIDI4QzI0LjQxNzEgMjggMjggMjQuNDE3MSAyOCAyMEMyOCAxNS41ODI5IDI0LjQxNzEgMTIgMjAgMTJaIiBmaWxsPSIjOUNBM0FGIi8+Cjwvc3ZnPgo=',
        category: 'SOCIAL',
        status: 'ACTIVE',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        url: 'https://reddit.com'
      };
      
      const redditContent: SocialContent[] = apiData.platforms.reddit.posts.map((post: any, index: number) => ({
        id: `reddit_${searchTerm}_${index}`,
        work_platform: {
          id: 'reddit',
          name: 'Reddit',
          logo_url: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0yMCAxMkMxNS41ODI5IDEyIDEyIDE1LjU4MjkgMTIgMjBDMTIgMjQuNDE3MSAxNS41ODI5IDI4IDIwIDI4QzI0LjQxNzEgMjggMjggMjQuNDE3MSAyOCAyMEMyOCAxNS41ODI5IDI0LjQxNzEgMTIgMjAgMTJaIiBmaWxsPSIjOUNBM0FGIi8+Cjwvc3ZnPgo='
        },
        type: 'text',
        title: post.title || `Reddit post about ${searchTerm}`,
        description: post.text || post.title || `Reddit content about ${searchTerm}`,
        url: post.url || `https://reddit.com/r/${post.subreddit}/comments/${post.id}`,
        published_at: post.publishedAt || new Date().toISOString(),
        thumbnail_url: post.thumbnail || `data:image/svg+xml;base64,${btoa(`<svg width="400" height="300" viewBox="0 0 400 300" fill="none" xmlns="http://www.w3.org/2000/svg"><rect width="400" height="300" fill="#FF4500"/><text x="200" y="150" text-anchor="middle" font-family="Arial, sans-serif" font-size="24" fill="white">Reddit</text></svg>`)}`,
        media_url: post.thumbnail || `data:image/svg+xml;base64,${btoa(`<svg width="400" height="300" viewBox="0 0 400 300" fill="none" xmlns="http://www.w3.org/2000/svg"><rect width="400" height="300" fill="#FF4500"/><text x="200" y="150" text-anchor="middle" font-family="Arial, sans-serif" font-size="24" fill="white">Reddit</text></svg>`)}`,
        platform_content_id: post.id || `reddit_${searchTerm}_${index}`,
        format: 'TEXT' as const,
        duration: 0,
        audio_track_info: null,
        hashtags: [`#${searchTerm.replace(/\s+/g, '')}`, '#reddit', `#${post.subreddit}`],
        mentions: [],
        media_urls: [],
        profile: {
          platform_username: post.author || 'reddit_user',
          url: `https://reddit.com/u/${post.author || 'reddit_user'}`,
          image_url: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0yMCAxMkMxNS41ODI5IDEyIDEyIDE1LjU4MjkgMTIgMjBDMTIgMjQuNDE3MSAxNS41ODI5IDI4IDIwIDI4QzI0LjQxNzEgMjggMjggMjQuNDE3MSAyOCAyMEMyOCAxNS41ODI5IDI0LjQxNzEgMTIgMjAgMTJaIiBmaWxsPSIjOUNBM0FGIi8+Cjwvc3ZnPgo=',
          platform_user_id: post.author || 'reddit_user'
        },
        engagement: {
          like_count: post.upvotes || 0,
          comment_count: post.comments || 0,
          share_count: 0,
          view_count: post.score || 0
        }
      }));
      
      results.push({
        platform: redditPlatform,
        content: redditContent
      });
    }

    // Process Twitter/X data
    if (apiData.platforms?.twitter?.posts && apiData.platforms.twitter.posts.length > 0) {
      const twitterPlatform = {
        id: 'twitter',
        name: 'Twitter/X',
        logo_url: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0yMCAxMkMxNS41ODI5IDEyIDEyIDE1LjU4MjkgMTIgMjBDMTIgMjQuNDE3MSAxNS41ODI5IDI4IDIwIDI4QzI0LjQxNzEgMjggMjggMjQuNDE3MSAyOCAyMEMyOCAxNS41ODI5IDI0LjQxNzEgMTIgMjAgMTJaIiBmaWxsPSIjOUNBM0FGIi8+Cjwvc3ZnPgo=',
        category: 'SOCIAL',
        status: 'ACTIVE',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        url: 'https://twitter.com'
      };
      
      const twitterContent: SocialContent[] = apiData.platforms.twitter.posts.map((post: any, index: number) => ({
        id: `twitter_${searchTerm}_${index}`,
        work_platform: {
          id: 'twitter',
          name: 'Twitter/X',
          logo_url: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0yMCAxMkMxNS41ODI5IDEyIDEyIDE1LjU4MjkgMTIgMjBDMTIgMjQuNDE3MSAxNS41ODI5IDI4IDIwIDI4QzI0LjQxNzEgMjggMjggMjQuNDE3MSAyOCAyMEMyOCAxNS41ODI5IDI0LjQxNzEgMTIgMjAgMTJaIiBmaWxsPSIjOUNBM0FGIi8+Cjwvc3ZnPgo='
        },
        type: 'text',
        title: post.text || `Tweet about ${searchTerm}`,
        description: post.text || `Twitter content about ${searchTerm}`,
        url: post.url || `https://twitter.com/${post.author.username}/status/${post.id}`,
        published_at: post.publishedAt || new Date().toISOString(),
        thumbnail_url: post.author.avatar || `data:image/svg+xml;base64,${btoa(`<svg width="400" height="300" viewBox="0 0 400 300" fill="none" xmlns="http://www.w3.org/2000/svg"><rect width="400" height="300" fill="#1DA1F2"/><text x="200" y="150" text-anchor="middle" font-family="Arial, sans-serif" font-size="24" fill="white">Twitter</text></svg>`)}`,
        media_url: post.author.avatar || `data:image/svg+xml;base64,${btoa(`<svg width="400" height="300" viewBox="0 0 400 300" fill="none" xmlns="http://www.w3.org/2000/svg"><rect width="400" height="300" fill="#1DA1F2"/><text x="200" y="150" text-anchor="middle" font-family="Arial, sans-serif" font-size="24" fill="white">Twitter</text></svg>`)}`,
        platform_content_id: post.id || `twitter_${searchTerm}_${index}`,
        format: 'TEXT' as const,
        duration: 0,
        audio_track_info: null,
        hashtags: post.hashtags || [`#${searchTerm.replace(/\s+/g, '')}`, '#twitter'],
        mentions: post.mentions || [],
        media_urls: post.media || [],
        profile: {
          platform_username: post.author.username || 'twitter_user',
          url: `https://twitter.com/${post.author.username || 'twitter_user'}`,
          image_url: post.author.avatar || 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0yMCAxMkMxNS41ODI5IDEyIDEyIDE1LjU4MjkgMTIgMjBDMTIgMjQuNDE3MSAxNS41ODI5IDI4IDIwIDI4QzI0LjQxNzEgMjggMjggMjQuNDE3MSAyOCAyMEMyOCAxNS41ODI5IDI0LjQxNzEgMTIgMjAgMTJaIiBmaWxsPSIjOUNBM0FGIi8+Cjwvc3ZnPgo=',
          platform_user_id: post.author.username || 'twitter_user'
        },
        engagement: {
          like_count: post.likes || 0,
          comment_count: post.replies || 0,
          share_count: post.retweets || 0,
          view_count: 0
        }
      }));
      
      results.push({
        platform: twitterPlatform,
        content: twitterContent
      });
    }

    // Process LinkedIn data
    if (apiData.platforms?.linkedin?.posts && apiData.platforms.linkedin.posts.length > 0) {
      const linkedinPlatform = {
        id: 'linkedin',
        name: 'LinkedIn',
        logo_url: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0yMCAxMkMxNS41ODI5IDEyIDEyIDE1LjU4MjkgMTIgMjBDMTIgMjQuNDE3MSAxNS41ODI5IDI4IDIwIDI4QzI0LjQxNzEgMjggMjggMjQuNDE3MSAyOCAyMEMyOCAxNS41ODI5IDI0LjQxNzEgMTIgMjAgMTJaIiBmaWxsPSIjOUNBM0FGIi8+Cjwvc3ZnPgo=',
        category: 'SOCIAL',
        status: 'ACTIVE',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        url: 'https://linkedin.com'
      };
      
      const linkedinContent: SocialContent[] = apiData.platforms.linkedin.posts.map((post: any, index: number) => ({
        id: `linkedin_${searchTerm}_${index}`,
        work_platform: {
          id: 'linkedin',
          name: 'LinkedIn',
          logo_url: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0yMCAxMkMxNS41ODI5IDEyIDEyIDE1LjU4MjkgMTIgMjBDMTIgMjQuNDE3MSAxNS41ODI5IDI4IDIwIDI4QzI0LjQxNzEgMjggMjggMjQuNDE3MSAyOCAyMEMyOCAxNS41ODI5IDI0LjQxNzEgMTIgMjAgMTJaIiBmaWxsPSIjOUNBM0FGIi8+Cjwvc3ZnPgo='
        },
        type: 'text',
        title: post.text || `LinkedIn post about ${searchTerm}`,
        description: post.text || `LinkedIn content about ${searchTerm}`,
        url: post.url || `https://linkedin.com/posts/${post.id}`,
        published_at: post.publishedAt || new Date().toISOString(),
        thumbnail_url: post.author.avatar || `data:image/svg+xml;base64,${btoa(`<svg width="400" height="300" viewBox="0 0 400 300" fill="none" xmlns="http://www.w3.org/2000/svg"><rect width="400" height="300" fill="#0077B5"/><text x="200" y="150" text-anchor="middle" font-family="Arial, sans-serif" font-size="24" fill="white">LinkedIn</text></svg>`)}`,
        media_url: post.author.avatar || `data:image/svg+xml;base64,${btoa(`<svg width="400" height="300" viewBox="0 0 400 300" fill="none" xmlns="http://www.w3.org/2000/svg"><rect width="400" height="300" fill="#0077B5"/><text x="200" y="150" text-anchor="middle" font-family="Arial, sans-serif" font-size="24" fill="white">LinkedIn</text></svg>`)}`,
        platform_content_id: post.id || `linkedin_${searchTerm}_${index}`,
        format: 'TEXT' as const,
        duration: 0,
        audio_track_info: null,
        hashtags: post.hashtags || [`#${searchTerm.replace(/\s+/g, '')}`, '#linkedin'],
        mentions: [],
        media_urls: post.media || [],
        profile: {
          platform_username: post.author.name || 'linkedin_user',
          url: `https://linkedin.com/in/${post.author.name || 'linkedin_user'}`,
          image_url: post.author.avatar || 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0yMCAxMkMxNS41ODI5IDEyIDEyIDE1LjU4MjkgMTIgMjBDMTIgMjQuNDE3MSAxNS41ODI5IDI4IDIwIDI4QzI0LjQxNzEgMjggMjggMjQuNDE3MSAyOCAyMEMyOCAxNS41ODI5IDI0LjQxNzEgMTIgMjAgMTJaIiBmaWxsPSIjOUNBM0FGIi8+Cjwvc3ZnPgo=',
          platform_user_id: post.author.name || 'linkedin_user'
        },
        engagement: {
          like_count: post.likes || 0,
          comment_count: post.comments || 0,
          share_count: post.shares || 0,
          view_count: post.engagement || 0
        }
      }));
      
      results.push({
        platform: linkedinPlatform,
        content: linkedinContent
      });
    }

    // Process Facebook data
    if (apiData.platforms?.facebook?.posts && apiData.platforms.facebook.posts.length > 0) {
      const facebookPlatform = {
        id: 'facebook',
        name: 'Facebook',
        logo_url: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0yMCAxMkMxNS41ODI5IDEyIDEyIDE1LjU4MjkgMTIgMjBDMTIgMjQuNDE3MSAxNS41ODI5IDI4IDIwIDI4QzI0LjQxNzEgMjggMjggMjQuNDE3MSAyOCAyMEMyOCAxNS41ODI5IDI0LjQxNzEgMTIgMjAgMTJaIiBmaWxsPSIjOUNBM0FGIi8+Cjwvc3ZnPgo=',
        category: 'SOCIAL',
        status: 'ACTIVE',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        url: 'https://facebook.com'
      };
      
      const facebookContent: SocialContent[] = apiData.platforms.facebook.posts.map((post: any, index: number) => ({
        id: `facebook_${searchTerm}_${index}`,
        work_platform: {
          id: 'facebook',
          name: 'Facebook',
          logo_url: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0yMCAxMkMxNS41ODI5IDEyIDEyIDE1LjU4MjkgMTIgMjBDMTIgMjQuNDE3MSAxNS41ODI5IDI4IDIwIDI4QzI0LjQxNzEgMjggMjggMjQuNDE3MSAyOCAyMEMyOCAxNS41ODI5IDI0LjQxNzEgMTIgMjAgMTJaIiBmaWxsPSIjOUNBM0FGIi8+Cjwvc3ZnPgo='
        },
        type: 'text',
        title: post.text || `Facebook post about ${searchTerm}`,
        description: post.text || `Facebook content about ${searchTerm}`,
        url: post.url || `https://facebook.com/posts/${post.id}`,
        published_at: post.publishedAt || new Date().toISOString(),
        thumbnail_url: post.author.avatar || `data:image/svg+xml;base64,${btoa(`<svg width="400" height="300" viewBox="0 0 400 300" fill="none" xmlns="http://www.w3.org/2000/svg"><rect width="400" height="300" fill="#1877F2"/><text x="200" y="150" text-anchor="middle" font-family="Arial, sans-serif" font-size="24" fill="white">Facebook</text></svg>`)}`,
        media_url: post.author.avatar || `data:image/svg+xml;base64,${btoa(`<svg width="400" height="300" viewBox="0 0 400 300" fill="none" xmlns="http://www.w3.org/2000/svg"><rect width="400" height="300" fill="#1877F2"/><text x="200" y="150" text-anchor="middle" font-family="Arial, sans-serif" font-size="24" fill="white">Facebook</text></svg>`)}`,
        platform_content_id: post.id || `facebook_${searchTerm}_${index}`,
        format: 'TEXT' as const,
        duration: 0,
        audio_track_info: null,
        hashtags: [`#${searchTerm.replace(/\s+/g, '')}`, '#facebook'],
        mentions: [],
        media_urls: post.media || [],
        profile: {
          platform_username: post.author.name || 'facebook_user',
          url: `https://facebook.com/${post.author.name || 'facebook_user'}`,
          image_url: post.author.avatar || 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0yMCAxMkMxNS41ODI5IDEyIDEyIDE1LjU4MjkgMTIgMjBDMTIgMjQuNDE3MSAxNS41ODI5IDI4IDIwIDI4QzI0LjQxNzEgMjggMjggMjQuNDE3MSAyOCAyMEMyOCAxNS41ODI5IDI0LjQxNzEgMTIgMjAgMTJaIiBmaWxsPSIjOUNBM0FGIi8+Cjwvc3ZnPgo=',
          platform_user_id: post.author.name || 'facebook_user'
        },
        engagement: {
          like_count: post.likes || 0,
          comment_count: post.comments || 0,
          share_count: post.shares || 0,
          view_count: 0
        }
      }));
      
      results.push({
        platform: facebookPlatform,
        content: facebookContent
      });
    }

    // Process Instagram data (hashtags, users, places)
    if (apiData.platforms?.instagram) {
      const instagramPlatform = {
        id: 'instagram',
        name: 'Instagram',
        logo_url: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0yMCAxMkMxNS41ODI5IDEyIDEyIDE1LjU4MjkgMTIgMjBDMTIgMjQuNDE3MSAxNS41ODI5IDI4IDIwIDI4QzI0LjQxNzEgMjggMjggMjQuNDE3MSAyOCAyMEMyOCAxNS41ODI5IDI0LjQxNzEgMTIgMjAgMTJaIiBmaWxsPSIjOUNBM0FGIi8+Cjwvc3ZnPgo=',
        category: 'SOCIAL',
        status: 'ACTIVE',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        url: 'https://instagram.com'
      };
      
      const instagramContent: SocialContent[] = [];
      
      // Process hashtags
      if (apiData.platforms.instagram.hashtags && apiData.platforms.instagram.hashtags.length > 0) {
        const hashtagContent = apiData.platforms.instagram.hashtags.map((item: any, index: number) => ({
          id: `instagram_hashtag_${searchTerm}_${index}`,
          work_platform: {
            id: 'instagram',
            name: 'Instagram',
            logo_url: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0yMCAxMkMxNS41ODI5IDEyIDEyIDE1LjU4MjkgMTIgMjBDMTIgMjQuNDE3MSAxNS41ODI5IDI4IDIwIDI4QzI0LjQxNzEgMjggMjggMjQuNDE3MSAyOCAyMEMyOCAxNS41ODI5IDI0LjQxNzEgMTIgMjAgMTJaIiBmaWxsPSIjOUNBM0FGIi8+Cjwvc3ZnPgo='
          },
          type: 'text',
          title: `#${item.hashtag.name} - ${item.hashtag.media_count.toLocaleString()} posts`,
          description: `Popular hashtag #${item.hashtag.name} with ${item.hashtag.media_count.toLocaleString()} posts on Instagram`,
          url: `https://instagram.com/explore/tags/${item.hashtag.name}`,
          published_at: new Date().toISOString(),
          thumbnail_url: `data:image/svg+xml;base64,${btoa(`<svg width="400" height="300" viewBox="0 0 400 300" fill="none" xmlns="http://www.w3.org/2000/svg"><rect width="400" height="300" fill="#E4405F"/><text x="200" y="150" text-anchor="middle" font-family="Arial, sans-serif" font-size="24" fill="white">#${item.hashtag.name}</text></svg>`)}`,
          media_url: `data:image/svg+xml;base64,${btoa(`<svg width="400" height="300" viewBox="0 0 400 300" fill="none" xmlns="http://www.w3.org/2000/svg"><rect width="400" height="300" fill="#E4405F"/><text x="200" y="150" text-anchor="middle" font-family="Arial, sans-serif" font-size="24" fill="white">#${item.hashtag.name}</text></svg>`)}`,
          platform_content_id: `hashtag_${item.hashtag.id}`,
          format: 'TEXT' as const,
          duration: 0,
          audio_track_info: null,
          hashtags: [`#${item.hashtag.name}`, `#${searchTerm.replace(/\s+/g, '')}`, '#instagram'],
          mentions: [],
          media_urls: [],
          profile: {
            platform_username: 'instagram_hashtag',
            url: 'https://instagram.com',
            image_url: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0yMCAxMkMxNS41ODI5IDEyIDEyIDE1LjU4MjkgMTIgMjBDMTIgMjQuNDE3MSAxNS41ODI5IDI4IDIwIDI4QzI0LjQxNzEgMjggMjggMjQuNDE3MSAyOCAyMEMyOCAxNS41ODI5IDI0LjQxNzEgMTIgMjAgMTJaIiBmaWxsPSIjOUNBM0FGIi8+Cjwvc3ZnPgo=',
            platform_user_id: 'instagram_hashtag'
          },
          engagement: {
            like_count: 0,
            comment_count: 0,
            share_count: 0,
            view_count: item.hashtag.media_count
          }
        }));
        instagramContent.push(...hashtagContent);
      }
      
      // Process users
      if (apiData.platforms.instagram.users && apiData.platforms.instagram.users.length > 0) {
        const userContent = apiData.platforms.instagram.users.map((item: any, index: number) => ({
          id: `instagram_user_${searchTerm}_${index}`,
          work_platform: {
            id: 'instagram',
            name: 'Instagram',
            logo_url: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0yMCAxMkMxNS41ODI5IDEyIDEyIDE1LjU4MjkgMTIgMjBDMTIgMjQuNDE3MSAxNS41ODI5IDI4IDIwIDI4QzI0LjQxNzEgMjggMjggMjQuNDE3MSAyOCAyMEMyOCAxNS41ODI5IDI0LjQxNzEgMTIgMjAgMTJaIiBmaWxsPSIjOUNBM0FGIi8+Cjwvc3ZnPgo='
          },
          type: 'text',
          title: `@${item.user.username} - Instagram Profile`,
          description: `Instagram user @${item.user.username}${item.user.full_name ? ` (${item.user.full_name})` : ''}`,
          url: `https://instagram.com/${item.user.username}`,
          published_at: new Date().toISOString(),
          thumbnail_url: item.user.profile_pic_url || `data:image/svg+xml;base64,${btoa(`<svg width="400" height="300" viewBox="0 0 400 300" fill="none" xmlns="http://www.w3.org/2000/svg"><rect width="400" height="300" fill="#E4405F"/><text x="200" y="150" text-anchor="middle" font-family="Arial, sans-serif" font-size="24" fill="white">@${item.user.username}</text></svg>`)}`,
          media_url: item.user.profile_pic_url || `data:image/svg+xml;base64,${btoa(`<svg width="400" height="300" viewBox="0 0 400 300" fill="none" xmlns="http://www.w3.org/2000/svg"><rect width="400" height="300" fill="#E4405F"/><text x="200" y="150" text-anchor="middle" font-family="Arial, sans-serif" font-size="24" fill="white">@${item.user.username}</text></svg>`)}`,
          platform_content_id: `user_${item.user.pk}`,
          format: 'TEXT' as const,
          duration: 0,
          audio_track_info: null,
          hashtags: [`#${searchTerm.replace(/\s+/g, '')}`, '#instagram', '#profile'],
          mentions: [],
          media_urls: [],
          profile: {
            platform_username: item.user.username,
            url: `https://instagram.com/${item.user.username}`,
            image_url: item.user.profile_pic_url || 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0yMCAxMkMxNS41ODI5IDEyIDEyIDE1LjU4MjkgMTIgMjBDMTIgMjQuNDE3MSAxNS41ODI5IDI4IDIwIDI4QzI0LjQxNzEgMjggMjggMjQuNDE3MSAyOCAyMEMyOCAxNS41ODI5IDI0LjQxNzEgMTIgMjAgMTJaIiBmaWxsPSIjOUNBM0FGIi8+Cjwvc3ZnPgo=',
            platform_user_id: item.user.pk
          },
          engagement: {
            like_count: 0,
            comment_count: 0,
            share_count: 0,
            view_count: 0
          }
        }));
        instagramContent.push(...userContent);
      }
      
      // Process places
      if (apiData.platforms.instagram.places && apiData.platforms.instagram.places.length > 0) {
        const placeContent = apiData.platforms.instagram.places.map((item: any, index: number) => ({
          id: `instagram_place_${searchTerm}_${index}`,
          work_platform: {
            id: 'instagram',
            name: 'Instagram',
            logo_url: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0yMCAxMkMxNS41ODI5IDEyIDEyIDE1LjU4MjkgMTIgMjBDMTIgMjQuNDE3MSAxNS41ODI5IDI4IDIwIDI4QzI0LjQxNzEgMjggMjggMjQuNDE3MSAyOCAyMEMyOCAxNS41ODI5IDI0LjQxNzEgMTIgMjAgMTJaIiBmaWxsPSIjOUNBM0FGIi8+Cjwvc3ZnPgo='
          },
          type: 'text',
          title: `${item.place.title} - Instagram Location`,
          description: `Instagram location: ${item.place.title}${item.place.subtitle ? ` - ${item.place.subtitle}` : ''}`,
          url: `https://instagram.com/explore/locations/${item.place.location.pk}`,
          published_at: new Date().toISOString(),
          thumbnail_url: `data:image/svg+xml;base64,${btoa(`<svg width="400" height="300" viewBox="0 0 400 300" fill="none" xmlns="http://www.w3.org/2000/svg"><rect width="400" height="300" fill="#E4405F"/><text x="200" y="150" text-anchor="middle" font-family="Arial, sans-serif" font-size="24" fill="white">${item.place.title}</text></svg>`)}`,
          media_url: `data:image/svg+xml;base64,${btoa(`<svg width="400" height="300" viewBox="0 0 400 300" fill="none" xmlns="http://www.w3.org/2000/svg"><rect width="400" height="300" fill="#E4405F"/><text x="200" y="150" text-anchor="middle" font-family="Arial, sans-serif" font-size="24" fill="white">${item.place.title}</text></svg>`)}`,
          platform_content_id: `place_${item.place.location.pk}`,
          format: 'TEXT' as const,
          duration: 0,
          audio_track_info: null,
          hashtags: [`#${searchTerm.replace(/\s+/g, '')}`, '#instagram', '#location'],
          mentions: [],
          media_urls: [],
          profile: {
            platform_username: 'instagram_location',
            url: 'https://instagram.com',
            image_url: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0yMCAxMkMxNS41ODI5IDEyIDEyIDE1LjU4MjkgMTIgMjBDMTIgMjQuNDE3MSAxNS41ODI5IDI4IDIwIDI4QzI0LjQxNzEgMjggMjggMjQuNDE3MSAyOCAyMEMyOCAxNS41ODI5IDI0LjQxNzEgMTIgMjAgMTJaIiBmaWxsPSIjOUNBM0FGIi8+Cjwvc3ZnPgo=',
            platform_user_id: 'instagram_location'
          },
          engagement: {
            like_count: 0,
            comment_count: 0,
            share_count: 0,
            view_count: 0
          }
        }));
        instagramContent.push(...placeContent);
      }
      
      if (instagramContent.length > 0) {
        results.push({
          platform: instagramPlatform,
          content: instagramContent
        });
      }
    }
    
    // If no results, create a test result to verify the UI works
    if (results.length === 0) {
      console.log('No results found, creating test data');
      const testPlatform = {
        id: 'test',
        name: 'Test Platform',
        logo_url: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0yMCAxMkMxNS41ODI5IDEyIDEyIDE1LjU4MjkgMTIgMjBDMTIgMjQuNDE3MSAxNS41ODI5IDI4IDIwIDI4QzI0LjQxNzEgMjggMjggMjQuNDE3MSAyOCAyMEMyOCAxNS41ODI5IDI0LjQxNzEgMTIgMjAgMTJaIiBmaWxsPSIjOUNBM0FGIi8+Cjwvc3ZnPgo=',
        category: 'SOCIAL',
        status: 'ACTIVE',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        url: 'https://test.com'
      };
      
      const testContent: SocialContent[] = [{
        id: `test_${searchTerm}_1`,
        work_platform: {
          id: 'test',
          name: 'Test Platform',
          logo_url: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0yMCAxMkMxNS41ODI5IDEyIDEyIDE1LjU4MjkgMTIgMjBDMTIgMjQuNDE3MSAxNS41ODI5IDI4IDIwIDI4QzI0LjQxNzEgMjggMjggMjQuNDE3MSAyOCAyMEMyOCAxNS41ODI5IDI0LjQxNzEgMTIgMjAgMTJaIiBmaWxsPSIjOUNBM0FGIi8+Cjwvc3ZnPgo='
        },
        type: 'text',
        title: `Test post about ${searchTerm}`,
        description: `This is a test post about ${searchTerm} to verify the media preview works`,
        url: `https://test.com/post/1`,
        published_at: new Date().toISOString(),
        thumbnail_url: `data:image/svg+xml;base64,${btoa(`<svg width="400" height="300" viewBox="0 0 400 300" fill="none" xmlns="http://www.w3.org/2000/svg"><rect width="400" height="300" fill="#FF6B6B"/><text x="200" y="150" text-anchor="middle" font-family="Arial, sans-serif" font-size="24" fill="white">Test Media Preview</text></svg>`)}`,
        media_url: `data:image/svg+xml;base64,${btoa(`<svg width="400" height="300" viewBox="0 0 400 300" fill="none" xmlns="http://www.w3.org/2000/svg"><rect width="400" height="300" fill="#FF6B6B"/><text x="200" y="150" text-anchor="middle" font-family="Arial, sans-serif" font-size="24" fill="white">Test Media Preview</text></svg>`)}`,
        platform_content_id: `test_${searchTerm}_1`,
        format: 'TEXT' as const,
        duration: 0,
        audio_track_info: null,
        hashtags: [`#${searchTerm.replace(/\s+/g, '')}`, '#test'],
        mentions: [],
        media_urls: [],
        profile: {
          platform_username: 'test_user',
          url: 'https://test.com/user/test_user',
          image_url: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0yMCAxMkMxNS41ODI5IDEyIDEyIDE1LjU4MjkgMTIgMjBDMTIgMjQuNDE3MSAxNS41ODI5IDI4IDIwIDI4QzI0LjQxNzEgMjggMjggMjQuNDE3MSAyOCAyMEMyOCAxNS41ODI5IDI0LjQxNzEgMTIgMjAgMTJaIiBmaWxsPSIjOUNBM0FGIi8+Cjwvc3ZnPgo=',
          platform_user_id: 'test_user'
        },
        engagement: {
          like_count: 100,
          comment_count: 25,
          share_count: 10,
          view_count: 1000
        }
      }];
      
      results.push({
        platform: testPlatform,
        content: testContent
      });
    }
    
    console.log('Final processed results:', results);
    return results;
  };



  const loadKeywords = async () => {
    try {
      setLoadingKeywords(true);
      console.log('Loading keywords...');
      
      // First, try to use keywords from Redux store
      if (user?.keywords && user.keywords.length > 0) {
        console.log('Using keywords from Redux store:', user.keywords);
        const reduxKeywords = user.keywords.map((keyword: string, index: number) => ({
          id: index + 1,
          userId: user.id,
          keyword: keyword,
          createdAt: new Date().toISOString()
        }));
        setKeywords(reduxKeywords);
        setLoadingKeywords(false);
        return;
      }
      
      // Try to get keywords from localStorage
        const userData = localStorage.getItem('user');
        if (userData) {
          const parsedUser = JSON.parse(userData);
          if (parsedUser.keywords && parsedUser.keywords.length > 0) {
          console.log('Using keywords from localStorage:', parsedUser.keywords);
            const fallbackKeywords = parsedUser.keywords.map((keyword: string, index: number) => ({
              id: index + 1,
              userId: parsedUser.id,
              keyword: keyword,
              createdAt: new Date().toISOString()
            }));
            setKeywords(fallbackKeywords);
          setLoadingKeywords(false);
          return;
        }
      }
      
      // If no keywords found, provide some default keywords
      console.log('No keywords found, using default keywords');
      const defaultKeywords = [
        { id: 1, userId: 1, keyword: 'artificial intelligence', createdAt: new Date().toISOString() },
        { id: 2, userId: 1, keyword: 'machine learning', createdAt: new Date().toISOString() },
        { id: 3, userId: 1, keyword: 'technology', createdAt: new Date().toISOString() },
        { id: 4, userId: 1, keyword: 'innovation', createdAt: new Date().toISOString() },
        { id: 5, userId: 1, keyword: 'AI', createdAt: new Date().toISOString() }
      ];
      setKeywords(defaultKeywords);
      
    } catch (error) {
      console.error('Error loading keywords:', error);
      // Set default keywords on error
      const defaultKeywords = [
        { id: 1, userId: 1, keyword: 'artificial intelligence', createdAt: new Date().toISOString() },
        { id: 2, userId: 1, keyword: 'machine learning', createdAt: new Date().toISOString() },
        { id: 3, userId: 1, keyword: 'technology', createdAt: new Date().toISOString() },
        { id: 4, userId: 1, keyword: 'innovation', createdAt: new Date().toISOString() },
        { id: 5, userId: 1, keyword: 'AI', createdAt: new Date().toISOString() }
      ];
      setKeywords(defaultKeywords);
    } finally {
      setLoadingKeywords(false);
    }
  };

  const handleSearch = async () => {
    setIsSearching(true);
    setSearchResults([]);
    setErrors([]);

    try {
      let allResults: SearchResult[] = [];
      let allErrors: { platform: SocialPlatform; error: string }[] = [];
      let searchTerm = '';

      // Determine what to search for
      if (searchQuery.trim()) {
        // Use custom search query
        searchTerm = searchQuery.trim();
        console.log(`Searching for custom query: ${searchTerm}`);
        
        // Call the real API to collect data
        try {
          const response = await fetch('/api/ensemble-search', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify({ keyword: searchTerm })
          });

          if (response.ok) {
            const data = await response.json();
            console.log('Ensemble API data received:', data);
            
            // Process the ensemble API data into the expected format
            allResults = processEnsembleAPIData(data.data, searchTerm);
            allErrors = [];
          } else {
            console.error('Ensemble API call failed');
            const errorData = await response.json().catch(() => ({}));
            const errorMessage = errorData.detail || 'API call failed. Please check your API configuration.';
            allResults = [];
            allErrors = [{ platform: { id: 'general', name: 'General' } as SocialPlatform, error: errorMessage }];
          }
        } catch (apiError) {
          console.error('Ensemble API error:', apiError);
          const errorMessage = apiError instanceof Error ? apiError.message : 'API error. Please check your API configuration.';
          allResults = [];
          allErrors = [{ platform: { id: 'general', name: 'General' } as SocialPlatform, error: errorMessage }];
        }
      } else if (selectedKeyword.trim()) {
        // Use selected keyword
        searchTerm = selectedKeyword.trim();
        console.log(`Searching for selected keyword: ${searchTerm}`);
        
        // Call the real API to collect data
        try {
          const response = await fetch('/api/ensemble-search', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify({ keyword: searchTerm })
          });

          if (response.ok) {
            const data = await response.json();
            console.log('Ensemble API data received:', data);
            
            // Process the ensemble API data into the expected format
            allResults = processEnsembleAPIData(data.data, searchTerm);
            allErrors = [];
          } else {
            console.error('Ensemble API call failed');
            const errorData = await response.json().catch(() => ({}));
            const errorMessage = errorData.detail || 'API call failed. Please check your API configuration.';
            allResults = [];
            allErrors = [{ platform: { id: 'general', name: 'General' } as SocialPlatform, error: errorMessage }];
          }
        } catch (apiError) {
          console.error('Ensemble API error:', apiError);
          const errorMessage = apiError instanceof Error ? apiError.message : 'API error. Please check your API configuration.';
          allResults = [];
          allErrors = [{ platform: { id: 'general', name: 'General' } as SocialPlatform, error: errorMessage }];
        }
      } else {
        // If no search query or keyword selected, search all keywords
        if (keywords.length === 0) {
          throw new Error('No keywords available to search. Please enter a search term or add keywords.');
        }

        const keywordStrings = keywords.map(k => k.keyword);
        
        try {
          // For multiple keywords, search each one individually with ensemble API
        for (const keyword of keywords) {
          try {
              const response = await fetch('/api/ensemble-search', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({ keyword: keyword.keyword })
              });

              if (response.ok) {
                const data = await response.json();
                console.log(`Ensemble API data received for keyword: ${keyword.keyword}`, data);
                
                // Process the ensemble API data into the expected format
                const keywordResults = processEnsembleAPIData(data.data, keyword.keyword);
                const resultsWithKeyword = keywordResults.map(searchResult => ({
              ...searchResult,
              keyword: keyword.keyword
            }));
                allResults = [...allResults, ...resultsWithKeyword];
              } else {
                console.warn(`Ensemble API call failed for keyword: ${keyword.keyword}`);
                // Skip this keyword if API fails
              }
            } catch (keywordError) {
              console.warn(`Ensemble API error for keyword: ${keyword.keyword}:`, keywordError);
              // Skip this keyword if API fails
            }
            
            // Add delay between keyword searches to avoid rate limits
            await new Promise(resolve => setTimeout(resolve, 1000));
          }
          allErrors = [];
        } catch (apiError) {
          console.error('Ensemble API error for all keywords:', apiError);
          allResults = [];
          allErrors = [{ platform: { id: 'general', name: 'General' } as SocialPlatform, error: 'API error for all keywords. Please check your API configuration.' }];
        }
        
        searchTerm = 'all keywords';
      }

      setSearchResults(allResults);
      setErrors(allErrors);
      
      // Store social listening data for hashtag tracking
      const socialData = {
        keyword: searchTerm,
        results: allResults,
        errors: allErrors,
        timestamp: new Date().toISOString()
      };
      localStorage.setItem('socialListeningData', JSON.stringify(socialData));
      
      // Update data manager
      dataManager.setSocialData({
        results: allResults,
        errors: allErrors,
        lastFetched: new Date().toISOString(),
        isLoading: false,
        error: null
      });
      
      if (allErrors.length > 0) {
        console.warn('Some platforms failed:', allErrors);
      }
    } catch (error) {
      console.error('Search failed:', error);
      setErrors([{ platform: { id: 'general', name: 'General' } as SocialPlatform, error: 'Search failed. Please try again.' }]);
    } finally {
      setIsSearching(false);
    }
  };

  const filteredResults = searchResults.filter(result => 
    selectedPlatform === 'all' || result.platform.id === selectedPlatform
  );

  const sortedResults = [...filteredResults].sort((a, b) => {
    switch (sortBy) {
      case 'date':
        return new Date(b.content[0]?.published_at || 0).getTime() - new Date(a.content[0]?.published_at || 0).getTime();
      case 'engagement':
        const aEngagement = a.content.reduce((sum, item) => sum + (item.engagement.like_count || 0) + (item.engagement.comment_count || 0) + (item.engagement.share_count || 0), 0);
        const bEngagement = b.content.reduce((sum, item) => sum + (item.engagement.like_count || 0) + (item.engagement.comment_count || 0) + (item.engagement.share_count || 0), 0);
        return bEngagement - aEngagement;
      case 'platform':
        return a.platform.name.localeCompare(b.platform.name);
      default:
        return 0;
    }
  });

  const totalContent = searchResults.reduce((sum, result) => sum + result.content.length, 0);

  return (
    <div className={styles.container}>
      <div className={styles.header}>
            <div className={styles.headerContent}>
              <div className={styles.headerText}>
                <h1>Social Listening Finder</h1>
                <p>Monitor social media mentions and engagement across all available platforms</p>
              </div>
            </div>
      </div>

      <div className={styles.searchSection}>
        <div className={styles.searchBar}>
          <div className={styles.searchInput}>
            <Search className={styles.searchIcon} />
            <input
              type="text"
              placeholder="Enter any search term (e.g., 'machine learning', 'AI', 'tech')..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              className={styles.searchField}
              disabled={isSearching}
            />
          </div>
          <div className={styles.keywordSelector}>
            <select
              value={selectedKeyword}
              onChange={(e) => setSelectedKeyword(e.target.value)}
              className={styles.keywordSelect}
              disabled={isSearching || loadingKeywords}
            >
              <option value="">
                {loadingKeywords ? 'Loading keywords...' : 'Or select from your keywords'}
              </option>
              {keywords.map((keyword) => (
                <option key={keyword.id} value={keyword.keyword}>
                  {keyword.keyword}
                </option>
              ))}
            </select>
          </div>
          <button 
            className={styles.searchButton}
            onClick={handleSearch}
            disabled={isSearching || (!searchQuery.trim() && !selectedKeyword.trim() && keywords.length === 0)}
          >
            {isSearching ? (
              <RefreshCw className={styles.spinner} />
            ) : (
              <Search />
            )}
            {isSearching ? 'Searching...' : 'Search'}
          </button>
        </div>

        <div className={styles.filters}>
          <div className={styles.filterGroup}>
            <label>Platform</label>
            <select 
              value={selectedPlatform} 
              onChange={(e) => setSelectedPlatform(e.target.value)}
              className={styles.filterSelect}
            >
              <option value="all">All Platforms</option>
              <option value="youtube">YouTube</option>
              <option value="tiktok">TikTok</option>
              <option value="instagram">Instagram</option>
              <option value="threads">Threads</option>
              <option value="reddit">Reddit</option>
              <option value="twitter">Twitter/X</option>
              <option value="linkedin">LinkedIn</option>
              <option value="facebook">Facebook</option>
              {platforms.map(platform => (
                <option key={platform.id} value={platform.id}>
                  {platform.name}
                </option>
              ))}
            </select>
          </div>
          
          <div className={styles.filterGroup}>
            <label>Sort By</label>
            <select 
              value={sortBy} 
              onChange={(e) => setSortBy(e.target.value as any)}
              className={styles.filterSelect}
            >
              <option value="date">Date</option>
              <option value="engagement">Engagement</option>
              <option value="platform">Platform</option>
            </select>
          </div>
        </div>
      </div>

      {errors.length > 0 && (
        <div className={styles.errorSection}>
          <h3>Platform Status Summary</h3>
          <div className={styles.statusSummary}>
            <div className={styles.statusItem}>
              <span className={styles.statusLabel}>✅ Working Platforms:</span>
              <span className={styles.statusValue}>{searchResults.length}</span>
            </div>
            <div className={styles.statusItem}>
              <span className={styles.statusLabel}>❌ Failed Platforms:</span>
              <span className={styles.statusValue}>{errors.length}</span>
            </div>
          </div>
          
          {errors.length > 0 && (
            <details className={styles.errorDetails}>
              <summary>View Failed Platforms ({errors.length})</summary>
              <div className={styles.errorList}>
                {errors.map((error, index) => (
                  <div key={index} className={styles.errorItem}>
                    <span className={styles.errorPlatform}>{error.platform.name}:</span>
                    <span className={styles.errorMessage}>{error.error}</span>
                  </div>
                ))}
              </div>
              <div className={styles.errorNote}>
                <p>
                  <strong>Rate limit errors (429):</strong> Too many requests - will resolve automatically<br/>
                  <strong>Not found errors (404):</strong> Platform may not be available or endpoint not found<br/>
                  <strong>Bad request errors (400):</strong> Platform may have different API requirements
                </p>
              </div>
            </details>
          )}
        </div>
      )}

      {searchResults.length > 0 && (
        <div className={styles.resultsHeader}>
          <div className={styles.resultsStats}>
            <h2>Search Results</h2>
            <span className={styles.resultsCount}>
              {totalContent} posts across {searchResults.length} platforms
            </span>
          </div>
          <button className={styles.exportButton}>
            <Download />
            Export Results
          </button>
        </div>
      )}

      <div className={styles.results}>
        {sortedResults.map((result, index) => (
          <div key={index} className={styles.platformSection}>
            <div className={styles.platformHeader}>
              <div className={styles.platformInfo}>
                <img 
                  src={result.platform.logo_url} 
                  alt={result.platform.name}
                  className={styles.platformLogo}
                  onError={handleImageError}
                />
                <div>
                  <h3>{result.platform.name}</h3>
                  {result.keyword && (
                    <span className={styles.keywordTag}>#{result.keyword}</span>
                  )}
                  <span className={styles.postCount}>{result.content.length} posts</span>
                </div>
              </div>
            </div>

            <div className={styles.contentGrid}>
              {result.content.map((item, itemIndex) => (
                <div key={itemIndex} className={styles.contentCard}>
                  <div className={styles.contentHeader}>
                    <div className={styles.profileInfo}>
                      <div className={styles.profileAvatar}>
                        {item.profile.image_url ? (
                          <img 
                            src={item.profile.image_url} 
                            alt={item.profile.platform_username}
                            onError={handleImageError}
                          />
                        ) : (
                          <User />
                        )}
                      </div>
                      <div>
                        <div className={styles.username}>@{item.profile.platform_username}</div>
                        <div className={styles.publishDate}>
                          <Calendar />
                          {new Date(item.published_at).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                    <a 
                      href={item.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className={styles.externalLink}
                    >
                      <ExternalLink />
                    </a>
                  </div>

                  <div className={styles.contentBody}>
                    <h4 className={styles.contentTitle}>{item.title}</h4>
                    <p className={styles.contentDescription}>{item.description}</p>
                    
                    {item.hashtags && item.hashtags.length > 0 && (
                      <div className={styles.hashtags}>
                        {item.hashtags.map((hashtag, tagIndex) => (
                          <span key={tagIndex} className={styles.hashtag}>
                            <Hash />
                            {hashtag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className={styles.mediaContainer}>
                    <a 
                      href={item.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className={styles.mediaLink}
                    >
                      <img 
                        src={item.thumbnail_url || item.media_url || `data:image/svg+xml;base64,${btoa(`<svg width="400" height="300" viewBox="0 0 400 300" fill="none" xmlns="http://www.w3.org/2000/svg"><rect width="400" height="300" fill="#FF6B6B"/><text x="200" y="150" text-anchor="middle" font-family="Arial, sans-serif" font-size="24" fill="white">Media Preview</text><text x="200" y="180" text-anchor="middle" font-family="Arial, sans-serif" font-size="16" fill="white">${item.work_platform?.name || 'Social Media'}</text></svg>`)}`}
                        alt="Content thumbnail"
                        className={styles.thumbnail}
                        onError={(e) => {
                          console.log('Image error for item:', item);
                          console.log('Thumbnail URL:', item.thumbnail_url);
                          console.log('Media URL:', item.media_url);
                          console.log('Work platform:', item.work_platform);
                          handleThumbnailError(e);
                        }}
                        onLoad={() => {
                          console.log('Image loaded successfully for item:', item);
                        }}
                      />
                      {(item.format === 'VIDEO' || item.type === 'video') && (
                        <div className={styles.playButton}>
                          <Play />
                        </div>
                      )}
                    </a>
                  </div>

                  <div className={styles.engagement}>
                    <div className={styles.engagementItem}>
                      <Heart />
                      <span>{(item.engagement.like_count || 0).toLocaleString()}</span>
                    </div>
                    <div className={styles.engagementItem}>
                      <MessageCircle />
                      <span>{(item.engagement.comment_count || 0).toLocaleString()}</span>
                    </div>
                    <div className={styles.engagementItem}>
                      <Share />
                      <span>{(item.engagement.share_count || 0).toLocaleString()}</span>
                    </div>
                    <div className={styles.engagementItem}>
                      <Eye />
                      <span>{(item.engagement.view_count || 0).toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

        {loadingKeywords ? (
          <div className={styles.emptyState}>
            <RefreshCw className={`${styles.emptyIcon} ${styles.spinning}`} />
            <h3>Loading Keywords...</h3>
            <p>Please wait while we load your keywords.</p>
          </div>
        ) : searchResults.length === 0 && !isSearching ? (
          <div className={styles.emptyState}>
            <Monitor className={styles.emptyIcon} />
            <h3>Start Social Listening</h3>
            <p>Enter any search term in the search box above to begin monitoring social media mentions across all available platforms</p>
            <div className={styles.searchSuggestions}>
              <p>Try searching for:</p>
              <div className={styles.suggestionTags}>
                <button 
                  className={styles.suggestionTag}
                  onClick={() => setSearchQuery('artificial intelligence')}
                >
                  artificial intelligence
                </button>
                <button 
                  className={styles.suggestionTag}
                  onClick={() => setSearchQuery('machine learning')}
                >
                  machine learning
                </button>
                <button 
                  className={styles.suggestionTag}
                  onClick={() => setSearchQuery('technology')}
                >
                  technology
                </button>
                <button 
                  className={styles.suggestionTag}
                  onClick={() => setSearchQuery('AI')}
                >
                  AI
                </button>
              </div>
            </div>
          </div>
        ) : null}
    </div>
  );
}
