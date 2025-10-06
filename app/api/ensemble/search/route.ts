import { NextRequest, NextResponse } from 'next/server';
import { apiKeyManager } from '../../../../lib/api-fallback';

// Mock data function for when API limit is reached
function getMockData(platform: string, keyword: string) {
  if (platform === 'youtube') {
    return {
      data: {
        posts: [
          {
            videoRenderer: {
              videoId: 'mock1',
              title: { runs: [{ text: `${keyword} - Amazing Video 1` }] },
              lengthSeconds: '120',
              viewCountText: { simpleText: '1.2M views' },
              publishedTimeText: { simpleText: '2 days ago' },
              ownerText: { runs: [{ text: 'Channel Name' }] },
              thumbnail: {
                thumbnails: [{ url: 'https://via.placeholder.com/320x180?text=YouTube+Video+1' }]
              }
            }
          },
          {
            videoRenderer: {
              videoId: 'mock2',
              title: { runs: [{ text: `${keyword} - Tutorial Video` }] },
              lengthSeconds: '300',
              viewCountText: { simpleText: '850K views' },
              publishedTimeText: { simpleText: '1 week ago' },
              ownerText: { runs: [{ text: 'Tech Channel' }] },
              thumbnail: {
                thumbnails: [{ url: 'https://via.placeholder.com/320x180?text=YouTube+Video+2' }]
              }
            }
          },
          {
            videoRenderer: {
              videoId: 'mock3',
              title: { runs: [{ text: `${keyword} - Best Moments Compilation` }] },
              lengthSeconds: '450',
              viewCountText: { simpleText: '2.5M views' },
              publishedTimeText: { simpleText: '3 days ago' },
              ownerText: { runs: [{ text: 'Sports Channel' }] },
              thumbnail: {
                thumbnails: [{ url: 'https://via.placeholder.com/320x180?text=YouTube+Video+3' }]
              }
            }
          },
          {
            videoRenderer: {
              videoId: 'mock4',
              title: { runs: [{ text: `${keyword} - Analysis & Review` }] },
              lengthSeconds: '600',
              viewCountText: { simpleText: '750K views' },
              publishedTimeText: { simpleText: '5 days ago' },
              ownerText: { runs: [{ text: 'Analysis Channel' }] },
              thumbnail: {
                thumbnails: [{ url: 'https://via.placeholder.com/320x180?text=YouTube+Video+4' }]
              }
            }
          },
          {
            videoRenderer: {
              videoId: 'mock5',
              title: { runs: [{ text: `${keyword} - Highlights Reel` }] },
              lengthSeconds: '180',
              viewCountText: { simpleText: '3.1M views' },
              publishedTimeText: { simpleText: '1 day ago' },
              ownerText: { runs: [{ text: 'Highlights Channel' }] },
              thumbnail: {
                thumbnails: [{ url: 'https://via.placeholder.com/320x180?text=YouTube+Video+5' }]
              }
            }
          }
        ]
      }
    };
  } else if (platform === 'instagram') {
    return {
      data: {
        users: [
          {
            user: {
              username: `${keyword}_fan`,
              full_name: `${keyword} Fan Account`,
              is_verified: true,
              profile_pic_url: 'https://via.placeholder.com/150x150?text=IG+User+1',
              pk: 'mock_user_1'
            }
          },
          {
            user: {
              username: `${keyword}_official`,
              full_name: `${keyword} Official`,
              is_verified: true,
              profile_pic_url: 'https://via.placeholder.com/150x150?text=IG+User+2',
              pk: 'mock_user_2'
            }
          }
        ],
        hashtags: [
          {
            hashtag: {
              name: keyword,
              media_count: 1250000,
              id: 'mock_hashtag_1'
            }
          },
          {
            hashtag: {
              name: `${keyword}_fan`,
              media_count: 850000,
              id: 'mock_hashtag_2'
            }
          }
        ]
      }
    };
  } else if (platform === 'tiktok') {
    return {
      data: {
        data: [
          {
            aweme_info: {
              aweme_id: 'mock_tiktok_1',
              desc: `${keyword} is amazing! Check this out! #${keyword}`,
              author: {
                nickname: `${keyword}_creator`,
                unique_id: `${keyword}_creator`,
                avatar_larger: {
                  url_list: ['https://via.placeholder.com/150x150?text=TT+User+1']
                }
              },
              video: {
                cover: {
                  url_list: ['https://via.placeholder.com/320x568?text=TikTok+Video+1']
                },
                duration: 15000
              },
              statistics: {
                digg_count: 12500,
                comment_count: 450,
                share_count: 230,
                play_count: 125000
              },
              share_url: 'https://tiktok.com/@mock_user/video/1'
            }
          },
          {
            aweme_info: {
              aweme_id: 'mock_tiktok_2',
              desc: `Amazing ${keyword} content! #${keyword} #viral`,
              author: {
                nickname: `${keyword}_viral`,
                unique_id: `${keyword}_viral`,
                avatar_larger: {
                  url_list: ['https://via.placeholder.com/150x150?text=TT+User+2']
                }
              },
              video: {
                cover: {
                  url_list: ['https://via.placeholder.com/320x568?text=TikTok+Video+2']
                },
                duration: 20000
              },
              statistics: {
                digg_count: 25000,
                comment_count: 1200,
                share_count: 850,
                play_count: 350000
              },
              share_url: 'https://tiktok.com/@mock_user/video/2'
            }
          }
        ]
      }
    };
  }
  
  return { data: { posts: [] } };
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { keyword, depth = '1', period = 'overall', sorting = 'relevance', platform = 'youtube', cursor = '0', country = 'us', match_exactly = 'false', get_author_stats = 'false' } = body;
    
    // Convert parameters for TikTok API
    const tiktokPeriod = period === 'overall' ? '0' : period === '24h' ? '1' : period === '7d' ? '7' : period === '30d' ? '30' : '0';
    const tiktokSorting = sorting === 'relevance' ? '0' : sorting === 'date' ? '1' : '0';
    
    if (!keyword) {
      return NextResponse.json(
        { error: 'Keyword is required' },
        { status: 400 }
      );
    }

    // Determine API endpoint based on platform
    let endpoint: string;
    if (platform === 'instagram') {
      endpoint = `/instagram/search?text=${encodeURIComponent(keyword)}`;
    } else if (platform === 'tiktok') {
      endpoint = `/tt/keyword/search?name=${encodeURIComponent(keyword)}&cursor=${cursor}&period=${tiktokPeriod}&sorting=${tiktokSorting}&country=${country}&match_exactly=${match_exactly}&get_author_stats=${get_author_stats}`;
    } else {
      endpoint = `/youtube/search?keyword=${encodeURIComponent(keyword)}&depth=${depth}&start_cursor=&period=${period}&sorting=${sorting}&get_additional_info=false`;
    }
    
    console.log(`🔍 Searching ${platform} for: ${keyword}`);
    
    // Use the API key fallback system
    const result = await apiKeyManager.makeRequest(endpoint);
    
    if (!result.success) {
      console.error(`❌ All API keys failed for ${platform} search:`, result.error);
      
      // Return mock data when all API keys fail
      const mockData = getMockData(platform, keyword);
      return NextResponse.json({
        success: true,
        keyword,
        platform,
        totalResults: platform === 'youtube' ? 5 : platform === 'instagram' ? 8 : 6,
        data: mockData,
        timestamp: new Date().toISOString(),
        note: `Mock data - All API keys failed. Used API key: ${result.usedApiKey || 'None'}`
      });
    }

    const data = result.data;
    
    // Calculate total results based on platform
    let totalResults = 0;
    if (platform === 'youtube') {
      totalResults = data.data?.posts ? data.data.posts.filter((item: any) => item.videoRenderer).length : 0;
    } else if (platform === 'instagram') {
      // Handle Instagram data structure - count users and hashtags
      if (data.data) {
        const users = data.data.users ? data.data.users.length : 0;
        const hashtags = data.data.hashtags ? data.data.hashtags.length : 0;
        totalResults = users + hashtags;
      }
    } else if (platform === 'tiktok') {
      // Handle TikTok data structure - count videos
      if (data.data && data.data.data && Array.isArray(data.data.data)) {
        totalResults = data.data.data.length;
      }
    }

    return NextResponse.json({
      success: true,
      keyword,
      platform,
      totalResults,
      data: data,
      timestamp: new Date().toISOString(),
      usedApiKey: result.usedApiKey
    });

  } catch (error) {
    console.error('Social Platform Search Error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  return NextResponse.json({
    message: 'Ensemble Data Social Platform Search API',
    endpoints: {
      POST: '/api/ensemble/search - Search social platforms for content by keyword'
    },
    supportedPlatforms: [
      'YouTube',
      'Instagram',
      'TikTok'
    ],
    usage: {
      method: 'POST',
      body: {
        keyword: 'string (required) - The search term to look for',
        platform: 'string (optional) - Platform to search (youtube/instagram/tiktok), default: "youtube"',
        depth: 'string (optional) - Search depth for YouTube, default: "1"',
        period: 'string (optional) - Time period for YouTube, default: "overall"',
        sorting: 'string (optional) - Sort by relevance/date/views for YouTube, default: "relevance"'
      }
    }
  });
}
