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
      const parsedItem = JSON.parse(cachedItem);
      // Support both old format (raw data) and new format ({ data, savedAt })
      const parsedData = parsedItem?.savedAt ? parsedItem.data : parsedItem;
      onData(parsedData);
    }
  } catch (error) {
    console.warn(`[Cache] Error reading ${cacheKey} from localStorage:`, error);
  }

  // 2. Fetch fresh data in the background
  try {
    const freshData = await fetchFn();
    
    // Wrap data with a savedAt timestamp for staleness detection
    try {
      const cacheEntry = { data: freshData, savedAt: new Date().toISOString() };
      localStorage.setItem(cacheKey, JSON.stringify(cacheEntry));
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
