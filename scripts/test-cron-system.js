#!/usr/bin/env node

/**
 * Test Script for Cron Job System
 * This script tests the automated data collection system
 */

const { execSync } = require('child_process');
const fs = require('fs');

console.log('🧪 Testing Cron Job System');
console.log('==========================\n');

// Test 1: Check if cron manager can be imported
console.log('1. Testing cron manager import...');
try {
  const cronManager = require('../services/cronManager');
  console.log('✅ Cron manager imported successfully');
} catch (error) {
  console.log('❌ Failed to import cron manager:', error.message);
  process.exit(1);
}

// Test 2: Check if database connection works
console.log('\n2. Testing database connection...');
try {
  const { getDatabase } = require('../lib/db/connection');
  console.log('✅ Database connection module imported');
} catch (error) {
  console.log('❌ Failed to import database connection:', error.message);
}

// Test 3: Check if API endpoints exist
console.log('\n3. Testing API endpoints...');
const apiFiles = [
  'app/api/cron/route.ts',
  'app/api/historical-data/route.ts'
];

apiFiles.forEach(file => {
  if (fs.existsSync(file)) {
    console.log(`✅ ${file} exists`);
  } else {
    console.log(`❌ ${file} missing`);
  }
});

// Test 4: Check if components exist
console.log('\n4. Testing UI components...');
const componentFiles = [
  'components/CronJobManager.tsx',
  'components/HistoricalDataDisplay.tsx',
  'components/DateRangeSlider.tsx'
];

componentFiles.forEach(file => {
  if (fs.existsSync(file)) {
    console.log(`✅ ${file} exists`);
  } else {
    console.log(`❌ ${file} missing`);
  }
});

// Test 5: Check database migration
console.log('\n5. Testing database migration...');
if (fs.existsSync('drizzle/0002_add_historical_data_tables.sql')) {
  console.log('✅ Database migration file exists');
} else {
  console.log('❌ Database migration file missing');
}

console.log('\n🎉 Cron Job System Test Complete!');
console.log('\n📋 Next Steps:');
console.log('1. Run: npm install node-cron @types/node-cron');
console.log('2. Apply database migration');
console.log('3. Start the application: npm run dev');
console.log('4. Check dashboard for automation status');
console.log('5. Data will be collected automatically every 24 hours');
