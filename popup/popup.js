/**
 * AniTick Popup Script
 * Main UI logic for the extension popup
 */

import { debounce, formatCountdown, getStatusLabel, getStatusClass } from '../utils/helpers.js';

// ==================== State ====================
const state = {
  watchlist: [],
  searchResults: [],
  isSearching: false,
  settings: null,
};

// ==================== DOM Elements ====================
const elements = {
  app: document.getElementById('app'),
  searchToggle: document.getElementById('searchToggle'),
  searchSection: document.getElementById('searchSection'),
  searchInput: document.getElementById('searchInput'),
  searchResults: document.getElementById('searchResults'),
  settingsToggle: document.getElementById('settingsToggle'),
  settingsModal: document.getElementById('settingsModal'),
  settingsBackdrop: document.getElementById('settingsBackdrop'),
  closeSettings: document.getElementById('closeSettings'),
  loading: document.getElementById('loading'),
  emptyState: document.getElementById('emptyState'),
  animeList: document.getElementById('animeList'),
  // Settings elements
  notificationsEnabled: document.getElementById('notificationsEnabled'),
  themeSelect: document.getElementById('themeSelect'),
  sortSelect: document.getElementById('sortSelect'),
  exportData: document.getElementById('exportData'),
  importData: document.getElementById('importData'),
  clearData: document.getElementById('clearData'),
};

// ==================== Initialization ====================
document.addEventListener('DOMContentLoaded', init);

async function init() {
  console.log('[AniTick] Popup initialized');
  
  setupEventListeners();
  await loadSettings();
  await loadWatchlist();
}

function setupEventListeners() {
  // Search toggle
  elements.searchToggle.addEventListener('click', toggleSearch);
  elements.searchInput.addEventListener('input', debouncedSearch);
  elements.searchInput.addEventListener('keydown', handleSearchKeydown);
  
  // Settings
  elements.settingsToggle.addEventListener('click', openSettings);
  elements.settingsBackdrop.addEventListener('click', closeSettings);
  elements.closeSettings.addEventListener('click', closeSettings);
  
  // Settings changes
  elements.notificationsEnabled.addEventListener('change', handleNotificationToggle);
  elements.themeSelect.addEventListener('change', handleThemeChange);
  elements.sortSelect.addEventListener('change', handleSortChange);
  
  // Data management
  elements.exportData.addEventListener('click', handleExport);
  elements.importData.addEventListener('click', handleImport);
  elements.clearData.addEventListener('click', handleClearData);
  
  // Close search when clicking outside
  document.addEventListener('click', handleOutsideClick);
  
  // Keyboard shortcuts
  document.addEventListener('keydown', handleGlobalKeydown);
}

// ==================== Data Loading ====================

async function loadSettings() {
  try {
    const response = await sendMessage({ type: 'GET_SETTINGS' });
    if (response.success && response.data) {
      state.settings = response.data;
      applySettings(state.settings);
    }
  } catch (error) {
    console.error('[AniTick] Error loading settings:', error);
  }
}

async function loadWatchlist() {
  showLoading(true);
  
  try {
    const response = await sendMessage({ type: 'GET_WATCHLIST' });
    if (response.success) {
      state.watchlist = response.data || [];
      renderWatchlist();
    }
  } catch (error) {
    console.error('[AniTick] Error loading watchlist:', error);
  } finally {
    showLoading(false);
  }
}

// ==================== Search ====================

function toggleSearch() {
  const isHidden = elements.searchSection.classList.contains('hidden');
  
  if (isHidden) {
    elements.searchSection.classList.remove('hidden');
    elements.searchInput.focus();
  } else {
    elements.searchSection.classList.add('hidden');
    elements.searchInput.value = '';
    elements.searchResults.innerHTML = '';
  }
}

const debouncedSearch = debounce(async (event) => {
  const query = event.target.value.trim();
  
  if (query.length < 2) {
    elements.searchResults.innerHTML = '';
    return;
  }
  
  state.isSearching = true;
  
  try {
    const response = await sendMessage({ type: 'SEARCH_ANIME', query });
    if (response.success) {
      state.searchResults = response.data || [];
      renderSearchResults();
    }
  } catch (error) {
    console.error('[AniTick] Search error:', error);
  } finally {
    state.isSearching = false;
  }
}, 300);

function handleSearchKeydown(event) {
  if (event.key === 'Escape') {
    toggleSearch();
  }
}

