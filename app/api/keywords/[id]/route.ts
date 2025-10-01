import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { keywords } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';

// Helper function to get user ID from request headers
function getUserIdFromRequest(request: Request): number | null {
  const authHeader = request.headers.get('authorization');
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7);
    try {
      const payload = JSON.parse(atob(token));
      return payload.userId;
    } catch {
      return null;
    }
  }
  return null;
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const userId = getUserIdFromRequest(request);
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const keywordId = parseInt(params.id);

    if (isNaN(keywordId)) {
      return NextResponse.json(
        { message: 'Invalid keyword ID' },
        { status: 400 }
      );
    }

    const database = await db;

    // Only allow users to delete their own keywords
    await database
      .delete(keywords)
      .where(and(
        eq(keywords.id, keywordId),
        eq(keywords.userId, parseInt(userId.toString()))
      ));

    return NextResponse.json({ message: 'Keyword deleted successfully' });
  } catch (error) {
    console.error('Error deleting keyword:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}
