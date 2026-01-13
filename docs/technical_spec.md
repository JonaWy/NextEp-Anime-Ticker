# Technische Spezifikation - AniTick Chrome Extension

## Architektur-Details

### 1. Manifest V3 Configuration

#### Erforderliche Permissions
```json
{
  "permissions": [
    "storage",           // Für Anime-Bookmarks und Settings
    "alarms",            // Für periodische Background Checks
    "notifications"      // Für Release-Benachrichtigungen
  ],
  "host_permissions": [
    "https://graphql.anilist.co/*"  // AniList API Access
  ]
}
```

#### Optional Permissions (für zukünftige Features)
- `activeTab`: Für Content Script Features
- `tabs`: Für automatische Streaming-Seiten Erkennung

### 2. Service Worker (background/service-worker.js)

#### Responsibilities
1. **Periodische API-Abfragen**
   - Chrome Alarms API für scheduling
   - Alle 30 Minuten neue Folgen checken
   - Exponential Backoff bei API-Fehlern

2. **Notification Management**
   - Trigger bei neuen Folgen
   - Gruppierung mehrerer Benachrichtigungen
   - User-Präferenzen respektieren

3. **Cache Management**
   - API Response Caching (24h TTL)
   - Stale-While-Revalidate Pattern

#### Event Listeners
```javascript
// Extension Installation
chrome.runtime.onInstalled

// Alarm Triggers
chrome.alarms.onAlarm

// Message Passing
chrome.runtime.onMessage

// Notification Clicks
chrome.notifications.onClicked
```

### 3. AniList API Integration (utils/api.js)

#### GraphQL Queries

##### Anime Search Query
```graphql
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
```

##### Anime Details Query
```graphql
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
    }
    bannerImage
    status
    episodes
    nextAiringEpisode {
      airingAt
      timeUntilAiring
      episode
    }
    airingSchedule {
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
    studios {
      nodes {
        name
      }
    }
  }
}
```

##### Bulk Update Query (für Watchlist)
```graphql
query ($ids: [Int]) {
  Page {
    media(id_in: $ids, type: ANIME) {
      id
      status
      nextAiringEpisode {
        airingAt
        episode
      }
    }
  }
}
```

#### API Handler Class Structure
```javascript
class AniListAPI {
  constructor() {
    this.baseURL = 'https://graphql.anilist.co';
    this.rateLimiter = new RateLimiter(90, 60000); // 90 req/min
  }

  async searchAnime(query) {}
  async getAnimeDetails(id) {}
  async bulkUpdateAnime(ids) {}
  
  // Helpers
  async makeRequest(query, variables) {}
  handleRateLimit() {}
  cacheResponse(key, data, ttl) {}
  getCachedResponse(key) {}
}
```

### 4. Storage Management (utils/storage.js)

#### Storage Schema

##### Watchlist
```javascript
{
  watchlist: [
    {
      id: 123,
      title: {
        romaji: "Frieren",
        english: "Frieren: Beyond Journey's End"
      },
      coverImage: "https://...",
      status: "RELEASING",
      nextEpisode: {
        number: 15,
        airingAt: 1704067200, // Unix timestamp
        timeUntilAiring: 86400 // seconds
      },
      totalEpisodes: 28,
      addedAt: 1703980800,
      lastChecked: 1704067200,
      notificationsEnabled: true
    }
  ]
}
```

##### Settings
```javascript
{
  settings: {
    notifications: {
      enabled: true,
      beforeAiring: 3600, // 1 hour before
      onRelease: true
    },
    display: {
      theme: "dark", // "light" | "dark" | "auto"
      sortBy: "nextEpisode", // "title" | "nextEpisode" | "dateAdded"
      groupBy: "status" // "none" | "status" | "day"
    },
    updates: {
      frequency: 30, // minutes
      autoUpdate: true
    }
  }
}
```

##### Cache
```javascript
{
  cache: {
    "anime_123": {
      data: {...},
      timestamp: 1704067200,
      ttl: 86400
    }
  }
}
```

#### Storage API Wrapper
```javascript
class StorageManager {
  async getWatchlist() {}
  async addToWatchlist(anime) {}
  async removeFromWatchlist(id) {}
  async updateAnimeInWatchlist(id, updates) {}
  
  async getSettings() {}
  async updateSettings(updates) {}
  
  async cacheSet(key, value, ttl) {}
  async cacheGet(key) {}
  async cacheClear() {}
  
  // Sync
  async exportWatchlist() {}
  async importWatchlist(data) {}
}
```

### 5. Popup Interface (popup/)

#### UI Components

##### Main View
- Header (Logo + Settings Icon)
- Search Bar (collapsible)
- Anime List (scrollable)
- Empty State

##### Anime Card
```
┌─────────────────────────────────────┐
│ [Cover] Title                    [×]│
│         Status Badge                │
│         ┌─────────────────────────┐ │
│         │ EP 15/28                │ │
│         │ Next in: 2h 30m         │ │
│         └─────────────────────────┘ │
└─────────────────────────────────────┘
```

