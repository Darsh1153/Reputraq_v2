const postgres = require('postgres');
require('dotenv/config');

const client = postgres(process.env.DATABASE_URL);

async function fixArticleIdType() {
  try {
    console.log('Fixing article_id column type...');
    
    // First, drop the existing column
    await client`
      ALTER TABLE news_articles DROP COLUMN IF EXISTS article_id;
    `;
    
    // Add the column back with varchar type
    await client`
      ALTER TABLE news_articles ADD COLUMN article_id VARCHAR(50) NOT NULL DEFAULT '';
    `;
    
    // Update the default value to be empty string instead of default
    await client`
      ALTER TABLE news_articles ALTER COLUMN article_id DROP DEFAULT;
    `;

    console.log('✅ Article ID column type fixed successfully!');
    
  } catch (error) {
    console.error('❌ Error fixing article ID column:', error);
  } finally {
    await client.end();
  }
}

fixArticleIdType();
