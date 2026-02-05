# Development Journal

## 2026-02-05: Fix Add Collection Screen Text Visibility

### Bug Fix
Text in the Add Collection screen was nearly invisible due to missing explicit color definitions, making the form unusable.

### Changes Made

#### 1. Form Element Colors
**File:** `src/components/AddCollection.tsx`
- Added `color="gray.800"` to heading
- Added `color="gray.700"` to all form labels
- Added `color="gray.800"` to input fields
- Added `_placeholder={{ color: 'gray.400' }}` for placeholder text

#### 2. Alert Colors
**File:** `src/components/AddCollection.tsx`
- Error alert: title `red.800`, description `red.700`
- Info alert: title `blue.800`, description `blue.700`

### Files Modified
- `src/components/AddCollection.tsx` - Explicit color definitions for all text elements

---

## 2026-01-31: Enhance Audio Player Controls

### Feature
Add custom audio controls for skip, speed, replay, and play/pause, keep playback on the current song, and refine the control layout/styling.

### Changes Made

#### 1. Playback Behavior + State
**File:** `src/components/layout/AudioPanel.tsx`
- Disabled auto-advance on track end so playback stays on the current song
- Added play/pause state and a highlighted Play/Pause control

#### 2. Skip + Speed Controls
**File:** `src/components/layout/AudioPanel.tsx`
- Added skip back/forward buttons for 5/10/30/60 seconds
- Added speed presets: 0.5x, 0.7x, 0.9x, 1x, 1.2x, 1.5x, 2x (with 1x emphasized)
- Added replay-from-start control

#### 3. Layout + Styling
**File:** `src/components/layout/AudioPanel.tsx`
- Rearranged controls into left/center/right groups (play/replay, skip, speed)
- Increased label contrast with distinct background colors

### Files Modified
- `src/components/layout/AudioPanel.tsx` - Custom audio controls, layout, and styling updates

---

## 2026-01-31: Add Browser Audio Support (mp3/mp4/wav)

### Feature
Support audio files from Google Drive in the browser, including listing, playback, and next/prev navigation within a category.

### Changes Made

#### 1. Drive Audio Detection
**Files:** `src/services/driveService.ts`, `src/services/scanService.ts`
- Added `isAudioFile()` MIME/extension detection (mp3/mp4/wav, including `video/mp4`)
- Included audio files in scan filters and document metadata (`contentType: 'audio'`)

#### 2. Audio Playback UI
**Files:** `src/components/layout/SongViewer.tsx`
- Added an audio viewer with HTML5 `<audio>` player
- Included Prev/Next controls and auto-advance on track end
- Added download action for audio files

#### 3. Listing + Selection Flow
**Files:** `src/components/CollectionView.tsx`, `src/components/layout/SongList.tsx`
- Ensured Drive refresh runs even with cached docs so new audio files appear
- Centralized sort state in `CollectionView` to keep playback order aligned with the list
- Added prev/next handlers for audio based on the sorted list
- Blob URL loading added for audio (same path as PDF/image)

#### 4. Documentation
**File:** `README.md`
- Documented audio playback in features and Drive structure notes

### Files Modified
- `src/services/driveService.ts` - Audio file detection
- `src/services/scanService.ts` - Audio scan inclusion
- `src/components/CollectionView.tsx` - Drive refresh, audio selection, prev/next
- `src/components/layout/SongList.tsx` - Externalized sort state
- `src/components/layout/SongViewer.tsx` - Audio player UI
- `README.md` - Audio support notes

---

## 2026-01-31: Split Doc + Audio Viewer Panels

### Feature
Split the main viewer into stacked doc and audio panels, and isolate refresh so doc selection no longer refreshes the audio panel (and vice versa).

### Changes Made

#### 1. Viewer Layout Split
**Files:** `src/components/CollectionView.tsx`
- Replaced the single viewer with a stacked layout: doc viewer on top, audio panel below
- Set a fixed-height audio panel and allowed the doc viewer to take the remaining space

#### 2. Dedicated Audio Panel
**File:** `src/components/layout/AudioPanel.tsx`
- Added a separate audio panel with now playing, controls, and playback UI

#### 3. Doc Viewer Simplification
**File:** `src/components/layout/SongViewer.tsx`
- Removed the embedded mini player so the doc viewer only renders doc content

