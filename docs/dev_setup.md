# Development Setup Guide - AniTick Chrome Extension

## Prerequisites

### Required Software
- **Node.js**: Version 18.x oder höher
- **npm**: Version 9.x oder höher (kommt mit Node.js)
- **Google Chrome**: Aktuelle Version (für Testing)
- **Code Editor**: VS Code empfohlen (oder Cursor IDE)
- **Git**: Für Version Control

### Optional Tools
- Chrome Extension Hot Reload (für Live Reloading)
- Postman oder Insomnia (für API Testing)
- Chrome DevTools Extension (für besseres Debugging)

## Project Setup

### 1. Projekt-Struktur erstellen

```bash
# Hauptordner erstellen
mkdir anitick-extension
cd anitick-extension

# Ordnerstruktur
mkdir -p {background,popup,content,utils,assets/icons,config}
```

### 2. Finale Ordnerstruktur

```
anitick-extension/
├── manifest.json
├── background/
│   └── service-worker.js
├── popup/
│   ├── popup.html
│   ├── popup.js
│   └── popup.css
├── content/
│   └── content.js
├── utils/
│   ├── api.js
│   ├── storage.js
│   ├── notifications.js
│   └── helpers.js
├── assets/
│   └── icons/
│       ├── icon-16.png
│       ├── icon-48.png
│       └── icon-128.png
├── config/
│   └── constants.js
├── package.json
├── .gitignore
└── README.md
```

### 3. package.json erstellen

```bash
npm init -y
```

**Inhalt anpassen:**
```json
{
  "name": "anitick",
  "version": "1.0.0",
  "description": "Anime Release Tracker Chrome Extension",
  "scripts": {
    "test": "echo \"No tests yet\"",
    "lint": "eslint .",
    "format": "prettier --write \"**/*.{js,json,css,html}\""
  },
  "keywords": ["chrome-extension", "anime", "tracker", "anilist"],
  "author": "Your Name",
  "license": "MIT",
  "devDependencies": {
    "eslint": "^8.52.0",
    "prettier": "^3.0.3"
  }
}
```

### 4. Development Dependencies installieren

```bash
# ESLint für Code Quality
npm install --save-dev eslint

# Prettier für Code Formatting
npm install --save-dev prettier

# Optional: ESLint Chrome Extensions Plugin
npm install --save-dev eslint-plugin-chrome-extension
```

### 5. .gitignore erstellen

```bash
cat > .gitignore << 'EOF'
# Dependencies
node_modules/
package-lock.json

# Build artifacts
dist/
build/

# IDE
.vscode/
.idea/
*.swp
*.swo

# OS
.DS_Store
Thumbs.db

# Logs
*.log
npm-debug.log*

# Environment
.env
.env.local

# Chrome specific
*.pem
*.crx
*.zip
EOF
```

### 6. ESLint Configuration

```bash
cat > .eslintrc.json << 'EOF'
{
  "env": {
    "browser": true,
    "es2021": true,
    "webextensions": true
  },
  "extends": "eslint:recommended",
  "parserOptions": {
    "ecmaVersion": "latest",
    "sourceType": "module"
  },
  "rules": {
    "no-unused-vars": "warn",
    "no-console": "off",
    "semi": ["error", "always"],
    "quotes": ["error", "single"]
  },
  "globals": {
    "chrome": "readonly"
  }
}
EOF
```

### 7. Prettier Configuration

```bash
cat > .prettierrc << 'EOF'
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": true,
  "printWidth": 80,
  "tabWidth": 2,
  "useTabs": false
}
EOF
```

## Chrome Extension Setup

### 1. Extension in Chrome laden

1. Chrome öffnen
2. Navigiere zu `chrome://extensions/`
3. **Developer Mode** aktivieren (Toggle oben rechts)
4. Klicke **"Load unpacked"**
5. Wähle dein `anitick-extension` Verzeichnis

### 2. Extension Icon erstellen

Falls du keine Icons hast, erstelle temporäre Placeholders:

**Quick Icon Generator (Online):**
- https://www.favicon-generator.org/
- https://realfavicongenerator.net/

**Erforderliche Größen:**
- 16x16px (Toolbar)
- 48x48px (Extension Management)
- 128x128px (Chrome Web Store)

### 3. Reload Extension während Development

Nach Code-Änderungen:
1. Gehe zu `chrome://extensions/`
2. Finde deine Extension
3. Klicke auf das **Reload Icon** 🔄

**Oder verwende Keyboard Shortcut:**
- Windows/Linux: `Ctrl + R` auf Extension Page
- Mac: `Cmd + R`

## Development Workflow

### 1. Live Debugging

#### Popup Debugging
1. Rechtsklick auf Extension Icon → "Inspect popup"
2. DevTools öffnet sich
3. Console, Network, Storage Tabs verfügbar

#### Service Worker Debugging
1. Gehe zu `chrome://extensions/`
2. Finde deine Extension
3. Klicke "service worker" Link
4. DevTools für Background Script öffnet sich

#### Content Script Debugging
1. Öffne die Webseite
2. `F12` für DevTools
3. Content Script läuft im Page Context

### 2. Storage Inspector

