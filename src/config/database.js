const dotenv = require('dotenv');
const mongoose = require('mongoose');

dotenv.config();

async function connectDatabase() {
  const mongoUri = process.env.MONGO_URI || 'mongodb://mongodb:27017/taskflow';

  await mongoose.connect(mongoUri, {
    serverSelectionTimeoutMS: 5000,
  });

  console.log('MongoDB connected');
}

module.exports = { connectDatabase };
