# PatraPaha (पत्रपहा) - Branding & UI Summary

## 🎯 Project Identity

**Name:** PatraPaha (पत्रपहा)  
**Pronunciation:** PAT-ra-PA-ha (all short 'a')  
**Short Form:** PP  

**Etymology:**
- **Patra** (పత్ర/ಪತ್ರ) = Document, Letter, Leaf (Telugu/Kannada/Sanskrit)  
- **Paha** (पहा) = View, See, Look (Marathi imperative)  
- **Meaning:** "View documents" / "See the papers"

**Philosophy:** A general-purpose document browser for sacred texts, devotional songs, classical compositions, and spiritual literature.

---

## 📚 Product Family

PatraPaha supports five specialized collection types:

### 1. Bhajana PatraPaha (भजन पत्रपहा)
- **Icon:** 🎵
- **Color:** Saffron #FF9933
- **Purpose:** Devotional songs and bhajans
- **Features:** Deity organization, ragam/talam filters, seasonal ordering

### 2. Veda PatraPaha (वेद पत्रपहा)
- **Icon:** 🕉️
- **Color:** Deep Blue #1E3A8A
- **Purpose:** Vedic scriptures and texts
- **Features:** Chapter/verse navigation, bookmarks, transliteration

### 3. Puja PatraPaha (पूजा पत्रपहा)
- **Icon:** 🙏
- **Color:** Red #DC2626
- **Purpose:** Puja sequences and procedures
- **Features:** Step-by-step sequences, materials checklist, timer

### 4. Krithi PatraPaha (कृति पत्रपहा)
- **Icon:** 🎼
- **Color:** Purple #7C3AED
- **Purpose:** Carnatic music compositions
- **Features:** Composer organization, ragam/talam filters, playlists

### 5. Stotra PatraPaha (स्तोत्र पत्रपहा)
- **Icon:** 📿
- **Color:** Green #059669
- **Purpose:** Devotional hymns and stotras
- **Features:** Time-based categories, phala shruti, daily recitation

---

## 🎨 Visual Identity

### Logo Concepts

**Option 1: Document Icon with PP**
```
   📄
  ┌───┐
  │PP │
  └───┘
पत्रपहा
```

**Option 2: Devanagari Focus**
```
पत्रपहा
PatraPaha
  (PP)
```

**Option 3: Minimal Monogram**
```
 ╔═══╗
 ║ P ║
 ║───║
 ║ P ║
 ╚═══╝
```

### Color Themes

**Calm Mode (Default):**
- Background: #F5F5DC (Warm Beige)
- Surface: #FFFFFF (White)
- Text Primary: #2C1810 (Dark Brown)
- Text Secondary: #6B5D52 (Medium Brown)
- Accent: #FF6B35 (Document Orange)
- Border: #E0D5C7 (Light Brown)
- Highlight: #FFF9C4 (Light Yellow)

**Dark Mode:**
- Background: #1A1A1A (Deep Charcoal)
- Surface: #2D2D2D (Dark Gray)
- Text Primary: #F5F5F0 (Warm White)
- Text Secondary: #B8B5B0 (Medium Gray)
- Accent: #FFA500 (Warm Orange)
- Border: #404040 (Medium Charcoal)
- Highlight: #3D3A2E (Dark Yellow)

### Typography
- **Multilingual Font:** Noto Sans Tamil, Noto Sans Devanagari, Noto Sans
- **Body Font:** Inter, SF Pro
- **Font Sizes:** 18px (small), 22px (medium), 28px (large), 36px (xlarge)
- **Line Spacing:** 1.5 (compact), 1.8 (comfortable), 2.0 (spacious)

---

## 📱 UI Layout

### Home Screen - Collection Selector
```
┌────────────────────────────────────────┐
│  📄 PatraPaha         🔍  ⚙️  👤      │
│     पत्रपहा                            │
├────────────────────────────────────────┤
│                                        │
│  Your Collections:                     │
│                                        │
│  ┌─────────────┐  ┌─────────────┐    │
│  │  🎵         │  │  🕉️         │    │
│  │  Bhajana    │  │  Veda       │    │
│  │  PatraPaha  │  │  PatraPaha  │    │
│  │  234 items  │  │  48 texts   │    │
│  └─────────────┘  └─────────────┘    │
│                                        │
│  ┌─────────────┐  ┌─────────────┐    │
│  │  🙏         │  │  🎼         │    │
│  │  Puja       │  │  Krithi     │    │
│  │  PatraPaha  │  │  PatraPaha  │    │
│  │  12 seq.    │  │  156 comp.  │    │
│  └─────────────┘  └─────────────┘    │
│                                        │
│  [+ Add Collection]                   │
│                                        │
└────────────────────────────────────────┘
```

