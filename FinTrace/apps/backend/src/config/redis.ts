// Redis Connection
import { createClient, RedisClientType } from 'redis';
import config from '@config';
import logger from '@utils/logger';

let redisClient: RedisClientType | null = null;

export async function connectRedis(): Promise<RedisClientType> {
  if (redisClient?.isOpen) {
    logger.info('Redis already connected');
    return redisClient;
  }

  try {
    redisClient = createClient({
      url: config.redis.url,
      socket: {
        reconnectStrategy: (retries) => Math.min(retries * 50, 500),
      },
    });

    redisClient.on('error', (err) => logger.error('Redis error:', err));
    redisClient.on('connect', () => logger.info('Redis connected'));

    await redisClient.connect();
    logger.info('Redis connected successfully');
    return redisClient;
  } catch (error) {
    logger.error('Redis connection failed:', error);
    throw error;
  }
}

export function getRedisClient(): RedisClientType {
  if (!redisClient) {
    throw new Error('Redis client not initialized');
  }
  return redisClient;
}

export async function disconnectRedis(): Promise<void> {
  if (redisClient?.isOpen) {
    try {
      await redisClient.disconnect();
      redisClient = null;
      logger.info('Redis disconnected');
    } catch (error) {
      logger.error('Redis disconnection error:', error);
      throw error;
    }
  }
}

export default { connectRedis, getRedisClient, disconnectRedis };
