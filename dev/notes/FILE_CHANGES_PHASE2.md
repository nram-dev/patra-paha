# Phase 2 File Changes Reference

Quick reference of all files created and modified during Phase 2 implementation.

---

## New Files Created

### 1. `src/components/Search.tsx` (301 lines)
**Purpose:** Full-featured search modal component  
**Key Features:**
- Fuzzy search with Fuse.js
- Keyboard navigation (Arrow keys, Enter, Escape)
- Recent searches from IndexedDB
- Real-time results with metadata display

**Dependencies:**
- Fuse.js
- Chakra UI components
- IndexedDB via Dexie

**Exports:**
- `Search` component (default)

---

### 2. `src/utils/songTitle.ts` (31 lines)
**Purpose:** Utility functions for song title resolution  
**Key Functions:**
- `getSongTitle(song, language)` - Get title in preferred language
- `getFirstLineAsTitle(content)` - Extract first line as fallback

**Exports:**
- `getSongTitle` function
- `getFirstLineAsTitle` function

---

### 3. `PHASE2-COMPLETE.md` (192 lines)
**Purpose:** User-facing completion summary  
**Contents:**
- Feature list and screenshots
- Testing checklist
- Keyboard shortcuts reference
- Next steps

---

### 4. `dev/notes/PHASE2_IMPLEMENTATION.md` (650+ lines)
**Purpose:** Developer implementation notes  
**Contents:**
- Detailed implementation timeline
- Architecture decisions
- Code examples
- Bug fixes and solutions
- Performance metrics
- Lessons learned

---

### 5. `dev/notes/TROUBLESHOOTING.md` (400+ lines)
**Purpose:** Common issues and solutions  
**Contents:**
- Authentication issues
- Search problems
- Database issues
- UI bugs
- Browser compatibility
- Debugging tips

---

### 6. `dev/notes/FILE_CHANGES_PHASE2.md` (this file)
**Purpose:** Quick reference of file changes

---

## Modified Files

### Database & Types

#### `src/db/database.ts`
**Lines Changed:** ~25 lines added  
**Changes:**
- Added database version 2
- New `searchHistory` table
- Added `isFavorite`, `viewCount`, `lastViewed` fields to songs
- Migration logic for existing songs

**Key Code:**
```typescript
this.version(2).stores({
  songs: 'id, driveFileId, deity, name, modifiedTime, cachedAt, isFavorite, viewCount, lastViewed',
  deities: 'id, name, order, driveFolderId',
  settings: 'id',
  searchHistory: '++id, query, timestamp'
})
```

---

#### `src/types/index.ts`
**Lines Changed:** ~30 lines added  
**Changes:**
- Updated `Song` interface with new fields
- Enhanced `SongMetadata` with language-specific title fields
- Added `SearchHistory` interface
- Added `SortOption` type
- Added `TitleLanguage` type
- Updated `AppSettings` with language field

**New Types:**
```typescript
export interface SearchHistory {
  id?: number
  query: string
  timestamp: string
}

export type SortOption = 'alphabetical' | 'recent' | 'mostViewed' | 'recentlyModified'
export type TitleLanguage = 'english' | 'tamil' | 'sanskrit'
```

---

### Layout Components

#### `src/components/layout/Header.tsx`
**Lines Changed:** ~70 lines added  
**Changes:**
- Added search button with Ctrl+K hint
- Added language dropdown menu (English/Tamil/Sanskrit)
- Updated props to include `onSearchOpen` and language handlers

**New Props:**
```typescript
interface HeaderProps {
  onLogout: () => void
  onSearchOpen: () => void
  language: TitleLanguage
  onLanguageChange: (language: TitleLanguage) => void
}
```

---

#### `src/components/layout/Navigation.tsx`
**Lines Changed:** ~40 lines added  
**Changes:**
- Added "Favorites" virtual folder at top
- Added star icon
- Added `showingFavorites` state handling
- Updated deity selection to clear favorites mode

**New Props:**
```typescript
interface NavigationProps {
  deities: Deity[]
  selectedDeity: Deity | null
  onDeitySelect: (deity: Deity | null) => void
  onFavoritesSelect: () => void
  showingFavorites: boolean
  loading: boolean
}
```

---

#### `src/components/layout/SongList.tsx`
**Lines Changed:** ~80 lines added  
**Changes:**
- Added sorting dropdown menu
- Added star icon button for each song
- Added sorting logic with `useMemo`
- Language-aware title display
- Updated layout to accommodate star icons

**New Props:**
```typescript
interface SongListProps {
  songs: Song[]
  selectedSong: Song | null
  onSongSelect: (song: Song) => void
  onToggleFavorite: (song: Song) => void
  language: TitleLanguage
  loading: boolean
}
```

**Key Features:**
- Sort options: Alphabetical, Recent, Most Viewed, Recently Modified
- Yellow star for favorites
- Hover effects on stars

---

#### `src/components/layout/SongViewer.tsx`
**Lines Changed:** No changes (future phase)  
**Planned Changes:**
- YouTube/Spotify link display
- Image viewer integration
- PDF viewer integration

---

### Main App Component

#### `src/App.tsx`
**Lines Changed:** ~150 lines added  
**Major Changes:**
1. Added search state and modal integration
2. Added favorites handling
3. Added language preference management
4. Added column collapse functionality
5. Added keyboard shortcuts (Ctrl+K, Alt+1, Alt+2)
6. Enhanced error handling for token expiration
7. Added view tracking (viewCount, lastViewed)

