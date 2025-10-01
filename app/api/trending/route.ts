import { NextRequest, NextResponse } from 'next/server';
import GoogleTrendsApi from '@alkalisummer/google-trends-js';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const geo = searchParams.get('geo') || 'US';
    const hl = searchParams.get('hl') || 'en';
    const keyword = searchParams.get('keyword');
    const trendingHours = parseInt(searchParams.get('trendingHours') || '4');

    let result;

    switch (type) {
      case 'daily':
        result = await GoogleTrendsApi.dailyTrends({ geo, hl });
        break;
      
      case 'realtime':
        result = await GoogleTrendsApi.realTimeTrends({ geo, trendingHours });
        break;
      
      case 'interest-over-time':
        if (!keyword) {
          return NextResponse.json(
            { error: 'Keyword is required for interest over time' },
            { status: 400 }
          );
        }
        result = await GoogleTrendsApi.interestOverTime({ keyword, geo });
        break;
      
      case 'autocomplete':
        if (!keyword) {
          return NextResponse.json(
            { error: 'Keyword is required for autocomplete' },
            { status: 400 }
          );
        }
        result = await GoogleTrendsApi.autocomplete(keyword, hl);
        break;
      
      case 'interest-by-region':
        if (!keyword) {
          return NextResponse.json(
            { error: 'Keyword is required for interest by region' },
            { status: 400 }
          );
        }
        const startTime = searchParams.get('startTime');
        const endTime = searchParams.get('endTime');
        const resolution = searchParams.get('resolution') || 'REGION';
        const timezone = parseInt(searchParams.get('timezone') || '0');
        const category = parseInt(searchParams.get('category') || '0');
        
        result = await GoogleTrendsApi.interestByRegion({
          keyword,
          geo,
          startTime: startTime ? new Date(startTime) : undefined,
          endTime: endTime ? new Date(endTime) : undefined,
          resolution: resolution as 'COUNTRY' | 'REGION' | 'CITY' | 'DMA',
          timezone,
          category
        });
        break;
      
      default:
        return NextResponse.json(
          { error: 'Invalid type parameter' },
          { status: 400 }
        );
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error('Trending API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch trending data' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, articleKeys, articleCount = 5 } = body;

    if (type === 'trending-articles') {
      if (!articleKeys || !Array.isArray(articleKeys)) {
        return NextResponse.json(
          { error: 'Article keys are required for trending articles' },
          { status: 400 }
        );
      }

      const result = await GoogleTrendsApi.trendingArticles({
        articleKeys,
        articleCount
      });

      return NextResponse.json(result);
    }

    return NextResponse.json(
      { error: 'Invalid request type' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Trending API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch trending data' },
      { status: 500 }
    );
  }
}
