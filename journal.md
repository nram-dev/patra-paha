## 2026-02-05

- Moved font size controls (A-/A+) from document panel to header bar for better accessibility and cleaner document view.
- Moved document title from document panel to header bar, displayed centered with larger bold text for prominence.
- Font size state is now managed at CollectionView level and shared between Header and SongViewer components.

## 2026-02-04

- Moved Favorites button from Categories panel (column 1) to the header, displaying as a star icon before the collection name for better visibility and space efficiency.

## 2026-02-03

- Improved light theme panel styling: Doc panel now has white background, Category panel uses light gray (#E0E0E0), Items panel uses slightly lighter gray (#EAEAEA) for visual hierarchy.
- Added corresponding dark theme panel colors for consistency.
- Increased font sizes in Category panel (Navigation) with semibold weight for better readability on gray background.
- Increased font sizes in Items panel (SongList) with normal weight for cleaner appearance.
- Updated section headers (Docs, Images, Audio, URL) to larger font size.
- Deployed app to Vercel at https://patra-paha.vercel.app for access from mobile devices.
- Enabled network access for dev server (`host: true` in vite.config.ts) for local network testing.
- Fixed TypeScript build errors: excluded legacy backup files, fixed unused imports, and corrected type mismatches.
- Added image scaling with text zoom: embedded images in documents now scale together with text when using A+/A- font size controls, using CSS zoom for proper layout adjustment.

## 2026-01-31

- Added a URL override in the Items panel, including recent URL recall, clear actions, and an embedded viewer override in the Doc panel.
- Enhanced the Audio Panel with external YouTube/Spotify playback, recent URL suggestions, layout refinements, height presets, and auto height switching between audio and embeds.
- Wired YouTube links in docs to load into the media panel (auto-detect + click-to-load), normalized Google redirect URLs, and disabled autoplay for embeds.


- Improved dark theme readability by removing inline text colors in normalized HTML and switching the background to dark gray.
