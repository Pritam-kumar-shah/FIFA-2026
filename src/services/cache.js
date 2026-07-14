/**
 * Simple Response Cache
 * Implements a memory cache with Time-To-Live (TTL) for API responses.
 */
class ResponseCache {
  constructor(defaultTtlMs = 60000) {
    this.cache = new Map();
    this.defaultTtlMs = defaultTtlMs;
  }

  /**
   * Get item from cache if it is still valid.
   * @param {string} key - Cache key
   * @returns {*} Cached value or null
   */
  get(key) {
    const item = this.cache.get(key);
    if (!item) return null;

    if (Date.now() > item.expiry) {
      this.cache.delete(key);
      return null;
    }

    return item.value;
  }

  /**
   * Set item in cache with TTL.
   * @param {string} key - Cache key
   * @param {*} value - Value to cache
   * @param {number} [ttlMs] - Custom TTL in milliseconds
   */
  set(key, value, ttlMs) {
    const ttl = ttlMs !== undefined ? ttlMs : this.defaultTtlMs;
    const expiry = Date.now() + ttl;
    this.cache.set(key, { value, expiry });
  }

  /**
   * Clear all items in cache.
   */
  clear() {
    this.cache.clear();
  }
}

export const apiCache = new ResponseCache(30000); // 30 seconds default TTL
