import mongoose from 'mongoose';

// Extend the NodeJS global type to include the mongoose cache
declare global {
  // eslint-disable-next-line no-var
  var mongoose: {
    conn: typeof import('mongoose') | null;
    promise: Promise<typeof import('mongoose')> | null;
  };
}

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

/**
 * Returns a cached Mongoose connection, creating one if it doesn't exist.
 * Uses a module-level cache to avoid exhausting the MongoDB Atlas free-tier
 * connection pool across Vercel serverless function invocations.
 */
export async function connectDB() {
  if (cached.conn) return cached.conn;

  if (!process.env.MONGODB_URI) {
    throw new Error('Please define the MONGODB_URI environment variable in .env.local');
  }

  cached.promise = mongoose.connect(process.env.MONGODB_URI!);
  cached.conn = await cached.promise;

  return cached.conn;
}