##### Search Modal
- Input Field mit Auto-Complete
- Results List mit Cover + Title
- Loading State
- No Results State

##### Settings Modal
- Notification Preferences
- Display Options
- Update Frequency
- Data Management (Export/Import/Clear)

#### State Management
```javascript
class PopupState {
  constructor() {
    this.watchlist = [];
    this.searchResults = [];
    this.isSearching = false;
    this.settings = {};
  }

  async init() {}
  async loadWatchlist() {}
  async searchAnime(query) {}
  async addAnime(anime) {}
  async removeAnime(id) {}
  updateUI() {}
}
```

### 6. Notification System (utils/notifications.js)

#### Notification Types

##### New Episode Available
```javascript
{
  type: "basic",
  iconUrl: "icon.png",
  title: "New Episode Released!",
  message: "Frieren EP 15 is now available",
  contextMessage: "Tap to open streaming links",
  buttons: [
    { title: "Watch Now" },
    { title: "Dismiss" }
  ]
}
```

##### Upcoming Episode
```javascript
{
  type: "basic",
  title: "Episode Airing Soon",
  message: "Frieren EP 16 airs in 1 hour",
  contextMessage: "3 more anime airing today"
}
```

#### Notification Manager
```javascript
class NotificationManager {
  async checkAndNotify() {
    // Check all anime in watchlist
    // Compare with last notification timestamp
    // Send grouped notifications
  }

  async sendNotification(anime, type) {}
  async clearNotification(id) {}
  
  handleNotificationClick(id) {
    // Open popup or streaming link
  }
}
```

### 7. Error Handling

#### Error Types
```javascript
const ErrorTypes = {
  API_ERROR: 'API request failed',
  RATE_LIMIT: 'Rate limit exceeded',
  NETWORK_ERROR: 'Network connection error',
  STORAGE_ERROR: 'Storage operation failed',
  INVALID_DATA: 'Invalid data format'
};
```

#### Error Handler
```javascript
class ErrorHandler {
  static handle(error, context) {
    console.error(`[${context}]`, error);
    
    // Log to storage for debugging
    this.logError(error, context);
    
    // Show user-friendly message
    this.showUserMessage(error);
    
    // Retry strategy
    if (this.isRetryable(error)) {
      return this.scheduleRetry();
    }
  }

  static isRetryable(error) {
    return [
      ErrorTypes.NETWORK_ERROR,
      ErrorTypes.RATE_LIMIT
    ].includes(error.type);
  }
}
```

### 8. Performance Optimizations

#### Lazy Loading
- Anime covers nur bei Sichtbarkeit laden
- Intersection Observer für List Items

#### Request Batching
- Bulk Updates für Watchlist
- Maximale Batch Size: 50 Anime

#### Caching Strategy
- API Responses: 24h TTL
- Images: Browser Cache
- Search Results: 5 Minuten

#### Debouncing
```javascript
// Search Input
const debouncedSearch = debounce((query) => {
  api.searchAnime(query);
}, 300);

// Watchlist Updates
const debouncedUpdate = debounce(() => {
  updateAllAnime();
}, 5000);
```

### 9. Testing Strategy

#### Unit Tests
- API Handler Functions
- Storage Manager Methods
- Utility Functions (Date Formatting, etc.)

#### Integration Tests
- Service Worker + Storage
- API + Cache Layer
- Popup + Background Communication

#### E2E Tests
- User Flow: Search → Add → Notification
- Settings Changes
- Error Scenarios

#### Manual Testing Checklist
- [ ] Fresh Install
- [ ] Adding 20+ Anime
- [ ] Notification Triggers
- [ ] Service Worker Persistence
- [ ] Settings Sync
- [ ] Error States
- [ ] Performance (100+ Anime)

### 10. Security Considerations

#### Content Security Policy
```json
{
  "content_security_policy": {
    "extension_pages": "script-src 'self'; object-src 'self'"
  }
}
```

#### Data Sanitization
```javascript
function sanitizeTitle(title) {
  return DOMPurify.sanitize(title, {
    ALLOWED_TAGS: [],
    ALLOWED_ATTR: []
  });
}
```

#### API Key Protection
- Keine API Keys erforderlich (AniList ist öffentlich)
- Bei zukünftiger Auth: Secure Storage verwenden

### 11. Accessibility

#### ARIA Labels
```html
<button aria-label="Add anime to watchlist">
<div role="status" aria-live="polite">Loading...</div>
<input aria-describedby="search-help">
```

#### Keyboard Navigation
- Tab-Index Management
- Escape für Modal Close
- Enter für Selections

#### Screen Reader Support
- Beschreibende Labels
- Status Updates
- Error Messages

### 12. Internationalization (Future)

#### Supported Languages (Roadmap)
- English (Default)
- Deutsch
- Español
- Français
- 日本語

#### i18n Structure
```javascript
{
  "en": {
    "app_name": "AniTick",
    "search_placeholder": "Search anime...",
    "next_episode": "Next episode in",
    "no_anime": "No anime in watchlist"
  }
}
```