import { NextRequest, NextResponse } from 'next/server';
import { searchAllPlatforms } from '../../../services/ensembleSocialAPI';

export async function POST(request: NextRequest) {
  try {
    const { keyword } = await request.json();

    if (!keyword || typeof keyword !== 'string' || keyword.trim().length === 0) {
      return NextResponse.json(
        { error: 'Keyword is required and must be a non-empty string' },
        { status: 400 }
      );
    }

    console.log(`Starting EnsembleData search for keyword: ${keyword}`);

    // Use the existing searchAllPlatforms function to collect data from all platforms
    const results = await searchAllPlatforms(keyword.trim());

    console.log(`EnsembleData search completed for keyword: ${keyword}`);
    console.log(`Results summary:`, {
      platforms: Object.keys(results.platforms),
      totalResults: Object.values(results.platforms).reduce((sum: number, platform: any) => {
        if (platform.videos) return sum + platform.videos.length;
        if (platform.posts) return sum + platform.posts.length;
        if (platform.hashtags) return sum + platform.hashtags.length;
        if (platform.users) return sum + platform.users.length;
        if (platform.places) return sum + platform.places.length;
        return sum;
      }, 0)
    });

    return NextResponse.json({
      success: true,
      data: results,
      message: `Successfully collected social media data for "${keyword}"`
    });

  } catch (error) {
    console.error('EnsembleData search error:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    
    return NextResponse.json(
      { 
        error: 'Failed to search social media platforms',
        detail: errorMessage,
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'EnsembleData Social Media Search API',
    endpoints: {
      POST: '/api/ensemble-search - Search all social media platforms for a keyword'
    },
    supportedPlatforms: [
      'YouTube',
      'TikTok', 
      'Instagram',
      'Threads',
      'Reddit',
      'Twitter/X',
      'LinkedIn',
      'Facebook'
    ],
    usage: {
      method: 'POST',
      body: {
        keyword: 'string (required) - The search term to look for across platforms'
      }
    }
  });
}