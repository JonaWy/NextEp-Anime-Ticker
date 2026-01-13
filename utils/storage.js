/**
 * Storage Manager
 * Handles all Chrome Storage operations for the extension
 */

import { STORAGE_KEYS, DEFAULT_SETTINGS } from '../config/constants.js';

/**
 * Storage Manager Class
 */
export class StorageManager {
  /**
   * Get the user's watchlist
   * @returns {Promise<Array>} - Array of anime in watchlist
   */
  async getWatchlist() {
    const data = await this.get(STORAGE_KEYS.WATCHLIST);
    return data || [];
  }

  /**
   * Add an anime to the watchlist
   * @param {Object} anime - Anime object to add
   * @returns {Promise<void>}
   */
  async addToWatchlist(anime) {
    const watchlist = await this.getWatchlist();
    
    // Check if already exists
    if (watchlist.some(a => a.id === anime.id)) {
      console.log('[Storage] Anime already in watchlist:', anime.id);
      return;
    }

    // Add metadata
    const animeWithMeta = {
      ...anime,
      addedAt: Date.now(),
      lastChecked: Date.now(),
      notificationsEnabled: true,
    };

    watchlist.push(animeWithMeta);
    await this.set(STORAGE_KEYS.WATCHLIST, watchlist);
    console.log('[Storage] Added to watchlist:', anime.id);
  }

  /**
   * Remove an anime from the watchlist
   * @param {number} id - AniList anime ID
   * @returns {Promise<void>}
   */
  async removeFromWatchlist(id) {
    const watchlist = await this.getWatchlist();
    const filtered = watchlist.filter(anime => anime.id !== id);
    await this.set(STORAGE_KEYS.WATCHLIST, filtered);
    console.log('[Storage] Removed from watchlist:', id);
  }

  /**
   * Update an anime in the watchlist
   * @param {number} id - AniList anime ID
   * @param {Object} updates - Properties to update
   * @returns {Promise<void>}
   */
  async updateAnimeInWatchlist(id, updates) {
    const watchlist = await this.getWatchlist();
    const index = watchlist.findIndex(anime => anime.id === id);
    
    if (index === -1) {
      console.warn('[Storage] Anime not found in watchlist:', id);
      return;
    }

    watchlist[index] = {
      ...watchlist[index],
      ...updates,
      lastChecked: Date.now(),
    };

    await this.set(STORAGE_KEYS.WATCHLIST, watchlist);
  }

  /**
   * Get user settings
   * @returns {Promise<Object>} - Settings object
   */
  async getSettings() {
    const data = await this.get(STORAGE_KEYS.SETTINGS);
    return data || DEFAULT_SETTINGS;
  }

  /**
   * Update user settings
   * @param {Object} updates - Settings to update
   * @returns {Promise<void>}
   */
  async updateSettings(updates) {
    const current = await this.getSettings();
    const merged = this.deepMerge(current, updates);
    await this.set(STORAGE_KEYS.SETTINGS, merged);
    console.log('[Storage] Settings updated');
  }

  /**
   * Set a cached value with TTL
   * @param {string} key - Cache key
   * @param {any} value - Value to cache
   * @param {number} ttl - Time to live in milliseconds
   * @returns {Promise<void>}
   */
  async cacheSet(key, value, ttl) {
    const cache = await this.get(STORAGE_KEYS.CACHE) || {};
    cache[key] = {
      data: value,
      timestamp: Date.now(),
      ttl,
    };
    await this.set(STORAGE_KEYS.CACHE, cache);
  }

  /**
   * Get a cached value if still valid
   * @param {string} key - Cache key
   * @returns {Promise<any|null>} - Cached data or null
   */
  async cacheGet(key) {
    const cache = await this.get(STORAGE_KEYS.CACHE) || {};
    const entry = cache[key];
    
    if (!entry) return null;
    
    const now = Date.now();
    if (now - entry.timestamp > entry.ttl) {
      delete cache[key];
      await this.set(STORAGE_KEYS.CACHE, cache);
      return null;
    }
    
    return entry.data;
  }

  /**
   * Clear all cached data
   * @returns {Promise<void>}
   */
  async cacheClear() {
    await this.set(STORAGE_KEYS.CACHE, {});
    console.log('[Storage] Cache cleared');
  }

  /**
   * Export the watchlist as JSON
   * @returns {Promise<string>} - JSON string
   */
  async exportWatchlist() {
    const watchlist = await this.getWatchlist();
    const settings = await this.getSettings();
    
    return JSON.stringify({
      watchlist,
      settings,
      exportedAt: new Date().toISOString(),
      version: '1.0.0',
    }, null, 2);
  }

  /**
   * Import watchlist from JSON
   * @param {string} jsonString - JSON string to import
   * @returns {Promise<void>}
   */
  async importWatchlist(jsonString) {
    try {
      const data = JSON.parse(jsonString);
      
      if (data.watchlist && Array.isArray(data.watchlist)) {
        const currentWatchlist = await this.getWatchlist();
        const existingIds = new Set(currentWatchlist.map(a => a.id));
        
        // Only add anime that don't already exist
        const newAnime = data.watchlist.filter(anime => !existingIds.has(anime.id));
        const merged = [...currentWatchlist, ...newAnime];
        
        await this.set(STORAGE_KEYS.WATCHLIST, merged);
        console.log('[Storage] Imported', newAnime.length, 'new anime');
      }
      
      if (data.settings) {
        await this.updateSettings(data.settings);
      }
    } catch (error) {
      console.error('[Storage] Import failed:', error);
      throw error;
    }
  }

  // ==================== Private Methods ====================

  /**
   * Get data from Chrome storage
   * @param {string} key - Storage key
   * @returns {Promise<any>}
   */
  async get(key) {
    return new Promise((resolve) => {
      chrome.storage.sync.get(key, (result) => {
        resolve(result[key]);
      });
    });
  }

  /**
   * Set data in Chrome storage
   * @param {string} key - Storage key
   * @param {any} value - Value to store
   * @returns {Promise<void>}
   */
  async set(key, value) {
    return new Promise((resolve, reject) => {
      chrome.storage.sync.set({ [key]: value }, () => {
        if (chrome.runtime.lastError) {
          reject(chrome.runtime.lastError);
        } else {
          resolve();
        }
      });
    });
  }

  /**
   * Deep merge two objects
   * @param {Object} target - Target object
   * @param {Object} source - Source object
   * @returns {Object} - Merged object
   */
  deepMerge(target, source) {
    const result = { ...target };
    
    for (const key of Object.keys(source)) {
      if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
        result[key] = this.deepMerge(result[key] || {}, source[key]);
      } else {
        result[key] = source[key];
      }
    }
    
    return result;
  }
}
