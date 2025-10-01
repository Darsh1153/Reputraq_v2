const { getDatabase } = require('../lib/db/connection');
const { sql } = require('drizzle-orm');

async function createCompetitorKeywordsTable() {
  try {
    console.log('Creating competitor_keywords table...');
    
    const db = await getDatabase();
    
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS "competitor_keywords" (
        "id" serial PRIMARY KEY NOT NULL,
        "user_id" integer NOT NULL,
        "keyword" varchar(255) NOT NULL,
        "created_at" timestamp DEFAULT now() NOT NULL
      );
    `);
    
    console.log('✅ Competitor keywords table created successfully!');
    
  } catch (error) {
    console.error('❌ Error creating competitor keywords table:', error);
  }
}

createCompetitorKeywordsTable();
