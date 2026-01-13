/**
 * AniList API Handler
 * Handles all communication with the AniList GraphQL API
 */

import { ANILIST_API_URL, CACHE_TTL } from '../config/constants.js';

/**
 * Rate Limiter Class
 * Ensures we don't exceed API rate limits
 */
class RateLimiter {
  constructor(maxRequests, timeWindow) {
    this.maxRequests = maxRequests;
    this.timeWindow = timeWindow;
    this.requests = [];
  }

  async waitForSlot() {
    const now = Date.now();
    this.requests = this.requests.filter(time => now - time < this.timeWindow);
    
    if (this.requests.length >= this.maxRequests) {
      const oldestRequest = this.requests[0];
      const waitTime = this.timeWindow - (now - oldestRequest);
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }
    
    this.requests.push(Date.now());
  }
}

/**
 * AniList API Class
 */
export class AniListAPI {
  constructor() {
    this.baseURL = ANILIST_API_URL;
    this.rateLimiter = new RateLimiter(90, 60000); // 90 requests per minute
    this.cache = new Map();
  }

  /**
   * Search for anime by query string
   * @param {string} query - Search term
   * @returns {Promise<Array>} - Array of anime results
   */
  async searchAnime(query) {
    const graphqlQuery = `
      query ($search: String) {
        Page(page: 1, perPage: 10) {
          media(search: $search, type: ANIME) {
            id
            title {
              romaji
              english
              native
            }
            coverImage {
              large
              medium
            }
            status
            nextAiringEpisode {
              airingAt
              episode
            }
            episodes
            season
            seasonYear
            genres
            averageScore
          }
        }
      }
    `;

    const response = await this.makeRequest(graphqlQuery, { search: query });
    return response?.data?.Page?.media || [];
  }

  /**
   * Get detailed information about a specific anime
   * @param {number} id - AniList anime ID
   * @returns {Promise<Object>} - Anime details
   */
  async getAnimeDetails(id) {
    // Check cache first
    const cacheKey = `anime_${id}`;
    const cached = this.getCachedResponse(cacheKey);
    if (cached) return cached;

    const query = `
      query ($id: Int) {
        Media(id: $id, type: ANIME) {
          id
          title {
            romaji
            english
            native
          }
          description
          coverImage {
            extraLarge
            large
            medium
          }
          bannerImage
          status
          episodes
          nextAiringEpisode {
            airingAt
            timeUntilAiring
            episode
          }
          airingSchedule(notYetAired: true, perPage: 5) {
            nodes {
              episode
              airingAt
            }
          }
          streamingEpisodes {
            title
            thumbnail
            url
          }
          externalLinks {
            url
            site
          }
          season
          seasonYear
          startDate {
            year
            month
            day
          }
          endDate {
            year
            month
            day
          }
          genres
          averageScore
          studios(isMain: true) {
            nodes {
              name
            }
          }
        }
      }
    `;

    const response = await this.makeRequest(query, { id });
    const data = response?.data?.Media;
    
    if (data) {
      this.cacheResponse(cacheKey, data, CACHE_TTL.ANIME_DETAILS);
    }
    
    return data;
  }

  /**
   * Bulk update multiple anime by IDs
   * @param {Array<number>} ids - Array of AniList anime IDs
   * @returns {Promise<Array>} - Updated anime data
   */
  async bulkUpdateAnime(ids) {
    if (!ids || ids.length === 0) return [];

    // Split into batches of 50
    const batches = [];
    for (let i = 0; i < ids.length; i += 50) {
      batches.push(ids.slice(i, i + 50));
    }

    const results = [];
    
    for (const batch of batches) {
      const query = `
        query ($ids: [Int]) {
          Page {
            media(id_in: $ids, type: ANIME) {
              id
              status
              episodes
              nextAiringEpisode {
                airingAt
                timeUntilAiring
                episode
              }
            }
          }
        }
      `;

      const response = await this.makeRequest(query, { ids: batch });
      const data = response?.data?.Page?.media || [];
      results.push(...data);
    }

    return results;
  }

  /**
   * Make a GraphQL request to the AniList API
   * @param {string} query - GraphQL query string
   * @param {Object} variables - Query variables
   * @returns {Promise<Object>} - API response
   */
  async makeRequest(query, variables = {}) {
    await this.rateLimiter.waitForSlot();

    try {
      const response = await fetch(this.baseURL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({ query, variables }),
      });

      if (!response.ok) {
        if (response.status === 429) {
          console.warn('[AniTick API] Rate limit exceeded, waiting...');
          await new Promise(resolve => setTimeout(resolve, 60000));
          return this.makeRequest(query, variables);
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('[AniTick API] Request failed:', error);
      throw error;
    }
  }

  /**
   * Cache a response with TTL
   * @param {string} key - Cache key
   * @param {any} data - Data to cache
   * @param {number} ttl - Time to live in milliseconds
   */
  cacheResponse(key, data, ttl) {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl,
    });
  }

  /**
   * Get a cached response if still valid
   * @param {string} key - Cache key
   * @returns {any|null} - Cached data or null if expired/missing
   */
  getCachedResponse(key) {
    const cached = this.cache.get(key);
    if (!cached) return null;

    const now = Date.now();
    if (now - cached.timestamp > cached.ttl) {
      this.cache.delete(key);
      return null;
    }

    return cached.data;
  }

  /**
   * Clear the cache
   */
  clearCache() {
    this.cache.clear();
  }
}
