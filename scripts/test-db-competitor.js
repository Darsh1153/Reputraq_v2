// Test database connection and competitor keywords table
const postgres = require('postgres');

async function testCompetitorKeywords() {
  console.log('🔍 Testing competitor keywords database functionality...');
  
  try {
    // Use the same connection string as the app
    const connectionString = process.env.DATABASE_URL;
    
    if (!connectionString) {
      console.error('❌ DATABASE_URL environment variable not set');
      return;
    }
    
    console.log('🔗 Connecting to database...');
    const sql = postgres(connectionString, {
      prepare: false,
      max: 10,
      idle_timeout: 30,
      connect_timeout: 30,
      max_lifetime: 60 * 30,
      ssl: true,
    });
    
    // Test basic connection
    console.log('📡 Testing basic connection...');
    const result = await sql`SELECT NOW() as current_time`;
    console.log('✅ Database connection successful:', result[0]);
    
    // Try to create the competitor_keywords table
    console.log('🏗️ Creating competitor_keywords table...');
    await sql`
      CREATE TABLE IF NOT EXISTS "competitor_keywords" (
        "id" serial PRIMARY KEY NOT NULL,
        "user_id" integer NOT NULL,
        "keyword" varchar(255) NOT NULL,
        "created_at" timestamp DEFAULT now() NOT NULL
      );
    `;
    console.log('✅ Table created/verified successfully');
    
    // Test inserting a sample record
    console.log('📝 Testing insert...');
    const insertResult = await sql`
      INSERT INTO "competitor_keywords" ("user_id", "keyword") 
      VALUES (1, 'Test Competitor') 
      RETURNING *;
    `;
    console.log('✅ Insert successful:', insertResult[0]);
    
    // Test selecting records
    console.log('📊 Testing select...');
    const selectResult = await sql`
      SELECT * FROM "competitor_keywords" WHERE "user_id" = 1;
    `;
    console.log('✅ Select successful:', selectResult);
    
    // Clean up test data
    console.log('🧹 Cleaning up test data...');
    await sql`DELETE FROM "competitor_keywords" WHERE "keyword" = 'Test Competitor'`;
    console.log('✅ Cleanup successful');
    
    console.log('🎉 All tests passed! Competitor keywords functionality is working.');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    if (sql) {
      await sql.end();
    }
  }
}

testCompetitorKeywords();
