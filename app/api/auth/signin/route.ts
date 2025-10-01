import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { users, keywords } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password } = body;

    const database = await db;
    
    // Find user by email
    const user = await database
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (user.length === 0) {
      return NextResponse.json(
        { message: 'Invalid email or password' },
        { status: 401 }
      );
    }

    const foundUser = user[0];

    // Check password (in production, use proper password hashing)
    if (foundUser.password !== password) {
      return NextResponse.json(
        { message: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Get user's keywords if they exist
    const userKeywords = await database
      .select()
      .from(keywords)
      .where(eq(keywords.userId, foundUser.id));

    // Return user data without password
    const { password: _, ...userWithoutPassword } = foundUser;
    
    return NextResponse.json({
      user: {
        ...userWithoutPassword,
        keywords: userKeywords.map(k => k.keyword)
      },
      redirectTo: foundUser.role === 'admin' ? '/admin' : '/dashboard'
    });
  } catch (error) {
    console.error('Signin error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}
