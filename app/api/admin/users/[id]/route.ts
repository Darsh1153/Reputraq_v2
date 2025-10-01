import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { users, keywords } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

export async function DELETE(
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
    
    // First delete all keywords associated with the user
    await database
      .delete(keywords)
      .where(eq(keywords.userId, userId));

    // Then delete the user
    await database
      .delete(users)
      .where(eq(users.id, userId));

    return NextResponse.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error deleting user:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const userId = parseInt(params.id);
    const body = await request.json();

    if (isNaN(userId)) {
      return NextResponse.json(
        { message: 'Invalid user ID' },
        { status: 400 }
      );
    }

    const { name, email, phone, companyName, password, plan } = body;

    const database = await db;
    await database
      .update(users)
      .set({
        name,
        email,
        phone,
        companyName,
        password, // TODO: Hash password before storing
        plan,
        updatedAt: new Date()
      })
      .where(eq(users.id, userId));

    return NextResponse.json({ message: 'User updated successfully' });
  } catch (error) {
    console.error('Error updating user:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}
