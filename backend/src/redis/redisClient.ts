import Redis from 'ioredis';

const REDIS_HOST = process.env.REDIS_HOST || 'localhost';
const REDIS_PORT = parseInt(process.env.REDIS_PORT || '6379', 10);
const REDIS_PASSWORD = process.env.REDIS_PASSWORD || undefined;

let redisClient: Redis | null = null;
let isConnected = false;

// Fallback in-memory cache store when Redis server is offline
const inMemoryCache = new Map<string, { value: string; expiresAt: number | null }>();

export const initRedis = (): Redis | null => {
  try {
    redisClient = new Redis({
      host: REDIS_HOST,
      port: REDIS_PORT,
      password: REDIS_PASSWORD,
      enableOfflineQueue: false,
      connectTimeout: 2000,
      maxRetriesPerRequest: 1,
      retryStrategy(times) {
        if (times > 3) {
          return null; // Stop retrying after 3 attempts
        }
        return 1000;
      }
    });

    redisClient.on('connect', () => {
      isConnected = true;
      console.log(`[Redis] Connected successfully to ${REDIS_HOST}:${REDIS_PORT}`);
    });

    redisClient.on('error', (err) => {
      if (isConnected) {
        console.warn(`[Redis] Connection error: ${err.message}. Switching to in-memory fallback cache.`);
      }
      isConnected = false;
    });

    redisClient.on('end', () => {
      isConnected = false;
    });

    return redisClient;
  } catch (error) {
    console.warn('[Redis] Failed to initialize client. Using in-memory fallback store.');
    isConnected = false;
    return null;
  }
};

export const getCache = async (key: string): Promise<string | null> => {
  if (isConnected && redisClient) {
    try {
      return await redisClient.get(key);
    } catch (err) {
      // Fallback to in-memory if Redis error happens
    }
  }

  // In-memory fallback
  const item = inMemoryCache.get(key);
  if (!item) return null;
  if (item.expiresAt && Date.now() > item.expiresAt) {
    inMemoryCache.delete(key);
    return null;
  }
  return item.value;
};

export const setCache = async (key: string, value: string, ttlSeconds: number = 300): Promise<void> => {
  if (isConnected && redisClient) {
    try {
      await redisClient.set(key, value, 'EX', ttlSeconds);
      return;
    } catch (err) {
      // Fallback
    }
  }

  // In-memory fallback
  const expiresAt = ttlSeconds ? Date.now() + ttlSeconds * 1000 : null;
  inMemoryCache.set(key, { value, expiresAt });
};

export const delCache = async (keyPattern: string): Promise<void> => {
  if (isConnected && redisClient) {
    try {
      if (keyPattern.includes('*')) {
        const keys = await redisClient.keys(keyPattern);
        if (keys.length > 0) {
          await redisClient.del(...keys);
        }
      } else {
        await redisClient.del(keyPattern);
      }
    } catch (err) {
      // Fallback
    }
  }

  // In-memory fallback
  if (keyPattern.includes('*')) {
    const regex = new RegExp('^' + keyPattern.replace(/\*/g, '.*') + '$');
    for (const key of inMemoryCache.keys()) {
      if (regex.test(key)) {
        inMemoryCache.delete(key);
      }
    }
  } else {
    inMemoryCache.delete(keyPattern);
  }
};

export const flushCache = async (): Promise<void> => {
  if (isConnected && redisClient) {
    try {
      await redisClient.flushdb();
    } catch (err) {
      // Fallback
    }
  }
  inMemoryCache.clear();
};

export const getRedisStatus = () => ({
  connected: isConnected,
  host: REDIS_HOST,
  port: REDIS_PORT,
  fallbackActive: !isConnected,
  inMemoryItemsCount: inMemoryCache.size
});