**New State:**
```typescript
const [isSearchOpen, setIsSearchOpen] = useState(false)
const [allSongs, setAllSongs] = useState<Song[]>([])
const [showingFavorites, setShowingFavorites] = useState(false)
const [language, setLanguage] = useState<TitleLanguage>('english')
const [isColumn1Collapsed, setIsColumn1Collapsed] = useState(false)
const [isColumn2Collapsed, setIsColumn2Collapsed] = useState(false)
```

**New Functions:**
- `handleFavoritesSelect()` - Load favorite songs
- `handleToggleFavorite()` - Toggle favorite status
- `handleSearchSongSelect()` - Select song from search
- `handleLanguageChange()` - Update language preference
- `toggleColumn1()` / `toggleColumn2()` - Column collapse

**Enhanced Functions:**
- `loadDeities()` - Added token expiration handling
- `handleDeitySelect()` - Added token expiration handling
- `handleSongSelect()` - Added view tracking and token expiration handling

---

## Configuration Files

### No Changes Required
- `package.json` - No new dependencies (fuse.js already present)
- `tsconfig.json` - No changes
- `vite.config.ts` - No changes
- `.env` - No changes

---

## Documentation Files

### Updated
- `.cursor/plans/implementation_roadmap_76597122.plan.md` - Marked Phase 2 todos complete

### Created
- `PHASE2-COMPLETE.md`
- `dev/notes/PHASE2_IMPLEMENTATION.md`
- `dev/notes/TROUBLESHOOTING.md`
- `dev/notes/FILE_CHANGES_PHASE2.md`

---

## Code Statistics

### Lines of Code
- **New production code:** ~800 lines
- **New documentation:** ~1,400 lines
- **Modified production code:** ~200 lines
- **Total:** ~2,400 lines

### Files Changed
- **New files:** 6 (2 production, 4 documentation)
- **Modified files:** 6 (production)
- **Total files touched:** 12

### Complexity Added
- **New components:** 1 (Search)
- **New utilities:** 1 (songTitle)
- **New database tables:** 1 (searchHistory)
- **New database fields:** 3 (isFavorite, viewCount, lastViewed)
- **New types:** 3 (SearchHistory, SortOption, TitleLanguage)

---

## Import/Export Map

### New Exports

**`src/components/Search.tsx`:**
```typescript
export default Search
```

**`src/utils/songTitle.ts`:**
```typescript
export function getSongTitle(song: Song, language: TitleLanguage): string
export function getFirstLineAsTitle(content?: string): string | null
```

**`src/types/index.ts`:**
```typescript
export interface SearchHistory
export type SortOption
export type TitleLanguage
```

### New Imports in Existing Files

**`src/App.tsx`:**
```typescript
import Search from './components/Search'
import { TitleLanguage } from './types'
```

**`src/components/layout/Header.tsx`:**
```typescript
import { TitleLanguage } from '../../types'
```

**`src/components/layout/SongList.tsx`:**
```typescript
import { TitleLanguage, SortOption } from '../../types'
import { getSongTitle } from '../../utils/songTitle'
import { useState, useMemo } from 'react'
```

**`src/db/database.ts`:**
```typescript
import { SearchHistory } from '../types'
```

---

## Dependency Tree

```
App.tsx
├── Search.tsx
│   └── types/index.ts (SearchHistory, Song, TitleLanguage)
│   └── db/database.ts (searchHistory table)
│
├── Header.tsx
│   └── types/index.ts (TitleLanguage)
│
├── Navigation.tsx (no new deps)
│
├── SongList.tsx
│   └── types/index.ts (TitleLanguage, SortOption)
│   └── utils/songTitle.ts (getSongTitle)
│
└── SongViewer.tsx (no changes)
```

---

## Git Diff Summary

If running `git diff`, expect changes in:

```bash
# Modified files
src/db/database.ts
src/types/index.ts
src/components/layout/Header.tsx
src/components/layout/Navigation.tsx
src/components/layout/SongList.tsx
src/App.tsx

# New files
src/components/Search.tsx
src/utils/songTitle.ts
PHASE2-COMPLETE.md
dev/notes/PHASE2_IMPLEMENTATION.md
dev/notes/TROUBLESHOOTING.md
dev/notes/FILE_CHANGES_PHASE2.md
```

---

## Rollback Instructions

To rollback Phase 2 changes:

```bash
# If not committed
git checkout -- src/

# If committed
git revert <commit-hash>

# Clear browser data
# In browser console:
indexedDB.deleteDatabase('GTDatabase')
localStorage.clear()
```

Note: Users will need to re-authenticate after rollback.

---

## Merge Considerations

### Merge-Safe Files
These files can be safely merged:
- All documentation files
- `src/types/index.ts` (additions only)
- `src/utils/songTitle.ts` (new file)
- `src/components/Search.tsx` (new file)

### Conflict-Prone Files
These files may conflict with other branches:
- `src/App.tsx` (many changes)
- `src/components/layout/*.tsx` (prop changes)
- `src/db/database.ts` (schema changes)

### Migration Path
If merging with other work:
1. Merge database schema carefully (ensure version numbers don't conflict)
2. Update component props to match new interfaces
3. Test IndexedDB migrations thoroughly
4. Verify OAuth flow still works

---

**Last Updated:** December 2024


