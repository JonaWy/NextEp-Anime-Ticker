/**
 * Application Constants
 * Central configuration for the AniTick extension
 */

// ==================== API Configuration ====================

/**
 * AniList GraphQL API endpoint
 */
export const ANILIST_API_URL = 'https://graphql.anilist.co';

/**
 * API rate limiting settings
 */
export const RATE_LIMIT = {
  MAX_REQUESTS: 90,
  TIME_WINDOW: 60000, // 1 minute in milliseconds
};

// ==================== Storage Keys ====================

/**
 * Chrome storage keys
 */
export const STORAGE_KEYS = {
  WATCHLIST: 'watchlist',
  SETTINGS: 'settings',
  CACHE: 'cache',
  LAST_UPDATE: 'lastUpdate',
};

// ==================== Cache TTL ====================

/**
 * Cache time-to-live values in milliseconds
 */
export const CACHE_TTL = {
  ANIME_DETAILS: 24 * 60 * 60 * 1000, // 24 hours
  SEARCH_RESULTS: 5 * 60 * 1000, // 5 minutes
  AIRING_SCHEDULE: 60 * 60 * 1000, // 1 hour
};

// ==================== Alarm Names ====================

/**
 * Chrome alarm identifiers
 */
export const ALARM_NAMES = {
  UPDATE_WATCHLIST: 'updateWatchlist',
  CHECK_NOTIFICATIONS: 'checkNotifications',
};

// ==================== Update Intervals ====================

/**
 * Update interval in minutes
 */
export const UPDATE_INTERVAL = 30;

// ==================== Notification Types ====================

/**
 * Notification type identifiers
 */
export const NOTIFICATION_TYPES = {
  NEW_EPISODE: 'newEpisode',
  UPCOMING: 'upcoming',
  UPDATE: 'update',
};

// ==================== Default Settings ====================

/**
 * Default user settings
 */
export const DEFAULT_SETTINGS = {
  notifications: {
    enabled: true,
    beforeAiring: 3600, // 1 hour before in seconds
    onRelease: true,
  },
  display: {
    theme: 'dark',
    sortBy: 'nextEpisode',
    groupBy: 'status',
  },
  search: {
    filterLatestSeason: true, // Only show latest season of each anime series
  },
  updates: {
    frequency: UPDATE_INTERVAL,
    autoUpdate: true,
  },
};

// ==================== Anime Status ====================

/**
 * AniList anime status values
 */
export const ANIME_STATUS = {
  RELEASING: 'RELEASING',
  FINISHED: 'FINISHED',
  NOT_YET_RELEASED: 'NOT_YET_RELEASED',
  CANCELLED: 'CANCELLED',
  HIATUS: 'HIATUS',
};

/**
 * Status labels in German
 */
export const STATUS_LABELS = {
  [ANIME_STATUS.RELEASING]: 'Läuft',
  [ANIME_STATUS.FINISHED]: 'Beendet',
  [ANIME_STATUS.NOT_YET_RELEASED]: 'Kommend',
  [ANIME_STATUS.CANCELLED]: 'Abgebrochen',
  [ANIME_STATUS.HIATUS]: 'Pausiert',
};

// ==================== Seasons ====================

/**
 * Anime seasons
 */
export const SEASONS = {
  WINTER: 'WINTER',
  SPRING: 'SPRING',
  SUMMER: 'SUMMER',
  FALL: 'FALL',
};

/**
 * Season labels in German
 */
export const SEASON_LABELS = {
  [SEASONS.WINTER]: 'Winter',
  [SEASONS.SPRING]: 'Frühling',
  [SEASONS.SUMMER]: 'Sommer',
  [SEASONS.FALL]: 'Herbst',
};

// ==================== Error Types ====================

/**
 * Application error types
 */
export const ERROR_TYPES = {
  API_ERROR: 'API_ERROR',
  RATE_LIMIT: 'RATE_LIMIT',
  NETWORK_ERROR: 'NETWORK_ERROR',
  STORAGE_ERROR: 'STORAGE_ERROR',
  INVALID_DATA: 'INVALID_DATA',
};

// ==================== UI Constants ====================

/**
 * UI dimensions and limits
 */
export const UI = {
  POPUP_WIDTH: 380,
  POPUP_MIN_HEIGHT: 500,
  POPUP_MAX_HEIGHT: 600,
  SEARCH_DEBOUNCE: 300,
  MAX_SEARCH_RESULTS: 10,
  MAX_BATCH_SIZE: 50,
};
