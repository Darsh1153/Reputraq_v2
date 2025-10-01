const { Pool } = require('postgres');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function createNewsTables() {
  try {
    console.log('Creating news articles table...');
    
    await pool.query(`
      CREATE TABLE IF NOT EXISTS news_articles (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL,
        keyword VARCHAR(255) NOT NULL,
        article_id INTEGER NOT NULL,
        title TEXT NOT NULL,
        description TEXT,
        url TEXT NOT NULL,
        published_at TIMESTAMP NOT NULL,
        source_name VARCHAR(255) NOT NULL,
        source_logo TEXT,
        image TEXT,
        sentiment_score INTEGER,
        sentiment_label VARCHAR(50),
        read_time INTEGER,
        is_breaking BOOLEAN DEFAULT FALSE,
        categories JSONB,
        topics JSONB,
        engagement JSONB,
        raw_data JSONB,
        created_at TIMESTAMP DEFAULT NOW() NOT NULL,
        updated_at TIMESTAMP DEFAULT NOW() NOT NULL
      );
    `);

    console.log('Creating social posts table...');
    
    await pool.query(`
      CREATE TABLE IF NOT EXISTS social_posts (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL,
        keyword VARCHAR(255) NOT NULL,
        post_id VARCHAR(255) NOT NULL,
        title TEXT,
        description TEXT,
        url TEXT,
        published_at TIMESTAMP NOT NULL,
        platform_name VARCHAR(255) NOT NULL,
        platform_logo TEXT,
        image TEXT,
        sentiment_score INTEGER,
        sentiment_label VARCHAR(50),
        engagement JSONB,
        raw_data JSONB,
        created_at TIMESTAMP DEFAULT NOW() NOT NULL,
        updated_at TIMESTAMP DEFAULT NOW() NOT NULL
      );
    `);

    console.log('Creating indexes...');
    
    // Create indexes for better performance
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_news_articles_user_id ON news_articles(user_id);
    `);
    
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_news_articles_keyword ON news_articles(keyword);
    `);
    
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_news_articles_published_at ON news_articles(published_at);
    `);
    
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_social_posts_user_id ON social_posts(user_id);
    `);
    
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_social_posts_keyword ON social_posts(keyword);
    `);

    console.log('✅ News tables created successfully!');
    
  } catch (error) {
    console.error('❌ Error creating tables:', error);
  } finally {
    await pool.end();
  }
}

createNewsTables();
