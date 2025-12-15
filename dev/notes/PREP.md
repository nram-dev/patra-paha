# GAnAmruta Thuli - Project Preparation & Discovery

## Overview

This document captures the preparation phase, key decisions, and learnings before implementation of the GAnAmruta Thuli (GT) bhajan lyrics management app.

## Project Context

**Project Name:** GAnAmruta Thuli (గానామృత துளி)  
**Short Name:** GT  
**Purpose:** Personal PWA for managing devotional song lyrics from Google Drive  
**Primary Device:** 10" Android Tablet (landscape mode)  
**Target User:** Single user (personal use, expandable to family/bhajan group)

## Key Decisions Made

### 1. Authentication Strategy
**Decision:** Client-side only authentication using Google Identity Services  
**Rationale:** 
- Single user scenario - no need for backend
- Lower friction - no server to maintain
- Uses `@react-oauth/google` for React integration
- Scope: `drive.readonly` (read-only access)

**Implementation:**
- OAuth 2.0 Client ID (Web application type)
- No backend proxy needed
- Token stored in browser localStorage
- Automatic token refresh handled by library

### 2. Content Extraction Strategy
**Decision:** HTML export with normalization  
**Requirements:**
- Preserve: Font families, font sizes, bold/italic, structure
- Normalize: Background colors → uniform (remove yellow highlights, use app theme)
- Process: Parse HTML → Extract structure → Apply uniform styling → Render

**Method:**
- Export Google Docs as HTML (`mimeType: 'text/html'`)
- Parse HTML to extract structure
- Remove background colors (yellow highlights from Google Docs)
- Apply uniform app styling while preserving fonts/sizes
- Render with Noto Sans Tamil font

### 3. Folder Naming Convention
**Decision:** Prefix non-deity folders with `__` (double underscore)

**Structure:**
```
/Namasankeerthanam/
  /Devi/          ← Normal name (deity folder)
  /Guru/          ← Normal name (deity folder)
  /__Media__/     ← Prefixed (non-deity)
  /__Special__/   ← Prefixed (non-deity)
```

**Detection Logic:**
- Folders starting with `__` are non-deity folders
- All other folders under `/Namasankeerthanam/` are deity folders
- User can customize deity order seasonally

### 4. Metadata Strategy
**Decision:** Progressive enhancement - works without, better with

**Format (Optional header block in Google Docs):**
```
---
Title: Karpaga Valli Nin Porpatangal
Ragam: Anandha Bhairavi
Talam: Aadhi
Deity: Devi
Tags: Kamakshi, Kanchi
YouTube: https://youtube.com/...
Source: Veeramani Iyer, Yaazhpaana Inuvil
---

[Song lyrics start here...]
```

**Enhanced Parser Features:**
- Multi-line value support
- Array handling (Tags, Deity - comma-separated)
- Validation and error recovery
- Special character escaping
- Case-insensitive keys
- Graceful fallback if metadata missing

**What Metadata Enables:**
- Structured display (ragam, talam in header)
- Search by ragam, talam, tags
- Multi-deity songs (one song can appear in multiple deity folders)
- Quick YouTube links
- Better organization

**Migration Path:**
- Phase 1: Use as-is (works without metadata)
- Phase 2: Add metadata to top 10 most-used songs
- Phase 3: Gradually add to more songs over months
- No deadline, no pressure

### 5. Sync Strategy
**Decision:** Manual sync only (user-initiated)

**Rationale:**
- Single user - no need for background sync
- Simpler implementation
- User controls when to check for updates
- Reduces API quota usage

**Implementation:**
- "Sync Now" button in UI
- Checks for new/updated files
- Downloads new text documents automatically
- Updates IndexedDB cache

### 6. Error Handling Strategy

**API Rate Limits:**
- Google Drive API: 20,000 requests/day (free tier)
- Exponential backoff with retry
- Cache everything in IndexedDB to minimize API calls

**Network Failures:**
- Graceful degradation
- Offline mode with cached content
- User-friendly error messages
- Retry mechanisms

**Corrupted Data:**
- Validation on read
- Recovery mechanisms
- User notification if data issues detected

