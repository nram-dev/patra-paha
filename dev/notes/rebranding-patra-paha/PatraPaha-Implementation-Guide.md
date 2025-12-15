# PatraPaha (पत्रपहा) - Complete Implementation Guide

## Project Overview

**Project Name:** PatraPaha (पत्रपहा)  
**Meaning:** 
- **Patra** (పత్ర/ಪತ್ರ) = Document, Letter, Leaf (Telugu/Kannada/Sanskrit)
- **Paha** (पहा) = View, See, Look (Marathi imperative)
- **Combined:** "View documents" / "See the papers"

**Pronunciation:** PAT-ra-PA-ha (all short 'a')  
**Short Name:** PP  
**Philosophy:** A general-purpose document browser for viewing and organizing collections of sacred texts, devotional songs, classical compositions, and spiritual literature.

**Target Users:** Personal use, expandable to family/community  
**Primary Device:** 10" Android Tablet (landscape mode)  
**Secondary Devices:** iPhone, Android Phone, Windows/Mac laptops  

---

## Product Family - Collection Types

PatraPaha supports multiple specialized collection types, each with unique features:

### 1. **Bhajana PatraPaha** (भजन पत्रपहा)
**Purpose:** Devotional songs and bhajans  
**Icon:** 🎵  
**Color:** Saffron (#FF9933)  
**Specialized Features:**
- Deity-based organization
- Seasonal deity ordering
- Ragam/Talam metadata support
- YouTube link integration
- Performance tracking (optional)

**Folder Structure Example:**
```
/Bhajans/
  /Devi/
  /Guru/
  /Siva/
  /Muruga/
  /Vinayaka/
  ... (deity folders)
```

---

### 2. **Veda PatraPaha** (वेद पत्रपहा)
**Purpose:** Vedic scriptures and texts  
**Icon:** 🕉️  
**Color:** Deep Blue (#1E3A8A)  
**Specialized Features:**
- Veda/Upanishad organization
- Chapter/verse navigation
- Verse bookmarking
- Sanskrit transliteration toggle
- Commentary sections support

**Folder Structure Example:**
```
/Vedic-Texts/
  /Upanishads/
    /Isha-Upanishad/
    /Katha-Upanishad/
    /Kena-Upanishad/
  /Vedas/
    /Rigveda/
    /Yajurveda/
  /Puranas/
```

---

### 3. **Puja PatraPaha** (पूजा पत्रपहा)
**Purpose:** Puja sequences and procedures  
**Icon:** 🙏  
**Color:** Red (#DC2626)  
**Specialized Features:**
- Step-by-step sequence display
- Material checklist
- Timer for each puja step
- Multiple puja types (daily, festival, deity-specific)
- Reminder system (optional)

**Folder Structure Example:**
```
/Puja-Sequences/
  /Daily-Puja/
  /Festival-Pujas/
    /Navaratri/
    /Diwali/
    /Vinayaka-Chaturthi/
  /Deity-Specific/
    /Lakshmi-Puja/
    /Saraswati-Puja/
```

---

### 4. **Krithi PatraPaha** (कृति पत्रपहा)
**Purpose:** Carnatic music compositions  
**Icon:** 🎼  
**Color:** Purple (#7C3AED)  
**Specialized Features:**
- Composer-based organization
- Ragam filtering
- Talam filtering
- Notation support
- Concert playlist creation

**Folder Structure Example:**
```
/Carnatic-Krithis/
  /Thyagaraja/
  /Muthuswami-Dikshitar/
  /Shyama-Sastri/
  /Papanasam-Sivan/
```

---

### 5. **Stotra PatraPaha** (स्तोत्र पत्रपहा)
**Purpose:** Devotional hymns and stotras  
**Icon:** 📿  
**Color:** Green (#059669)  
**Specialized Features:**
- Deity-based organization
- Time-based categorization (morning/evening/occasion)
- Phala shruti (benefits) display
- Audio pronunciation guide support
- Quick access for daily recitation

**Folder Structure Example:**
```
/Stotras/
  /Morning-Stotras/
  /Evening-Stotras/
  /Deity-Stotras/
    /Vishnu-Sahasranamam/
    /Lalitha-Sahasranamam/
  /Occasion-Based/
```

---

## Technical Architecture

### High-Level Architecture
```
User's Google Drive (Content Storage)
    ↕ Google Drive API (OAuth 2.0)
React PWA (User Interface)
    ↕ IndexedDB (Offline Cache via Dexie.js)
Firebase (Optional - for metadata/favorites/sync)
```

### Core Components
1. **Content Storage:** Google Drive (existing user folders)
2. **Frontend:** React 18+ with TypeScript
3. **Offline Storage:** IndexedDB (via Dexie.js)
4. **Authentication:** Google OAuth 2.0
5. **PWA:** Service Workers (Workbox)
6. **Hosting:** Firebase Hosting or Vercel

---

## Technical Stack

### Frontend (Required)
- **Framework:** React 18+ with TypeScript
- **Build Tool:** Vite
- **UI Library:** Chakra UI or shadcn/ui (for RTL support, Indian languages)
- **PWA:** Workbox for service workers
- **State Management:** React Context or Zustand (lightweight)
- **Routing:** React Router v6

### Backend/Storage (Required)
- **Primary Storage:** Google Drive (existing content)
- **Authentication:** Google OAuth 2.0
- **Offline Storage:** IndexedDB via Dexie.js

### Optional Enhancements
- **Metadata Storage:** Firebase Firestore (for favorites, performance tracking)
- **Analytics:** Firebase Analytics
- **Hosting:** Firebase Hosting or Vercel

### Key Libraries
```json
{
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^6.20.0",
    "typescript": "^5.0.0",
    "@chakra-ui/react": "^2.8.0",
    "framer-motion": "^10.16.0",
    "dexie": "^3.2.4",
    "dexie-react-hooks": "^1.1.6",
    "googleapis": "^126.0.0",
    "workbox-core": "^7.0.0",
    "workbox-precaching": "^7.0.0",
    "workbox-routing": "^7.0.0",
    "fuse.js": "^7.0.0",
    "zustand": "^4.4.0"
  }
}
```

---

## Multi-Collection Architecture

### Database Schema (IndexedDB)

```typescript
import Dexie, { Table } from 'dexie';

// Collection Type Definition
type CollectionType = 'bhajana' | 'veda' | 'puja' | 'krithi' | 'stotra';

interface Collection {
  id: string;
  type: CollectionType;
  name: string;
  nameDevanagari: string;
  icon: string;
  color: string;
  driveFolderId: string;
  driveFolderPath: string;
  features: string[];
  organizationTypes: string[];
  createdAt: string;
  lastSyncedAt?: string;
}

interface Document {
  id: string;
  collectionId: string;
  collectionType: CollectionType;
  driveFileId: string;
  name: string;
  category: string; // deity, composer, puja-type, etc.
  contentType: 'text' | 'image' | 'pdf' | 'audio';
  content?: string; // For text documents
  imageUrl?: string; // For images
  metadata?: DocumentMetadata;
  modifiedTime: string;
  cachedAt?: string;
  size: number;
  isFavorite?: boolean;
}

interface DocumentMetadata {
  // Common fields
  title?: string;
  tags?: string[];
  
  // Bhajana-specific
  ragam?: string;
  talam?: string;
  deity?: string;
  youtube?: string;
  
  // Veda-specific
  veda?: string;
  chapter?: string;
  verse?: string;
  
  // Puja-specific
  occasion?: string;
  duration?: number;
  materials?: string[];
  
  // Krithi-specific
  composer?: string;
  
  // Stotra-specific
  recitationTime?: 'morning' | 'evening' | 'anytime';
  phalaShruthi?: string;
}

interface Category {
  id: string;
  collectionId: string;
  name: string;
  driveFolderId: string;
  order: number;
  documentCount: number;
  icon?: string;
}

interface AppSettings {
  id: string;
  theme: 'calm' | 'dark' | 'auto';
  fontSize: 'small' | 'medium' | 'large' | 'xlarge';
  lineSpacing: 1.5 | 1.8 | 2.0;
  activeCollections: string[];
  autoDownload: {
    text: boolean;
    imagesOnView: boolean;
    allImages: boolean;
    pdfs: boolean;
    audio: boolean;
  };
  maxFileSize: number; // MB
}

class PatraPahaDatabase extends Dexie {
  collections!: Table<Collection>;
  documents!: Table<Document>;
  categories!: Table<Category>;
  settings!: Table<AppSettings>;

  constructor() {
    super('PatraPahaDB');
    this.version(1).stores({
      collections: 'id, type, driveFolderId',
      documents: 'id, collectionId, collectionType, category, driveFileId, name, modifiedTime',
      categories: 'id, collectionId, name, order',
      settings: 'id'
    });
  }
}

const db = new PatraPahaDatabase();
```

---

## Collection Configuration

### Collection Definitions

```typescript
interface CollectionConfig {
  id: string;
  type: CollectionType;
  name: string;
  nameDevanagari: string;
  nameTamil?: string;
  icon: string;
  color: string;
  accentColor: string;
  features: string[];
  organizationTypes: OrganizationType[];
  metadataFields: MetadataField[];
}

type OrganizationType = 
  | 'deity' 
  | 'composer' 
  | 'veda' 
  | 'chapter'
  | 'puja-type'
  | 'occasion'
  | 'ragam'
  | 'time';

const COLLECTION_CONFIGS: CollectionConfig[] = [
  {
    id: 'bhajana',
    type: 'bhajana',
    name: 'Bhajana PatraPaha',
    nameDevanagari: 'भजन पत्रपहा',
    nameTamil: 'பஜன பத்ரபாஹா',
    icon: '🎵',
    color: '#FF9933',
    accentColor: '#E68A2E',
    features: [
      'deity-organization',
      'seasonal-ordering',
      'ragam-filter',
      'talam-filter',
      'youtube-links',
      'performance-tracking'
    ],
    organizationTypes: ['deity', 'ragam'],
    metadataFields: [
      { key: 'title', label: 'Title', type: 'text' },
      { key: 'ragam', label: 'Ragam', type: 'text' },
      { key: 'talam', label: 'Talam', type: 'text' },
      { key: 'deity', label: 'Deity', type: 'select' },
      { key: 'youtube', label: 'YouTube Link', type: 'url' },
      { key: 'tags', label: 'Tags', type: 'array' }
    ]
  },
  {
    id: 'veda',
    type: 'veda',
    name: 'Veda PatraPaha',
    nameDevanagari: 'वेद पत्रपहा',
    icon: '🕉️',
    color: '#1E3A8A',
    accentColor: '#1E40AF',
    features: [
      'chapter-navigation',
      'verse-bookmarks',
      'transliteration-toggle',
      'commentary-sections'
    ],
    organizationTypes: ['veda', 'chapter'],
    metadataFields: [
      { key: 'title', label: 'Title', type: 'text' },
      { key: 'veda', label: 'Veda', type: 'select' },
      { key: 'chapter', label: 'Chapter', type: 'text' },
      { key: 'verse', label: 'Verse', type: 'text' }
    ]
  },
  {
    id: 'puja',
    type: 'puja',
    name: 'Puja PatraPaha',
    nameDevanagari: 'पूजा पत्रपहा',
    icon: '🙏',
    color: '#DC2626',
    accentColor: '#B91C1C',
    features: [
      'step-sequence',
      'materials-checklist',
      'timer',
      'reminder-system'
    ],
    organizationTypes: ['puja-type', 'occasion'],
    metadataFields: [
      { key: 'title', label: 'Puja Name', type: 'text' },
      { key: 'occasion', label: 'Occasion', type: 'select' },
      { key: 'duration', label: 'Duration (min)', type: 'number' },
      { key: 'materials', label: 'Materials', type: 'array' }
    ]
  },
  {
    id: 'krithi',
    type: 'krithi',
    name: 'Krithi PatraPaha',
    nameDevanagari: 'कृति पत्रपहा',
    icon: '🎼',
    color: '#7C3AED',
    accentColor: '#6D28D9',
    features: [
      'composer-organization',
      'ragam-filter',
      'talam-filter',
      'notation-support',
      'playlist-creation'
    ],
    organizationTypes: ['composer', 'ragam'],
    metadataFields: [
      { key: 'title', label: 'Title', type: 'text' },
      { key: 'composer', label: 'Composer', type: 'select' },
      { key: 'ragam', label: 'Ragam', type: 'text' },
      { key: 'talam', label: 'Talam', type: 'text' }
    ]
  },
  {
    id: 'stotra',
    type: 'stotra',
    name: 'Stotra PatraPaha',
    nameDevanagari: 'स्तोत्र पत्रपहा',
    icon: '📿',
    color: '#059669',
    accentColor: '#047857',
    features: [
      'deity-organization',
      'time-based-categories',
      'phala-shruti',
      'audio-guide',
      'daily-recitation'
    ],
    organizationTypes: ['deity', 'time'],
    metadataFields: [
      { key: 'title', label: 'Title', type: 'text' },
      { key: 'deity', label: 'Deity', type: 'select' },
      { key: 'recitationTime', label: 'Recitation Time', type: 'select' },
      { key: 'phalaShruthi', label: 'Phala Shruti', type: 'text' }
    ]
  }
];
```

---

## Google Drive Integration

### Authentication Flow

**Step 1: Google Cloud Console Setup**
1. Go to https://console.cloud.google.com
2. Create new project: "PatraPaha"
3. Enable Google Drive API
4. Create OAuth 2.0 Client ID (Web application)
5. Add authorized redirect URIs:
   - http://localhost:5173 (development)
   - https://patrapaha.app (production)
6. Download credentials JSON

**Step 2: OAuth Implementation**

```typescript
import { google } from 'googleapis';

const SCOPES = ['https://www.googleapis.com/auth/drive.readonly'];

const oauth2Client = new google.auth.OAuth2(
  process.env.VITE_GOOGLE_CLIENT_ID,
  process.env.VITE_GOOGLE_CLIENT_SECRET,
  process.env.VITE_GOOGLE_REDIRECT_URI
);

// Generate auth URL
export function getAuthUrl(): string {
  return oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
    prompt: 'consent'
  });
}

// Exchange code for tokens
export async function getTokensFromCode(code: string) {
  const { tokens } = await oauth2Client.getToken(code);
  oauth2Client.setCredentials(tokens);
  
  // Store tokens securely
  localStorage.setItem('google_tokens', JSON.stringify(tokens));
  
  return tokens;
}

// Initialize with stored tokens
export function initializeFromStoredTokens() {
  const stored = localStorage.getItem('google_tokens');
  if (stored) {
    const tokens = JSON.parse(stored);
    oauth2Client.setCredentials(tokens);
    return true;
  }
  return false;
}
```

---

### Key API Calls

**List Folders (Root):**
```typescript
const drive = google.drive({ version: 'v3', auth: oauth2Client });

async function listRootFolders(parentFolderId?: string) {
  const query = parentFolderId
    ? `'${parentFolderId}' in parents and mimeType='application/vnd.google-apps.folder' and trashed=false`
    : `mimeType='application/vnd.google-apps.folder' and 'root' in parents and trashed=false`;
    
  const response = await drive.files.list({
    q: query,
    fields: 'files(id, name, modifiedTime, parents)',
    orderBy: 'name'
  });
  
  return response.data.files;
}
```

**List Documents in Folder:**
```typescript
async function listDocumentsInFolder(folderId: string) {
  const response = await drive.files.list({
    q: `'${folderId}' in parents and trashed=false`,
    fields: 'files(id, name, mimeType, modifiedTime, size, thumbnailLink)',
    orderBy: 'name'
  });
  
  return response.data.files;
}
```

**Fetch Text Document Content:**
```typescript
async function fetchTextContent(fileId: string, mimeType: string): Promise<string> {
  if (mimeType === 'application/vnd.google-apps.document') {
    // Google Doc - export as plain text
    const response = await drive.files.export(
      { fileId, mimeType: 'text/plain' },
      { responseType: 'text' }
    );
    return response.data as string;
  } else {
    // Regular text file
    const response = await drive.files.get(
      { fileId, alt: 'media' },
      { responseType: 'text' }
    );
    return response.data as string;
  }
}
```

**Fetch Image:**
```typescript
async function fetchImage(fileId: string): Promise<string> {
  const response = await drive.files.get(
    { fileId, alt: 'media' },
    { responseType: 'arraybuffer' }
  );
  
  const base64 = btoa(
    new Uint8Array(response.data as ArrayBuffer)
      .reduce((data, byte) => data + String.fromCharCode(byte), '')
  );
  
  return `data:image/jpeg;base64,${base64}`;
}
```

---

## Content Handling

### Metadata Parsing

**Optional Metadata Format (YAML-style header):**

```
---
Title: Karpaga Valli Nin Porpatangal
Ragam: Anandha Bhairavi
Talam: Aadhi
Deity: Devi
Tags: Kamakshi, Kanchi
YouTube: https://youtube.com/watch?v=...
---

கற்பகவல்லி நின் பொற்பதங்கள்...
[Lyrics continue...]
```

**Parser Implementation:**

```typescript
interface ParsedContent {
  hasMetadata: boolean;
  metadata: Record<string, any>;
  content: string;
}

function parseMetadata(rawContent: string): ParsedContent {
  const metadataRegex = /^---\n([\s\S]*?)\n---\n/;
  const match = rawContent.match(metadataRegex);
  
  if (!match) {
    return {
      hasMetadata: false,
      metadata: {},
      content: rawContent
    };
  }
  
  const metadataBlock = match[1];
  const metadata: Record<string, any> = {};
  
  metadataBlock.split('\n').forEach(line => {
    const colonIndex = line.indexOf(':');
    if (colonIndex > 0) {
      const key = line.substring(0, colonIndex).trim();
      const value = line.substring(colonIndex + 1).trim();
      
      // Handle arrays (comma-separated)
      if (key.toLowerCase() === 'tags' || key.toLowerCase() === 'materials') {
        metadata[key] = value.split(',').map(v => v.trim());
      } else {
        metadata[key] = value;
      }
    }
  });
  
  const content = rawContent.replace(metadataRegex, '');
  
  return {
    hasMetadata: true,
    metadata,
    content
  };
}
```

### Yellow Highlight Preservation

```typescript
function preserveGoogleDocsFormatting(content: string): string {
  // Google Docs exports don't preserve highlights
  // We need to detect patterns and apply custom highlighting
  
  // Look for section headers (typically in capital or bold patterns)
  // Apply yellow background styling
  
  // This is a placeholder - actual implementation depends on
  // how Google Docs exports formatting
  
  return content;
}
```

---

## UI Component Structure

### Project Folder Structure
```
src/
├── App.tsx
├── main.tsx
├── components/
│   ├── layout/
│   │   ├── Header.tsx
│   │   ├── CollectionSelector.tsx
│   │   ├── Navigation.tsx (Column 1)
│   │   ├── DocumentList.tsx (Column 2)
│   │   └── DocumentViewer.tsx (Column 3)
│   ├── collections/
│   │   ├── bhajana/
│   │   │   ├── DeityNavigation.tsx
│   │   │   ├── RagamFilter.tsx
│   │   │   ├── SeasonalOrdering.tsx
│   │   │   └── PerformanceTracker.tsx
│   │   ├── veda/
│   │   │   ├── ChapterNavigation.tsx
│   │   │   ├── VerseBookmarks.tsx
│   │   │   └── TransliterationToggle.tsx
│   │   ├── puja/
│   │   │   ├── SequenceSteps.tsx
│   │   │   ├── MaterialsChecklist.tsx
│   │   │   └── TimerComponent.tsx
│   │   ├── krithi/
│   │   │   ├── ComposerNavigation.tsx
│   │   │   ├── RagamFilter.tsx
│   │   │   └── PlaylistCreator.tsx
│   │   └── stotra/
│   │       ├── DeityNavigation.tsx
│   │       ├── TimeBasedFilter.tsx
│   │       └── RecitationGuide.tsx
│   ├── documents/
│   │   ├── TextDocument.tsx
│   │   ├── ImageDocument.tsx
│   │   └── PDFDocument.tsx
│   ├── settings/
│   │   ├── SettingsPanel.tsx
│   │   ├── CollectionManager.tsx
│   │   ├── CategoryOrderEditor.tsx
│   │   └── OfflineSettings.tsx
│   └── search/
│       └── GlobalSearch.tsx
├── hooks/
│   ├── useDriveAPI.ts
│   ├── useOfflineStorage.ts
│   ├── useCollection.ts
│   ├── useSettings.ts
│   └── useSearch.ts
├── services/
│   ├── driveService.ts
│   ├── cacheService.ts
│   ├── metadataParser.ts
│   └── syncManager.ts
├── stores/
│   ├── collectionStore.ts
│   ├── documentStore.ts
│   └── settingsStore.ts
├── utils/
│   ├── textRendering.ts
│   ├── contentTypeDetector.ts
│   └── formatPreservation.ts
└── types/
    ├── collection.ts
    ├── document.ts
    └── metadata.ts
```

---

## Key Components Implementation

### Collection Selector (Home Screen)

```tsx
import { Box, SimpleGrid, Card, CardBody, Heading, Text, Icon } from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import { COLLECTION_CONFIGS } from '../config/collections';
import { useCollectionStore } from '../stores/collectionStore';

export const CollectionSelector = () => {
  const navigate = useNavigate();
  const { activeCollections, documentCounts } = useCollectionStore();
  
  const activeConfigs = COLLECTION_CONFIGS.filter(c => 
    activeCollections.includes(c.id)
  );
  
  return (
    <Box p={8}>
      <Heading mb={6}>Your Collections</Heading>
      
      <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
        {activeConfigs.map(collection => (
          <Card
            key={collection.id}
            cursor="pointer"
            onClick={() => navigate(`/collection/${collection.id}`)}
            _hover={{ transform: 'translateY(-4px)', shadow: 'lg' }}
            transition="all 0.2s"
          >
            <CardBody>
              <Box fontSize="4xl" mb={3}>{collection.icon}</Box>
              <Heading size="md" mb={2}>
                {collection.name}
              </Heading>
              <Text fontSize="sm" color="gray.600" mb={2}>
                {collection.nameDevanagari}
              </Text>
              <Text fontSize="sm" color="gray.500">
                {documentCounts[collection.id] || 0} items
              </Text>
            </CardBody>
          </Card>
        ))}
      </SimpleGrid>
      
      <Box mt={8}>
        <Button onClick={() => navigate('/add-collection')}>
          + Add Collection
        </Button>
      </Box>
    </Box>
  );
};
```

### Collection View (3-Column Layout)

```tsx
import { Grid, GridItem } from '@chakra-ui/react';
import { useParams } from 'react-router-dom';
import { Navigation } from './Navigation';
import { DocumentList } from './DocumentList';
import { DocumentViewer } from './DocumentViewer';
import { useCollection } from '../hooks/useCollection';
import { COLLECTION_CONFIGS } from '../config/collections';

export const CollectionView = () => {
  const { collectionId } = useParams();
  const { categories, selectedCategory, selectedDocument } = useCollection(collectionId!);
  const config = COLLECTION_CONFIGS.find(c => c.id === collectionId);
  
  if (!config) return <div>Collection not found</div>;
  
  return (
    <Grid
      templateColumns="200px 280px 1fr"
      height="calc(100vh - 60px)"
      gap={0}
    >
      {/* Column 1: Navigation */}
      <GridItem bg="white" borderRight="1px" borderColor="gray.200" overflowY="auto">
        <Navigation
          collection={config}
          categories={categories}
          selectedCategory={selectedCategory}
        />
      </GridItem>
      
      {/* Column 2: Document List */}
      <GridItem bg="white" borderRight="1px" borderColor="gray.200" overflowY="auto">
        <DocumentList
          collection={config}
          category={selectedCategory}
          selectedDocument={selectedDocument}
        />
      </GridItem>
      
      {/* Column 3: Document Viewer */}
      <GridItem bg="gray.50" overflowY="auto">
        <DocumentViewer
          document={selectedDocument}
          collection={config}
        />
      </GridItem>
    </Grid>
  );
};
```

### Document Viewer (Text)

```tsx
import { Box, Heading, VStack, HStack, IconButton, Text } from '@chakra-ui/react';
import { FiPlus, FiMinus, FiHeart, FiCopy } from 'react-icons/fi';
import { useState } from 'react';
import { parseMetadata } from '../services/metadataParser';
import { useSettings } from '../hooks/useSettings';

interface DocumentViewerProps {
  document: Document | null;
  collection: CollectionConfig;
}

export const DocumentViewer = ({ document, collection }: DocumentViewerProps) => {
  const { fontSize, lineSpacing, theme } = useSettings();
  const [isFavorite, setIsFavorite] = useState(false);
  
  if (!document) {
    return (
      <Box p={8} textAlign="center">
        <Text color="gray.500">Select a document to view</Text>
      </Box>
    );
  }
  
  const { metadata, content } = parseMetadata(document.content || '');
  
  const fontSizeMap = {
    small: '18px',
    medium: '22px',
    large: '28px',
    xlarge: '36px'
  };
  
  return (
    <Box p={8} maxW="800px" mx="auto">
      {/* Title */}
      <Heading size="lg" mb={4}>
        {metadata.title || document.name}
      </Heading>
      
      {/* Metadata Display (if present) */}
      {metadata && Object.keys(metadata).length > 0 && (
        <VStack align="start" bg="gray.100" p={4} borderRadius="md" mb={6} spacing={2}>
          {collection.metadataFields.map(field => (
            metadata[field.key] && (
              <HStack key={field.key}>
                <Text fontWeight="bold">{field.label}:</Text>
                <Text>{metadata[field.key]}</Text>
              </HStack>
            )
          ))}
        </VStack>
      )}
      
      {/* Content */}
      <Text
        fontFamily="'Noto Sans Tamil', 'Noto Sans Devanagari', sans-serif"
        fontSize={fontSizeMap[fontSize]}
        lineHeight={lineSpacing}
        whiteSpace="pre-wrap"
      >
        {content}
      </Text>
      
      {/* Controls */}
      <HStack mt={8} spacing={4}>
        <IconButton icon={<FiPlus />} aria-label="Increase font" />
        <IconButton icon={<FiMinus />} aria-label="Decrease font" />
        <IconButton
          icon={<FiHeart />}
          aria-label="Favorite"
          colorScheme={isFavorite ? 'red' : 'gray'}
          onClick={() => setIsFavorite(!isFavorite)}
        />
        <IconButton icon={<FiCopy />} aria-label="Copy" />
      </HStack>
    </Box>
  );
};
```

---

## Collection-Specific Features

### Bhajana PatraPaha - Seasonal Deity Ordering

```tsx
interface SeasonalPreset {
  name: string;
  nameDevanagari: string;
  period: string;
  deityOrder: string[];
}

const SEASONAL_PRESETS: SeasonalPreset[] = [
  {
    name: 'Navaratri',
    nameDevanagari: 'नवरात्रि',
    period: 'Sep-Oct',
    deityOrder: ['Devi', 'Durga', 'Lakshmi', 'Saraswati', 'Guru', 'Siva', '...']
  },
  {
    name: 'Ayyappa Season',
    nameDevanagari: 'अय्यप्पा मौसम',
    period: 'Nov-Jan',
    deityOrder: ['Ayyappa', 'Guru', 'Siva', 'Vinayaka', 'Devi', '...']
  },
  {
    name: 'Vinayaka Chaturthi',
    nameDevanagari: 'विनायक चतुर्थी',
    period: 'Aug-Sep',
    deityOrder: ['Vinayaka', 'Siva', 'Guru', 'Devi', '...']
  },
  {
    name: 'Skanda Shasti',
    nameDevanagari: 'स्कंद षष्ठी',
    period: 'Oct-Nov',
    deityOrder: ['Muruga', 'Siva', 'Vinayaka', 'Guru', '...']
  }
];

export const SeasonalOrdering = () => {
  const { deityOrder, setDeityOrder } = useCollectionStore();
  
  const applyPreset = (preset: SeasonalPreset) => {
    setDeityOrder(preset.deityOrder);
  };
  
  return (
    <Box>
      <Heading size="md" mb={4}>Seasonal Presets</Heading>
      <VStack align="stretch" spacing={3}>
        {SEASONAL_PRESETS.map(preset => (
          <Button
            key={preset.name}
            onClick={() => applyPreset(preset)}
            variant="outline"
          >
            <VStack align="start" spacing={0}>
              <Text>{preset.name}</Text>
              <Text fontSize="sm" color="gray.600">{preset.nameDevanagari}</Text>
              <Text fontSize="xs" color="gray.500">{preset.period}</Text>
            </VStack>
          </Button>
        ))}
      </VStack>
    </Box>
  );
};
```

### Puja PatraPaha - Step Sequence

```tsx
interface PujaStep {
  id: string;
  stepNumber: number;
  title: string;
  description: string;
  duration?: number; // minutes
  materials?: string[];
}

export const SequenceSteps = ({ steps }: { steps: PujaStep[] }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [timer, setTimer] = useState<number | null>(null);
  
  return (
    <Box>
      <Stepper index={currentStep}>
        {steps.map((step, index) => (
          <Step key={step.id}>
            <StepIndicator>
              <StepStatus
                complete={<StepIcon />}
                incomplete={<StepNumber />}
                active={<StepNumber />}
              />
            </StepIndicator>
            
            <Box flexShrink="0">
              <StepTitle>{step.title}</StepTitle>
              <StepDescription>{step.description}</StepDescription>
              
              {step.materials && (
                <Box mt={2}>
                  <Text fontSize="sm" fontWeight="bold">Materials:</Text>
                  <UnorderedList fontSize="sm">
                    {step.materials.map(material => (
                      <ListItem key={material}>{material}</ListItem>
                    ))}
                  </UnorderedList>
                </Box>
              )}
              
              {step.duration && (
                <HStack mt={2}>
                  <Icon as={FiClock} />
                  <Text fontSize="sm">{step.duration} minutes</Text>
                </HStack>
              )}
            </Box>
            
            <StepSeparator />
          </Step>
        ))}
      </Stepper>
      
      <HStack mt={4} spacing={4}>
        <Button
          isDisabled={currentStep === 0}
          onClick={() => setCurrentStep(currentStep - 1)}
        >
          Previous
        </Button>
        <Button
          isDisabled={currentStep === steps.length - 1}
          onClick={() => setCurrentStep(currentStep + 1)}
        >
          Next
        </Button>
      </HStack>
    </Box>
  );
};
```

---

## Offline Strategy

### What Gets Cached

**Tier 1: Auto-Download (Immediate)**
- All text-based documents in active collections
- Collection metadata (folder structure, categories)
- App shell and core assets
- Estimated size: 15-30 MB

**Tier 2: On-Demand (When Viewed)**
- Images embedded in documents
- Standalone image files
- Cached after first view
- Estimated size: 1-5 MB per document with images

**Tier 3: User Choice (Manual)**
- PDF files
- Audio files (if supported)
- User explicitly downloads via settings

### Sync Logic

```typescript
async function syncCollection(collectionId: string) {
  const collection = await db.collections.get(collectionId);
  if (!collection) return;
  
  const lastSync = collection.lastSyncedAt 
    ? new Date(collection.lastSyncedAt) 
    : null;
  
  // 1. Get all folders (categories) in the collection
  const folders = await listDocumentsInFolder(collection.driveFolderId);
  const categoryFolders = folders.filter(f => 
    f.mimeType === 'application/vnd.google-apps.folder'
  );
  
  // 2. For each category folder, get documents
  for (const folder of categoryFolders) {
    const documents = await listDocumentsInFolder(folder.id!);
    
    // 3. Download new/updated text documents
    for (const doc of documents) {
      const existing = await db.documents
        .where({ driveFileId: doc.id! })
        .first();
      
      const docModified = new Date(doc.modifiedTime!);
      
      // Skip if already cached and not modified
      if (existing && existing.modifiedTime === doc.modifiedTime) {
        continue;
      }
      
      // Download if text-based
      if (doc.mimeType === 'application/vnd.google-apps.document' ||
          doc.mimeType?.startsWith('text/')) {
        
        const content = await fetchTextContent(doc.id!, doc.mimeType!);
        const { metadata, content: parsedContent } = parseMetadata(content);
        
        await db.documents.put({
          id: doc.id!,
          collectionId: collection.id,
          collectionType: collection.type,
          driveFileId: doc.id!,
          name: doc.name!,
          category: folder.name!,
          contentType: 'text',
          content: parsedContent,
          metadata,
          modifiedTime: doc.modifiedTime!,
          cachedAt: new Date().toISOString(),
          size: parseInt(doc.size || '0')
        });
      }
    }
  }
  
  // 4. Update last synced time
  await db.collections.update(collectionId, {
    lastSyncedAt: new Date().toISOString()
  });
}
```

---

## Search Implementation

### Global Search Across Collections

```typescript
import Fuse from 'fuse.js';

interface SearchOptions {
  collections?: string[];
  contentTypes?: string[];
  categories?: string[];
}

async function searchDocuments(
  query: string, 
  options: SearchOptions = {}
): Promise<Document[]> {
  
  let documents = await db.documents.toArray();
  
  // Filter by collections if specified
  if (options.collections?.length) {
    documents = documents.filter(d => 
      options.collections!.includes(d.collectionId)
    );
  }
  
  // Filter by content types if specified
  if (options.contentTypes?.length) {
    documents = documents.filter(d => 
      options.contentTypes!.includes(d.contentType)
    );
  }
  
  // Fuse.js configuration
  const fuse = new Fuse(documents, {
    keys: [
      { name: 'name', weight: 2.0 },
      { name: 'metadata.title', weight: 2.0 },
      { name: 'metadata.ragam', weight: 1.5 },
      { name: 'metadata.composer', weight: 1.5 },
      { name: 'metadata.deity', weight: 1.3 },
      { name: 'category', weight: 1.0 },
      { name: 'content', weight: 0.5 }
    ],
    threshold: 0.4,
    includeScore: true
  });
  
  const results = fuse.search(query);
  return results.map(r => r.item);
}
```

---

## Color Themes

### Calm Mode (Default)
```typescript
export const calmTheme = {
  colors: {
    background: '#F5F5DC', // Warm beige
    surface: '#FFFFFF',
    textPrimary: '#2C1810',
    textSecondary: '#6B5D52',
    accent: '#FF6B35', // Document orange
    border: '#E0D5C7',
    highlight: '#FFF9C4', // Yellow highlights
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
    accent: '#FFA500',
    border: '#404040',
    highlight: '#3D3A2E',
  }
};
```

---

## PWA Configuration

### manifest.json
```json
{
  "name": "PatraPaha - Document Browser",
  "short_name": "PatraPaha",
  "description": "Browse and organize your collections of sacred texts, devotional songs, and classical compositions",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#F5F5DC",
  "theme_color": "#FF6B35",
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

---

## Development Workflow

### Phase 1: Core Infrastructure (Week 1-2)
**Tasks:**
- [ ] Initialize React + TypeScript + Vite project
- [ ] Set up Google Cloud Console, enable Drive API
- [ ] Implement OAuth authentication
- [ ] Set up IndexedDB with Dexie (multi-collection schema)
- [ ] Create collection configuration system
- [ ] Implement basic 3-column layout
- [ ] Test Drive API connection with sample folder

**Deliverable:** Can authenticate and see collections

### Phase 2: Single Collection MVP - Bhajana (Week 3-4)
**Tasks:**
- [ ] Implement Collection Selector UI
- [ ] Implement Bhajana collection features
  - [ ] Deity-based navigation
  - [ ] Song list display
  - [ ] Text song viewer with Tamil rendering
  - [ ] Metadata parser
  - [ ] Offline caching for text songs
- [ ] Basic search within Bhajana collection
- [ ] Settings panel (theme, font size)

**Deliverable:** Fully functional Bhajana PatraPaha

### Phase 3: Additional Collections (Week 5-6)
**Tasks:**
- [ ] Add Veda PatraPaha
  - [ ] Chapter/verse navigation
  - [ ] Bookmarking system
- [ ] Add Puja PatraPaha
  - [ ] Step sequence UI
  - [ ] Materials checklist
  - [ ] Timer component
- [ ] Add Krithi PatraPaha
  - [ ] Composer organization
  - [ ] Ragam/Talam filters
- [ ] Add Stotra PatraPaha
  - [ ] Time-based categorization

**Deliverable:** All 5 collection types working

### Phase 4: Enhanced Features (Week 7-8)
**Tasks:**
- [ ] Global search across collections
- [ ] Image document viewer (with zoom)
- [ ] PDF reference display
- [ ] Advanced offline sync
- [ ] Collection management (add/remove)
- [ ] Category ordering customization
- [ ] Performance optimization

**Deliverable:** Feature-complete app

### Phase 5: Polish & Deploy (Week 9-10)
**Tasks:**
- [ ] PWA setup (manifest, service worker)
- [ ] Responsive mobile view
- [ ] Performance testing
- [ ] Cross-browser testing
- [ ] Deploy to hosting (Firebase/Vercel)
- [ ] Test on all target devices

**Deliverable:** Production-ready app

---

## Testing Checklist

### Functionality Testing
- [ ] Google Drive authentication works
- [ ] Can add multiple collections
- [ ] Can list all categories in each collection
- [ ] Text documents display with proper fonts
- [ ] Metadata parsing works correctly
- [ ] Highlights/formatting preserved
- [ ] Image documents display and zoom
- [ ] PDF references link correctly
- [ ] Search works across collections
- [ ] Collection-specific features work
- [ ] Settings persist across sessions
- [ ] Offline mode works
- [ ] Sync detects updates

### Device Testing
- [ ] 10" Android tablet (landscape) - PRIMARY
- [ ] 10" Android tablet (portrait)
- [ ] Android phone
- [ ] iPhone
- [ ] Windows laptop
- [ ] MacBook

### Collection-Specific Testing
**Bhajana:**
- [ ] Deity organization works
- [ ] Seasonal ordering applies
- [ ] Ragam/Talam filtering works

**Veda:**
- [ ] Chapter navigation works
- [ ] Verse bookmarks save
- [ ] Transliteration toggle works

**Puja:**
- [ ] Step sequence displays correctly
- [ ] Timer functions properly
- [ ] Materials checklist works

**Krithi:**
- [ ] Composer filtering works
- [ ] Ragam filtering works

**Stotra:**
- [ ] Time-based categories work
- [ ] Phala shruti displays

---

## Deployment

### Recommended: Firebase Hosting

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

### Domain Options
- patrapaha.app (recommended)
- patrapaha.in
- pp.app (if available)

---

## Cost Estimate

### Free Tier
- **Google Drive:** Already using it ($0)
- **Google Drive API:** 20,000 requests/day free ($0)
- **Firebase Hosting:** 10GB storage, 360MB/day ($0)
- **Domain:** patrapaha.app (~$12/year)

**Total: $0-12/year for personal use**

---

## Future Enhancements

### Phase 2 Features
1. **Metadata Helper Tool** - Web form to add metadata to documents
2. **Audio Support** - Play audio files for chanting/pronunciation
3. **Performance Tracking** - Track which bhajans performed when
4. **Sharing** - Share individual documents or collections
5. **Multi-user Support** - Family/group access
6. **Cloud Backup** - Backup favorites/settings to Firebase

---

## Summary

**PatraPaha** is a flexible, multi-collection document browser designed for viewing sacred texts, devotional songs, and classical compositions. The architecture supports:

✅ **5 Collection Types** (Bhajana, Veda, Puja, Krithi, Stotra)  
✅ **Google Drive Backend** (zero migration)  
✅ **Offline-First** (works without internet)  
✅ **Beautiful Rendering** (Tamil, Sanskrit, Devanagari)  
✅ **Collection-Specific Features** (each optimized for its content)  
✅ **Progressive Enhancement** (works without metadata)  
✅ **Responsive Design** (tablet, phone, desktop)  

**Timeline:** 8-10 weeks to production  
**Cost:** $0-12/year  

This implementation guide contains everything needed to build PatraPaha from scratch!
