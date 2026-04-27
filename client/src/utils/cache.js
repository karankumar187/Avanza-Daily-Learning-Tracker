/**
 * Utility for fetching data with a Stale-While-Revalidate (SWR) strategy using localStorage.
 * 
 * @param {string} cacheKey - The unique key for storing data in localStorage.
 * @param {Function} fetchFn - A function that returns a Promise resolving to the fresh data.
 * @param {Function} onData - Callback invoked when data is available (can be called twice: once for cache, once for fresh data).
 * @returns {Promise<any>} - A promise resolving to the fresh data (optional to await).
 */
export const fetchWithCache = async (cacheKey, fetchFn, onData) => {
  // 1. Instantly return cached data if available
  try {
    const cachedItem = localStorage.getItem(cacheKey);
    if (cachedItem) {
      const parsedData = JSON.parse(cachedItem);
      onData(parsedData);
    }
  } catch (error) {
    console.warn(`[Cache] Error reading ${cacheKey} from localStorage:`, error);
  }

  // 2. Fetch fresh data in the background
  try {
    const freshData = await fetchFn();
    
    // Check if the fresh data is actually different before triggering another update
    // For simplicity, we just save and trigger onData
    try {
      localStorage.setItem(cacheKey, JSON.stringify(freshData));
    } catch (e) {
      console.warn(`[Cache] Error writing ${cacheKey} to localStorage:`, e);
    }

    onData(freshData);
    return freshData;
  } catch (error) {
    console.error(`[Cache] Error fetching fresh data for ${cacheKey}:`, error);
    throw error;
  }
};
