const mongoose = require('mongoose')

async function connectDb() {
  try {
    const uri = process.env.MONGODB_URI || process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/waste'
    
    if (!uri || uri === 'mongodb://127.0.0.1:27017/waste') {
      console.warn('⚠️  Using default local MongoDB. Set MONGODB_URI in .env for MongoDB Atlas.')
    }
    
    mongoose.set('strictQuery', true)
    
    const options = {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    }
    
    await mongoose.connect(uri, options)
    console.log('✅ MongoDB connected successfully')
    
    mongoose.connection.on('error', (err) => {
      console.error('❌ MongoDB connection error:', err)
    })
    
    mongoose.connection.on('disconnected', () => {
      console.warn('⚠️  MongoDB disconnected')
    })
  } catch (error) {
    console.error('❌ Failed to connect to MongoDB:', error.message)
    throw error
  }
}

module.exports = { connectDb }


