const { getDatabase, isDatabaseHealthy, closeDatabase } = require('../lib/db/connection');

async function testDatabaseConnection() {
  console.log('🔍 Testing database connection...');
  
  try {
    // Test basic connection
    console.log('1. Testing basic connection...');
    const db = await getDatabase();
    console.log('✅ Database connection established');
    
    // Test health check
    console.log('2. Testing health check...');
    const isHealthy = await isDatabaseHealthy();
    if (isHealthy) {
      console.log('✅ Database health check passed');
    } else {
      console.log('❌ Database health check failed');
    }
    
    // Test a simple query
    console.log('3. Testing simple query...');
    const result = await db.execute('SELECT NOW() as current_time, version() as postgres_version');
    console.log('✅ Query executed successfully');
    console.log('📊 Query result:', result[0]);
    
    console.log('\n🎉 All database tests passed!');
    
  } catch (error) {
    console.error('❌ Database connection test failed:');
    console.error('Error type:', error.constructor.name);
    console.error('Error message:', error.message);
    console.error('Error code:', error.code);
    console.error('Full error:', error);
    
    // Check if it's a connection timeout
    if (error.code === 'CONNECT_TIMEOUT') {
      console.log('\n💡 Connection timeout detected. This might be due to:');
      console.log('   - Network connectivity issues');
      console.log('   - Database server being down');
      console.log('   - Firewall blocking the connection');
      console.log('   - Incorrect DATABASE_URL');
    }
    
    process.exit(1);
  } finally {
    console.log('\n🔌 Closing database connection...');
    await closeDatabase();
    console.log('✅ Database connection closed');
  }
}

// Run the test
testDatabaseConnection();