function renderSearchResults() {
  if (state.searchResults.length === 0) {
    elements.searchResults.innerHTML = `
      <div class="search-result-item" style="justify-content: center; color: hsl(var(--muted-foreground));">
        Keine Ergebnisse gefunden
      </div>
    `;
    return;
  }
  
  elements.searchResults.innerHTML = state.searchResults.map(anime => `
    <div class="search-result-item" data-id="${anime.id}">
      <img 
        class="search-result-cover" 
        src="${anime.coverImage?.medium || ''}" 
        alt="${anime.title?.romaji || 'Cover'}"
        loading="lazy"
      >
      <div class="search-result-info">
        <div class="search-result-title">${anime.title?.romaji || anime.title?.english || 'Unknown'}</div>
        <div class="search-result-meta">
          ${anime.seasonYear || ''} • ${anime.episodes || '?'} Episoden
        </div>
      </div>
    </div>
  `).join('');
  
  // Add click handlers
  elements.searchResults.querySelectorAll('.search-result-item[data-id]').forEach(item => {
    item.addEventListener('click', () => handleAddAnime(item.dataset.id));
  });
}

async function handleAddAnime(animeId) {
  const anime = state.searchResults.find(a => a.id === parseInt(animeId));
  if (!anime) return;
  
  // Check if already in watchlist
  if (state.watchlist.some(a => a.id === anime.id)) {
    console.log('[AniTick] Anime already in watchlist');
    return;
  }
  
  try {
    const response = await sendMessage({ type: 'ADD_TO_WATCHLIST', anime });
    if (response.success) {
      await loadWatchlist();
      toggleSearch();
    }
  } catch (error) {
    console.error('[AniTick] Error adding anime:', error);
  }
}

// ==================== Watchlist Rendering ====================

function renderWatchlist() {
  if (state.watchlist.length === 0) {
    elements.emptyState.classList.remove('hidden');
    elements.animeList.innerHTML = '';
    return;
  }
  
  elements.emptyState.classList.add('hidden');
  
  // Sort watchlist
  const sortedList = sortWatchlist(state.watchlist);
  
  elements.animeList.innerHTML = sortedList.map(anime => createAnimeCard(anime)).join('');
  
  // Add remove handlers
  elements.animeList.querySelectorAll('.anime-remove').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      handleRemoveAnime(btn.dataset.id);
    });
  });
}

function createAnimeCard(anime) {
  const title = anime.title?.romaji || anime.title?.english || 'Unknown';
  const cover = anime.coverImage?.medium || anime.coverImage?.large || '';
  const status = anime.status || 'UNKNOWN';
  const statusLabel = getStatusLabel(status);
  const statusClass = getStatusClass(status);
  const episodes = anime.episodes ? `${anime.nextAiringEpisode?.episode || '?'}/${anime.episodes}` : '?';
  const countdown = anime.nextAiringEpisode ? formatCountdown(anime.nextAiringEpisode.airingAt) : null;
  
  return `
    <div class="anime-card" data-id="${anime.id}">
      <img class="anime-cover" src="${cover}" alt="${title}" loading="lazy">
      <div class="anime-info">
        <div class="anime-header">
          <span class="anime-title" title="${title}">${title}</span>
          <button class="icon-btn anime-remove" data-id="${anime.id}" aria-label="Entfernen">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M18 6 6 18"></path>
              <path d="m6 6 12 12"></path>
            </svg>
          </button>
        </div>
        <span class="anime-status ${statusClass}">${statusLabel}</span>
        <div class="anime-details">
          <span class="anime-episodes">EP ${episodes}</span>
          ${countdown ? `<span class="anime-next">Nächste Folge: <span class="anime-countdown">${countdown}</span></span>` : ''}
        </div>
      </div>
    </div>
  `;
}

function sortWatchlist(list) {
  const sortBy = state.settings?.display?.sortBy || 'nextEpisode';
  
  return [...list].sort((a, b) => {
    switch (sortBy) {
      case 'title':
        return (a.title?.romaji || '').localeCompare(b.title?.romaji || '');
      case 'dateAdded':
        return (b.addedAt || 0) - (a.addedAt || 0);
      case 'nextEpisode':
      default:
        const aTime = a.nextAiringEpisode?.airingAt || Infinity;
        const bTime = b.nextAiringEpisode?.airingAt || Infinity;
        return aTime - bTime;
    }
  });
}

