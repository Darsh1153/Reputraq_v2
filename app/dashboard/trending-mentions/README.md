# Trending Mentions Finder

This feature provides real-time trending hashtags and keywords from Google Trends, allowing users to discover popular topics and search for specific trending terms.

## Features

- **Real-time Trending Data**: Fetches daily trending topics from Google Trends
- **Hashtag Formatting**: Automatically converts keywords to hashtag format
- **Search Functionality**: Search through trending hashtags by keyword
- **Regional Support**: View trends for different countries/regions
- **Sorting Options**: Sort by traffic volume, growth rate, or recency
- **Related Hashtags**: View related trending hashtags for each topic
- **Interactive UI**: Modern, responsive interface with real-time updates

## Usage

1. Navigate to the "Trending Mentions Finder" section in the dashboard
2. Select your preferred region from the dropdown
3. Use the search bar to find specific trending hashtags
4. Toggle "Show Related Hashtags" to see related trending topics
5. Sort results by traffic, growth rate, or time
6. Click "View on Google Trends" to see detailed analytics

## API Integration

The feature uses the `@alkalisummer/google-trends-js` library through a server-side API route to avoid CORS issues. The API supports:

- Daily trends
- Real-time trends
- Interest over time data
- Autocomplete suggestions
- Interest by region data
- Trending articles

## Technical Implementation

- **Frontend**: React component with TypeScript
- **Styling**: SCSS modules with responsive design
- **API**: Next.js API routes for server-side Google Trends integration
- **State Management**: Local component state with error handling
- **Data Formatting**: Automatic hashtag conversion and traffic formatting

## Dependencies

- `@alkalisummer/google-trends-js`: Google Trends API integration
- `lucide-react`: Icons
- `next`: Framework
- `react`: UI library
