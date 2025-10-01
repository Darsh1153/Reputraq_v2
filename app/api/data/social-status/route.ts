import { NextResponse } from 'next/server';
import axios from 'axios';

const headers = {
    Accept: "application/json",
    Authorization:
        "Basic NWU2ZDkwZjYtYmMxZS00OTc5LWJlYmEtY2YzOTA5ZjgxZGMxOjg1ZTZiY2UzLTA1MmMtNGJmYy1hNDJhLTY5NmFhM2ZhMjk0OQ==",
};

export async function POST(request: Request) {
  try {
    const { searchId, keyword } = await request.json();
    
    if (!searchId || !keyword) {
      return NextResponse.json(
        { error: 'Search ID and keyword are required' },
        { status: 400 }
      );
    }

    // Check status
    const status_response = await axios.get(
      `https://api.staging.insightiq.ai/v1/social/creators/contents/search/${searchId}`,
      { headers }
    );
    
    console.log(`Status check for ${keyword}:`, status_response.data.status);
    
    if (status_response.data.status === "SUCCESS") {
      // Get social insights
      const getSocial_insight = await axios.get(
        `https://api.staging.insightiq.ai/v1/social/creators/contents/search/${searchId}/fetch`,
        { headers }
      );
      
      return NextResponse.json({
        success: true,
        status: 'SUCCESS',
        data: getSocial_insight.data,
        keyword
      });
    } else if (status_response.data.status === "FAILED" || status_response.data.error) {
      return NextResponse.json({
        success: false,
        status: 'FAILED',
        error: status_response.data.error,
        keyword
      });
    } else {
      return NextResponse.json({
        success: false,
        status: status_response.data.status,
        message: 'Still processing',
        keyword
      });
    }
  } catch (error) {
    console.error('Error checking social status:', error);
    return NextResponse.json(
      { error: 'Failed to check social status' },
      { status: 500 }
    );
  }
}
