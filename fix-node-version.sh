#!/bin/bash

echo "🔧 Fixing Node.js Version for Next.js 14 Compatibility"
echo "=================================================="

# Check current Node.js version
echo "📋 Current Node.js version:"
node --version

# Check if we're in WSL
if grep -q Microsoft /proc/version; then
    echo "✅ Running in WSL environment"
else
    echo "⚠️ Not running in WSL - this script is designed for WSL"
fi

echo ""
echo "🚀 Updating Node.js to version 18.x.x..."
echo "This will fix the 'SyntaxError: Unexpected token ?' error"

# Update Node.js using NodeSource repository
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

echo ""
echo "✅ Node.js update completed!"
echo "📋 New Node.js version:"
node --version
echo "📋 New npm version:"
npm --version

echo ""
echo "🎯 Now you can start the development server:"
echo "npm run dev"
echo ""
echo "💡 The Historical Data page should work properly once the server is running!"
