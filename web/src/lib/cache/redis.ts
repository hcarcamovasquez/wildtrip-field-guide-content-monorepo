import { Redis } from '@upstash/redis'

// Initialize Redis client
const redis = new Redis({
  url: import.meta.env.UPSTASH_REDIS_REST_URL,
  token: import.meta.env.UPSTASH_REDIS_REST_TOKEN,
})

// Default cache TTL in seconds (1 hour)
const DEFAULT_TTL = 3600

/**
 * Generic Redis cache service
 * Provides a type-safe interface for caching any data type
 */
export class RedisCache {
  /**
   * Get value from cache
   * @param key - Cache key
   * @returns Cached value or null if not found
   */
  static async get<T>(key: string): Promise<T | null> {
    try {
      const cached = await redis.get<T>(key)
      return cached
    } catch (error) {
      console.error('Error getting from cache:', error)
      return null
    }
  }

  /**
   * Set value in cache
   * @param key - Cache key
   * @param value - Value to cache
   * @param ttl - Time to live in seconds (optional, defaults to DEFAULT_TTL)
   */
  static async set<T>(key: string, value: T, ttl: number = DEFAULT_TTL): Promise<void> {
    try {
      await redis.set(key, JSON.stringify(value), {
        ex: ttl,
      })
    } catch (error) {
      console.error('Error setting cache:', error)
    }
  }

  /**
   * Delete value from cache
   * @param key - Cache key
   */
  static async delete(key: string): Promise<void> {
    try {
      await redis.del(key)
    } catch (error) {
      console.error('Error deleting from cache:', error)
    }
  }

  /**
   * Delete multiple values from cache
   * @param keys - Array of cache keys
   */
  static async deleteMany(keys: string[]): Promise<void> {
    try {
      if (keys.length > 0) {
        await redis.del(...keys)
      }
    } catch (error) {
      console.error('Error deleting multiple keys from cache:', error)
    }
  }

  /**
   * Check if key exists in cache
   * @param key - Cache key
   * @returns true if key exists, false otherwise
   */
  static async exists(key: string): Promise<boolean> {
    try {
      const result = await redis.exists(key)
      return result === 1
    } catch (error) {
      console.error('Error checking cache existence:', error)
      return false
    }
  }

  /**
   * Get remaining TTL for a key
   * @param key - Cache key
   * @returns TTL in seconds, -1 if key doesn't exist, -2 if key exists but has no TTL
   */
  static async ttl(key: string): Promise<number> {
    try {
      return await redis.ttl(key)
    } catch (error) {
      console.error('Error getting TTL:', error)
      return -1
    }
  }

  /**
   * Clear all keys matching a pattern
   * @param pattern - Pattern to match keys (e.g., "user:*")
   */
  static async clearPattern(pattern: string): Promise<void> {
    try {
      const keys = await redis.keys(pattern)
      if (keys.length > 0) {
        await redis.del(...keys)
      }
    } catch (error) {
      console.error('Error clearing cache pattern:', error)
    }
  }

  /**
   * Get or set value in cache
   * If key exists, return cached value. Otherwise, call factory function and cache the result.
   * @param key - Cache key
   * @param factory - Function to generate value if not cached
   * @param ttl - Time to live in seconds (optional)
   */
  static async getOrSet<T>(key: string, factory: () => Promise<T>, ttl: number = DEFAULT_TTL): Promise<T> {
    const cached = await this.get<T>(key)
    if (cached !== null) {
      return cached
    }

    const value = await factory()
    await this.set(key, value, ttl)
    return value
  }
}

// Cache key prefixes for different entities
export const CacheKeys = {
  user: (clerkId: string) => `user:clerk:${clerkId}`,
  species: (id: number) => `species:${id}`,
  speciesList: (page: number, limit: number) => `species:list:${page}:${limit}`,
  news: (id: number) => `news:${id}`,
  newsList: (page: number, limit: number) => `news:list:${page}:${limit}`,
  protectedArea: (id: number) => `protected-area:${id}`,
  protectedAreaList: (page: number, limit: number) => `protected-area:list:${page}:${limit}`,
  gallery: (folderId: number | null) => `gallery:folder:${folderId || 'root'}`,
} as const

// Cache TTL values for different entities (in seconds)
export const CacheTTL = {
  user: 3600, // 1 hour
  species: 1800, // 30 minutes
  speciesList: 300, // 5 minutes
  news: 1800, // 30 minutes
  newsList: 300, // 5 minutes
  protectedArea: 1800, // 30 minutes
  protectedAreaList: 300, // 5 minutes
  gallery: 600, // 10 minutes
} as const
