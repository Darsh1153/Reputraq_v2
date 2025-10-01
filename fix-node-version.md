# 🚀 Quick Fix for Node.js Version Issue

## The Problem
Your Node.js version is too old for Next.js 14. The error shows:
```
SyntaxError: Unexpected token '?'
```

This means your Node.js doesn't support optional chaining (`?.`) which was introduced in Node.js 14.

## 🔧 Solutions

### Option 1: Update Node.js (Recommended)
```bash
# In WSL Ubuntu terminal:
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Verify version
node --version  # Should show v18.x.x or higher
npm --version
```

### Option 2: Use Node Version Manager (nvm)
```bash
# Install nvm
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash

# Reload terminal
source ~/.bashrc

# Install and use Node.js 18
nvm install 18
nvm use 18

# Verify
node --version
```

### Option 3: Quick Workaround - Use Older Next.js
If you can't update Node.js right now, downgrade Next.js:

```bash
# In your project directory
npm install next@13.5.6
npm run dev
```

## 🚀 After Fixing Node.js

Once your server starts properly:

1. **Start server**: `npm run dev`
2. **Open**: `http://localhost:3000/trigger-data-now.html`
3. **Follow the steps** to trigger data collection
4. **Check dashboard** for data

## 🆘 Alternative: Manual Data Collection

If you can't start the server, you can manually add some test data to see the UI working:

1. **Open browser console** on your dashboard
2. **Paste this code** to add test data:

```javascript
// Add test data to localStorage
const testData = [
  {
    keyword: "test keyword",
    newsData: {
      results: [
        {
          id: "1",
          title: "Test News Article",
          description: "This is a test article to verify the UI is working.",
          url: "https://example.com",
          publishedAt: new Date().toISOString(),
          source: { name: "Test Source" },
          sentiment: { score: 10, label: "positive" },
          engagement: { views: 100, shares: 5, comments: 2 }
        }
      ]
    },
    socialData: { data: [] },
    timestamp: new Date().toISOString()
  }
];

// Store in localStorage
localStorage.setItem('testMonitoringData', JSON.stringify(testData));
console.log('✅ Test data added! Refresh the page to see it.');
```

## 📋 Quick Checklist

- [ ] Update Node.js to version 18+ OR downgrade Next.js to 13.x
- [ ] Start server with `npm run dev`
- [ ] Use `trigger-data-now.html` to collect real data
- [ ] Check dashboard for results

## 🎯 Expected Result

After fixing Node.js and starting the server, you should see:
- Server running on `http://localhost:3000`
- Dashboard showing collected data
- Cron job automatically running every 24 hours
