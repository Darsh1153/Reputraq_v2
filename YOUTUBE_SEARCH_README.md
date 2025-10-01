# YouTube Search Integration

This document describes the YouTube search functionality integrated into the Reputraq dashboard.

## Overview

The YouTube search feature allows users to search for YouTube videos without requiring an API key. It's built using the `youtube-search-without-api-key` package and provides a clean, modern interface for discovering video content.

## Features

- **No API Key Required**: Search YouTube videos without needing a YouTube API key
- **Duration Filtering**: Filter videos by duration (under 4 min, 4-20 min, over 20 min)
- **Search History**: Automatically saves and displays recent searches
- **Responsive Design**: Works on desktop and mobile devices
- **Real-time Search**: Instant search results with loading states
- **Video Details**: Displays title, description, views, duration, and publish date
- **Direct Links**: Click to watch videos directly on YouTube

## Technical Implementation

### API Endpoint
- **Path**: `/api/youtube`
- **Methods**: GET, POST
- **Parameters**:
  - `q` (required): Search query string
  - `duration` (optional): Duration filter ('under', 'between', 'over')

### Service Layer
- **File**: `services/youtubeService.ts`
- **Class**: `YouTubeService`
- **Methods**:
  - `searchVideos(query, options)`: Search videos with GET request
  - `searchVideosPost(query, options)`: Search videos with POST request
  - `formatDuration(durationRaw)`: Format video duration
  - `formatViews(views)`: Format view count
  - `getThumbnailUrl(video, quality)`: Get video thumbnail
  - `extractVideoId(url)`: Extract video ID from URL
  - `getEmbedUrl(videoId)`: Generate embed URL

### Frontend Components
- **Page**: `app/dashboard/youtube-search/page.tsx`
- **Styles**: `app/dashboard/youtube-search/page.module.scss`
- **Navigation**: Added to dashboard sidebar

## Usage

1. Navigate to the YouTube Search page from the dashboard sidebar
2. Enter a search query in the search input
3. Optionally select a duration filter
4. Click search or press Enter
5. Browse results and click "Watch on YouTube" to view videos

## Search Options

### Duration Filters
- **All**: No duration restriction
- **Under 4 min**: Videos shorter than 4 minutes
- **4-20 min**: Videos between 4 and 20 minutes
- **Over 20 min**: Videos longer than 20 minutes

### Search History
- Automatically saves the last 10 searches
- Stored in browser localStorage
- Click on history items to repeat searches

## Data Structure

### Video Object
```typescript
interface YouTubeVideo {
  id: {
    videoId: string;
  };
  url: string;
  title: string;
  description: string;
  duration_raw: string;
  snippet: {
    url: string;
    duration: string;
    publishedAt: string;
    thumbnails: {
      id: string;
      url: string;
      default: { url: string; width: number; height: number; };
      high: { url: string; width: number; height: number; };
      height: number;
      width: number;
    };
    title: string;
  };
  views: string;
}
```

## Installation

The package is already added to `package.json`. To install dependencies:

```bash
npm install
```

## Dependencies

- `youtube-search-without-api-key`: ^2.0.7
- `lucide-react`: For icons
- `next`: For API routes and React components

## Error Handling

- Network errors are caught and displayed to users
- Invalid search queries are handled gracefully
- Loading states prevent multiple simultaneous requests
- Error messages are user-friendly and actionable

## Future Enhancements

- Video embedding directly in the dashboard
- Search result caching
- Advanced filtering options (date range, channel, etc.)
- Export search results
- Integration with other dashboard features
- Analytics for search patterns

## Troubleshooting

### Common Issues

1. **Package not found error**: Run `npm install` to install dependencies
2. **Search not working**: Check browser console for API errors
3. **No results**: Try different search terms or check filters
4. **Slow loading**: Check network connection and server status

### Debug Mode

Enable debug logging by adding `console.log` statements in the service methods or API route.

## Security Considerations

- No API keys are stored or transmitted
- Search queries are sent to external YouTube service
- No user data is permanently stored (except search history in localStorage)
- All external links open in new tabs for security
