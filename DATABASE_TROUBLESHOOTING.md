# Database Connection Troubleshooting Guide

## Issue: CONNECT_TIMEOUT Error with Render PostgreSQL

You're experiencing connection timeouts when trying to connect to your Render PostgreSQL database. This guide will help you resolve this issue.

## ✅ What We've Fixed

1. **Increased Connection Timeout**: Changed from 5 seconds to 30 seconds
2. **Added Retry Logic**: 3 retry attempts with exponential backoff
3. **Improved Connection Pool**: Increased max connections from 2 to 10
4. **Added SSL Configuration**: Proper SSL settings for production
5. **Better Error Handling**: More detailed error messages and cleanup

## 🔧 Immediate Steps to Fix

### 1. Check Your Environment Variables

Make sure your `DATABASE_URL` is correctly set in your environment:

```bash
# Check if DATABASE_URL is set
echo $DATABASE_URL

# Should look like:
# postgresql://username:password@dpg-d33h547diees739isip0-a:5432/database_name?sslmode=require
```

### 2. Verify Render Database Status

1. Go to your Render dashboard
2. Check if your PostgreSQL database is running
3. Look for any maintenance or restart notifications
4. Check the database logs for any errors

### 3. Test Database Connection

Run the test script we created:

```bash
node scripts/test-db-connection.js
```

### 4. Check Network Connectivity

If you're running locally, test if you can reach the database:

```bash
# Test if the host is reachable
ping dpg-d33h547diees739isip0-a

# Test if the port is open
telnet dpg-d33h547diees739isip0-a 5432
```

## 🚨 Common Causes and Solutions

### 1. Database is Sleeping (Most Common)
**Problem**: Render free tier databases sleep after inactivity
**Solution**: 
- Upgrade to a paid plan, OR
- Implement a keep-alive mechanism

### 2. Incorrect Connection String
**Problem**: Missing SSL parameters or wrong format
**Solution**: Ensure your DATABASE_URL includes `?sslmode=require`

### 3. Firewall/Network Issues
**Problem**: Your IP might be blocked
**Solution**: 
- Check Render's IP allowlist
- Try from a different network

### 4. Database Resource Limits
**Problem**: Too many connections or resource limits
**Solution**: 
- Reduce connection pool size
- Check Render's resource usage

## 🔄 Keep-Alive Solution

If you're on Render's free tier, add this to your app to prevent the database from sleeping:

```javascript
// Add this to your app startup
setInterval(async () => {
  try {
    const db = await getDatabase();
    await db.execute('SELECT 1');
  } catch (error) {
    console.log('Keep-alive ping failed:', error.message);
  }
}, 300000); // Every 5 minutes
```

## 📊 Monitoring

Use the health check endpoint to monitor your database:

```bash
curl http://localhost:3000/api/health/db
```

## 🆘 If Nothing Works

1. **Restart your Render database**
2. **Check Render's status page** for outages
3. **Contact Render support** with your database URL (without password)
4. **Consider upgrading** to a paid plan for better reliability

## 📝 Environment Variables Checklist

Make sure these are set in your `.env.local`:

```env
DATABASE_URL=postgresql://username:password@dpg-d33h547diees739isip0-a:5432/database_name?sslmode=require
NODE_ENV=production
```

## 🔍 Debug Commands

```bash
# Test connection with psql
psql "postgresql://username:password@dpg-d33h547diees739isip0-a:5432/database_name?sslmode=require"

# Check environment variables
printenv | grep DATABASE

# Test with curl
curl -X GET http://localhost:3000/api/health/db
```
