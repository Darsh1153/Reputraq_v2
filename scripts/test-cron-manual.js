#!/usr/bin/env node

/**
 * Manual Cron Job Test Script
 * 
 * This script tests the cron job system manually by:
 * 1. Checking if cron manager is running
 * 2. Triggering data collection for a test user
 * 3. Verifying data is stored in the database
 */

const axios = require('axios');

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';
const TEST_USER_ID = 1; // Change this to your test user ID

// Helper function to create auth token
function createAuthToken(userId) {
  return Buffer.from(JSON.stringify({ userId })).toString('base64');
}

// Helper function to make authenticated requests
async function makeRequest(method, endpoint, data = null) {
  const token = createAuthToken(TEST_USER_ID);
  
  try {
    const response = await axios({
      method,
      url: `${BASE_URL}${endpoint}`,
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      data
    });
    return response.data;
  } catch (error) {
    if (error.response) {
      throw new Error(`HTTP ${error.response.status}: ${error.response.data?.error || error.response.statusText}`);
    }
    throw error;
  }
}

// Test functions
async function testCronSettings() {
  console.log('🔍 Testing cron settings...');
  
  try {
    const result = await makeRequest('GET', '/api/cron');
    console.log('✅ Cron settings retrieved successfully');
    console.log(`   - Enabled: ${result.settings.isEnabled}`);
    console.log(`   - Interval: ${result.settings.intervalHours} hours`);
    console.log(`   - Timezone: ${result.settings.timezone}`);
    console.log(`   - Last Run: ${result.settings.lastRunAt || 'Never'}`);
    console.log(`   - Next Run: ${result.settings.nextRunAt || 'Not scheduled'}`);
    return true;
  } catch (error) {
    console.error('❌ Failed to get cron settings:', error.message);
    return false;
  }
}

async function testDataCollection() {
  console.log('🔄 Testing data collection...');
  
  try {
    const result = await makeRequest('POST', '/api/cron', { action: 'runNow' });
    console.log('✅ Data collection triggered successfully');
    console.log(`   - Message: ${result.message}`);
    return true;
  } catch (error) {
    console.error('❌ Failed to trigger data collection:', error.message);
    return false;
  }
}

async function testJobStatus() {
  console.log('📊 Checking job status...');
  
  try {
    const result = await makeRequest('POST', '/api/cron', { action: 'getJobHistory' });
    const jobs = result.jobs || [];
    
    if (jobs.length > 0) {
      const latestJob = jobs[jobs.length - 1];
      console.log('✅ Latest job status retrieved');
      console.log(`   - Status: ${latestJob.status}`);
      console.log(`   - Keywords: ${latestJob.keywords?.length || 0}`);
      console.log(`   - Processed: ${latestJob.processedKeywords || 0}/${latestJob.totalKeywords || 0}`);
      console.log(`   - Start Time: ${new Date(latestJob.startTime).toLocaleString()}`);
      console.log(`   - End Time: ${latestJob.endTime ? new Date(latestJob.endTime).toLocaleString() : 'Still running'}`);
      
      if (latestJob.errorMessage) {
        console.log(`   - Error: ${latestJob.errorMessage}`);
      }
    } else {
      console.log('⚠️ No jobs found in history');
    }
    return true;
  } catch (error) {
    console.error('❌ Failed to get job status:', error.message);
    return false;
  }
}

async function testMonitoringData() {
  console.log('📈 Testing monitoring data retrieval...');
  
  try {
    const result = await makeRequest('GET', '/api/data/monitoring');
    const data = result.monitoringData || [];
    
    console.log('✅ Monitoring data retrieved successfully');
    console.log(`   - Keywords processed: ${data.length}`);
    
    if (data.length > 0) {
      let totalNews = 0;
      let totalSocial = 0;
      
      data.forEach((item, index) => {
        const newsCount = item.newsData?.results?.length || 0;
        const socialCount = item.socialData?.data?.length || 0;
        totalNews += newsCount;
        totalSocial += socialCount;
        
        console.log(`   - Keyword ${index + 1}: "${item.keyword}"`);
        console.log(`     * News articles: ${newsCount}`);
        console.log(`     * Social posts: ${socialCount}`);
        console.log(`     * Timestamp: ${item.timestamp ? new Date(item.timestamp).toLocaleString() : 'N/A'}`);
      });
      
      console.log('📊 Total Summary:');
      console.log(`   - Total news articles: ${totalNews}`);
      console.log(`   - Total social posts: ${totalSocial}`);
    } else {
      console.log('⚠️ No monitoring data found');
    }
    return true;
  } catch (error) {
    console.error('❌ Failed to get monitoring data:', error.message);
    return false;
  }
}

// Main test function
async function runFullTest() {
  console.log('🚀 Starting comprehensive cron data flow test...');
  console.log(`📍 Testing against: ${BASE_URL}`);
  console.log(`👤 Test User ID: ${TEST_USER_ID}`);
  console.log('');
  
  const results = {
    cronSettings: false,
    dataCollection: false,
    jobStatus: false,
    monitoringData: false
  };
  
  // Test 1: Cron Settings
  results.cronSettings = await testCronSettings();
  console.log('');
  
  // Test 2: Data Collection
  results.dataCollection = await testDataCollection();
  console.log('');
  
  // Wait a bit for job to process
  console.log('⏳ Waiting for data collection to process...');
  await new Promise(resolve => setTimeout(resolve, 5000));
  
  // Test 3: Job Status
  results.jobStatus = await testJobStatus();
  console.log('');
  
  // Test 4: Monitoring Data
  results.monitoringData = await testMonitoringData();
  console.log('');
  
  // Summary
  console.log('📋 Test Results Summary:');
  console.log(`   - Cron Settings: ${results.cronSettings ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`   - Data Collection: ${results.dataCollection ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`   - Job Status: ${results.jobStatus ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`   - Monitoring Data: ${results.monitoringData ? '✅ PASS' : '❌ FAIL'}`);
  
  const allPassed = Object.values(results).every(result => result);
  console.log('');
  console.log(allPassed ? '🎉 All tests passed! Cron system is working correctly.' : '⚠️ Some tests failed. Check the errors above.');
  
  return allPassed;
}

// Run the test if this script is executed directly
if (require.main === module) {
  runFullTest()
    .then(success => {
      process.exit(success ? 0 : 1);
    })
    .catch(error => {
      console.error('💥 Test script failed:', error.message);
      process.exit(1);
    });
}

module.exports = {
  runFullTest,
  testCronSettings,
  testDataCollection,
  testJobStatus,
  testMonitoringData
};
