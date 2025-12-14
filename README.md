# GAnAmruta Thuli (GT)

Personal PWA for managing devotional song lyrics from Google Drive.

## Project Overview

**GAnAmruta Thuli** (கானாம்ருத துளி) is a Progressive Web App that displays devotional songs (bhajans) from your Google Drive, organized by deity folders with customizable seasonal ordering.

## Features

- 📱 **PWA** - Works offline after initial download
- 🎨 **Beautiful Tamil/Sanskrit rendering** - Noto Sans Tamil font support
- 📁 **Google Drive Integration** - Direct access to your existing content
- 🔍 **Search** - Find songs by filename, metadata, or content
- 🎯 **Progressive Enhancement** - Works without metadata, enhanced with it
- 🌙 **Theme Support** - Calm and dark modes
- 📱 **Responsive** - Optimized for 10" Android tablets (landscape)

## Tech Stack

- **React 18** with TypeScript
- **Vite** - Build tool
- **Chakra UI** - Component library with RTL support
- **Dexie.js** - IndexedDB wrapper for offline storage
- **Google Drive API** - Client-side OAuth authentication
- **Workbox** - Service worker for PWA

## Setup Instructions

### 1. Prerequisites

- Node.js 18+ and npm
- Google Cloud Console account
- Google Drive with `/Namasankeerthanam` folder structure

### 2. Install Dependencies

```bash
npm install
```

### 3. Google Cloud Console Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project: "GAnAmruta Thuli"
3. Enable **Google Drive API**
4. Configure OAuth Consent Screen:
   - Application type: Web application
   - Scopes: `https://www.googleapis.com/auth/drive.readonly`
   - Testing mode (for personal use)
   - Add your email as a test user
5. Create OAuth 2.0 Client ID:
   - Type: Web application
   - Authorized JavaScript origins: `http://localhost:5173`
   - Authorized redirect URIs: `http://localhost:5173`
6. Copy the Client ID

### 4. Environment Configuration

Create a `.env` file in the project root:

```bash
cp .env.example .env
```

Edit `.env` and add your Google OAuth Client ID:

```
VITE_GOOGLE_CLIENT_ID=your-client-id-here.apps.googleusercontent.com
```

### 5. Run Development Server

```bash
npm run dev
```

The app will open at `http://localhost:5173`

### 6. Build for Production

```bash
npm run build
```

The production build will be in the `dist` folder.

## Project Structure

```
src/
├── components/
│   └── layout/
│       ├── Header.tsx          # App header with theme toggle
│       ├── Navigation.tsx      # Column 1: Deity folders
│       ├── SongList.tsx        # Column 2: Songs in selected deity
│       └── SongViewer.tsx      # Column 3: Song content viewer
├── db/
│   └── database.ts             # Dexie IndexedDB setup
├── services/
│   ├── driveService.ts         # Google Drive API client
│   ├── metadataParser.ts       # Enhanced metadata parser
│   └── contentNormalizer.ts    # HTML content normalizer
├── types/
│   └── index.ts                # TypeScript type definitions
├── App.tsx                     # Main app component
├── main.tsx                    # Entry point
└── theme.ts                    # Chakra UI theme configuration
```

## Google Drive Structure

The app expects the following structure in your Google Drive:

```
/Namasankeerthanam/
  /Devi/          ← Deity folder
  /Guru/          ← Deity folder
  /Ayyappa/       ← Deity folder
  /__Media__/     ← Non-deity folder (prefixed with __)
  /__Special__/   ← Non-deity folder (prefixed with __)
```

**Note:** Folders starting with `__` are treated as non-deity folders and won't appear in the main navigation.

## Metadata Format (Optional)

You can add optional metadata to Google Docs using a header block:

```
---
Title: Karpaga Valli Nin Porpatangal
Ragam: Anandha Bhairavi
Talam: Aadhi
Deity: Devi
Tags: Kamakshi, Kanchi
YouTube: https://youtube.com/watch?v=...
Source: Veeramani Iyer, Yaazhpaana Inuvil
---

[Song lyrics start here...]
```

The app works perfectly without metadata - this is just for enhanced features like search by ragam/talam.

## Development Phases

### ✅ Phase 1: Foundation (Completed)
- React + TypeScript + Vite setup
- Google Drive API client (client-side auth)
- Enhanced metadata parser
- HTML content normalizer
- IndexedDB setup with Dexie
- Basic 3-column layout

### Phase 2: Core Features (Next)
- Navigation component enhancements
- Song list component enhancements
- Text song viewer with Tamil fonts
- Offline caching for text songs
- Manual sync functionality

### Phase 3: Enhanced Features
- Image song viewer (with zoom)
- PDF reference display
- Search implementation (Fuse.js)
- Settings panel
- Deity order customization
- Theme toggle
- Font size controls

### Phase 4: Polish & Deploy
- PWA setup (manifest, service worker)
- Responsive mobile view
- Performance optimization
- Deploy to hosting (Firebase/Vercel)
- Test on Android tablet

## License

MIT

## Notes

- All content stays in your Google Drive
- IndexedDB is local to your device
- No backend required - fully client-side
- OAuth tokens stored in browser localStorage