### Collection View - 3 Column Layout (Tablet Landscape)
```
┌───────────────┬──────────────────────────┬─────────────────────────────────────────────────┐
│               │                          │                                                 │
│  NAVIGATION   │   DOCUMENT LIST          │   DOCUMENT VIEWER                               │
│  (Column 1)   │   (Column 2)             │   (Column 3)                                    │
│               │                          │                                                 │
│  200px fixed  │   280px fixed            │   Fluid (min 400px)                             │
│               │                          │                                                 │
└───────────────┴──────────────────────────┴─────────────────────────────────────────────────┘
```

**Column 1: Navigation**
- Quick Access (Favorites, Recent, Downloaded)
- Categories (deity/composer/type-specific)
- Special folders (if any)
- Sync status

**Column 2: Document List**
- Shows documents in selected category
- Title only (may be in English or Tamil/Sanskrit)
- Type indicators: 📄 (text), 🖼️ (image), 📊 (table)
- Filter and sort options

**Column 3: Document Viewer**
- Clean content display
- Large Tamil/Sanskrit text (22px default)
- Preserved formatting (highlights, headers)
- Minimal controls (font size, favorite, copy)

---

## 🔍 Collection-Specific Navigation

### Bhajana PatraPaha - Column 1
```
┌───────────────────┐
│  NAVIGATION       │
│                   │
│  ⭐ Favorites     │
│  🕐 Recent        │
│  ☁️ Downloaded    │
│                   │
│  ───────────────  │
│                   │
│  DEITIES ⚙️       │
│  (Customizable)   │
│                   │
│  Devi             │
│  Guru             │
│  Siva             │
│  Muruga           │
│  Vinayaka         │
│  ... more         │
│                   │
│  ───────────────  │
│                   │
│  BY RAGAM         │
│  Anandha Bhairavi │
│  Kalyani          │
│  ... more         │
│                   │
└───────────────────┘
```

### Veda PatraPaha - Column 1
```
┌───────────────────┐
│  NAVIGATION       │
│                   │
│  ⭐ Favorites     │
│  📖 Bookmarks     │
│  🕐 Recent        │
│                   │
│  ───────────────  │
│                   │
│  UPANISHADS       │
│  Isha Upanishad   │
│  Katha Upanishad  │
│  Kena Upanishad   │
│  ... more         │
│                   │
│  VEDAS            │
│  Rigveda          │
│  Yajurveda        │
│  Samaveda         │
│  Atharvaveda      │
│                   │
│  PURANAS          │
│  ... more         │
│                   │
└───────────────────┘
```

### Puja PatraPaha - Column 1
```
┌───────────────────┐
│  NAVIGATION       │
│                   │
│  ⭐ Favorites     │
│  🕐 Recent        │
│                   │
│  ───────────────  │
│                   │
│  DAILY PUJAS      │
│  Morning Puja     │
│  Evening Puja     │
│                   │
│  FESTIVAL PUJAS   │
│  Navaratri        │
│  Diwali           │
│  Vinayaka Chatur. │
│  ... more         │
│                   │
│  DEITY SPECIFIC   │
│  Lakshmi Puja     │
│  Saraswati Puja   │
│  ... more         │
│                   │
└───────────────────┘
```

### Krithi PatraPaha - Column 1
```
┌───────────────────┐
│  NAVIGATION       │
│                   │
│  ⭐ Favorites     │
│  📋 Playlists     │
│  🕐 Recent        │
│                   │
│  ───────────────  │
│                   │
│  BY COMPOSER      │
│  Thyagaraja       │
│  M. Dikshitar     │
│  Shyama Sastri    │
│  Papanasam Sivan  │
│  ... more         │
│                   │
│  BY RAGAM         │
│  Kalyani          │
│  Shankarabharanam │
│  ... more         │
│                   │
└───────────────────┘
```