**Missing Files:**
- Skip with user notification
- Continue scanning other files
- Log errors for review

## Technical Stack Decisions

### Frontend
- **Framework:** React 18+ with TypeScript
- **Build Tool:** Vite
- **UI Library:** Chakra UI (RTL support for Indian languages)
- **PWA:** Workbox for service workers
- **State Management:** React Context or Zustand (lightweight)

### Storage
- **Primary:** Google Drive (existing content)
- **Offline:** IndexedDB via Dexie.js
- **Authentication:** Google Identity Services (client-side)

### Key Libraries
```json
{
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "typescript": "^5.0.0",
    "@chakra-ui/react": "^2.8.0",
    "@react-oauth/google": "^0.12.0",
    "framer-motion": "^10.16.0",
    "dexie": "^3.2.4",
    "dexie-react-hooks": "^1.1.6",
    "workbox-core": "^7.0.0",
    "workbox-precaching": "^7.0.0",
    "workbox-routing": "^7.0.0",
    "fuse.js": "^7.0.0"
  }
}
```

## Google Drive API Setup Requirements

### OAuth Configuration
1. **OAuth Consent Screen:**
   - Application type: Web application
   - Scopes required: `https://www.googleapis.com/auth/drive.readonly`
   - Testing mode (for personal use)
   - Add user email as test user

2. **OAuth Client ID:**
   - Type: Web application
   - Authorized JavaScript origins: `http://localhost:5173` (dev), production URL
   - Authorized redirect URIs: `http://localhost:5173` (dev), production URL

3. **APIs to Enable:**
   - Google Drive API (required)
   - Google Docs API (for better content extraction)

### API Quotas
- **Free Tier:** 20,000 requests/day
- **Strategy:** Aggressive caching in IndexedDB
- **Sync Frequency:** Manual only (user-initiated)

## Content Type Handling

### Google Docs (Text)
- Export as HTML for formatting preservation
- Parse HTML to extract structure
- Normalize styling (uniform background, preserve fonts)
- Render with Noto Sans Tamil font
- Extract metadata if present (header block)

### Google Docs with Images
- Export as HTML
- Extract embedded images
- Display at full column width
- Enable zoom on tap
- Cache images for offline

### Standalone Images
- Fetch image URL from Drive API
- Full-screen viewer with zoom
- Pinch-to-zoom on mobile/tablet
- Pan gestures
- Download option for offline

### PDFs
- Show metadata card (name, size, modified date)
- Preview thumbnail if available
- Actions: Open in Google Drive, Download for offline
- Link to specific page if metadata includes page number

## Offline Strategy

### Tier 1: Auto-Download (Immediate)
- All text-based Google Docs
- File metadata (names, sizes, modified dates)
- Folder structure
- Estimated size: 10-20 MB

### Tier 2: On-Demand (When Viewed)
- Images embedded in documents
- Standalone image files
- Cached after first view
- Estimated size: 1-3 MB per song with images

### Tier 3: User Choice (Manual)
- PDF files
- Audio files
- User explicitly downloads

### IndexedDB Schema (Dexie)
```typescript
interface Song {
  id: string;
  driveFileId: string;
  name: string;
  deity: string;
  contentType: 'text' | 'image' | 'pdf' | 'audio';
  content?: string; // For text songs
  imageUrl?: string; // For images
  metadata?: {
    title?: string;
    ragam?: string;
    talam?: string;
    tags?: string[];
    youtube?: string;
  };
  modifiedTime: string;
  cachedAt: string;
  size: number;
}

interface Deity {
  id: string;
  name: string;
  driveFolderId: string;
  order: number;
  songCount: number;
}

interface AppSettings {
  id: string;
  theme: 'calm' | 'dark' | 'auto';
  fontSize: 'small' | 'medium' | 'large' | 'xlarge';
  lineSpacing: 1.5 | 1.8 | 2.0;
  deityOrder: string[];
  autoDownload: {
    text: boolean;
    imagesOnView: boolean;
    allImages: boolean;
    pdfs: boolean;
    audio: boolean;
  };
}
```

## UI/UX Design Decisions

