import mongoose from 'mongoose';
import * as dotenv from "dotenv"
const env = dotenv.config()
const connectDB = async () => {
  const uri = process.env.MONGO_URI;

  if (!uri) {
    console.error("❌ MongoDB URI is missing! Check your .env file.");
    process.exit(1);
  }

  try {
    await mongoose.connect(uri, {
    });
    console.log("✅ MongoDB Connected Successfully!");
  } catch (error) {
    console.error("❌ MongoDB Connection Error:", (error as Error).message);
    process.exit(1);
  }
};

// Auto-reconnect on disconnect
mongoose.connection.on('disconnected', () => {
  console.warn('⚠️ MongoDB disconnected. Attempting to reconnect...');
  setTimeout(connectDB, 5000);
});

mongoose.connection.on('error', (err: Error) => {
  console.error('❌ MongoDB error:', err);
});

export default connectDB;
