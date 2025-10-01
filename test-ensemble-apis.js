// Test script for Ensemble Social APIs
// Run with: node test-ensemble-apis.js

const axios = require('axios');

// Configuration
const baseUrl = process.env.NEXT_PUBLIC_ENSEMBLE_API_URL || 'https://your-base-url.com';
const token = process.env.NEXT_PUBLIC_ENSEMBLE_TOKEN || 'ynjXb8sa7fImKelP';

const testKeyword = 'keyboard';

console.log('🧪 Testing Ensemble Social APIs...');
console.log(`Base URL: ${baseUrl}`);
console.log(`Token: ${token}`);
console.log(`Test Keyword: ${testKeyword}`);
console.log('='.repeat(50));

// Test 1: YouTube Search
async function testYouTubeSearch() {
  console.log('\n📺 Testing YouTube Search API...');
  try {
    const response = await axios.get(`${baseUrl}/youtube/search`, {
      params: {
        keyword: testKeyword,
        depth: 1,
        start_cursor: '',
        period: 'overall',
        sorting: 'relevance',
        get_additional_info: false,
        token: token
      },
      timeout: 30000
    });
    
    console.log('✅ YouTube Search API - SUCCESS');
    console.log(`Status: ${response.status}`);
    console.log(`Data structure:`, Object.keys(response.data));
    console.log(`Posts found: ${response.data?.data?.posts?.length || 0}`);
    
    if (response.data?.data?.posts?.length > 0) {
      const firstPost = response.data.data.posts[0];
      console.log('Sample post structure:', Object.keys(firstPost));
    }
    
    return response.data;
  } catch (error) {
    console.log('❌ YouTube Search API - FAILED');
    console.log('Error:', error.message);
    if (error.response) {
      console.log('Status:', error.response.status);
      console.log('Response:', error.response.data);
    }
    return null;
  }
}

// Test 2: YouTube Hashtag Search
async function testYouTubeHashtag() {
  console.log('\n🏷️ Testing YouTube Hashtag API...');
  try {
    const response = await axios.get(`${baseUrl}/youtube/hashtag/search`, {
      params: {
        name: testKeyword,
        depth: 1,
        only_shorts: false,
        token: token
      },
      timeout: 30000
    });
    
    console.log('✅ YouTube Hashtag API - SUCCESS');
    console.log(`Status: ${response.status}`);
    console.log(`Data structure:`, Object.keys(response.data));
    
    return response.data;
  } catch (error) {
    console.log('❌ YouTube Hashtag API - FAILED');
    console.log('Error:', error.message);
    if (error.response) {
      console.log('Status:', error.response.status);
      console.log('Response:', error.response.data);
    }
    return null;
  }
}

// Test 3: TikTok Hashtag Search
async function testTikTokHashtag() {
  console.log('\n🎵 Testing TikTok Hashtag API...');
  try {
    const response = await axios.get(`${baseUrl}/tt/hashtag/posts`, {
      params: {
        name: testKeyword,
        cursor: 0,
        token: token
      },
      timeout: 30000
    });
    
    console.log('✅ TikTok Hashtag API - SUCCESS');
    console.log(`Status: ${response.status}`);
    console.log(`Data structure:`, Object.keys(response.data));
    console.log(`Posts found: ${response.data?.data?.posts?.length || 0}`);
    
    return response.data;
  } catch (error) {
    console.log('❌ TikTok Hashtag API - FAILED');
    console.log('Error:', error.message);
    if (error.response) {
      console.log('Status:', error.response.status);
      console.log('Response:', error.response.data);
    }
    return null;
  }
}

// Test 4: Instagram Search
async function testInstagramSearch() {
  console.log('\n📸 Testing Instagram Search API...');
  try {
    const response = await axios.get(`${baseUrl}/instagram/search`, {
      params: {
        text: testKeyword,
        token: token
      },
      timeout: 30000
    });
    
    console.log('✅ Instagram Search API - SUCCESS');
    console.log(`Status: ${response.status}`);
    console.log(`Data structure:`, Object.keys(response.data));
    console.log(`Posts found: ${response.data?.data?.posts?.length || 0}`);
    
    return response.data;
  } catch (error) {
    console.log('❌ Instagram Search API - FAILED');
    console.log('Error:', error.message);
    if (error.response) {
      console.log('Status:', error.response.status);
      console.log('Response:', error.response.data);
    }
    return null;
  }
}

// Test 5: Our Ensemble Search API
async function testEnsembleSearchAPI() {
  console.log('\n🔗 Testing Our Ensemble Search API...');
  try {
    const response = await axios.post('http://localhost:3000/api/ensemble-search', {
      keyword: testKeyword
    }, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer test-token' // You'll need a real token
      },
      timeout: 60000
    });
    
    console.log('✅ Ensemble Search API - SUCCESS');
    console.log(`Status: ${response.status}`);
    console.log(`Data structure:`, Object.keys(response.data));
    
    return response.data;
  } catch (error) {
    console.log('❌ Ensemble Search API - FAILED');
    console.log('Error:', error.message);
    if (error.response) {
      console.log('Status:', error.response.status);
      console.log('Response:', error.response.data);
    }
    return null;
  }
}

// Run all tests
async function runAllTests() {
  console.log('🚀 Starting comprehensive API testing...\n');
  
  const results = {
    youtube: await testYouTubeSearch(),
    youtubeHashtag: await testYouTubeHashtag(),
    tiktok: await testTikTokHashtag(),
    instagram: await testInstagramSearch(),
    ensemble: await testEnsembleSearchAPI()
  };
  
  console.log('\n' + '='.repeat(50));
  console.log('📊 TEST SUMMARY');
  console.log('='.repeat(50));
  
  const successCount = Object.values(results).filter(result => result !== null).length;
  const totalTests = Object.keys(results).length;
  
  console.log(`✅ Successful: ${successCount}/${totalTests}`);
  console.log(`❌ Failed: ${totalTests - successCount}/${totalTests}`);
  
  if (successCount === totalTests) {
    console.log('\n🎉 ALL TESTS PASSED! Your APIs are working perfectly!');
  } else {
    console.log('\n⚠️ Some tests failed. Check the errors above.');
  }
  
  return results;
}

// Run the tests
runAllTests().catch(console.error);


