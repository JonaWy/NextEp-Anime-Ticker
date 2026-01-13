/**
 * AniTick Service Worker
 * Background script für periodische API-Abfragen und Notification Management
 */

// Import modules
import { AniListAPI } from '../utils/api.js';
import { StorageManager } from '../utils/storage.js';
import { NotificationManager } from '../utils/notifications.js';
import { ALARM_NAMES, UPDATE_INTERVAL } from '../config/constants.js';

// Initialize managers
const api = new AniListAPI();
const storage = new StorageManager();
const notifications = new NotificationManager();

/**
 * Extension Installation Handler
 */
chrome.runtime.onInstalled.addListener(async (details) => {
  console.log('[AniTick] Extension installed:', details.reason);

  if (details.reason === 'install') {
    // First-time installation
    await initializeStorage();
    await setupAlarms();
    console.log('[AniTick] Initial setup completed');
  } else if (details.reason === 'update') {
    // Extension update
    console.log('[AniTick] Extension updated to version:', chrome.runtime.getManifest().version);
  }
});

/**
 * Alarm Trigger Handler
 */
chrome.alarms.onAlarm.addListener(async (alarm) => {
  console.log('[AniTick] Alarm triggered:', alarm.name);

  if (alarm.name === ALARM_NAMES.UPDATE_WATCHLIST) {
    await updateWatchlist();
  } else if (alarm.name === ALARM_NAMES.CHECK_NOTIFICATIONS) {
    await checkAndSendNotifications();
  }
});

/**
 * Message Handler für Kommunikation mit Popup
 */
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log('[AniTick] Message received:', message.type);

  handleMessage(message, sender, sendResponse);
  return true; // Async response
});

/**
 * Notification Click Handler
 */
chrome.notifications.onClicked.addListener((notificationId) => {
  console.log('[AniTick] Notification clicked:', notificationId);
  notifications.handleClick(notificationId);
});

// ==================== Helper Functions ====================

/**
 * Initialize storage with default values
 */
async function initializeStorage() {
  const defaults = await storage.getSettings();
  if (!defaults) {
    await storage.updateSettings({
      notifications: {
        enabled: true,
        beforeAiring: 3600,
        onRelease: true,
      },
      display: {
        theme: 'dark',
        sortBy: 'nextEpisode',
        groupBy: 'status',
      },
      updates: {
        frequency: UPDATE_INTERVAL,
        autoUpdate: true,
      },
    });
  }
}

/**
 * Setup periodic alarms
 */
async function setupAlarms() {
  // Clear existing alarms
  await chrome.alarms.clearAll();

  // Update watchlist every 30 minutes
  chrome.alarms.create(ALARM_NAMES.UPDATE_WATCHLIST, {
    periodInMinutes: UPDATE_INTERVAL,
  });

  // Check for notifications every 5 minutes
  chrome.alarms.create(ALARM_NAMES.CHECK_NOTIFICATIONS, {
    periodInMinutes: 5,
  });

  console.log('[AniTick] Alarms configured');
}

/**
 * Update all anime in watchlist
 */
async function updateWatchlist() {
  try {
    const watchlist = await storage.getWatchlist();
    if (!watchlist || watchlist.length === 0) {
      console.log('[AniTick] Watchlist is empty, skipping update');
      return;
    }

    const ids = watchlist.map((anime) => anime.id);
    const updatedData = await api.bulkUpdateAnime(ids);

    // Update storage with new data
    for (const anime of updatedData) {
      await storage.updateAnimeInWatchlist(anime.id, anime);
    }

    console.log('[AniTick] Watchlist updated successfully');
  } catch (error) {
    console.error('[AniTick] Error updating watchlist:', error);
  }
}

/**
 * Check and send notifications for new episodes
 */
async function checkAndSendNotifications() {
  try {
    await notifications.checkAndNotify();
  } catch (error) {
    console.error('[AniTick] Error checking notifications:', error);
  }
}

/**
 * Handle incoming messages
 */
async function handleMessage(message, sender, sendResponse) {
  try {
    switch (message.type) {
      case 'SEARCH_ANIME':
        const results = await api.searchAnime(message.query);
        sendResponse({ success: true, data: results });
        break;

      case 'GET_ANIME_DETAILS':
        const details = await api.getAnimeDetails(message.id);
        sendResponse({ success: true, data: details });
        break;

      case 'ADD_TO_WATCHLIST':
        await storage.addToWatchlist(message.anime);
        sendResponse({ success: true });
        break;

      case 'REMOVE_FROM_WATCHLIST':
        await storage.removeFromWatchlist(message.id);
        sendResponse({ success: true });
        break;

      case 'GET_WATCHLIST':
        const watchlist = await storage.getWatchlist();
        sendResponse({ success: true, data: watchlist });
        break;

      case 'UPDATE_SETTINGS':
        await storage.updateSettings(message.settings);
        sendResponse({ success: true });
        break;

      case 'GET_SETTINGS':
        const settings = await storage.getSettings();
        sendResponse({ success: true, data: settings });
        break;

      case 'FORCE_UPDATE':
        await updateWatchlist();
        sendResponse({ success: true });
        break;

      default:
        sendResponse({ success: false, error: 'Unknown message type' });
    }
  } catch (error) {
    console.error('[AniTick] Error handling message:', error);
    sendResponse({ success: false, error: error.message });
  }
}

console.log('[AniTick] Service Worker loaded');
