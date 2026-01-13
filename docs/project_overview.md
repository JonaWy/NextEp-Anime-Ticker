# AniTick - Anime Release Tracker Chrome Extension

## Projektzusammenfassung

AniTick ist eine Chrome Extension, die als Ticker für Anime-Serien funktioniert. Nutzer können ihre favorisierten Anime-Serien bookmarken und erhalten Informationen über:
- Neue Episoden-Releases
- Countdown bis zur nächsten Folge
- Anime-Status (laufend, pausiert, beendet)
- Release-Schedule
- News und Updates

## Technologie-Stack

### Frontend
- HTML5, CSS3, JavaScript (ES6+)
- Manifest V3 (neueste Chrome Extension API)
- Responsive Design für Popup-Interface

### Backend/API
- **AniList GraphQL API** (primäre Datenquelle)
  - Kostenlos und öffentlich zugänglich
  - Über 500.000 Anime/Manga Einträge
  - Echtzeit Airing-Daten
  - Keine Authentifizierung für öffentliche Daten erforderlich
- URL: `https://graphql.anilist.co`

### Storage
- Chrome Storage API (chrome.storage.sync) für Cross-Device Sync
- Lokale Speicherung der Anime-Bookmarks
- Cache für API-Responses

## Hauptfunktionen (MVP)

### Phase 1 - Core Features
1. **Anime Suchen & Hinzufügen**
   - Suchfunktion mit AniList API
   - Anime zur Watchlist hinzufügen
   - Anime-Details anzeigen (Cover, Titel, Status)

2. **Ticker Display**
   - Liste aller gebookmarkten Anime
   - Status-Anzeige (Currently Airing, Not Yet Released, Finished)
   - Nächstes Release-Datum mit Countdown
   - Episode-Counter (z.B. "12/24 Folgen")

3. **Benachrichtigungen**
   - Browser-Benachrichtigung bei neuer Folge
   - Einstellbare Benachrichtigungszeiten

4. **Background Updates**
   - Automatische Checks alle 30 Minuten
   - Service Worker für effiziente Background-Tasks

### Phase 2 - Enhanced Features
- Filterung nach Wochentag
- Sortierung (alphabetisch, Release-Datum, etc.)
- Quick-Links zu Streaming-Plattformen
- Spoiler-Filter für Beschreibungen
- Dark/Light Theme
- Export/Import der Watchlist

### Phase 3 - Advanced Features
- Anime-Empfehlungen basierend auf Watchlist
- Synchronisation mit AniList-Account (optional)
- Statistiken (gesehene Folgen, Zeit investiert)
- Content Script: Automatische Erkennung von Anime-Seiten

## Architektur-Übersicht

```
AniTick Extension
├── manifest.json (Extension Configuration)
├── background/
│   └── service-worker.js (Background Tasks, API Calls)
├── popup/
│   ├── popup.html (Main UI)
│   ├── popup.js (UI Logic)
│   └── popup.css (Styling)
├── content/
│   └── content.js (Optional: Web Page Integration)
├── utils/
│   ├── api.js (AniList API Handler)
│   ├── storage.js (Storage Management)
│   └── notifications.js (Notification Handler)
├── assets/
│   └── icons/ (Extension Icons)
└── config/
    └── constants.js (Configuration Constants)
```

## Entwicklungs-Workflow

1. **Lokale Entwicklung**
   - Extensions-Ordner in Chrome laden (chrome://extensions)
   - Developer Mode aktivieren
   - "Load unpacked" für schnelles Testing

2. **Testing**
   - Chrome DevTools für Debugging
   - Service Worker Console für Background Tasks
   - Storage API Inspector

3. **Deployment**
   - Vorbereitung für Chrome Web Store
   - Icon-Set (16x16, 48x48, 128x128)
   - Screenshots und Beschreibung
   - Privacy Policy

## Best Practices

### Manifest V3 Compliance
- Service Workers statt Background Pages
- Declarative Net Request API wo möglich
- Minimale Permissions
- Content Security Policy

### Performance
- Lazy Loading für API-Daten
- Caching von Anime-Informationen
- Debouncing für Search-Input
- Optimierte Render-Zyklen

### Security
- Input Sanitization
- Keine remote hosted code
- Sichere API-Kommunikation
- User Data Privacy

### UX/UI
- Intuitive Navigation
- Klare Status-Indikatoren
- Responsive Design
- Accessibility (ARIA Labels)
- Loading States & Error Handling

## Bekannte Limitierungen

1. **AniList API Rate Limiting**
   - 90 Requests pro Minute
   - Implementierung von Request Batching

2. **Service Worker Lifecycle**
   - Workers werden nach Inaktivität beendet
   - Wichtige Daten müssen persistent gespeichert werden

3. **Chrome Extension Permissions**
   - Minimale Permissions für bessere User Trust
   - Keine <all_urls> Permission ohne konkreten Nutzen

## Erfolgsmetriken (Post-Launch)

- Anzahl aktiver Nutzer
- Durchschnittliche Anzahl gebookmarkter Anime
- Benachrichtigungs-Engagement
- Chrome Web Store Rating
- User Feedback und Feature Requests

## Nächste Schritte

1. Development Environment Setup
2. Manifest.json erstellen
3. AniList API Integration testen
4. Popup UI Design & Implementation
5. Service Worker für Background Tasks
6. Storage Management
7. Testing & Debugging
8. Chrome Web Store Preparation