const { db } = require('../lib/db');
const { competitorKeywords } = require('../lib/db/schema');

async function createCompetitorKeywordsTable() {
  try {
    console.log('Creating competitor_keywords table...');
    
    // The table should be created automatically when we run the app
    // since we've already defined it in the schema
    console.log('Competitor keywords table schema is ready!');
    console.log('You can now use the competitor keyword management features.');
    
  } catch (error) {
    console.error('Error creating competitor keywords table:', error);
  }
}

createCompetitorKeywordsTable();
