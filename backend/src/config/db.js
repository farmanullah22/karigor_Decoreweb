const mongoose = require('mongoose');
const env = require('./env');

/**
 * Connect to MongoDB. Retries once on transient failures to be resilient
 * during local development when the database starts slightly later.
 */
async function connectDatabase(uri = env.mongodbUri) {
  mongoose.set('strictQuery', true);

  try {
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 8000,
    });
    // eslint-disable-next-line no-console
    console.log(`[db] MongoDB connected: ${mongoose.connection.host}/${mongoose.connection.name}`);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error(`[db] MongoDB connection failed: ${error.message}`);
    throw error;
  }
}

async function disconnectDatabase() {
  await mongoose.connection.close();
}

module.exports = { connectDatabase, disconnectDatabase };
