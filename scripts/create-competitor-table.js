const postgres = require('postgres');

// Database connection
const sql = postgres({
  host: process.env.DATABASE_HOST || 'localhost',
  port: process.env.DATABASE_PORT || 5432,
  database: process.env.DATABASE_NAME || 'reputraq',
  username: process.env.DATABASE_USER || 'postgres',
  password: process.env.DATABASE_PASSWORD || 'password',
});

async function createCompetitorKeywordsTable() {
  try {
    console.log('Creating competitor_keywords table...');
    
    await sql`
      CREATE TABLE IF NOT EXISTS "competitor_keywords" (
        "id" serial PRIMARY KEY NOT NULL,
        "user_id" integer NOT NULL,
        "keyword" varchar(255) NOT NULL,
        "created_at" timestamp DEFAULT now() NOT NULL
      );
    `;
    
    console.log('✅ Competitor keywords table created successfully!');
    
  } catch (error) {
    console.error('❌ Error creating competitor keywords table:', error);
  } finally {
    await sql.end();
  }
}

createCompetitorKeywordsTable();
