// MongoDB Connection
import mongoose from 'mongoose';
import config from '@config';
import logger from '@utils/logger';

let isConnected = false;

export async function connectMongoDB(): Promise<void> {
  if (isConnected) {
    logger.info('MongoDB already connected');
    return;
  }

  try {
    await mongoose.connect(config.mongodb.uri);
    isConnected = true;
    logger.info('MongoDB connected successfully');
  } catch (error) {
    logger.error('MongoDB connection failed:', error);
    throw error;
  }
}

export async function disconnectMongoDB(): Promise<void> {
  if (!isConnected) {
    return;
  }

  try {
    await mongoose.disconnect();
    isConnected = false;
    logger.info('MongoDB disconnected');
  } catch (error) {
    logger.error('MongoDB disconnection error:', error);
    throw error;
  }
}

export default mongoose;