```javascript
// Im DevTools Console
chrome.storage.sync.get(null, (data) => {
  console.log('Alle gespeicherten Daten:', data);
});

// Watchlist anzeigen
chrome.storage.sync.get('watchlist', (data) => {
  console.log('Watchlist:', data.watchlist);
});

// Storage löschen (für Testing)
chrome.storage.sync.clear(() => {
  console.log('Storage cleared');
});
```

### 3. API Testing

#### GraphQL Playground
- URL: https://anilist.co/graphiql
- Teste Queries direkt im Browser
- Kopiere Working Queries in deine Extension

#### Postman/Insomnia Collection
```json
{
  "name": "AniList API",
  "requests": [
    {
      "name": "Search Anime",
      "method": "POST",
      "url": "https://graphql.anilist.co",
      "headers": {
        "Content-Type": "application/json"
      },
      "body": {
        "query": "query ($search: String) { ... }"
      }
    }
  ]
}
```

### 4. Common Development Tasks

#### Neue Funktion testen
```bash
# 1. Code ändern
# 2. Extension reloaden
# 3. Popup öffnen & testen
# 4. Service Worker Console checken
# 5. Storage inspizieren
```

#### Fehler debuggen
```bash
# 1. Error Message in Console finden
# 2. Breakpoints setzen
# 3. Step-through Debugging
# 4. Variables inspizieren
```

#### Performance prüfen
```javascript
// Timing messen
console.time('API Call');
await api.searchAnime('Frieren');
console.timeEnd('API Call');

// Memory Usage
console.log(performance.memory);
```

## Testing Setup

### 1. Manual Testing Checklist

Erstelle eine Datei `TESTING_CHECKLIST.md`:

```markdown
## Installation
- [ ] Fresh install funktioniert
- [ ] Icons werden korrekt angezeigt
- [ ] Popup öffnet sich

## Core Features
- [ ] Anime suchen funktioniert
- [ ] Anime hinzufügen funktioniert
- [ ] Anime entfernen funktioniert
- [ ] Watchlist wird persistiert
- [ ] Updates werden geladen

## Notifications
- [ ] Benachrichtigung bei neuer Folge
- [ ] Notification Click funktioniert
- [ ] Settings respektiert

## Edge Cases
- [ ] Leere Watchlist
- [ ] API Error Handling
- [ ] Offline Modus
- [ ] Keine Suchergebnisse
- [ ] Rate Limit erreicht
```

### 2. Test Data Generator

```javascript
// utils/test-data.js
export const testAnime = [
  {
    id: 154587,
    title: { romaji: 'Frieren', english: 'Frieren: Beyond Journey\'s End' },
    status: 'RELEASING',
    nextEpisode: { number: 15, airingAt: Date.now() / 1000 + 3600 }
  },
  {
    id: 21,
    title: { romaji: 'One Piece' },
    status: 'RELEASING',
    nextEpisode: { number: 1090, airingAt: Date.now() / 1000 + 86400 }
  }
];

export function loadTestData() {
  chrome.storage.sync.set({ watchlist: testAnime });
}
```

## Troubleshooting

### Problem: Extension lädt nicht
**Lösung:**
- Manifest.json Syntax prüfen
- Console Errors checken
- Permissions korrekt?

### Problem: Service Worker stoppt
**Lösung:**
- Das ist normal bei Manifest V3
- Alarms für periodische Tasks nutzen
- Wichtige Daten in Storage

### Problem: API Calls schlagen fehl
**Lösung:**
- Network Tab in DevTools checken
- CORS Policy (sollte OK sein für AniList)
- Rate Limiting?

### Problem: Storage Sync funktioniert nicht
**Lösung:**
- Chrome Sync aktiviert?
- Quota Limits beachten (100KB sync, 5MB local)
- Storage API Permissions korrekt?

## Production Build Vorbereitung

### 1. Code Optimierung
```bash
# Linting durchführen
npm run lint

# Formatting prüfen
npm run format
```

### 2. Assets vorbereiten
- Icons in allen Größen
- Screenshots für Web Store
- Promotional Images

### 3. Testing
- Alle Manual Tests durchführen
- Edge Cases testen
- Performance Audit

### 4. Package erstellen
```bash
# Zip für Upload erstellen
zip -r anitick-extension.zip . -x "node_modules/*" -x ".git/*" -x "*.md"
```

## VS Code / Cursor Extensions (Empfohlen)

### Nützliche Extensions
- **ESLint** (dbaeumer.vscode-eslint)
- **Prettier** (esbenp.prettier-vscode)
- **Chrome Extension Tools** (cezaraugusto.chrome-extension-tools)
- **REST Client** (humao.rest-client) für API Testing
- **GitLens** (eamodio.gitlens)

### VS Code Settings
```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "eslint.validate": ["javascript"],
  "[javascript]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  }
}
```

## Nächste Schritte

1. ✅ Development Environment Setup abgeschlossen
2. ➡️ Weiter zu `IMPLEMENTATION_GUIDE.md`
3. ➡️ manifest.json erstellen (siehe `MANIFEST_TEMPLATE.md`)
4. ➡️ API Integration implementieren
5. ➡️ Popup UI bauen