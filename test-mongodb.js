const { MongoClient } = require('mongodb');

// Configuration
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://username:password@cluster.mongodb.net/investment-tracker';
const DB_NAME = 'investment-tracker';

async function testMongoDBConnection() {
  console.log('\n🔍 Testing MongoDB Atlas Connection...\n');
  
  try {
    // Connect to MongoDB
    const client = new MongoClient(MONGODB_URI, { 
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      maxPoolSize: 10,
      minPoolSize: 1,
    });
    
    console.log('📡 Connecting to MongoDB Atlas...');
    await client.connect();
    console.log('✅ Connected successfully!\n');
    
    // Get database
    const db = client.db(DB_NAME);
    console.log(`📂 Database: ${db.databaseName}\n`);
    
    // List collections
    const collections = await db.listCollections().toArray();
    console.log('📊 Collections in database:');
    collections.forEach((col, index) => {
      const count = await col.countDocuments();
      console.log(`  ${index + 1}. ${col.name}: ${count} documents`);
    });
    
    // Test write operation (create a test document)
    try {
      const testCollection = db.collection('test_connection');
      const result = await testCollection.insertOne({
        timestamp: new Date(),
        message: 'MongoDB Atlas connection test successful!',
        environment: process.env.NODE_ENV || 'development'
      });
      
      console.log(`\n✅ Write test: Inserted document with ID ${result.insertedId}\n`);
      
      // Clean up test document
      await testCollection.deleteOne({ _id: result.insertedId });
      console.log('🧹 Cleanup: Removed test document\n');
    } catch (writeError) {
      console.log(`⚠️  Write test skipped or failed: ${writeError.message}\n`);
    }
    
    // Get server info
    const serverInfo = await db.admin().serverStatus();
    console.log('🖥️  Server Info:');
    console.log(`  Process ID: ${serverInfo.process}`);
    console.log(`  Uptime: ${Math.floor(serverInfo.uptime / 60)} minutes\n`);
    
    // Close connection
    await client.close();
    console.log('🔌 Connection closed.\n');
    
    console.log('=' .repeat(50));
    console.log('✅ MongoDB Atlas setup is working correctly!');
    console.log('=' .repeat(50) + '\n');
    
  } catch (error) {
    console.error('\n❌ Connection failed!');
    console.error(`Error: ${error.message}`);
    console.error('\n💡 Troubleshooting tips:');
    console.error('  1. Check that your MONGODB_URI is correct in .env.local');
    console.error('  2. Verify Network Access settings in Atlas (allow IP 0.0.0.0/0 for dev)');
    console.error('  3. Ensure database user was created with read/write permissions');
    console.error('  4. Check that cluster is deployed and ready\n');
    
    process.exit(1);
  }
}

// Run the test
testMongoDBConnection();