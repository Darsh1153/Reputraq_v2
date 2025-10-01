import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { keywords } from '@/lib/db/schema';

export async function GET() {
  try {
    const database = await db;
    
    // Get all keywords from the database
    const allKeywords = await database
      .select()
      .from(keywords);
    
    console.log('Test Keywords API - All keywords:', allKeywords);
    
    return NextResponse.json({
      message: 'Keywords test endpoint',
      totalKeywords: allKeywords.length,
      keywords: allKeywords
    });
  } catch (error) {
    console.error('Test Keywords API - Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch keywords', details: error },
      { status: 500 }
    );
  }
}
