# GAnAmruta Thuli (GT) - UI/UX Design Specification

## Project Overview

**Project Name:** GAnAmruta Thuli (గానామృత துளி)
**Short Name:** GT
**Meaning:** 
- GAna (गान) = Song/Music (Sanskrit)
- Amruta (अमृत) = Nectar/Immortal elixir (Sanskrit)  
- Thuli (துளி) = Drop (Tamil)
**Philosophy:** Each song is a precious drop of divine nectar - small in the vast ocean of devotional music, yet infinitely sweet and nourishing to the soul
**Significance:** Bilingual name (Sanskrit + Tamil) representing that music transcends language

## Design Decisions Summary

### Layout
**3-Column Master-Detail** (Android Laptop landscape mode)
- Column 1: Deity/Folder navigation
- Column 2: Song list
- Column 3: Song content viewer

### Organization Strategy
**Root Structure:**
```
/Namasankeerthanam/
  📁 Deities (Customizable order)
    /Vinayaka/
    /Guru/
    /Devi/
    /Muruga/
    ... (user can reorder based on season)
  
  📁 Media
    /AUDIO/
    /Bhajan Class 2021/
    /Bhajan Class 2024/
    
  📁 Special
    /Marriage songs/
    /KKSF/
    /Self/
    /Misc/
    ... (other non-deity folders)
```

