#!/usr/bin/env node

/**
 * Database Connection Troubleshooting Script
 * This script helps diagnose and fix database connection issues
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🔧 Database Connection Troubleshooting Script');
console.log('==============================================\n');

// Check if DATABASE_URL is set
console.log('1. Checking environment variables...');
const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  console.log('❌ DATABASE_URL is not set');
  console.log('💡 Create a .env.local file with:');
  console.log('   DATABASE_URL="postgresql://username:password@host:port/database?sslmode=require"');
  process.exit(1);
} else {
  console.log('✅ DATABASE_URL is set');
  
  // Parse and validate the URL
  try {
    const url = new URL(databaseUrl);
    console.log(`   Host: ${url.hostname}`);
    console.log(`   Port: ${url.port || '5432'}`);
    console.log(`   Database: ${url.pathname.slice(1)}`);
    console.log(`   SSL Mode: ${url.searchParams.get('sslmode') || 'not specified'}`);
  } catch (error) {
    console.log('❌ Invalid DATABASE_URL format');
    process.exit(1);
  }
}

// Test DNS resolution
console.log('\n2. Testing DNS resolution...');
try {
  const url = new URL(databaseUrl);
  const hostname = url.hostname;
  
  console.log(`Testing DNS resolution for: ${hostname}`);
  
  // Use nslookup or similar command
  try {
    if (process.platform === 'win32') {
      execSync(`nslookup ${hostname}`, { stdio: 'pipe' });
    } else {
      execSync(`nslookup ${hostname}`, { stdio: 'pipe' });
    }
    console.log('✅ DNS resolution successful');
  } catch (dnsError) {
    console.log('❌ DNS resolution failed');
    console.log('💡 This could be due to:');
    console.log('   - Network connectivity issues');
    console.log('   - DNS server problems');
    console.log('   - Incorrect hostname');
  }
} catch (error) {
  console.log('❌ Error testing DNS resolution:', error.message);
}

// Test network connectivity
console.log('\n3. Testing network connectivity...');
try {
  const url = new URL(databaseUrl);
  const hostname = url.hostname;
  const port = url.port || '5432';
  
  console.log(`Testing connection to ${hostname}:${port}`);
  
  // Use telnet or nc to test port connectivity
  try {
    if (process.platform === 'win32') {
      execSync(`powershell -Command "Test-NetConnection -ComputerName ${hostname} -Port ${port}"`, { stdio: 'pipe' });
    } else {
      execSync(`nc -z -v ${hostname} ${port}`, { stdio: 'pipe' });
    }
    console.log('✅ Network connectivity successful');
  } catch (netError) {
    console.log('❌ Network connectivity failed');
    console.log('💡 This could be due to:');
    console.log('   - Firewall blocking the connection');
    console.log('   - Database server is down');
    console.log('   - Database server is sleeping (Render free tier)');
  }
} catch (error) {
  console.log('❌ Error testing network connectivity:', error.message);
}

// Test database connection
console.log('\n4. Testing database connection...');
try {
  // Import the database connection
  const { getDatabase, isDatabaseHealthy, closeDatabase } = require('../lib/db/connection');
  
  async function testConnection() {
    try {
      console.log('Attempting to connect to database...');
      const db = await getDatabase();
      console.log('✅ Database connection established');
      
      const isHealthy = await isDatabaseHealthy();
      if (isHealthy) {
        console.log('✅ Database health check passed');
      } else {
        console.log('❌ Database health check failed');
      }
      
      // Test a simple query
      const result = await db.execute('SELECT NOW() as current_time, version() as postgres_version');
      console.log('✅ Query executed successfully');
      console.log(`   Current time: ${result[0].current_time}`);
      console.log(`   PostgreSQL version: ${result[0].postgres_version.split(' ')[0]}`);
      
    } catch (error) {
      console.log('❌ Database connection failed');
      console.log(`   Error: ${error.message}`);
      
      if (error.code === 'EAI_AGAIN') {
        console.log('💡 DNS resolution error. Try:');
        console.log('   - Check your internet connection');
        console.log('   - Try a different DNS server (8.8.8.8)');
        console.log('   - Verify the database hostname');
      } else if (error.code === 'CONNECT_TIMEOUT') {
        console.log('💡 Connection timeout. Try:');
        console.log('   - Check if database server is running');
        console.log('   - Verify firewall settings');
        console.log('   - Check if database is sleeping (Render free tier)');
      } else if (error.message.includes('authentication')) {
        console.log('💡 Authentication error. Check:');
        console.log('   - Username and password in DATABASE_URL');
        console.log('   - Database user permissions');
      }
    } finally {
      await closeDatabase();
    }
  }
  
  testConnection();
  
} catch (error) {
  console.log('❌ Error importing database connection:', error.message);
}

// Provide recommendations
console.log('\n5. Recommendations:');
console.log('==================');

if (databaseUrl.includes('render.com')) {
  console.log('🔍 Render PostgreSQL detected:');
  console.log('   - Free tier databases sleep after inactivity');
  console.log('   - Consider upgrading to paid plan for better reliability');
  console.log('   - Use keep-alive mechanism to prevent sleeping');
  console.log('   - Check Render dashboard for database status');
}

console.log('\n📋 Next Steps:');
console.log('1. Set DATABASE_URL in .env.local file');
console.log('2. Restart your application');
console.log('3. Check Render dashboard for database status');
console.log('4. Consider upgrading to paid Render plan');
console.log('5. Implement keep-alive mechanism');

console.log('\n🆘 If problems persist:');
console.log('1. Contact Render support');
console.log('2. Check Render status page for outages');
console.log('3. Try connecting from a different network');
console.log('4. Consider switching to a different database provider');
