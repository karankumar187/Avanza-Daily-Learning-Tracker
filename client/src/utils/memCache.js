/**
 * Simple in-memory cache with TTL.
 * Module-level Map → survives SPA navigation, resets on hard refresh.
 * Safe for UTC data since we store raw API responses (already UTC).
 */

const cache = new Map();

const DEFAULT_TTL_MS = 60 * 1000; // 60 seconds

export const memGet = (key) => {
  const entry = cache.get(key);
  if (!entry) return null;
  if (Date.now() > entry.expiresAt) {
    cache.delete(key);
    return null;
  }
  return entry.data;
};

export const memSet = (key, data, ttlMs = DEFAULT_TTL_MS) => {
  cache.set(key, { data, expiresAt: Date.now() + ttlMs });
};

export const memDel = (key) => cache.delete(key);

export const memClear = () => cache.clear();

// Invalidate all keys that start with a prefix
export const memInvalidate = (prefix) => {
  for (const key of cache.keys()) {
    if (key.startsWith(prefix)) cache.delete(key);
  }
};
