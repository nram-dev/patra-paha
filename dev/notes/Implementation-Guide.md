# GAnAmruta Thuli (GT) - Complete Implementation Guide

## Project Overview

**Project Name:** GAnAmruta Thuli (గానామృత துளి)  
**Short Name:** GT  
**Target Users:** Personal use, expandable to family/bhajan group  
**Primary Device:** 10" Android Tablet (landscape mode)  
**Secondary Devices:** iPhone, Android Phone, Windows/Mac laptops  

## Quick Start Summary

### What This App Does
- Displays devotional songs (bhajans) from your Google Drive
- Organizes by deity folders with customizable seasonal ordering
- Works offline after initial download
- Handles mixed content: Tamil text, images, PDFs
- Beautiful Tamil/Sanskrit text rendering
- Progressive enhancement with optional metadata

### Technical Architecture
```
Your Google Drive (Content Storage)
    ↕ Google Drive API
React PWA (User Interface)
    ↕ IndexedDB (Offline Cache)
Firebase (Optional - for metadata/tracking)
```

---

## File Organization Reference

### Your Current Google Drive Structure
```
/Namasankeerthanam/
  /Devi/ (23 songs)
    - abhirAmi andhAdhi (Google Doc - text)
    - Amba bhavani (Google Doc - contains image/table)
    - karpaga valli nin (Google Doc - text with yellow highlighting)
    - ... more songs
  /Guru/ (18 songs)
  /Ayyappa/ (31 songs)
  /Muruga/ (12 songs)
  ... (~24 deity folders total)
  
  /AUDIO/ (audio files)
  /Bhajan Class 2021/ (class materials)
  /Bhajan Class 2024/ (class materials)
  /Marriage songs/ (special occasions)
  /KKSF/
  /Self/
  /Misc/
```

### Recommended Organization (In App)
```
App Navigation:
├─ DEITIES (customizable order)
│  ├─ Devi
│  ├─ Guru
│  ├─ Ayyappa
│  └─ ... (user can reorder seasonally)
├─ MEDIA ▼
│  ├─ Audio
│  ├─ Class 2021
│  └─ Class 2024
└─ SPECIAL ▼
   ├─ Marriage songs
   ├─ KKSF
   ├─ Self
   └─ Misc
```

---

## Technical Stack

### Frontend (Required)
- **Framework:** React 18+ with TypeScript
- **Build Tool:** Vite
- **UI Library:** Chakra UI (has RTL support for Indian languages)
- **PWA:** Workbox for service workers
- **State Management:** React Context or Zustand (lightweight)

### Backend/Storage (Required)
- **Primary Storage:** Google Drive (existing content)
- **Authentication:** Google OAuth 2.0
- **Offline Storage:** IndexedDB via Dexie.js

### Optional Enhancements
- **Metadata Storage:** Firebase Firestore (for performance tracking, favorites)
- **Analytics:** Firebase Analytics
- **Hosting:** Firebase Hosting or Vercel

### Key Libraries
```json
{
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "typescript": "^5.0.0",
    "@chakra-ui/react": "^2.8.0",
    "framer-motion": "^10.16.0",
    "dexie": "^3.2.4",
    "dexie-react-hooks": "^1.1.6",
    "googleapis": "^126.0.0",
    "workbox-core": "^7.0.0",
    "workbox-precaching": "^7.0.0",
    "workbox-routing": "^7.0.0",
    "fuse.js": "^7.0.0"
  }
}
```

---

## Content Type Handling

### Google Docs (Text)
**Example:** karpaga valli nin

**How to Handle:**
1. Fetch via Google Drive API: `GET /drive/v3/files/{fileId}?alt=media&mimeType=text/plain`
2. Parse content:
   - Detect Tamil (Unicode U+0B80-U+0BFF)
   - Preserve formatting (bold, highlighting)
   - Extract metadata if present (see Metadata Format below)
