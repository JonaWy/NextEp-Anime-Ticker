/**
 * Notification Manager
 * Handles all browser notification operations
 */

import { StorageManager } from './storage.js';
import { NOTIFICATION_TYPES } from '../config/constants.js';

/**
 * Notification Manager Class
 */
export class NotificationManager {
  constructor() {
    this.storage = new StorageManager();
    this.lastNotified = new Map(); // Track last notification time per anime
  }

  /**
   * Check watchlist and send notifications for new episodes
   * @returns {Promise<void>}
   */
  async checkAndNotify() {
    const settings = await this.storage.getSettings();

    // Check if notifications are enabled
    if (!settings?.notifications?.enabled) {
      console.log('[Notifications] Notifications are disabled');
      return;
    }

    const watchlist = await this.storage.getWatchlist();
    if (!watchlist || watchlist.length === 0) {
      return;
    }

    const now = Date.now() / 1000; // Convert to seconds for comparison with airingAt

    for (const anime of watchlist) {
      if (!anime.notificationsEnabled) continue;

      const nextEp = anime.nextAiringEpisode;
      if (!nextEp) continue;

      const airingAt = nextEp.airingAt;
      const timeUntilAiring = airingAt - now;

      // Check for "airing soon" notification (1 hour before)
      if (settings.notifications.beforeAiring) {
        const beforeTime = settings.notifications.beforeAiring; // seconds
        if (timeUntilAiring > 0 && timeUntilAiring <= beforeTime) {
          await this.sendUpcomingNotification(anime, nextEp, timeUntilAiring);
        }
      }

      // Check for "now available" notification
      if (settings.notifications.onRelease && timeUntilAiring <= 0) {
        await this.sendNewEpisodeNotification(anime, nextEp);
      }
    }
  }

  /**
   * Send notification for upcoming episode
   * @param {Object} anime - Anime object
   * @param {Object} episode - Episode info
   * @param {number} timeUntil - Seconds until airing
   * @returns {Promise<void>}
   */
  async sendUpcomingNotification(anime, episode, timeUntil) {
    const notificationKey = `upcoming_${anime.id}_${episode.episode}`;

    // Don't spam notifications
    if (this.hasRecentlyNotified(notificationKey)) {
      return;
    }

    const timeString = this.formatTimeUntil(timeUntil);
    const title = anime.title?.romaji || anime.title?.english || 'Anime';

    await this.sendNotification({
      id: notificationKey,
      type: NOTIFICATION_TYPES.UPCOMING,
      title: 'Folge startet bald',
      message: `${title} EP ${episode.episode} startet in ${timeString}`,
      iconUrl: anime.coverImage?.medium || 'assets/icons/icon-128.png',
      data: { animeId: anime.id },
    });

    this.markNotified(notificationKey);
  }

  /**
   * Send notification for new episode release
   * @param {Object} anime - Anime object
   * @param {Object} episode - Episode info
   * @returns {Promise<void>}
   */
  async sendNewEpisodeNotification(anime, episode) {
    const notificationKey = `release_${anime.id}_${episode.episode}`;

    // Don't spam notifications
    if (this.hasRecentlyNotified(notificationKey)) {
      return;
    }

    const title = anime.title?.romaji || anime.title?.english || 'Anime';

    await this.sendNotification({
      id: notificationKey,
      type: NOTIFICATION_TYPES.NEW_EPISODE,
      title: 'Neue Folge verfügbar!',
      message: `${title} EP ${episode.episode} ist jetzt verfügbar`,
      iconUrl: anime.coverImage?.medium || 'assets/icons/icon-128.png',
      data: { animeId: anime.id },
    });

    this.markNotified(notificationKey);
  }

  /**
   * Send a browser notification
   * @param {Object} options - Notification options
   * @returns {Promise<string>} - Notification ID
   */
  async sendNotification({ id, title, message, iconUrl }) {
    return new Promise((resolve) => {
      chrome.notifications.create(
        id,
        {
          type: 'basic',
          iconUrl: iconUrl || 'assets/icons/icon-128.png',
          title,
          message,
          priority: 2,
          requireInteraction: false,
        },
        (notificationId) => {
          console.log('[Notifications] Sent:', notificationId);
          resolve(notificationId);
        }
      );
    });
  }

  /**
   * Handle notification click
   * @param {string} notificationId - Clicked notification ID
   */
  handleClick(notificationId) {
    console.log('[Notifications] Clicked:', notificationId);

    // Clear the notification
    chrome.notifications.clear(notificationId);

    // Open popup (the notification ID contains anime info)
    // For now, just clear - could open specific anime page in future
  }

  /**
   * Clear a specific notification
   * @param {string} notificationId - Notification ID to clear
   * @returns {Promise<void>}
   */
  async clearNotification(notificationId) {
    return new Promise((resolve) => {
      chrome.notifications.clear(notificationId, resolve);
    });
  }

  // ==================== Helper Methods ====================

  /**
   * Check if we've recently sent a notification for this key
   * @param {string} key - Notification key
   * @returns {boolean}
   */
  hasRecentlyNotified(key) {
    const lastTime = this.lastNotified.get(key);
    if (!lastTime) return false;

    // Don't re-notify within 30 minutes
    const thirtyMinutes = 30 * 60 * 1000;
    return Date.now() - lastTime < thirtyMinutes;
  }

  /**
   * Mark a notification as sent
   * @param {string} key - Notification key
   */
  markNotified(key) {
    this.lastNotified.set(key, Date.now());

    // Clean up old entries
    const oneDay = 24 * 60 * 60 * 1000;
    for (const [k, v] of this.lastNotified) {
      if (Date.now() - v > oneDay) {
        this.lastNotified.delete(k);
      }
    }
  }

  /**
   * Format seconds into human-readable time
   * @param {number} seconds - Seconds to format
   * @returns {string}
   */
  formatTimeUntil(seconds) {
    if (seconds < 60) return 'weniger als 1 Minute';

    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes} Minuten`;

    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;

    if (hours < 24) {
      return remainingMinutes > 0
        ? `${hours}h ${remainingMinutes}m`
        : `${hours} Stunden`;
    }

    const days = Math.floor(hours / 24);
    const remainingHours = hours % 24;

    return remainingHours > 0 ? `${days}d ${remainingHours}h` : `${days} Tagen`;
  }
}
