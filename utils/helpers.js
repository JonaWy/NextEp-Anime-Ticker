/**
 * Helper Utilities
 * Common utility functions used across the extension
 */

/**
 * Debounce function calls
 * @param {Function} func - Function to debounce
 * @param {number} wait - Wait time in milliseconds
 * @returns {Function} - Debounced function
 */
export function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

/**
 * Throttle function calls
 * @param {Function} func - Function to throttle
 * @param {number} limit - Time limit in milliseconds
 * @returns {Function} - Throttled function
 */
export function throttle(func, limit) {
  let inThrottle;
  return function executedFunction(...args) {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

/**
 * Format a Unix timestamp to a countdown string
 * @param {number} timestamp - Unix timestamp (seconds)
 * @returns {string|null} - Formatted countdown or null if in the past
 */
export function formatCountdown(timestamp) {
  const now = Math.floor(Date.now() / 1000);
  const diff = timestamp - now;
  
  if (diff <= 0) return null;
  
  const days = Math.floor(diff / 86400);
  const hours = Math.floor((diff % 86400) / 3600);
  const minutes = Math.floor((diff % 3600) / 60);
  
  if (days > 0) {
    return `${days}d ${hours}h`;
  } else if (hours > 0) {
    return `${hours}h ${minutes}m`;
  } else {
    return `${minutes}m`;
  }
}

/**
 * Format a date to a localized string
 * @param {Object} date - Date object with year, month, day
 * @returns {string} - Formatted date string
 */
export function formatDate(date) {
  if (!date || !date.year) return 'TBA';
  
  const { year, month, day } = date;
  
  if (!month) return String(year);
  if (!day) return `${getMonthName(month)} ${year}`;
  
  return `${day}. ${getMonthName(month)} ${year}`;
}

/**
 * Get German month name
 * @param {number} month - Month number (1-12)
 * @returns {string} - Month name
 */
function getMonthName(month) {
  const months = [
    'Januar', 'Februar', 'März', 'April',
    'Mai', 'Juni', 'Juli', 'August',
    'September', 'Oktober', 'November', 'Dezember'
  ];
  return months[month - 1] || '';
}

/**
 * Get human-readable status label
 * @param {string} status - AniList status enum
 * @returns {string} - Localized status label
 */
export function getStatusLabel(status) {
  const labels = {
    'RELEASING': 'Läuft',
    'FINISHED': 'Beendet',
    'NOT_YET_RELEASED': 'Kommend',
    'CANCELLED': 'Abgebrochen',
    'HIATUS': 'Pausiert',
  };
  return labels[status] || status;
}

/**
 * Get CSS class for status
 * @param {string} status - AniList status enum
 * @returns {string} - CSS class name
 */
export function getStatusClass(status) {
  const classes = {
    'RELEASING': 'airing',
    'FINISHED': 'finished',
    'NOT_YET_RELEASED': 'upcoming',
    'CANCELLED': 'finished',
    'HIATUS': 'finished',
  };
  return classes[status] || 'finished';
}

/**
 * Sanitize HTML to prevent XSS
 * @param {string} html - HTML string to sanitize
 * @returns {string} - Sanitized text
 */
export function sanitizeText(html) {
  if (!html) return '';
  
  const div = document.createElement('div');
  div.textContent = html;
  return div.innerHTML;
}

/**
 * Truncate text with ellipsis
 * @param {string} text - Text to truncate
 * @param {number} maxLength - Maximum length
 * @returns {string} - Truncated text
 */
export function truncate(text, maxLength) {
  if (!text || text.length <= maxLength) return text;
  return text.slice(0, maxLength - 3) + '...';
}

/**
 * Generate a unique ID
 * @returns {string} - Unique ID string
 */
export function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

/**
 * Check if a value is empty (null, undefined, empty string, empty array)
 * @param {any} value - Value to check
 * @returns {boolean} - True if empty
 */
export function isEmpty(value) {
  if (value === null || value === undefined) return true;
  if (typeof value === 'string' && value.trim() === '') return true;
  if (Array.isArray(value) && value.length === 0) return true;
  if (typeof value === 'object' && Object.keys(value).length === 0) return true;
  return false;
}

/**
 * Sleep for a specified duration
 * @param {number} ms - Milliseconds to sleep
 * @returns {Promise<void>}
 */
export function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Retry a function with exponential backoff
 * @param {Function} fn - Async function to retry
 * @param {number} maxRetries - Maximum number of retries
 * @param {number} baseDelay - Base delay in milliseconds
 * @returns {Promise<any>} - Function result
 */
export async function retry(fn, maxRetries = 3, baseDelay = 1000) {
  let lastError;
  
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      const delay = baseDelay * Math.pow(2, i);
      console.warn(`Retry ${i + 1}/${maxRetries} failed, waiting ${delay}ms...`);
      await sleep(delay);
    }
  }
  
  throw lastError;
}

/**
 * Group array items by a key
 * @param {Array} array - Array to group
 * @param {string|Function} key - Key to group by
 * @returns {Object} - Grouped object
 */
export function groupBy(array, key) {
  return array.reduce((result, item) => {
    const groupKey = typeof key === 'function' ? key(item) : item[key];
    if (!result[groupKey]) {
      result[groupKey] = [];
    }
    result[groupKey].push(item);
    return result;
  }, {});
}