### Layout
- **3-Column Master-Detail** (Android Laptop landscape)
  - Column 1: Deity/Folder navigation (200px fixed)
  - Column 2: Song list (280px fixed)
  - Column 3: Song content viewer (fluid width)

### Color Schemes
**Calm Mode (Default):**
- Background: #F5F5DC (Warm Beige)
- Text: #2C1810 (Dark Brown)
- Accents: #FF9933 (Soft Saffron)
- Cards: #FFFFFF (White)

**Dark Mode:**
- Background: #1A1A1A (Deep Charcoal)
- Text: #F5F5F0 (Warm White)
- Accents: #D4AF37 (Muted Gold)
- Cards: #2D2D2D (Dark Gray)

### Typography
- **Tamil Font:** Noto Sans Tamil
- **English Font:** Inter / SF Pro
- **Sizes:** 18px (small), 22px (medium), 28px (large), 36px (xlarge)
- **Line Height:** 1.8 (comfortable reading)

### Key Features
- Customizable deity order (seasonal priority)
- Favorites and recent songs
- Search (filename, metadata, content)
- Font size controls
- Theme toggle (calm/dark)
- Offline support
- Progressive enhancement with metadata

## Implementation Phases

### Phase 1: Foundation (Week 1)
- React + TypeScript + Vite setup
- Google Drive API client (client-side auth)
- Enhanced metadata parser
- HTML content normalizer
- IndexedDB setup with Dexie
- Basic 3-column layout

### Phase 2: Core Features (Week 2)
- Navigation component (Column 1)
- Song list component (Column 2)
- Text song viewer (Column 3)
- Tamil font rendering
- Offline caching for text songs
- Manual sync functionality

### Phase 3: Enhanced Features (Week 3)
- Image song viewer (with zoom)
- PDF reference display
- Search implementation (Fuse.js)
- Settings panel
- Deity order customization
- Theme toggle
- Font size controls

### Phase 4: Polish & Deploy (Week 4)
- PWA setup (manifest, service worker)
- Responsive mobile view
- Performance optimization
- Deploy to hosting (Firebase/Vercel)
- Test on Android tablet

## Drive Scanner Tool

**Location:** `dev/scripts/scan-drive-browser.html`

**Purpose:** Analyze Google Drive structure before implementation

**Features:**
- Scans `/Namasankeerthanam` folder structure
- Analyzes file types and distribution
- Reports image percentage
- Identifies Google Docs with images vs text-only
- Generates JSON report

**Usage:**
1. Serve via local HTTP server (e.g., `python -m http.server 8000`)
2. Open in browser
3. Enter OAuth Client ID
4. Authenticate
5. Click "Start Scan"
6. Review report

**Output:**
- Folder structure analysis
- File type distribution
- Image percentage (standalone + embedded)
- Google Docs analysis (text-only vs with images)
- File sizes
- JSON report download

## Actual Drive Structure Analysis

**Scan Date:** December 14, 2025  
**Report:** `drive-scan-report.json`

### Summary Statistics
- **Total Files:** 315
- **Total Folders:** 50
- **Deity Folders:** 27 (at depth 1)
- **Special Folders:** 22 (includes nested folders)

### Google Docs Analysis
- **Total Google Docs:** 188
- **Text Only:** 159 (84.57%)
- **With Images:** 29 (15.43%)
- **Key Finding:** 15.43% of songs have embedded images - image handling is important but not critical for MVP

### Image Analysis
- **Standalone Images:** 0
- **Images in Documents:** 29
- **Key Finding:** All images are embedded in Google Docs - no standalone image files to handle

### File Type Distribution
- **Google Docs:** 188 (59.7%)
- **PDFs:** 59 (18.7%)
- **Audio Files:** 54 (17.1%) - MP3, M4A, MP4 audio
- **Word Documents:** 8 (2.5%)
- **Spreadsheets:** 3 (1.0%)
- **Video Files:** 3 (1.0%)

### Folder Structure Insights

**Top-Level Deity Folders (27):**
- Devi (20 files)
- Ayyappa (34 files + 1 subfolder)
- Guru (19 files)
- Murugan (14 files)
- Krishna (14 files)
- Siva (15 files)
- Vinayaka (7 files)
- Narayana (5 files)
- Rama (3 files)
- Hanuman (3 files)
- Lakshmi (1 file)
- Thiruppugazh (2 files)
- Misc (5 files)
- And 14 more folders...

