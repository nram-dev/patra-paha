## 2026-02-03

- Deployed app to Vercel at https://patra-paha.vercel.app for access from mobile devices.
- Enabled network access for dev server (`host: true` in vite.config.ts) for local network testing.
- Fixed TypeScript build errors: excluded legacy backup files, fixed unused imports, and corrected type mismatches.
- Added image scaling with text zoom: embedded images in documents now scale together with text when using A+/A- font size controls, using CSS zoom for proper layout adjustment.

## 2026-01-31

- Added a URL override in the Items panel, including recent URL recall, clear actions, and an embedded viewer override in the Doc panel.
- Enhanced the Audio Panel with external YouTube/Spotify playback, recent URL suggestions, layout refinements, height presets, and auto height switching between audio and embeds.
- Wired YouTube links in docs to load into the media panel (auto-detect + click-to-load), normalized Google redirect URLs, and disabled autoplay for embeds.


- Improved dark theme readability by removing inline text colors in normalized HTML and switching the background to dark gray.
