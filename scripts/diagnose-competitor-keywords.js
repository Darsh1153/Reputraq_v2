// Simple diagnostic script for competitor keywords
console.log('🔍 Diagnosing competitor keywords issue...');

// Check if we can import the schema
try {
  console.log('📦 Testing schema import...');
  const { competitorKeywords } = require('../lib/db/schema');
  console.log('✅ Schema imported successfully:', competitorKeywords);
} catch (error) {
  console.error('❌ Schema import failed:', error);
}

// Check if we can import the database connection
try {
  console.log('🗄️ Testing database connection import...');
  const { db } = require('../lib/db');
  console.log('✅ Database connection imported successfully');
} catch (error) {
  console.error('❌ Database connection import failed:', error);
}

console.log('🏁 Diagnosis complete');
