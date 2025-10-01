const { drizzle } = require('drizzle-orm/postgres-js');
const postgres = require('postgres');
const { users } = require('../lib/db/schema');

const connectionString = process.env.DATABASE_URL || 'postgresql://username:password@localhost:5432/reputraq';
const client = postgres(connectionString, { prepare: false });
const db = drizzle(client, { schema: { users } });

async function createAdmin() {
  try {
    console.log('Creating admin user...');
    
    const adminUser = await db
      .insert(users)
      .values({
        name: 'Admin User',
        email: 'admin@reputraq.com',
        phone: '1234567890',
        companyName: 'Reputraq',
        password: 'admin123', // In production, hash this password
        plan: 'enterprise',
        role: 'admin',
        status: 'approved',
      })
      .returning();

    console.log('Admin user created successfully:', adminUser[0]);
    console.log('You can now sign in with:');
    console.log('Email: admin@reputraq.com');
    console.log('Password: admin123');
  } catch (error) {
    console.error('Error creating admin user:', error);
  } finally {
    await client.end();
  }
}

createAdmin();
