// src/config/database.js - ✅ WITH LATEST OPTIONS
const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    // ✅ Latest Mongoose options
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      connectTimeoutMS: 10000,
      maxPoolSize: 10,
      minPoolSize: 2,
    });

    console.log('');
    console.log('='.repeat(50));
    console.log('✅ MongoDB Connected Successfully');
    console.log('='.repeat(50));
    console.log(`📡 Host: ${conn.connection.host}`);
    console.log(`📊 Database: ${conn.connection.db.databaseName}`);
    console.log(`🔗 Port: ${conn.connection.port}`);
    console.log('='.repeat(50));
    console.log('');

    mongoose.connection.on('error', (err) => {
      console.error('❌ MongoDB connection error:', err.message);
    });

    mongoose.connection.on('disconnected', () => {
      console.warn('⚠️ MongoDB disconnected');
    });

    return conn;
  } catch (error) {
    console.error('');
    console.error('='.repeat(50));
    console.error('❌ MongoDB Connection Failed');
    console.error('='.repeat(50));
    console.error(`Error: ${error.message}`);
    console.error('='.repeat(50));
    console.error('');
    
    if (process.env.NODE_ENV === 'production') {
      console.log('🔄 Retrying connection in 5 seconds...');
      setTimeout(() => connectDB(), 5000);
    } else {
      process.exit(1);
    }
  }
};

module.exports = connectDB;