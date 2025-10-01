# 🧪 Complete Testing Guide for Ensemble Social APIs

## 📋 **Testing Checklist**

### **1. Environment Setup**
- [ ] Set environment variables in `.env.local`
- [ ] Verify API endpoints are accessible
- [ ] Check authentication tokens

### **2. API Endpoint Testing**
- [ ] Test individual API endpoints
- [ ] Verify response data structure
- [ ] Check error handling

### **3. Frontend Testing**
- [ ] Test social listening search
- [ ] Test hashtag finder
- [ ] Verify data visualization
- [ ] Check error states

### **4. Integration Testing**
- [ ] Test complete search flow
- [ ] Verify data processing
- [ ] Check fallback mechanisms

---

## 🔧 **Step 1: Environment Setup**

### **Create `.env.local` file:**
```bash
# Ensemble Social API Configuration
NEXT_PUBLIC_ENSEMBLE_API_URL=https://your-actual-base-url.com
NEXT_PUBLIC_ENSEMBLE_TOKEN=ynjXb8sa7fImKelP
```

### **Install dependencies (if needed):**
```bash
npm install axios
```

---

## 🚀 **Step 2: Run API Tests**

### **Option A: Automated Testing Script**
```bash
# Run the comprehensive test script
node test-ensemble-apis.js
```

### **Option B: Manual API Testing**

#### **Test YouTube Search:**
```bash
curl "https://your-base-url.com/youtube/search?keyword=keyboard&depth=1&start_cursor=&period=overall&sorting=relevance&get_additional_info=false&token=ynjXb8sa7fImKelP"
```

#### **Test YouTube Hashtag:**
```bash
curl "https://your-base-url.com/youtube/hashtag/search?name=keyboard&depth=1&only_shorts=false&token=ynjXb8sa7fImKelP"
```

#### **Test TikTok Hashtag:**
```bash
curl "https://your-base-url.com/tt/hashtag/posts?name=keyboard&cursor=0&token=ynjXb8sa7fImKelP"
```

#### **Test Instagram Search:**
```bash
curl "https://your-base-url.com/instagram/search?text=keyboard&token=ynjXb8sa7fImKelP"
```

---

## 🌐 **Step 3: Frontend Testing**

### **Start the Development Server:**
```bash
npm run dev
```

### **Test Social Listening Page:**
1. **Navigate to:** `http://localhost:3000/dashboard/social-listening`
2. **Test Search:**
   - Enter "keyboard" in search box
   - Click "Search" button
   - Verify results appear
   - Check browser console for API calls

### **Test Hashtag Finder:**
1. **Navigate to:** `http://localhost:3000/dashboard/hashtag-finder`
2. **Test Search:**
   - Enter "keyboard" in search box
   - Click "Search" button
   - Verify hashtag suggestions appear

### **Test Social Listening Finder:**
1. **Navigate to:** `http://localhost:3000/dashboard/social-listening-finder`
2. **Test Search:**
   - Enter "keyboard" in search box
   - Click "Search" button
   - Verify social content appears

---

## 🔍 **Step 4: Detailed Testing Scenarios**

### **Scenario 1: Basic Search**
- **Input:** "keyboard"
- **Expected:** Results from YouTube, TikTok, Instagram
- **Check:** Data appears in correct format

### **Scenario 2: Multi-word Search**
- **Input:** "machine learning"
- **Expected:** Results for both words
- **Check:** Proper URL encoding

### **Scenario 3: Special Characters**
- **Input:** "AI & ML"
- **Expected:** Handles special characters
- **Check:** No errors in API calls

### **Scenario 4: Empty Search**
- **Input:** ""
- **Expected:** Error message or default behavior
- **Check:** Graceful error handling

### **Scenario 5: API Failure**
- **Simulate:** Network error or API down
- **Expected:** Fallback to mock data
- **Check:** User sees mock results, not error

---

## 📊 **Step 5: Data Validation**

### **Check YouTube Data:**
- [ ] Video titles are extracted
- [ ] Thumbnails are displayed
- [ ] View counts are parsed correctly
- [ ] Channel names are shown
- [ ] Shorts are detected properly

### **Check TikTok Data:**
- [ ] Post text is displayed
- [ ] Engagement metrics are shown
- [ ] Author profiles are correct
- [ ] Hashtags are extracted
- [ ] Video URLs are valid

### **Check Instagram Data:**
- [ ] Captions are displayed
- [ ] Images/videos are shown
- [ ] Like/comment counts are correct
- [ ] User profiles are accurate
- [ ] Hashtags are extracted

