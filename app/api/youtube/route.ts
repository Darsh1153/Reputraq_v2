import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');
    const duration = searchParams.get('duration') as 'under' | 'between' | 'over' | undefined;

    if (!query) {
      return NextResponse.json(
        { error: 'Query parameter "q" is required' },
        { status: 400 }
      );
    }

    // Search options
    const searchOptions: any = {};
    if (duration) {
      searchOptions.duration = duration;
    }

    // Perform YouTube search using dynamic import for ES module
    const yt = await import('youtube-search-without-api-key');
    const videos = await yt.default.search(query, searchOptions);

    return NextResponse.json({
      success: true,
      data: videos,
      query,
      duration: duration || 'all',
      count: videos.length
    });

  } catch (error) {
    console.error('YouTube search error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to search YouTube videos',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { query, duration } = body;

    if (!query) {
      return NextResponse.json(
        { error: 'Query is required in request body' },
        { status: 400 }
      );
    }

    // Search options
    const searchOptions: any = {};
    if (duration) {
      searchOptions.duration = duration;
    }

    // Perform YouTube search using dynamic import for ES module
    const yt = await import('youtube-search-without-api-key');
    const videos = await yt.default.search(query, searchOptions);

    return NextResponse.json({
      success: true,
      data: videos,
      query,
      duration: duration || 'all',
      count: videos.length
    });

  } catch (error) {
    console.error('YouTube search error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to search YouTube videos',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
