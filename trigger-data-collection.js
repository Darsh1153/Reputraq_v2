#!/usr/bin/env node

/**
 * Quick script to trigger data collection immediately
 */

const axios = require('axios');

const BASE_URL = 'http://localhost:3000';
const TEST_USER_ID = 1; // Change this to your actual user ID

// Helper function to create auth token
function createAuthToken(userId) {
  return Buffer.from(JSON.stringify({ userId })).toString('base64');
}

async function triggerDataCollection() {
  console.log('🚀 Triggering immediate data collection...');
  
  try {
    const token = createAuthToken(TEST_USER_ID);
    
    // Step 1: Check if user has keywords
    console.log('📋 Checking user keywords...');
    const keywordsResponse = await axios.get(`${BASE_URL}/api/keywords`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    const keywords = keywordsResponse.data;
    console.log(`✅ Found ${keywords.length} keywords:`, keywords.map(k => k.keyword));
    
    if (keywords.length === 0) {
      console.log('❌ No keywords found! Please add keywords first.');
      return;
    }
    
    // Step 2: Trigger data collection
    console.log('🔄 Triggering data collection...');
    const collectResponse = await axios.post(`${BASE_URL}/api/cron`, {
      action: 'runNow'
    }, {
      headers: { 
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ Data collection triggered successfully!');
    console.log('⏳ This may take a few minutes to complete...');
    
    // Step 3: Wait and check status
    console.log('📊 Checking job status...');
    await new Promise(resolve => setTimeout(resolve, 10000)); // Wait 10 seconds
    
    const statusResponse = await axios.post(`${BASE_URL}/api/cron`, {
      action: 'getJobHistory'
    }, {
      headers: { 
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    const jobs = statusResponse.data.jobs || [];
    if (jobs.length > 0) {
      const latestJob = jobs[jobs.length - 1];
      console.log(`📈 Latest job status: ${latestJob.status}`);
      console.log(`   - Keywords: ${latestJob.keywords?.length || 0}`);
      console.log(`   - Processed: ${latestJob.processedKeywords || 0}/${latestJob.totalKeywords || 0}`);
    }
    
    // Step 4: Check monitoring data
    console.log('📈 Checking monitoring data...');
    const monitoringResponse = await axios.get(`${BASE_URL}/api/data/monitoring`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    const data = monitoringResponse.data.monitoringData || [];
    console.log(`✅ Monitoring data: ${data.length} keywords processed`);
    
    if (data.length > 0) {
      let totalNews = 0;
      let totalSocial = 0;
      
      data.forEach((item, index) => {
        const newsCount = item.newsData?.results?.length || 0;
        const socialCount = item.socialData?.data?.length || 0;
        totalNews += newsCount;
        totalSocial += socialCount;
        
        console.log(`   - "${item.keyword}": ${newsCount} news, ${socialCount} social`);
      });
      
      console.log(`📊 Total: ${totalNews} news articles, ${totalSocial} social posts`);
    }
    
    console.log('🎉 Data collection completed! Check your dashboard now.');
    
  } catch (error) {
    if (error.response) {
      console.error('❌ Error:', error.response.status, error.response.data?.error || error.response.statusText);
    } else {
      console.error('❌ Error:', error.message);
    }
  }
}

// Run the script
triggerDataCollection();