---

## 🐛 **Step 6: Error Testing**

### **Test Network Errors:**
1. Disconnect internet
2. Try searching
3. Verify fallback to mock data

### **Test API Errors:**
1. Use invalid token
2. Try searching
3. Check error handling

### **Test Invalid Input:**
1. Enter very long search terms
2. Use special characters
3. Check validation

---

## 📈 **Step 7: Performance Testing**

### **Test Response Times:**
- [ ] YouTube API: < 10 seconds
- [ ] TikTok API: < 10 seconds
- [ ] Instagram API: < 10 seconds
- [ ] Overall search: < 30 seconds

### **Test Concurrent Searches:**
- [ ] Multiple users searching simultaneously
- [ ] Rate limiting handling
- [ ] Memory usage

---

## ✅ **Step 8: Success Criteria**

### **All tests pass when:**
- [ ] All 4 API endpoints return data
- [ ] Frontend displays results correctly
- [ ] Data processing works properly
- [ ] Error handling is graceful
- [ ] Performance is acceptable
- [ ] No console errors

### **Expected Console Output:**
```
🧪 Testing Ensemble Social APIs...
Base URL: https://your-base-url.com
Token: ynjXb8sa7fImKelP
Test Keyword: keyboard
==================================================

📺 Testing YouTube Search API...
✅ YouTube Search API - SUCCESS
Status: 200
Data structure: ['data']
Posts found: 5

🏷️ Testing YouTube Hashtag API...
✅ YouTube Hashtag API - SUCCESS
Status: 200

🎵 Testing TikTok Hashtag API...
✅ TikTok Hashtag API - SUCCESS
Status: 200
Posts found: 3

📸 Testing Instagram Search API...
✅ Instagram Search API - SUCCESS
Status: 200
Posts found: 4

🔗 Testing Our Ensemble Search API...
✅ Ensemble Search API - SUCCESS
Status: 200

==================================================
📊 TEST SUMMARY
==================================================
✅ Successful: 5/5
❌ Failed: 0/5

🎉 ALL TESTS PASSED! Your APIs are working perfectly!
```

---

## 🆘 **Troubleshooting**

### **Common Issues:**

#### **1. API Connection Failed**
- Check base URL is correct
- Verify token is valid
- Check network connectivity

#### **2. No Data Returned**
- Check API response format
- Verify data processing logic
- Check console for errors

#### **3. Frontend Not Loading**
- Check environment variables
- Verify Next.js server is running
- Check browser console for errors

#### **4. Type Errors**
- Check TypeScript compilation
- Verify interface definitions
- Check data structure matches

### **Debug Commands:**
```bash
# Check environment variables
echo $NEXT_PUBLIC_ENSEMBLE_API_URL
echo $NEXT_PUBLIC_ENSEMBLE_TOKEN

# Check Next.js build
npm run build

# Check TypeScript
npx tsc --noEmit

# Check linting
npm run lint
```

---

## 🎯 **Quick Test Commands**

```bash
# Run all tests
node test-ensemble-apis.js

# Start development server
npm run dev

# Check specific API
curl "https://your-base-url.com/youtube/search?keyword=test&token=your-token"

# Check our API
curl -X POST http://localhost:3000/api/ensemble-search \
  -H "Content-Type: application/json" \
  -d '{"keyword":"test"}'
```

---

## 📝 **Test Results Template**

```
Test Date: ___________
Tester: ___________
Environment: ___________

API Tests:
- [ ] YouTube Search: PASS/FAIL
- [ ] YouTube Hashtag: PASS/FAIL  
- [ ] TikTok Hashtag: PASS/FAIL
- [ ] Instagram Search: PASS/FAIL
- [ ] Ensemble API: PASS/FAIL

Frontend Tests:
- [ ] Social Listening: PASS/FAIL
- [ ] Hashtag Finder: PASS/FAIL
- [ ] Social Listening Finder: PASS/FAIL

Data Validation:
- [ ] YouTube Data: PASS/FAIL
- [ ] TikTok Data: PASS/FAIL
- [ ] Instagram Data: PASS/FAIL

Error Handling:
- [ ] Network Errors: PASS/FAIL
- [ ] API Errors: PASS/FAIL
- [ ] Invalid Input: PASS/FAIL

Performance:
- [ ] Response Time: PASS/FAIL
- [ ] Concurrent Users: PASS/FAIL

Overall Result: PASS/FAIL
Notes: ___________
```


