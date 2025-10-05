import { NextRequest, NextResponse } from 'next/server';

const ENSEMBLE_BASE_URL = process.env.NEXT_PUBLIC_ENSEMBLE_BASE_URL;
const ENSEMBLE_TOKEN = process.env.ENSEMBLE_TOKEN;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, depth = '1', onlyShorts = 'false' } = body;
    
    if (!name) {
      return NextResponse.json(
        { error: 'Hashtag name is required' },
        { status: 400 }
      );
    }

    if (!ENSEMBLE_BASE_URL || !ENSEMBLE_TOKEN) {
      return NextResponse.json(
        { error: 'API configuration missing' },
        { status: 500 }
      );
    }

    // Construct the YouTube hashtag search URL
    const apiUrl = `${ENSEMBLE_BASE_URL}/youtube/hashtag/search?name=${encodeURIComponent(name)}&depth=${depth}&only_shorts=${onlyShorts}&token=${ENSEMBLE_TOKEN}`;
    
    console.log(`Fetching YouTube hashtag data from:`, apiUrl);
    
    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('YouTube Hashtag API Error:', errorText);
      
      // If API limit reached (495), return mock data for demonstration
      if (response.status === 495) {
        console.log('API limit reached for YouTube hashtag, returning mock data');
        return NextResponse.json({
          success: true,
          hashtag: name,
          platform: 'youtube',
          totalResults: 5,
          data: {
            hashtags: [{
              hashtag_name: name,
              post_count: 150,
              trending_score: 85,
              videos: [
                {
                  video_id: 'mock1',
                  title: `${name} - Amazing Video 1`,
                  thumbnail: 'https://via.placeholder.com/320x180?text=YouTube+Video+1',
                  channel_name: 'Channel Name',
                  view_count: 1200000,
                  published_time: '2 days ago',
                  duration: '4:32',
                  url: 'https://youtube.com/watch?v=mock1'
                },
                {
                  video_id: 'mock2',
                  title: `${name} - Tutorial Video`,
                  thumbnail: 'https://via.placeholder.com/320x180?text=YouTube+Video+2',
                  channel_name: 'Tutorial Channel',
                  view_count: 850000,
                  published_time: '1 week ago',
                  duration: '8:15',
                  url: 'https://youtube.com/watch?v=mock2'
                }
              ]
            }]
          },
          timestamp: new Date().toISOString(),
          note: 'Mock data - API limit reached'
        });
      }
      
      return NextResponse.json(
        { 
          error: 'Failed to fetch YouTube hashtag data',
          status: response.status,
          details: errorText
        },
        { status: response.status }
      );
    }

    const data = await response.json();
    
    // Calculate total results
    let totalResults = 0;
    if (data.data && data.data.hashtags && Array.isArray(data.data.hashtags)) {
      totalResults = data.data.hashtags.reduce((sum: number, hashtag: any) => {
        return sum + (hashtag.videos ? hashtag.videos.length : 0);
      }, 0);
    }
    
    return NextResponse.json({
      success: true,
      hashtag: name,
      platform: 'youtube',
      totalResults,
      data: data,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Hashtag Finder API Error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'YouTube Hashtag Finder API',
    endpoints: {
      POST: '/api/hashtag-finder - Search YouTube videos by hashtag'
    },
    usage: {
      method: 'POST',
      body: {
        name: 'string (required) - The hashtag name to search for',
        depth: 'string (optional) - Search depth (1, 2, 3)',
        onlyShorts: 'string (optional) - Only search Shorts videos (true/false)'
      }
    }
  });
}