3. Render with:
   - Font: Noto Sans Tamil 22px
   - Line height: 1.8
   - Preserve yellow highlights (#FFF9C4)
   - Preserve section headers (bold text)

**Example Content:**
```
கற்பகவல்லி நின் பொற்பதங்கள்

யாழ்ப்பாணம் இணுவில் வீரமணி ஐயர்

ராகமாலிகா - ஆதி

[Yellow highlighted section start]
ஆனந்த பைரவி
கற்பகவல்லி நின் பொற்பதங்கள் பிடித்தேன்
நற்கதி அருள்வாய் அம்மா!
[Yellow highlighted section end]
```

### Google Docs with Images
**Example:** Amba bhavani (table with transliteration)

**How to Handle:**
1. Fetch via Google Drive API
2. Extract embedded images
3. Display options:
   - Option A: Show image at full column width with zoom capability
   - Option B: If table, try to render as responsive HTML table
   - Option C: Fallback to image viewer

### Standalone Images
**Example:** Screenshot files

**How to Handle:**
1. Fetch image URL from Drive API
2. Display with:
   - Full-screen viewer
   - Pinch-to-zoom on mobile/tablet
   - Pan gestures
   - Brightness controls
   - Download option for offline

### PDFs
**Example:** Reference materials

**How to Handle:**
1. Show metadata card with:
   - File name
   - Size
   - Preview thumbnail (if available)
2. Actions:
   - Open in Google Drive (online)
   - Download for offline viewing
   - Link to specific page if metadata includes page number

---

## Metadata Format (Optional)

### Recommended Format for Enhanced Features

Add this header block at the top of Google Docs (optional):

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
கற்பகவல்லி நின் பொற்பதங்கள்...
```

### Parsing Logic
```javascript
function parseMetadata(content) {
  const metadataRegex = /^---\n([\s\S]*?)\n---\n/;
  const match = content.match(metadataRegex);
  
  if (!match) {
    return {
      hasMetadata: false,
      metadata: {},
      lyrics: content
    };
  }
  
  const metadataBlock = match[1];
  const metadata = {};
  
  metadataBlock.split('\n').forEach(line => {
    const [key, ...valueParts] = line.split(':');
    if (key && valueParts.length) {
      metadata[key.trim()] = valueParts.join(':').trim();
    }
  });
  
  const lyrics = content.replace(metadataRegex, '');
  
  return {
    hasMetadata: true,
    metadata,
    lyrics
  };
}
```

### What Metadata Enables

**Without Metadata (Works perfectly):**
- View all songs
- Navigate by folder/deity
- Search by filename
- Offline access
- All core features work

**With Metadata (Enhanced):**
- Structured display (ragam, talam in header)
- Search by ragam, talam, tags
- Multi-deity songs (one song can appear in multiple deity folders)
- Quick YouTube links
- Better organization

**Migration Strategy:**
- **Phase 1:** Build app, works without metadata
- **Phase 2:** Add metadata to 10 most-used songs
- **Phase 3:** Gradually add to more songs over months
- **No deadline, no pressure**

---

## Google Drive API Integration

### Authentication Flow

**Step 1: Get OAuth Credentials**
1. Go to Google Cloud Console: https://console.cloud.google.com
2. Create new project: "GAnAmruta Thuli"
3. Enable Google Drive API
4. Create OAuth 2.0 Client ID (Web application)
5. Add authorized redirect URIs:
   - http://localhost:5173 (development)
   - https://ganamrutathuli.app (production)
6. Download credentials JSON

**Step 2: Implement OAuth Flow**
```typescript
import { google } from 'googleapis';

const oauth2Client = new google.auth.OAuth2(
  CLIENT_ID,
  CLIENT_SECRET,
  REDIRECT_URI
);

// Generate auth URL
const authUrl = oauth2Client.generateAuthUrl({
  access_type: 'offline',
  scope: ['https://www.googleapis.com/auth/drive.readonly']
});

// After user authorizes, exchange code for tokens
const { tokens } = await oauth2Client.getToken(code);
oauth2Client.setCredentials(tokens);
```

### Key API Calls

**List Folders (Deities):**
```javascript
const drive = google.drive({ version: 'v3', auth: oauth2Client });

// Get Namasankeerthanam folder ID first
const namaFolder = await drive.files.list({
  q: "name='Namasankeerthanam' and mimeType='application/vnd.google-apps.folder'",
  fields: 'files(id, name)'
});

// List all deity folders inside
const deityFolders = await drive.files.list({
  q: `'${namaFolderID}' in parents and mimeType='application/vnd.google-apps.folder'`,
  fields: 'files(id, name, modifiedTime)',
  orderBy: 'name'
});
```

**List Songs in Folder:**
```javascript
const songs = await drive.files.list({
  q: `'${deityFolderID}' in parents`,
  fields: 'files(id, name, mimeType, modifiedTime, size)',
  orderBy: 'name'
});
```

**Fetch Song Content (Text):**
```javascript
// For Google Docs
const response = await drive.files.export({
  fileId: songFileId,
  mimeType: 'text/plain'
}, { responseType: 'text' });

const content = response.data;
```

**Fetch Image:**
```javascript
const response = await drive.files.get({
  fileId: imageFileId,
  alt: 'media'
}, { responseType: 'stream' });

// Convert to blob/data URL for display
```

### Rate Limits & Quotas
- **Google Drive API Free Tier:** 20,000 requests/day
- **Strategy:** Cache everything in IndexedDB
- **Sync:** Only check for updates every 4-6 hours
- **User Action:** Immediate API call + cache update

---

## Offline Strategy

### What Gets Cached

**Tier 1: Auto-Download (Immediate)**
- All text-based Google Docs
- File metadata (names, sizes, modified dates)
- Folder structure
- Estimated size: 10-20 MB

**Tier 2: On-Demand (When Viewed)**
- Images embedded in documents
- Standalone image files
- Cached after first view
- Estimated size: 1-3 MB per song with images

**Tier 3: User Choice (Manual)**
- PDF files
- Audio files
- User explicitly downloads

### IndexedDB Schema

```typescript
// Using Dexie.js
import Dexie, { Table } from 'dexie';

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

class GTDatabase extends Dexie {
  songs!: Table<Song>;
  deities!: Table<Deity>;
  settings!: Table<AppSettings>;

  constructor() {
    super('GTDatabase');
    this.version(1).stores({
      songs: 'id, driveFileId, deity, name, modifiedTime',
      deities: 'id, name, order',
      settings: 'id'
    });
  }
}

const db = new GTDatabase();
```

### Sync Logic

```typescript
async function syncWithDrive() {
  const lastSync = await getLastSyncTime();
  
  // 1. Get all folders
  const folders = await listDriveFolders();
  
  // 2. For each folder, check for new/updated files
  for (const folder of folders) {
    const files = await listFilesInFolder(folder.id, lastSync);
    
    // 3. Download new/updated text files
    for (const file of files) {
      if (file.mimeType === 'application/vnd.google-apps.document') {
        const content = await fetchGoogleDocContent(file.id);
        await db.songs.put({
          id: file.id,
          driveFileId: file.id,
          name: file.name,
          deity: folder.name,
          contentType: 'text',
          content: content,
          modifiedTime: file.modifiedTime,
          cachedAt: new Date().toISOString(),
          size: content.length
        });
      }
    }
  }
  
  await setLastSyncTime(new Date());
}
```

---

## UI Component Structure

### App Structure
```
src/
├── components/
│   ├── layout/
│   │   ├── Header.tsx
│   │   ├── Navigation.tsx (Column 1)
│   │   ├── SongList.tsx (Column 2)
│   │   └── SongViewer.tsx (Column 3)
│   ├── songs/
│   │   ├── TextSong.tsx
│   │   ├── ImageSong.tsx
│   │   ├── PDFSong.tsx
│   │   └── SongCard.tsx
│   ├── settings/
│   │   ├── SettingsPanel.tsx
│   │   ├── DeityOrderEditor.tsx
│   │   └── OfflineSettings.tsx
│   └── search/
│       └── SearchBar.tsx
├── hooks/
│   ├── useDriveAPI.ts
│   ├── useOfflineStorage.ts
│   └── useSettings.ts
├── services/
│   ├── driveService.ts
│   ├── cacheService.ts
│   └── metadataParser.ts
├── utils/
│   ├── tamilTextUtils.ts
│   ├── contentTypeDetector.ts
│   └── syncManager.ts
└── App.tsx
```

### Key Components

**Header Component:**
```tsx
export const Header = () => {
  const { syncStatus } = useSyncStatus();
  const { settings } = useSettings();
  
  return (
    <Box bg={colors.background} px={4} py={3}>
      <Flex justify="space-between" align="center">
        <HStack>
          <Text fontSize="xl" fontWeight="bold">
            🕉️ GAnAmruta Thuli (GT)
          </Text>
          <Text fontSize="sm" color="gray.600">
            గానామృత துளி
          </Text>
        </HStack>
        
        <HStack spacing={4}>
          <SearchIcon />
          <SyncStatus status={syncStatus} />
          <ThemeToggle />
          <SettingsIcon />
          <UserMenu />
        </HStack>
      </Flex>
    </Box>
  );
};
```

**Song Viewer Component:**
```tsx
export const SongViewer = ({ song }: { song: Song }) => {
  const { metadata, lyrics } = parseMetadata(song.content || '');
  const { fontSize, lineSpacing } = useSettings();
  
  return (
    <Box p={8} maxW="800px" mx="auto">
      {/* Title */}
      <Heading size="lg" mb={4}>
        {metadata.title || song.name}
      </Heading>
      
      {/* Metadata if present */}
      {metadata.ragam && (
        <VStack align="start" bg="gray.50" p={4} borderRadius="md" mb={6}>
          <Text><strong>Ragam:</strong> {metadata.ragam}</Text>
          <Text><strong>Talam:</strong> {metadata.talam}</Text>
          {metadata.youtube && (
            <Link href={metadata.youtube} color="blue.500">
              🎵 YouTube Link
            </Link>
          )}
        </VStack>
      )}
      
      {/* Lyrics */}
      <Text
        fontFamily="'Noto Sans Tamil', sans-serif"
        fontSize={fontSizes[fontSize]}
        lineHeight={lineSpacing}
        whiteSpace="pre-wrap"
      >
        {lyrics}
      </Text>
      
      {/* Controls */}
      <HStack mt={6} spacing={4}>
        <IconButton icon={<FiPlus />} aria-label="Increase font" />
        <IconButton icon={<FiMinus />} aria-label="Decrease font" />
        <IconButton icon={<FiHeart />} aria-label="Favorite" />
        <IconButton icon={<FiCopy />} aria-label="Copy" />
      </HStack>
    </Box>
  );
};
```

---

## Color Theme Implementation

### Calm Mode (Default)
```typescript
export const calmTheme = {
  colors: {
    background: '#F5F5DC', // Warm beige
    surface: '#FFFFFF',
    textPrimary: '#2C1810',
    textSecondary: '#6B5D52',
    accent: '#FF9933',
    border: '#E0D5C7',
    highlight: '#FFF9C4', // Yellow highlights from Google Docs
  },
  fonts: {
    tamil: "'Noto Sans Tamil', 'Lohit Tamil', sans-serif",
    body: "'Inter', sans-serif",
  },
  fontSizes: {
    small: '18px',
    medium: '22px',
    large: '28px',
    xlarge: '36px',
  },
  spacing: {
    xs: '4px',
    sm: '8px',
    md: '16px',
    lg: '24px',
    xl: '32px',
  }
};
```

### Dark Mode
```typescript
export const darkTheme = {
  colors: {
    background: '#1A1A1A',
    surface: '#2D2D2D',
    textPrimary: '#F5F5F0',
    textSecondary: '#B8B5B0',
    accent: '#D4AF37',
    border: '#404040',
    highlight: '#3D3A2E', // Dark yellow for highlights
  },
  // fonts and sizes same as calm mode
};
```

---

## Search Implementation

### Search Strategy

**What to Search:**
1. **Filenames** (always available)
2. **Metadata fields** (if present): title, ragam, talam, tags
3. **Lyrics content** (text files only)
4. **Deity/folder names**

**Search Library:** Fuse.js for fuzzy matching

```typescript
import Fuse from 'fuse.js';

const searchOptions = {
  keys: [
    { name: 'name', weight: 2.0 },
    { name: 'metadata.title', weight: 2.0 },
    { name: 'metadata.ragam', weight: 1.5 },
    { name: 'metadata.talam', weight: 1.0 },
    { name: 'metadata.tags', weight: 0.8 },
    { name: 'content', weight: 0.5 },
    { name: 'deity', weight: 1.0 }
  ],
  threshold: 0.4,
  includeScore: true
};

const fuse = new Fuse(songs, searchOptions);

function search(query: string) {
  return fuse.search(query);
}
```

### Search Results Display

Group results by category:
1. Found in titles
2. Found in ragam
3. Found in talam
4. Found in lyrics content
5. Found in tags

---

## PWA Configuration

### manifest.json
```json
{
  "name": "GAnAmruta Thuli",
  "short_name": "GT",
  "description": "Your collection of devotional songs - drops of musical nectar",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#F5F5DC",
  "theme_color": "#FF9933",
  "orientation": "any",
  "icons": [
    {
      "src": "/icons/icon-192.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "/icons/icon-512.png",
      "sizes": "512x512",
      "type": "image/png"
    }
  ]
}
```

### Service Worker Strategy
```typescript
// Using Workbox
import { precacheAndRoute } from 'workbox-precaching';
import { registerRoute } from 'workbox-routing';
import { CacheFirst, NetworkFirst } from 'workbox-strategies';

// Precache app shell
precacheAndRoute(self.__WB_MANIFEST);

// Cache Google Drive API responses
registerRoute(
  /^https:\/\/www\.googleapis\.com\/drive/,
  new CacheFirst({
    cacheName: 'drive-api-cache',
    plugins: [
      {
        cacheWillUpdate: async ({ response }) => {
          return response.status === 200 ? response : null;
        }
      }
    ]
  })
);

// Network first for song list (to get updates)
registerRoute(
  /\/api\/songs/,
  new NetworkFirst({
    cacheName: 'songs-list',
    networkTimeoutSeconds: 3
  })
);
```

---

## Development Workflow

### Phase 1: Setup (Week 1)
**Tasks:**
- [ ] Initialize React + TypeScript + Vite project
- [ ] Set up Google Cloud Console, enable Drive API
- [ ] Implement OAuth authentication
- [ ] Test Drive API connection
- [ ] Set up IndexedDB with Dexie
- [ ] Create basic 3-column layout

**Deliverable:** Can authenticate and see folder list

### Phase 2: Core Viewer (Week 2)
**Tasks:**
- [ ] Implement Navigation component (Column 1)
- [ ] Implement SongList component (Column 2)
- [ ] Implement TextSongViewer (Column 3)
- [ ] Tamil font rendering
- [ ] Metadata parser (optional headers)
- [ ] Offline caching for text songs

**Deliverable:** Can view text songs beautifully

### Phase 3: Enhanced Features (Week 3)
**Tasks:**
- [ ] Image song viewer (with zoom)
- [ ] PDF reference display
- [ ] Search implementation (Fuse.js)
- [ ] Settings panel
- [ ] Deity order customization
- [ ] Theme toggle (calm/dark)
- [ ] Font size controls

**Deliverable:** Full-featured MVP

### Phase 4: Polish & Deploy (Week 4)
**Tasks:**
- [ ] PWA setup (manifest, service worker)
- [ ] Offline sync refinement
- [ ] Responsive mobile view
- [ ] Performance optimization
- [ ] Deploy to hosting (Firebase/Vercel)
- [ ] Test on Android tablet

**Deliverable:** Production-ready app

---

## Testing Checklist

### Functionality Testing
- [ ] Google Drive authentication works
- [ ] Can list all deity folders
- [ ] Can list songs in each folder
- [ ] Text songs display correctly with Tamil fonts
- [ ] Yellow highlights preserved from Google Docs
- [ ] Bold section headers preserved
- [ ] Image songs display and zoom works
- [ ] PDF references link correctly
- [ ] Search finds songs by filename
- [ ] Search finds songs by ragam (if metadata)
- [ ] Deity order can be customized
- [ ] Settings persist across sessions
- [ ] Offline mode works after initial load
- [ ] Sync detects new/updated songs

### Device Testing
- [ ] 10" Android tablet (landscape) - PRIMARY
- [ ] 10" Android tablet (portrait)
- [ ] Android phone
- [ ] iPhone
- [ ] Windows laptop
- [ ] MacBook

### Performance Testing
- [ ] App loads in <3 seconds on 3G
- [ ] Song viewer opens in <500ms
- [ ] Search results in <200ms
- [ ] Smooth scrolling on large songs
- [ ] No jank on tablet gestures

---

## Deployment

### Recommended: Firebase Hosting

**Why Firebase:**
- Free tier generous (10GB storage, 360MB/day transfer)
- CDN globally distributed
- Automatic SSL
- Easy deployment
- Can add Firestore later for metadata

**Deployment Steps:**
```bash
# Install Firebase CLI
npm install -g firebase-tools

# Login
firebase login

# Initialize
firebase init hosting

# Build
npm run build

# Deploy
firebase deploy
```

### Alternative: Vercel

**Why Vercel:**
- Even simpler deployment
- Automatic preview deployments
- Great for React apps
- Free tier excellent

**Deployment:**
```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel
```

---

## Cost Estimate

### Free Tier (Recommended for Personal Use)
- **Google Drive:** Already using it ($0)
- **Google Drive API:** 20,000 requests/day free ($0)
- **Firebase Hosting:** 10GB storage, 360MB/day ($0)
- **Domain (optional):** ganamrutathuli.app (~$12/year)

**Total: $0-12/year**

### Paid Tier (If Scaling to 100+ Users)
- **Google Drive API:** Still free (quota is per user)
- **Firebase Hosting:** ~$0.026/GB storage + $0.15/GB transfer
- **Firebase Firestore:** $0.18/GB storage, $0.06/100K reads
- **Domain:** $12/year

**Estimated: $25-50/year for 100 active users**

---

## Future Enhancements (Phase 2)

### Metadata Tool
Web form to easily add metadata to songs:
```
┌─────────────────────────────┐
│ Metadata Helper             │
├─────────────────────────────┤
│ Select song: [Dropdown]     │
│ Title: [Auto-fill_______]   │
│ Ragam: [_______________]    │
│ Talam: [_______________]    │
│ YouTube: [Paste URL____]    │
│ [Generate Header Block]     │
└─────────────────────────────┘
```

### PDF Parser
Python script to extract songs from NJABM PDF:
```python
import pdfplumber

# Extract text from PDF
# Pattern match deity sections
# Detect song boundaries
# Generate CSV for bulk import
```

### Performance Tracking (via Firebase)
```typescript
interface PerformanceLog {
  songId: string;
  performedAt: Date;
  type: 'practice' | 'performance';
  notes?: string;
}

// Track in Firestore
await db.collection('performances').add({
  userId: currentUser.uid,
  songId: song.id,
  performedAt: new Date(),
  type: 'performance'
});
```

### Audio Recording
Record practice sessions:
```typescript
// Using Web Audio API
const mediaRecorder = new MediaRecorder(stream);
// Save to Firebase Storage
// Link to song
```

---

## Security Considerations

### Google Drive Access
- Use `drive.readonly` scope (not `drive` full access)
- Store OAuth tokens securely (browser localStorage + encryption)
- Refresh tokens before expiry
- Clear tokens on logout

### Data Privacy
- All data stays in user's Google Drive
- IndexedDB is local to device
- If using Firebase, use Firestore security rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can only read/write their own data
    match /users/{userId}/{document=**} {
      allow read, write: if request.auth.uid == userId;
    }
    
    // Songs metadata is public (read-only from Drive)
    match /songs/{songId} {
      allow read: if request.auth != null;
      allow write: if request.auth.uid == resource.data.createdBy;
    }
  }
}
```

---

## FAQ for Implementation

**Q: Do I need to migrate all songs immediately?**
A: No. The app reads directly from Google Drive. Zero migration needed.

**Q: What if I don't add metadata to any songs?**
A: App works perfectly. You'll see filenames as titles, search by filename, navigate by folders.

**Q: Can I still edit songs in Google Docs?**
A: Yes! Edit normally in Google Drive. App will sync changes next time it checks for updates.

**Q: What happens if I'm offline?**
A: All text songs work offline (auto-downloaded). Images work if you've viewed them before. PDFs need to be manually downloaded.

**Q: How do I reorder deities seasonally?**
A: Settings → Customize Deity Order → Drag to reorder → Save. Or use quick presets (Navaratri, Ayyappa Season, etc.)

**Q: Can my family use this?**
A: Yes. They can either:
1. Use your Google Drive (share folder with them)
2. Or you can deploy the app publicly and they sign in with their own Google accounts

**Q: What if I add a new song to Drive?**
A: App syncs every 4-6 hours, or you can manually trigger sync. New song appears automatically.

---

## Support Resources

### Documentation
- Google Drive API: https://developers.google.com/drive/api/v3/reference
- React: https://react.dev
- Chakra UI: https://chakra-ui.com
- Dexie.js: https://dexie.org
- Workbox: https://developer.chrome.com/docs/workbox

### Tamil Fonts
- Noto Sans Tamil: https://fonts.google.com/noto/specimen/Noto+Sans+Tamil
- Lohit Tamil: https://github.com/lohit-fonts/lohit-tamil

### Community
- Stack Overflow (tag: google-drive-api, react, pwa)
- Reddit: r/reactjs, r/webdev

---

## Summary

This implementation guide contains everything needed to build GAnAmruta Thuli (GT):

1. ✅ Complete technical architecture
2. ✅ Google Drive integration details
3. ✅ Content handling for all file types
4. ✅ Metadata strategy (optional, progressive)
5. ✅ UI component structure
6. ✅ Offline caching strategy
7. ✅ Search implementation
8. ✅ PWA configuration
9. ✅ Security considerations
10. ✅ Deployment guide
11. ✅ Phase-by-phase development workflow
12. ✅ Testing checklist

**Next Steps:**
1. Review this guide
2. Set up development environment
3. Start with Phase 1 (authentication + basic layout)
4. Iterate through phases
5. Deploy and test on your devices

**Timeline:** 3-4 weeks to production-ready MVP

Good luck with the implementation! 🎵🕉️