### Color Scheme
**Calm Mode (Default):**
- Background: Warm beige (#F5F5DC)
- Text: Dark brown (#2C1810)
- Accents: Soft saffron (#FF9933)
- Cards: White with subtle shadow

**Dark Mode (Evening sessions):**
- Background: Deep charcoal (#1A1A1A)
- Text: Warm white (#F5F5F0)
- Accents: Muted gold (#D4AF37)
- Cards: Dark gray (#2D2D2D)

---

## Metadata Strategy: Progressive Enhancement

### Approach: "Works Without, Better With"

The UI will work perfectly with **zero metadata** (current state), but will progressively enhance as you add metadata over time.

### Recommended Metadata Format

**Simple Header Block** (optional, at top of each Google Doc):

```
---
Title: Karpaga Valli Nin Porpatangal
Ragam: Anandha Bhairavi
Talam: Aadhi
Deity: Devi
Tags: Kamakshi, Kanchi
YouTube: https://youtube.com/...
Source: Yaazhpaana Inuvil Veeramani Iyer
---

[Song lyrics start here...]
கற்பகவல்லி நின் பொற்பதங்கள்...
```

**Benefits:**
- ✅ Human-readable (you can edit in Google Docs)
- ✅ Easy to parse programmatically
- ✅ Optional - songs without it work fine
- ✅ Can add gradually (one song at a time)
- ✅ Enhances search (ragam, talam searchable)

### What Metadata Enables

| Feature | Without Metadata | With Metadata |
|---------|------------------|---------------|
| **View song** | ✅ Works perfectly | ✅ Enhanced display |
| **Search by title** | ✅ Filename | ✅ Actual title |
| **Filter by deity** | ✅ Folder | ✅ Multi-deity songs |
| **Display ragam** | ⚠️ Must be in text | ✅ Extracted to header |
| **Find by ragam** | ❌ Not searchable | ✅ "Show all Hamsanadam" |
| **Find by talam** | ❌ Not possible | ✅ "Show all Aadhi" |
| **YouTube link** | ⚠️ Must be in text | ✅ Clickable button |
| **Multi-tag search** | ❌ Not possible | ✅ "Kamakshi + Bhairavi" |

### Migration Path (No Pressure)

**Phase 1: Use as-is (Week 1-4)**
- App reads all files without metadata
- Works perfectly
- Extract title from filename or first line
- No changes needed to your files

**Phase 2: Add metadata gradually (Months 2-6)**
- Add metadata to your 10 most-used songs
- See the enhanced UI features
- Add to more songs over time
- No deadline, no pressure

**Phase 3: Bulk enhancement (Optional)**
- After Phase 2, you decide if worth continuing
- I can build a tool to help add metadata faster
- Or keep hybrid: some with, some without

---

## Detailed UI Mockups

### 1. Home Screen - 3 Column Layout

```
┌──────────────────────────────────────────────────────────────────────────────┐
│  🕉️ Bhajan Lyrics              🔍 Search    ☀️/🌙  ⚙️  👤                    │
├────────────┬─────────────────────┬───────────────────────────────────────────┤
│  NAVIGATE  │   SONGS (Devi)      │   SONG VIEWER                             │
│            │                     │                                           │
│ ⭐ Favorites│ 📄 abhirAmi andh... │   कार्पगवल्ली நின் பொற்பதங்கள்           │
│ 🕐 Recent  │ 🖼️ Abirami Anthat...│                                           │
│            │ 🖼️ Amba bhavani     │   Ragam: Anandha Bhairavi                │
│ DEITIES ⚙️ │ 📄 AmbA manan ka... │   Talam: Aadhi                           │
│  📿 Devi   │ 📄 Amba Parameshw...│   Source: Veeramani Iyer                 │
│  🙏 Guru   │ 📄 Amme narayana... │   🎵 [YouTube]                           │
│  🔱 Siva   │ 📄 Andarul Seivai   │                                           │
│  🦚 Muruga │ 🖼️ aval thAn anai...│   ───────────────────────────────────    │
│  🐘 Vinaya │ 📄 Chinnanchiru...  │                                           │
│  🕉️ Ayyappa│ 📄 enna seidAlum    │   கற்பகவல்லி நின் பொற்பதங்கள் பிடித்தேன் │
│  📿 Naray..│ 📄 Hamsa vahana...  │   நற்கதி அருள்வாய் அம்மா!                │
│  🙏 Hanuma │ 📄 Janani janani... │   பற்பலரும் போற்றும் பதி மயிலாழியில்     │
│  ↕️ [More] │ 📄 Jayajaya devi    │   சிற்பம் நிறைந்த உயர் சிங்காரக்        │
│            │ 📄 karpaga valli... │   கோயில் கொண்ட                           │
│ MEDIA      │ 🖼️ Karumari         │                                           │
│  🎵 Audio  │ 📄 koDu bEga div... │   ராகம் : ஆனந்த பைரவி                    │
│  📚 Class  │ 📄 Mangattu kamma...│                                           │
│   2021     │ 📄 mAnika venai...  │   நீ இந்த வேளையெனில் செயன் எனை          │
│  📚 Class  │ 📄 vara vENDum...   │   மாற்றின நீதி நாநின்லத்தில் நாடுகல்    │
│   2024     │                     │   யோன் இந்த மெள்ளினம் அம்மா எனை         │
│            │ Showing 20 songs    │   ஆனந்த பைரவியே ஆதரித்தாளும் அம்மா!   │
│ SPECIAL    │ [Load more...]      │   (கற்பக வல்லி)                          │
│  💑 Marria │                     │                                           │
│  📖 KKSF   │                     │   [Song continues scrolling...]           │
│  📂 Self   │                     │                                           │
│  📁 Misc   │ 🔍 Filter: All      │                                           │
│            │ 📄 Text only        │                                           │
│            │ 🖼️ Images only      │   ─────────────────────────────────       │
│            │                     │   [Aa+] [Aa-] [❤️] [📋] [⚙️]              │
└────────────┴─────────────────────┴───────────────────────────────────────────┘
     200px         280px                    Rest (fluid)
```

### Column 1: Navigation (200px width)

**Sections:**

1. **Quick Access** (Always on top)
   - ⭐ Favorites
   - 🕐 Recently viewed
   - 📥 Downloaded (offline)

2. **Deities** (Main section)
   - Customizable order (⚙️ reorder icon)
   - Drag-to-reorder enabled
   - Emoji + Name
   - Count badge (optional): "Devi (23)"

3. **Media** (Collapsible)
   - Audio files
   - Bhajan classes

4. **Special** (Collapsible)
   - All non-deity folders

**Customization Panel:**
```
⚙️ Customize Deity Order

[Drag to reorder - seasonal priority]

≡ 📿 Devi          (Currently featured)
≡ 🙏 Guru
≡ 🕉️ Ayyappa
≡ 🔱 Siva
≡ 🦚 Muruga
≡ 🐘 Vinayaka
≡ ... more

[Save] [Reset to default]
```

### Column 2: Song List (280px width)

**Features:**

1. **Header with deity name & count**
   ```
   SONGS (Devi) - 23 songs
   🔍 [Search within Devi...]
   ```

2. **Song Cards**
   ```
   ┌─────────────────────────┐
   │ 📄 karpaga valli nin    │  ← Icon (📄=text, 🖼️=image)
   │                         │
   │ Ragam: Anandha Bhairavi │  ← If metadata exists
   │ ✓ Downloaded            │  ← Offline indicator
   └─────────────────────────┘
   ```

3. **Active Song Highlighting**
   - Currently viewing song has colored background

4. **Filter Options**
   - All songs
   - Text only
   - Images only
   - With metadata
   - Downloaded (offline available)

5. **Sort Options**
   - A-Z (default)
   - Recently modified
   - Recently viewed
   - By ragam (if metadata)

### Column 3: Song Viewer (Fluid width)

**Without Metadata:**
```
┌────────────────────────────────────┐
│  karpaga valli nin                 │  ← Filename as title
│  📁 Devi                            │  ← Folder badge
│  📄 Google Doc                      │  ← Source type
│                                    │
│  ────────────────────────────────  │
│                                    │
│  கற்பகவல்லி நின் பொற்பதங்கள்      │  ← Full content
│                                    │
│  யாழ்ப்பாணம் இணுவில்              │
│  வீரமணி ஐயர்                      │
│                                    │
│  ராகமாலிகா - ஆதி                  │
│  ...                               │
└────────────────────────────────────┘
```

**With Metadata:**
```
┌────────────────────────────────────┐
│  Karpaga Valli Nin Porpatangal     │  ← Clean title
│                                    │
│  Ragam: Anandha Bhairavi           │  ← Structured info
│  Talam: Aadhi                      │
│  Source: Veeramani Iyer            │
│  🎵 [YouTube Link]                 │  ← Interactive button
│                                    │
│  ────────────────────────────────  │
│                                    │
│  கற்பகவல்லி நின் பொற்பதங்கள்      │  ← Content only
│  பிடித்தேன்                       │     (metadata removed)
│  நற்கதி அருள்வாய் அம்மா!          │
│  ...                               │
└────────────────────────────────────┘
```

**Controls (Bottom bar):**
```
[Aa+] [Aa-] [❤️ Favorite] [📋 Copy] [⚙️ More]
```

**⚙️ More Menu:**
- 🔍 Find in song
- 📤 Share
- 📥 Download for offline
- 🔗 Open in Google Drive
- 📝 Edit in Google Docs
- ℹ️ File info (size, modified date)

---

## Content Rendering: Smart Preservation

### Text Documents (Google Docs)

**What Gets Preserved:**
1. ✅ **Yellow highlights** - Render with background color
2. ✅ **Bold text** - Section headers
3. ✅ **Font sizes** - If used for headers
4. ✅ **Indentation** - Poetry structure
5. ✅ **Line breaks** - Verse separations

**Example Rendering:**
```css
/* Yellow highlighted text (like karpaga valli) */
.highlighted {
  background-color: #FFF9C4;  /* Light yellow */
  padding: 20px;
  border-radius: 4px;
}

/* Section headers (bold) */
.section-header {
  font-weight: 700;
  font-size: 1.3em;
  margin-top: 24px;
  margin-bottom: 12px;
}

/* Main Tamil text */
.tamil-lyrics {
  font-family: 'Noto Sans Tamil', 'Lohit Tamil', sans-serif;
  font-size: 22px;  /* Default, adjustable */
  line-height: 1.8;
  color: #2C1810;  /* Calm mode */
}
```

### Image Documents

**Rendering Strategy:**
```
If (embedded image in Google Doc):
  → Display at full column width
  → Maintain aspect ratio
  → Enable zoom on tap
  → Show caption if present

If (table/structured content):
  → Try to render as responsive table
  → Fallback: Display as image if complex
  → Enable horizontal scroll if needed

If (standalone image file):
  → Full-screen image viewer
  → Pinch-to-zoom
  → Pan gestures
  → Rotate option
```

---

## Search Implementation

### Global Search (Header bar)

**Search across:**
- Song titles (filenames)
- Metadata (if present): ragam, talam, tags
- Deity/folder names
- File content (text documents only)

**Search UI:**
```
┌─────────────────────────────────────┐
│ 🔍 Search: "anandha bhairavi"       │
├─────────────────────────────────────┤
│                                     │
│ Found in Ragam (3 songs)            │
│  📄 Karpaga valli nin               │
│  📄 Devi stuti                      │
│  📄 Mahishasura mardini             │
│                                     │
│ Found in Lyrics (2 songs)           │
│  📄 Amba bhavani                    │
│  📄 ...anandha bhairavi...          │
│                                     │
│ Filter by:                          │
│ ☐ Devi  ☐ Guru  ☐ Muruga           │
└─────────────────────────────────────┘
```

### Smart Filters (Column 2)

**By Metadata Availability:**
- All songs
- With ragam info
- With YouTube links
- Need metadata (flag for you to add)

**By Content Type:**
- Text documents
- Images
- Has embedded media
- Has tables

---

## Offline Strategy: Smart & Transparent

### Auto-Download Logic

**Tier 1: Always (Immediate on first launch)**
```
✅ All text documents from deity folders
   Estimated: 10-20 MB
   Reason: Small, frequently accessed
```

**Tier 2: On-View (Downloaded when you open them)**
```
⚠️ Images embedded in documents
   Downloaded: First time you view the song
   Cached: For subsequent views
   Estimated: 1-3 MB per song with images
```

**Tier 3: User Choice (Manual download)**
```
🎵 AUDIO folder (potentially 500MB+)
📄 Large PDF files (10MB+ each)
🖼️ Standalone image files

User sees:
┌────────────────────────────┐
│ 🎵 Krishna bhajan.mp3      │
│ Size: 8.5 MB               │
│ [Download] [Stream]        │
└────────────────────────────┘
```

### Offline Indicator

**Status Bar:**
```
☁️ Online - All features available
📥 Syncing - Updating 3 songs...
✈️ Offline - 234 songs cached
⚠️ Limited - Some features unavailable
```

**Song-Level Indicators:**
```
In song list:
✓ karpaga valli nin  ← Green check = downloaded
☁️ large-pdf-song     ← Cloud = online only
⚠️ new-song          ← Warning = not yet cached
```

### Offline Settings Panel

```
┌──────────────────────────────────────┐
│ Offline Storage Settings             │
├──────────────────────────────────────┤
│                                      │
│ Auto-download:                       │
│ ☑ All text songs (Recommended)      │
│ ☑ Images when viewing (Smart)       │
│ ☐ All images immediately (20 MB)    │
│ ☐ PDF files (50 MB)                 │
│ ☐ Audio files (500 MB)              │
│                                      │
│ Exclude large files:                 │
│ ☑ Skip files larger than: [5] MB    │
│                                      │
│ Current Usage:                       │
│ ████████░░░░░░  18 MB / 100 MB      │
│                                      │
│ Downloaded: 234 songs                │
│ Online only: 12 songs                │
│                                      │
│ [Clear Cache] [Download All]         │
└──────────────────────────────────────┘
```

---

## Customization Features

### 1. Deity Order Management

**Interface:**
```
Settings → Deity Order

Current Season: Navaratri 🎭

Drag to reorder:
≡ 📿 Devi         ⭐ Priority 1
≡ 🙏 Guru         ⭐ Priority 2
≡ 🕉️ Ayyappa     ⭐ Priority 3
≡ 🔱 Siva
≡ 🦚 Muruga
... [Remaining deities]

[Save Order] [Quick Presets ▼]

Quick Presets:
- Navaratri (Devi first)
- Ayyappa Season (Nov-Jan)
- Vinayaka Chaturthi
- Skanda Shasti
- Reset to Alphabetical
```

### 2. Reading Preferences

```
Display Settings:

Font Size:
○ Small (18px)
● Medium (22px)
○ Large (28px)
○ Extra Large (36px)

Line Spacing:
◎ Comfortable (1.8)
○ Compact (1.5)
○ Spacious (2.0)

Theme:
☀️ Calm (Beige background)
🌙 Dark (Evening mode)
⚙️ Auto (Follow system)

Text Display:
☑ Preserve highlights
☑ Show section headers bold
☐ Justify text alignment
```

### 3. Metadata Display Preferences

```
Song Header Display:

When metadata available:
☑ Show ragam
☑ Show talam
☑ Show source/composer
☑ Show YouTube link
☐ Show tags
☐ Show deity (already in folder)

When metadata missing:
● Show filename as title
○ Extract title from first line
○ Ask me each time
```

---

## Responsive Behavior

### Android Laptop (Primary - 10" screen)

**Landscape Mode (Default):**
```
3 Columns: Nav | List | Viewer
200px   280px   Fluid
```

**Portrait Mode:**
```
2 Columns: List | Viewer
(Nav becomes slide-out drawer)
300px   Fluid
```

### Phone (Secondary)

**Single Column Stack:**
```
1. Deity Grid (home screen)
2. Song List (after selecting deity)
3. Song Viewer (after selecting song)

Navigation: Bottom bar + hamburger menu
```

### Laptop/Desktop (Tertiary)

**Same as Android Laptop landscape:**
```
3 Columns with wider viewer area
Can resize column widths
```

---

## Migration Timeline for Metadata

### Your Workflow (No Pressure)

**Month 1-2: Use without metadata**
- App works perfectly as-is
- Get comfortable with UI
- Identify most-used songs

**Month 3: Add metadata to top 10 songs**
- Your 10 most-performed songs
- See enhanced features
- Decide if worth continuing

**Month 4-6: Gradual addition**
- Add metadata when you edit songs
- Or 2-3 songs per week
- No deadline

**Tool to Help (Optional):**
```
I can build a simple web form:

┌─────────────────────────────────┐
│ Quick Metadata Helper           │
├─────────────────────────────────┤
│ Select song: [karpaga valli ▼] │
│                                 │
│ Title: [Auto-filled________]    │
│ Ragam: [____________]           │
│ Talam: [Aadhi_______]           │
│ YouTube: [Paste URL_____]       │
│                                 │
│ [Generate Header] → Copy-paste  │
│    to your Google Doc           │
└─────────────────────────────────┘
```

---

## Implementation Priority

### Phase 1: Core Viewer (Week 1-3)
✅ Google Drive authentication
✅ 3-column layout
✅ Read Google Docs (text)
✅ Display images
✅ Basic navigation
✅ Works WITHOUT metadata

### Phase 2: Enhanced Features (Week 4-5)
✅ Offline downloading
✅ Search (basic)
✅ Favorites
✅ Font size controls
✅ Dark/Calm modes

### Phase 3: Metadata Support (Week 6)
✅ Parse metadata headers
✅ Enhanced display when present
✅ Ragam/talam search
✅ Still works without metadata

### Phase 4: Customization (Week 7)
✅ Deity order management
✅ Seasonal presets
✅ Advanced preferences

---

## Questions for Final Mockup

1. **Deity Icons** - Do you want:
   - Emoji (🕉️ 📿 🙏) - Simple, colorful
   - Traditional icons - More authentic
   - Text only - Cleanest
   - Your preference?

2. **Song Card Preview** - In Column 2, show:
   - Title only (cleanest)
   - Title + first line (more context)
   - Title + metadata (if available)

3. **Media/Special Folders** - Should they be:
   - Collapsed by default (less clutter)
   - Expanded always (quick access)
   - Remember last state

Ready to create visual mockups?
