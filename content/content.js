/**
 * AniTick Content Script
 * Optional: Runs on web pages to enhance anime-related content
 *
 * This script is currently a placeholder for future features like:
 * - Automatic detection of anime pages
 * - Integration with streaming sites
 * - Quick-add buttons on AniList pages
 */

// Check if we're on a supported site
const SUPPORTED_SITES = [
  { pattern: /anilist\.co\/anime\/(\d+)/, name: 'AniList' },
  { pattern: /myanimelist\.net\/anime\/(\d+)/, name: 'MyAnimeList' },
];

/**
 * Initialize content script
 */
function init() {
  const currentSite = detectSite();

  if (currentSite) {
    console.log(`[AniTick Content] Detected: ${currentSite.name}`);
    // Future: Add quick-add button or other enhancements
  }
}

/**
 * Detect if we're on a supported site
 * @returns {Object|null} - Site info or null
 */
function detectSite() {
  const url = window.location.href;

  for (const site of SUPPORTED_SITES) {
    const match = url.match(site.pattern);
    if (match) {
      return {
        name: site.name,
        animeId: match[1],
      };
    }
  }

  return null;
}

/**
 * Send message to background script
 * @param {Object} message - Message to send
 * @returns {Promise<Object>} - Response
 */
// eslint-disable-next-line no-unused-vars
async function sendMessage(message) {
  return new Promise((resolve) => {
    chrome.runtime.sendMessage(message, resolve);
  });
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
