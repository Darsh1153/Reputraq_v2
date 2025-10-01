import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { users } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const userId = parseInt(params.id);

    if (isNaN(userId)) {
      return NextResponse.json(
        { message: 'Invalid user ID' },
        { status: 400 }
      );
    }

    const database = await db;
    await database
      .update(users)
      .set({ 
        status: 'approved',
        updatedAt: new Date()
      })
      .where(eq(users.id, userId));

    return NextResponse.json({ message: 'User approved successfully' });
  } catch (error) {
    console.error('Error approving user:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}
