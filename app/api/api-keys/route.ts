import { NextRequest, NextResponse } from 'next/server';
import { apiKeyManager } from '../../../lib/api-fallback';

export async function GET(request: NextRequest) {
  try {
    const status = apiKeyManager.getApiKeyStatus();
    
    return NextResponse.json({
      success: true,
      message: 'API Key Status',
      apiKeys: status,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('API Key Status Error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to get API key status',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action } = body;
    
    if (action === 'reset') {
      apiKeyManager.resetApiKeys();
      return NextResponse.json({
        success: true,
        message: 'All API keys have been reset',
        timestamp: new Date().toISOString()
      });
    }
    
    return NextResponse.json(
      { error: 'Invalid action. Use "reset" to reset all API keys.' },
      { status: 400 }
    );
  } catch (error) {
    console.error('API Key Management Error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to manage API keys',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