#### 4. Loading Isolation
**File:** `src/components/CollectionView.tsx`
- Added a separate `audioLoading` state to avoid doc refresh when loading audio

### Files Modified
- `src/components/CollectionView.tsx` - Split layout and audio loading isolation
- `src/components/layout/AudioPanel.tsx` - New audio panel component
- `src/components/layout/SongViewer.tsx` - Doc-only viewer

---

## 2026-01-31: Hide Empty Collections and Categories by Default

### Feature
Hide empty collections (on home page) and empty categories (on collection page) by default, with View menu toggles to show them.

## 2026-01-31: Split Item Column and Audio Playback Placement

### Feature
Split the items list into Docs/Images/Audio sections, allow audio to play independently, and move the audio player to the main viewer bottom.

### Changes Made

#### 1. Split List Sections
**Files:** `src/components/CollectionView.tsx`, `src/components/layout/SongList.tsx`
- Broke the items column into Docs, Images, and Audio sections
- Audio selection no longer replaces the main document viewer selection
- Updated `SongList` to support headerless, embedded rendering

#### 2. Main Viewer Audio Player
**File:** `src/components/layout/SongViewer.tsx`
- Added a sticky mini player at the bottom of the main viewer
- Kept the player visible while viewing docs/images

#### 3. Viewer Loading Isolation
**File:** `src/components/CollectionView.tsx`
- Introduced a separate `viewerLoading` state so the item column no longer refreshes when loading content

### Files Modified
- `src/components/CollectionView.tsx` - Split items, audio selection, loading isolation
- `src/components/layout/SongList.tsx` - Embedded list rendering
- `src/components/layout/SongViewer.tsx` - Bottom mini player

---

### Changes Made

#### 1. Collection Page - Empty Categories Toggle
**Files:** `src/components/layout/Header.tsx`, `src/components/CollectionView.tsx`
- Added "Empty Categories" option to the View dropdown menu
- Categories with 0 items are hidden by default
- Keyboard shortcut: **Alt+3**
- Setting persisted in localStorage (`showEmptyCategories`)

#### 2. Home Page - Empty Collections Toggle
**File:** `src/components/CollectionSelector.tsx`
- Added View menu in top-right corner of header
- "Empty Collections" toggle hides collections with 0 documents by default
- Setting persisted in localStorage (`showEmptyCollections`)

### User Experience

| Page | Default Behavior | Toggle Location | Shortcut |
|------|-----------------|-----------------|----------|
| Home page | Empty collections hidden | View → Empty Collections | - |
| Collection page | Empty categories hidden | View → Empty Categories | Alt+3 |

### Files Modified
- `src/components/layout/Header.tsx` - Added showEmptyCategories prop and menu item
- `src/components/CollectionView.tsx` - State, localStorage, keyboard shortcut, filtering
- `src/components/CollectionSelector.tsx` - View menu with Empty Collections toggle

---

## 2026-01-31: Add View Menu for Column Visibility

### Feature
Added a "View" menu in the header toolbar to toggle visibility of Categories and Items columns.

### Changes Made

#### 1. Header Component
**File:** `src/components/layout/Header.tsx`
- Added new props: `showCategories`, `showItems`, `onToggleCategories`, `onToggleItems`
- Added "View" menu between Search and Language selector
- Menu shows checkmark next to visible columns
- Displays keyboard shortcuts (Alt+1, Alt+2) inline

#### 2. CollectionView Integration
**File:** `src/components/CollectionView.tsx`
- Passes column visibility state and toggle handlers to Header

### User Experience
- Click **View → Categories** to toggle categories column (or Alt+1)
- Click **View → Items** to toggle items column (or Alt+2)
- Existing edge toggle buttons and keyboard shortcuts continue to work
- Column state persists via localStorage

### Files Modified
- `src/components/layout/Header.tsx` - View menu with toggle options
- `src/components/CollectionView.tsx` - Pass toggle props to Header

---

## 2026-01-31: Fix CORS Issue for PDF and Image Display

### Problem
PDFs and images from Google Drive failed to load with the error:
- `Failed to load PDF. Please try again.`
- Console: `Access to fetch blocked by CORS policy: No 'Access-Control-Allow-Origin' header`

