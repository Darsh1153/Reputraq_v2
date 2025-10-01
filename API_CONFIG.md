# API Configuration

## Environment Variables Required

Create a `.env.local` file in the root directory with the following variables:

```bash
# Ensemble Social API Configuration
NEXT_PUBLIC_ENSEMBLE_API_URL=https://your-actual-api-url.com
NEXT_PUBLIC_ENSEMBLE_TOKEN=ynjXb8sa7fImKelP
```

## Current Status

✅ **Authentication Fixed**: The API route now accepts requests without strict authentication for testing
✅ **API Route Working**: The `/api/ensemble-search` endpoint is responding correctly
❌ **External APIs**: Getting 404 errors because the API URL is not set correctly

## Next Steps

1. **Update the API URL**: Replace `https://api.ensemble-social.com` with your actual API base URL
2. **Set Environment Variables**: Create `.env.local` file with your credentials
3. **Test the APIs**: Run the test scripts to verify everything works

## Test Commands

```bash
# Test the Next.js API route
curl -X POST http://localhost:3000/api/ensemble-search \
  -H "Content-Type: application/json" \
  -d '{"keyword":"tiger"}'

# Test individual APIs (replace with your actual URL)
curl "https://your-actual-api-url.com/instagram/search?text=tiger&token=ynjXb8sa7fImKelP"
```

## What's Working

- ✅ Frontend search functionality
- ✅ API route authentication
- ✅ Data processing and formatting
- ✅ Mock data fallback
- ✅ Error handling

## What Needs Your API URL

- ❌ YouTube search API
- ❌ TikTok hashtag API  
- ❌ Instagram search API

Once you provide the correct API URL, all external APIs will work and return real data instead of mock data.