### Stotra PatraPaha - Column 1
```
┌───────────────────┐
│  NAVIGATION       │
│                   │
│  ⭐ Favorites     │
│  ⏰ Daily Recite  │
│  🕐 Recent        │
│                   │
│  ───────────────  │
│                   │
│  BY TIME          │
│  Morning Stotras  │
│  Evening Stotras  │
│  Anytime          │
│                   │
│  BY DEITY         │
│  Vishnu           │
│  Shiva            │
│  Devi             │
│  ... more         │
│                   │
│  SPECIAL          │
│  Sahasranamas     │
│  Ashtottaras      │
│                   │
└───────────────────┘
```

---

## 📋 Key UI Features

### Universal Features (All Collections)
- ✅ Offline access after sync
- ✅ Search within collection
- ✅ Favorites marking
- ✅ Font size controls (18-36px)
- ✅ Theme toggle (calm/dark)
- ✅ Copy text
- ✅ Beautiful multilingual rendering

### Collection-Specific Features

**Bhajana:**
- Seasonal deity ordering
- Ragam/Talam filtering
- YouTube link support
- Performance tracking (optional)

**Veda:**
- Chapter/Verse navigation
- Bookmark system
- Transliteration toggle
- Commentary sections

**Puja:**
- Step-by-step sequence view
- Materials checklist
- Timer for each step
- Reminder system

**Krithi:**
- Composer filtering
- Ragam/Talam filtering
- Playlist creation
- Notation support

**Stotra:**
- Time-based organization
- Phala shruti display
- Daily recitation tracker
- Audio pronunciation guide

---

## 🎯 Design Principles

1. **Content First:** Minimal UI, maximum content visibility
2. **Offline First:** Works beautifully without internet
3. **Respectful:** Appropriate for sacred/classical content
4. **Flexible:** Adapts to different collection types
5. **Beautiful Typography:** Optimized for Indian languages
6. **Simple:** Text-only navigation, clean interfaces

---

## 📱 Responsive Breakpoints

- **Tablet Landscape (Primary):** 1200-1600px → 3 columns
- **Tablet Portrait:** 900-1200px → 2 columns (nav becomes drawer)
- **Phone:** < 600px → Single column stack
- **Desktop:** > 1600px → 3 columns (wider viewer)

---

## 🚀 Implementation Notes

### Core Components Needed
1. **CollectionSelector** - Home screen with collection cards
2. **CollectionView** - 3-column layout
3. **Navigation** - Category/deity/composer tree
4. **DocumentList** - Scrollable list of documents
5. **DocumentViewer** - Text/image/PDF viewer
6. **Settings** - Theme, font, sync, collection management
7. **Search** - Global search across collections

### Collection-Specific Components
Each collection type has specialized components:
- Bhajana: `DeityNavigation`, `RagamFilter`, `SeasonalOrdering`
- Veda: `ChapterNavigation`, `VerseBookmarks`, `TransliterationToggle`
- Puja: `SequenceSteps`, `MaterialsChecklist`, `TimerComponent`
- Krithi: `ComposerNavigation`, `PlaylistCreator`
- Stotra: `TimeBasedFilter`, `RecitationGuide`

---

## 📦 Files Included

1. **PatraPaha-Implementation-Guide.md** - Complete technical implementation
2. **This file (PatraPaha-Branding-UI-Summary.md)** - Branding and UI overview

**Note:** The older files (bhajan-ui-mockups-final.md and bhajan-ui-design-spec.md) 
contained GT branding and single-collection design. The new PatraPaha implementation 
guide supersedes these with multi-collection architecture.

---

## ✅ Ready for Implementation

With this branding and the implementation guide, you have everything needed to:

1. **Start development** with clear multi-collection architecture
2. **Brand consistently** across all collection types
3. **Design UI** for each collection's specific needs
4. **Scale easily** by adding new collection types

**Next Steps:**
1. Review the PatraPaha-Implementation-Guide.md
2. Set up development environment
3. Begin with Phase 1 (authentication + core infrastructure)
4. Build Collection Selector first
5. Implement Bhajana PatraPaha as first collection
6. Add other collections progressively

---

**PatraPaha (पत्रपहा) - View Your Knowledge** 📄