**Special Folders (Need `__` Prefix):**
- Audio (20 files + 1 subfolder)
- AUDIO (4 files + 1 subfolder)
- Bhajan Class 2021 (0 files, 3 subfolders)
- Bhajan Class 2024 (14 files)
- Marriage songs (7 files)
- KKSF (1 file)
- Self (1 file)
- Misc (5 files) - Note: There's also a Misc at depth 3

**Nested Structure:**
- Some folders are nested 2-5 levels deep
- Example: `Bhajan Class 2021 > Lyrics > [Deity folders]`
- Example: `Events > Sankara-Jayanthi-Apr-2020 > Tracks > Finished`

### Implementation Implications

1. **Image Handling Priority:** Medium
   - 15.43% have images, but all are embedded in docs
   - Can handle images in Phase 2 or 3
   - HTML export will preserve images

2. **PDF Handling:** Important
   - 59 PDFs (18.7% of files)
   - Need PDF viewer or link to Google Drive
   - Consider download option for offline

3. **Audio Files:** Low Priority for MVP
   - 54 audio files (17.1%)
   - Can be handled in later phase
   - Link to Google Drive for now

4. **Folder Organization:**
   - Need to identify special folders (Audio, Classes, Events, etc.)
   - Some folders need `__` prefix for proper categorization
   - Nested folders require recursive scanning

5. **Content Volume:**
   - 188 Google Docs is manageable
   - Estimated cache size: ~15-25 MB for text docs
   - Images add ~1-3 MB per doc with images (29 docs = ~30-90 MB)

### Recommended Folder Reorganization

Folders that should be renamed with `__` prefix:
- `Audio` → `__Media__/Audio`
- `AUDIO` → `__Media__/AUDIO` (or merge with Audio)
- `Bhajan Class 2021` → `__Media__/Bhajan Class 2021`
- `Bhajan Class 2024` → `__Media__/Bhajan Class 2024`
- `Marriage songs` → `__Special__/Marriage songs`
- `KKSF` → `__Special__/KKSF`
- `Self` → `__Special__/Self`
- `Misc` (top-level) → `__Special__/Misc`

**Note:** This reorganization is optional - the app can detect these folders programmatically, but renaming makes it cleaner.

## Key Learnings

### Google Drive API
- OAuth consent screen must have scopes configured
- Google Drive API must be explicitly enabled
- Token scopes can be verified in token response
- Client-side authentication works well for single-user apps

### Content Extraction
- HTML export preserves more formatting than plain text
- Need to normalize styling for uniform appearance
- Images in Google Docs require special handling
- Metadata parsing should be robust with fallbacks

### User Experience
- Progressive enhancement approach reduces pressure
- Manual sync gives user control
- Offline-first design critical for mobile use
- Customizable deity order important for seasonal use

## Next Steps for Implementation

1. **Set up development environment**
   - Initialize React + TypeScript + Vite project
   - Install dependencies
   - Configure Chakra UI

2. **Google Cloud Console setup**
   - Enable Google Drive API
   - Configure OAuth consent screen
   - Create OAuth Client ID
   - Add test user

3. **Implement core components**
   - Authentication flow
   - Drive API integration
   - Content extraction and normalization
   - IndexedDB caching

4. **Build UI components**
   - 3-column layout
   - Navigation panel
   - Song list
   - Song viewer

5. **Add features incrementally**
   - Search
   - Settings
   - Offline sync
   - Customization

## References

- Design Spec: `dev/notes/bhajan-ui-design-spec.md`
- Mockups: `dev/notes/bhajan-ui-mockups-final.md`
- Implementation Guide: `dev/notes/Implementation-Guide.md`
- Drive Scanner: `dev/scripts/scan-drive-browser.html`

## Notes

- All troubleshooting steps for 403 errors are documented separately (not included here)
- Scanner tool is functional and ready for use
- Key technical decisions are documented above
- Ready to proceed with implementation phase

