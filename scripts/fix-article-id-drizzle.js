const { sql } = require('drizzle-orm');
const { drizzle } = require('drizzle-orm/postgres-js');
const postgres = require('postgres');
const schema = require('../lib/db/schema');
require('dotenv/config');

async function fixArticleIdType() {
  const client = postgres(process.env.DATABASE_URL);
  const db = drizzle(client, { schema });

  try {
    console.log('Fixing article_id column type using Drizzle...');
    
    // Check if the table exists and get current column type
    const tableInfo = await db.execute(sql`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'news_articles' AND column_name = 'article_id'
    `);
    
    console.log('Current article_id column info:', tableInfo.rows);
    
    if (tableInfo.rows.length > 0) {
      const currentType = tableInfo.rows[0].data_type;
      console.log(`Current article_id type: ${currentType}`);
      
      if (currentType === 'integer') {
        console.log('Converting article_id from integer to varchar(50)...');
        
        // First, update any existing data to convert integers to strings
        await db.execute(sql`
          UPDATE news_articles 
          SET article_id = article_id::text 
          WHERE article_id IS NOT NULL
        `);
        
        // Then alter the column type
        await db.execute(sql`
          ALTER TABLE news_articles 
          ALTER COLUMN article_id TYPE VARCHAR(50)
        `);
        
        console.log('✅ Article ID column type successfully converted to VARCHAR(50)');
      } else {
        console.log(`✅ Article ID column is already ${currentType}, no changes needed`);
      }
    } else {
      console.log('❌ news_articles table or article_id column not found');
    }
    
  } catch (error) {
    console.error('❌ Error fixing article ID column:', error);
  } finally {
    await client.end();
  }
}

fixArticleIdType();
