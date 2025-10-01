#!/usr/bin/env node

/**
 * Quick script to check keywords and trigger data collection
 */

const axios = require('axios');

const BASE_URL = 'http://localhost:3000';

// Helper function to create auth token
function createAuthToken(userId) {
  return Buffer.from(JSON.stringify({ userId })).toString('base64');
}

async function quickCheck() {
  console.log('🔍 Quick Data Check...');
  
  // Try different user IDs
  const userIds = [1, 2, 3];
  
  for (const userId of userIds) {
    try {
      console.log(`\n👤 Checking User ID: ${userId}`);
      
      const token = createAuthToken(userId);
      
      // Check if user exists and has keywords
      const keywordsResponse = await axios.get(`${BASE_URL}/api/keywords`, {
        headers: { 'Authorization': `Bearer ${token}` },
        timeout: 5000
      });
      
      const keywords = keywordsResponse.data;
      console.log(`✅ User ${userId} found with ${keywords.length} keywords`);
      
      if (keywords.length > 0) {
        console.log(`📋 Keywords: ${keywords.map(k => k.keyword).join(', ')}`);
        
        // Trigger data collection
        console.log('🔄 Triggering data collection...');
        const collectResponse = await axios.post(`${BASE_URL}/api/cron`, {
          action: 'runNow'
        }, {
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          timeout: 10000
        });
        
        console.log('✅ Data collection triggered successfully!');
        console.log('⏳ Please wait 2-3 minutes for data to be collected...');
        
        // Wait and check monitoring data
        setTimeout(async () => {
          try {
            const monitoringResponse = await axios.get(`${BASE_URL}/api/data/monitoring`, {
              headers: { 'Authorization': `Bearer ${token}` },
              timeout: 5000
            });
            
            const data = monitoringResponse.data.monitoringData || [];
            console.log(`📊 Monitoring data: ${data.length} keywords processed`);
            
            if (data.length > 0) {
              let totalNews = 0;
              data.forEach(item => {
                const newsCount = item.newsData?.results?.length || 0;
                totalNews += newsCount;
                console.log(`   - "${item.keyword}": ${newsCount} news articles`);
              });
              console.log(`📈 Total: ${totalNews} news articles collected`);
            }
          } catch (error) {
            console.log('⏳ Data collection still in progress...');
          }
        }, 30000); // Wait 30 seconds
        
        return; // Found a user with keywords, stop checking others
      } else {
        console.log(`⚠️ User ${userId} has no keywords`);
      }
      
    } catch (error) {
      if (error.response?.status === 401) {
        console.log(`❌ User ${userId} not found or unauthorized`);
      } else if (error.code === 'ECONNREFUSED') {
        console.log('❌ Server not running. Please start with: npm run dev');
        return;
      } else {
        console.log(`❌ Error checking user ${userId}:`, error.message);
      }
    }
  }
  
  console.log('\n💡 If no users have keywords, you need to:');
  console.log('1. Sign up/login to create a user');
  console.log('2. Add keywords to your account');
  console.log('3. Then run this script again');
}

// Run the check
quickCheck().catch(console.error);
