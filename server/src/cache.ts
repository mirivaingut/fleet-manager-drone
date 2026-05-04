import { createClient } from 'redis';

let redisClient: any = null;
let isRedisConnected = false;

const initRedis = () => {
  if (!redisClient) {
    redisClient = createClient({
      url: process.env.REDIS_URL || 'redis://localhost:6379',
    });
  }
};

export const connectRedis = async () => {
  try {
    initRedis();
    await redisClient.connect();
    isRedisConnected = true;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.warn('Redis connection failed, caching disabled', message);
    redisClient = null;
  }
};

export const getCache = async (key: string): Promise<string | null> => {
  if (!isRedisConnected || !redisClient) return null;
  try {
    return await redisClient.get(key);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.warn('Redis get failed', message);
    return null;
  }
};

export const setCache = async (key: string, value: string, ttl: number = 300): Promise<void> => {
  if (!isRedisConnected || !redisClient) return;
  try {
    await redisClient.setEx(key, ttl, value);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.warn('Redis set failed', message);
  }
};

export const disconnectRedis = async () => {
  if (redisClient && isRedisConnected) {
    await redisClient.disconnect();
  }
};