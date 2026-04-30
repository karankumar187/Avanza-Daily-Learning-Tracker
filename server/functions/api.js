const serverless = require('serverless-http');
const mongoose = require('mongoose');
const app = require('../server');

// Initialize passport strategies before handling request
require('../config/passportConfig')();

// Define handler outside to reuse database connection across invocations
let serverlessHandler;

module.exports.handler = async (event, context) => {
  // Make sure to add this so you can re-use `conn` between function calls.
  // See https://www.mongodb.com/blog/post/serverless-development-with-nodejs-aws-lambda-mongodb-atlas
  context.callbackWaitsForEmptyEventLoop = false;

  // Because serverless functions can spin up and down, we must ensure MongoDB is connected
  if (mongoose.connection.readyState !== 1) {
    try {
      console.log('Connecting to MongoDB...');
      await mongoose.connect(process.env.MONGODB_URI, {
        maxPoolSize: 10, // reuse connections across warm serverless functions
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000,
      });
      console.log('MongoDB connected');
    } catch (err) {
      console.error('MongoDB connection error:', err);
      return {
        statusCode: 500,
        body: JSON.stringify({ error: 'Database connection failed' })
      };
    }
  }

  // Initialize serverless-http once
  if (!serverlessHandler) {
    serverlessHandler = serverless(app);
  }

  // Pass execution to the Express app via serverless-http
  return serverlessHandler(event, context);
};
