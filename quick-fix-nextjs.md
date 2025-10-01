# Quick Fix: Downgrade Next.js for Node.js Compatibility

## 🎯 Problem
The server fails to start with `SyntaxError: Unexpected token '?'` due to Node.js version incompatibility with Next.js 14.

## ✅ Quick Solution
Downgrade Next.js to a compatible version that works with your current Node.js version.

## 🚀 Steps

### Option 1: Downgrade Next.js (Fastest)
```bash
# Install compatible Next.js version
npm install next@13.5.6

# Start the server
npm run dev
```

### Option 2: Update Node.js (Recommended)
```bash
# Update Node.js to version 18.x.x
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Verify installation
node --version
npm --version

# Start the server
npm run dev
```

## 🎯 Expected Results
After either fix:
- ✅ Server starts without errors
- ✅ Historical Data page works properly
- ✅ All API endpoints are accessible
- ✅ Data collection functions correctly

## 💡 Why This Happens
Next.js 14 uses modern JavaScript syntax (optional chaining `?.`) that requires Node.js 14+ with proper support. Older Node.js versions don't support this syntax.

## 🔍 Verification
Once the server is running:
1. Open `http://localhost:3000/dashboard/historical`
2. The Historical Data page should load without "No Data Found"
3. You can trigger data collection and see results