async function handleRemoveAnime(animeId) {
  try {
    const response = await sendMessage({ type: 'REMOVE_FROM_WATCHLIST', id: parseInt(animeId) });
    if (response.success) {
      await loadWatchlist();
    }
  } catch (error) {
    console.error('[AniTick] Error removing anime:', error);
  }
}

// ==================== Settings ====================

function openSettings() {
  elements.settingsModal.classList.remove('hidden');
}

function closeSettings() {
  elements.settingsModal.classList.add('hidden');
}

function applySettings(settings) {
  // Apply theme
  const theme = settings.display?.theme || 'dark';
  applyTheme(theme);
  
  // Update form values
  elements.notificationsEnabled.checked = settings.notifications?.enabled ?? true;
  elements.themeSelect.value = theme;
  elements.sortSelect.value = settings.display?.sortBy || 'nextEpisode';
}

function applyTheme(theme) {
  if (theme === 'auto') {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    elements.app.dataset.theme = prefersDark ? 'dark' : 'light';
  } else {
    elements.app.dataset.theme = theme;
  }
}

async function handleNotificationToggle(event) {
  await updateSettings({
    notifications: { enabled: event.target.checked },
  });
}

async function handleThemeChange(event) {
  const theme = event.target.value;
  applyTheme(theme);
  await updateSettings({
    display: { theme },
  });
}

async function handleSortChange(event) {
  await updateSettings({
    display: { sortBy: event.target.value },
  });
  renderWatchlist();
}

async function updateSettings(updates) {
  try {
    // Merge with existing settings
    state.settings = {
      ...state.settings,
      ...updates,
      notifications: { ...state.settings?.notifications, ...updates.notifications },
      display: { ...state.settings?.display, ...updates.display },
    };
    
    await sendMessage({ type: 'UPDATE_SETTINGS', settings: state.settings });
  } catch (error) {
    console.error('[AniTick] Error updating settings:', error);
  }
}

// ==================== Data Management ====================

async function handleExport() {
  try {
    const data = {
      watchlist: state.watchlist,
      settings: state.settings,
      exportedAt: new Date().toISOString(),
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `anitick-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error('[AniTick] Export error:', error);
  }
}

async function handleImport() {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = '.json';
  
  input.onchange = async (event) => {
    const file = event.target.files[0];
    if (!file) return;
    
    try {
      const text = await file.text();
      const data = JSON.parse(text);
      
      if (data.watchlist) {
        for (const anime of data.watchlist) {
          await sendMessage({ type: 'ADD_TO_WATCHLIST', anime });
        }
      }
      
      if (data.settings) {
        await sendMessage({ type: 'UPDATE_SETTINGS', settings: data.settings });
      }
      
      await loadSettings();
      await loadWatchlist();
      
      console.log('[AniTick] Import successful');
    } catch (error) {
      console.error('[AniTick] Import error:', error);
    }
  };
  
  input.click();
}

async function handleClearData() {
  if (!confirm('Alle Daten wirklich löschen? Diese Aktion kann nicht rückgängig gemacht werden.')) {
    return;
  }
  
  try {
    await chrome.storage.sync.clear();
    state.watchlist = [];
    state.settings = null;
    await loadSettings();
    renderWatchlist();
  } catch (error) {
    console.error('[AniTick] Clear error:', error);
  }
}

// ==================== Utilities ====================

function showLoading(show) {
  if (show) {
    elements.loading.classList.remove('hidden');
    elements.animeList.innerHTML = '';
    elements.emptyState.classList.add('hidden');
  } else {
    elements.loading.classList.add('hidden');
  }
}

function handleOutsideClick(event) {
  // Close search results when clicking outside
  if (!elements.searchSection.contains(event.target) && 
      !elements.searchToggle.contains(event.target)) {
    elements.searchResults.innerHTML = '';
  }
}

function handleGlobalKeydown(event) {
  // Escape to close modals
  if (event.key === 'Escape') {
    if (!elements.settingsModal.classList.contains('hidden')) {
      closeSettings();
    }
  }
  
  // Ctrl/Cmd + K to open search
  if ((event.ctrlKey || event.metaKey) && event.key === 'k') {
    event.preventDefault();
    toggleSearch();
  }
}

async function sendMessage(message) {
  return new Promise((resolve) => {
    chrome.runtime.sendMessage(message, (response) => {
      resolve(response || { success: false, error: 'No response' });
    });
  });
}