### Root Cause
The `react-pdf` library and `<Image>` component were trying to fetch files directly from Google Drive URLs (`https://www.googleapis.com/drive/v3/files/{id}?alt=media&access_token=...`). Google Drive's API blocks these direct browser fetches due to CORS restrictions, even with a valid access token in the URL.

### Solution
Download files as blobs using authenticated API calls (which work because they use the `Authorization` header), then convert to blob URLs for display.

### Changes Made

#### 1. New Blob Download Method
**File:** `src/services/driveService.ts`
- Added `getFileBlobUrl(fileId)` method that:
  1. Fetches file via authenticated `makeRequest()` (uses Authorization header)
  2. Converts response to blob
  3. Returns `URL.createObjectURL(blob)` for use in components

#### 2. Fetch Blob on Selection
**File:** `src/components/CollectionView.tsx`
- Updated `handleSongSelect()` to check for `contentType === 'pdf' || 'image'`
- Calls `driveService.getFileBlobUrl()` before displaying
- Sets the blob URL as `imageUrl` on the song object

#### 3. Memory Leak Prevention
**File:** `src/components/layout/SongViewer.tsx`
- Added `useEffect` cleanup to revoke blob URLs when component unmounts or song changes
- Checks if URL starts with `blob:` before revoking

### Files Modified
- `src/services/driveService.ts` - Added `getFileBlobUrl()` method
- `src/components/CollectionView.tsx` - Fetch blob for PDF/image on selection
- `src/components/layout/SongViewer.tsx` - Blob URL cleanup

