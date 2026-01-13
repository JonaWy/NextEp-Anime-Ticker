# AniTick - Anime Release Tracker

Eine Chrome Extension zum Verfolgen von Anime-Serien und Benachrichtigungen bei neuen Folgen.

## Features

- 🔍 **Anime Suchen** - Suche nach Anime über die AniList API
- 📋 **Watchlist** - Speichere deine Lieblings-Anime
- ⏰ **Countdown** - Sieh wann die nächste Folge erscheint
- 🔔 **Benachrichtigungen** - Erhalte Alerts bei neuen Folgen
- 🌙 **Dark Mode** - Augenschonendes Design

## Installation (Development)

### Voraussetzungen

- Node.js 18.x oder höher
- npm 9.x oder höher
- Google Chrome

### Setup

```bash
# Dependencies installieren
npm install

# Linting
npm run lint

# Code formatieren
npm run format
```

### In Chrome laden

1. Öffne `chrome://extensions/`
2. Aktiviere **Developer Mode** (oben rechts)
3. Klicke **Load unpacked**
4. Wähle den Projektordner

## Projektstruktur

```
anitick-extension/
├── manifest.json          # Extension Konfiguration
├── background/
│   └── service-worker.js  # Background Tasks, API Calls
├── popup/
│   ├── popup.html         # Main UI
│   ├── popup.js           # UI Logic
│   └── popup.css          # Styling
├── content/
│   └── content.js         # Web Page Integration (optional)
├── utils/
│   ├── api.js             # AniList API Handler
│   ├── storage.js         # Storage Management
│   ├── notifications.js   # Notification Handler
│   └── helpers.js         # Utility Functions
├── assets/
│   └── icons/             # Extension Icons
└── config/
    └── constants.js       # Konfiguration
```

## API

Diese Extension nutzt die [AniList GraphQL API](https://anilist.gitbook.io/anilist-apiv2-docs/).

- Kostenlos und öffentlich zugänglich
- Keine Authentifizierung erforderlich
- Rate Limit: 90 Requests/Minute

## Development

### Debugging

- **Popup**: Rechtsklick auf Extension Icon → "Inspect popup"
- **Service Worker**: `chrome://extensions/` → "service worker" Link
- **Storage**: DevTools → Application → Storage

### Befehle

```bash
npm run lint        # Code prüfen
npm run lint:fix    # Fehler automatisch beheben
npm run format      # Code formatieren
npm run format:check # Formatierung prüfen
```

## Lizenz

MIT License
