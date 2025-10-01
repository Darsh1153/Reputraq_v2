import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { users } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, phone, companyName, password, plan } = body;

    const database = await db;
    
    // Check if user already exists
    const existingUser = await database
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (existingUser.length > 0) {
      return NextResponse.json(
        { message: 'User with this email already exists' },
        { status: 400 }
      );
    }

    // Create new user (password should be hashed in production)
    const newUser = await database
      .insert(users)
      .values({
        name,
        email,
        phone,
        companyName,
        password, // TODO: Hash password before storing
        plan,
        role: 'user',
        status: 'pending',
      })
      .returning({ id: users.id });

    return NextResponse.json(
      { 
        message: 'User created successfully', 
        userId: newUser[0]?.id 
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Signup error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}