### Technical Notes
- Blob URLs are temporary and not cached in IndexedDB (they don't persist across sessions)
- Each PDF/image selection triggers a fresh download
- The authenticated `makeRequest()` works because it sets `Authorization: Bearer {token}` header, which Google Drive accepts

---

## 2026-01-31: Custom Collections Support

### Feature
Allow users to add any collection (not just Bhajana/Anusthanam) with customizable name, icon, and color.

### Changes Made

#### 1. Custom Collection Type
**File:** `src/types/index.ts`
- Added `'custom'` to `CollectionType` union: `'bhajana' | 'anusthanam' | 'custom'`

#### 2. Custom Collection Config
**File:** `src/config/collections.ts`
- Added `CUSTOM_COLORS` - 6 color options (Indigo, Green, Blue, Purple, Pink, Teal)
- Added `CUSTOM_ICONS` - 9 icon options
- Added `DEFAULT_CUSTOM_CONFIG` with folder-organization and favorites features
- Updated `getCollectionConfig()` to return `DEFAULT_CUSTOM_CONFIG` for unknown types

#### 3. Redesigned Add Collection Form
**File:** `src/components/AddCollection.tsx`
- New form flow:
  1. Folder name input (required)
  2. Collection name auto-fills from folder name (editable)
  3. Type selection buttons: Bhajana / Anusthanam / Custom
  4. Icon picker (shown for Custom type)
  5. Color picker (shown for Custom type)
- Fixed auto-fill bug: used `useRef` to track if user manually edited the name

#### 4. Feature-based Folder Filtering
**File:** `src/services/scanService.ts`
- Changed from type-based to feature-based filtering
- Now checks for `deity-organization` feature instead of `bhajana` type
- Custom collections won't filter `__` prefixed folders

#### 5. Dynamic Column Labels
**Files:** `src/components/layout/Navigation.tsx`, `src/components/layout/SongList.tsx`, `src/components/CollectionView.tsx`

| Collection Type | Column 1 | Item Count | Column 2 | Empty State |
|-----------------|----------|------------|----------|-------------|
| Bhajana | Deities | "5 songs" | Songs | "Select a deity to view songs" |
| Others | Categories | "5 items" | Items | "Select a category to view items" |

- Added `categoryLabel` and `itemLabel` props to Navigation
- Added `categoryLabel` and `itemsLabel` props to SongList
- CollectionView passes labels based on `collection.type === 'bhajana'`

### Files Modified
- `src/types/index.ts` - Added 'custom' type
- `src/config/collections.ts` - Custom config, colors, icons
- `src/components/AddCollection.tsx` - Redesigned form
- `src/services/scanService.ts` - Feature-based filtering
- `src/components/layout/Navigation.tsx` - Dynamic labels
- `src/components/layout/SongList.tsx` - Dynamic labels
- `src/components/CollectionView.tsx` - Pass labels based on type

---

## 2026-01-31: Collection Management Improvements

### Problem
When adding a new collection (linking a Google Drive folder), the subfolders were not appearing in the app. The user had to manually understand that a "Scan Now" action was required, but this button was also not visible on the collection card.

### Root Cause
1. `AddCollection.tsx` was adding the collection to IndexedDB but not triggering `scanCollection()` to fetch the folder structure from Google Drive
2. The scan populates the `categories` table in IndexedDB, which the `CollectionView` reads to display folders
3. Without scanning, the categories table was empty

### Changes Made

#### 1. Auto-scan on Collection Addition
**File:** `src/components/AddCollection.tsx`

- Added import for `scanCollection` from `../services/scanService`
- After `addCollection()`, now automatically calls `scanCollection(collection)`
- Shows toast notifications for progress: "Scanning folder contents..." then "Scan complete!"
- Handles scan failures gracefully with a warning toast

#### 2. Collection Card Action Icons
**File:** `src/components/CollectionSelector.tsx`

- Replaced text "Scan Now" button with compact icon buttons
- Added **Scan icon** (orange `RepeatIcon`) with tooltip "Scan for changes"
- Added **Delete icon** (red `DeleteIcon`) with tooltip "Delete collection"
- Both icons show a `Spinner` while processing
- Icons are positioned to the right of the document count for cleaner layout
- Added `handleDelete` function with confirmation dialog

#### 3. Complete Cleanup on Delete
**File:** `src/stores/collectionStore.ts`

- Updated `deleteCollection()` to also delete associated data:
  - Deletes categories: `db.categories.where('collectionId').equals(id).delete()`
  - Deletes documents: `db.documents.where('collectionId').equals(id).delete()`
  - Then deletes the collection itself

### Files Modified
- `src/components/AddCollection.tsx` - Auto-scan on add
- `src/components/CollectionSelector.tsx` - Icon buttons for scan/delete
- `src/stores/collectionStore.ts` - Cleanup on delete

### Testing
1. Delete existing collection using the delete icon
2. Add a new collection with a valid Google Drive folder
3. Verify folders appear automatically after "Scan complete!" toast
4. Verify "Scan Now" icon refreshes folder list
5. Verify delete removes collection and clears cached data

---

## 2026-01-31: Add Collection Screen Redesign

### Feature
Redesigned the Add New Collection screen with predefined presets and improved UX.

### Changes Made

#### 1. Predefined Collection Presets
**File:** `src/config/collections.ts`
- Added `PREDEFINED_PRESETS` array with 4 presets:
  - **Music** (🎵, Orange) - uses bhajana config
  - **Namasankeerthanam** (🙏, Amber) - uses bhajana config
  - **Anushtanam** (🕉️, Red) - uses anusthanam config
  - **Veda** (📜, Maroon) - uses anusthanam config
- Added new colors: Orange, Red, Amber, Maroon
- Added new icons: 🕉️, 📜
- Created `PredefinedPreset` interface

#### 2. New Form Layout
**File:** `src/components/AddCollection.tsx`
- **Predefined dropdown at top** - Shows icon + color circle + preset name
- **Folder Name row** - Input with inline Icon and Color popovers
- **Collection Name** - Defaults to folder name, placeholder shows "Same as folder name"
- Removed all `FormHelperText` for cleaner UI

#### 3. Auto-populate from Preset
- Selecting a preset auto-fills: folder name, icon, and color
- User can still customize any field after selection
- Selecting "None (Custom)" resets all fields
- Used `useRef` flags to track manual edits

#### 4. Duplicate Folder Prevention
- Checks if folder's Drive ID already exists in collections
- Shows warning toast: "Collection already added"

#### 5. Empty Folder Validation
- Before creating collection, verifies folder has files or subfolders
- Shows error if folder is empty or inaccessible:
  - `Folder "xxx" appears to be empty or not accessible`
  - `Folder "xxx" not accessible - please check permissions`

#### 6. Improved Error Messages
- Changed "not found" message to: `Folder "xxx" not found or not accessible in Google Drive`

### Files Modified
- `src/config/collections.ts` - Predefined presets, new colors/icons
- `src/components/AddCollection.tsx` - Complete redesign

### UI Flow
1. Select predefined preset (optional) → auto-fills fields
2. Adjust folder name if needed → icon/color popovers inline
3. Customize collection name (optional)
4. Click "Find Folder & Add Collection"
5. Validates: folder exists, not duplicate, has content
6. Creates collection and auto-scans

---

## 2026-02-04: Streamline Audio Controls UI

### Feature
Replaced text buttons with icon-only controls for a cleaner, more compact audio panel.

### Changes Made

#### 1. Icon-Only Buttons
**File:** `src/components/layout/AudioPanel.tsx`
- Play/Pause: Unicode icons (▶ / ❚❚) with colored backgrounds
- Replay: Chakra `RepeatIcon`
- Prev/Next: Icon-only chevron buttons (removed text labels)
- Skip indicator: Double chevron icon replacing "<< Skip >>" text

#### 2. Simplified Labels
- Changed "Now Playing:" to "Playing:"
- Changed "Normal Speed" to "1x"
- Removed "Height:" label (kept size preset icons)

#### 3. Updated Skip Options
- Changed from [5, 10, 30, 60] to [5, 15, 30] seconds

### Files Modified
- `src/components/layout/AudioPanel.tsx` - Icon buttons, label changes, skip options

---

## 2026-02-04: Responsive UI for Mobile and Tablet

### Feature
Added responsive layouts for mobile, tablet, and desktop with adaptive UI components and manual layout mode override.

### Changes Made

#### 1. Breakpoint Definitions
**File:** `src/theme.ts`
- Added Chakra UI breakpoints: base (0), sm (480px), md (768px), lg (992px), xl (1280px), 2xl (1536px)

#### 2. Responsive Hook
**File:** `src/hooks/useResponsive.ts` (new)
- Created `useResponsive()` hook for device type detection (mobile/tablet/desktop)

#### 3. Header Responsive Layout
**File:** `src/components/layout/Header.tsx`
- Mobile: Hamburger menu, collection icon only, hidden sign out
- Tablet: Category dropdown, icon-only buttons, sign out icon
- Desktop: Full text labels, categories in sidebar
- Removed View dropdown menu
- Added tablet/desktop layout toggle icons for manual override
- Removed language selector (kept props for future use)
- Search button is icon-only in all layouts

#### 4. Mobile Navigation Drawer
**File:** `src/components/CollectionView.tsx`
- Added left-side drawer for categories on mobile
- Added bottom tab bar for panel switching (Songs/Viewer/Audio)
- Added `layoutMode` state with localStorage persistence

#### 5. Compact Mobile Collection Tiles
**File:** `src/components/CollectionSelector.tsx`
- 2-line compact layout on mobile:
  - Line 1: Icon, Name, Edit, Refresh, Delete
  - Line 2: Folder path (document count)
- Compact mobile header with menu button

#### 6. Audio Panel Mobile Layout
**File:** `src/components/layout/AudioPanel.tsx`
- Stacked controls on mobile (play/replay, skip, speed in separate rows)
- Hidden height controls on mobile
- Responsive URL input width

#### 7. Layout Mode Override
**Files:** `src/components/layout/Header.tsx`, `src/components/CollectionView.tsx`
- Added TabletIcon and DesktopIcon SVG components
- Users can manually switch between tablet/desktop layouts
- Fixes tablet in landscape being detected as desktop

### Layout Comparison

| Feature | Mobile | Tablet | Desktop |
|---------|--------|--------|---------|
| Categories | Drawer | Header dropdown | Sidebar |
| Song list | Full screen tab | 240px column | 280px column |
| Panel switch | Bottom tabs | N/A | Collapse buttons |
| Layout toggle | Hidden | Shown | Shown |
| Sign out | Hidden | Icon | Text |

### Files Modified
- `src/theme.ts` - Breakpoint definitions
- `src/hooks/useResponsive.ts` - New responsive hook
- `src/components/layout/Header.tsx` - Responsive header, layout toggle
- `src/components/layout/Navigation.tsx` - Drawer mode support
- `src/components/layout/SongList.tsx` - Full-width mode
- `src/components/layout/AudioPanel.tsx` - Mobile stacked controls
- `src/components/CollectionView.tsx` - Mobile drawer, bottom tabs, layout state
- `src/components/CollectionSelector.tsx` - Compact mobile tiles
