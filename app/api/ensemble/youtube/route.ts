import { NextRequest, NextResponse } from 'next/server';

const ENSEMBLE_BASE_URL = process.env.NEXT_PUBLIC_ENSEMBLE_BASE_URL;
const ENSEMBLE_TOKEN = process.env.ENSEMBLE_TOKEN;

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const keyword = searchParams.get('keyword') || 'magic';
    const depth = searchParams.get('depth') || '1';
    const period = searchParams.get('period') || 'overall';
    const sorting = searchParams.get('sorting') || 'relevance';
    
    if (!ENSEMBLE_BASE_URL || !ENSEMBLE_TOKEN) {
      return NextResponse.json(
        { error: 'API configuration missing' },
        { status: 500 }
      );
    }

    const url = `${ENSEMBLE_BASE_URL}/youtube/search?keyword=${encodeURIComponent(keyword)}&depth=${depth}&start_cursor=&period=${period}&sorting=${sorting}&get_additional_info=false&token=${ENSEMBLE_TOKEN}`;
    
    console.log('Fetching YouTube data from:', url);
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('YouTube API Error:', errorText);
      return NextResponse.json(
        { 
          error: 'Failed to fetch YouTube data',
          status: response.status,
          details: errorText
        },
        { status: response.status }
      );
    }

    const data = await response.json();
    
    return NextResponse.json({
      success: true,
      platform: 'youtube',
      keyword,
      data: data,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('YouTube API Error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { keyword, depth = '1', period = 'overall', sorting = 'relevance' } = body;
    
    if (!keyword) {
      return NextResponse.json(
        { error: 'Keyword is required' },
        { status: 400 }
      );
    }

    if (!ENSEMBLE_BASE_URL || !ENSEMBLE_TOKEN) {
      return NextResponse.json(
        { error: 'API configuration missing' },
        { status: 500 }
      );
    }

    const url = `${ENSEMBLE_BASE_URL}/youtube/search?keyword=${encodeURIComponent(keyword)}&depth=${depth}&start_cursor=&period=${period}&sorting=${sorting}&get_additional_info=false&token=${ENSEMBLE_TOKEN}`;
    
    const response = await fetch(url);
    
    if (!response.ok) {
      const errorText = await response.text();
      return NextResponse.json(
        { error: 'Failed to fetch YouTube data', details: errorText },
        { status: response.status }
      );
    }

    const data = await response.json();
    
    return NextResponse.json({
      success: true,
      platform: 'youtube',
      keyword,
      data: data,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

