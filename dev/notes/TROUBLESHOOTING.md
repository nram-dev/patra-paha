# Troubleshooting Guide

Common issues and their solutions for GAnAmruta Thuli

---

## Authentication Issues

### Issue: "401 Unauthorized" - No Deities Loading

**Symptoms:**
- Deities list is empty
- Console shows: `GET https://www.googleapis.com/drive/v3/files?q=... 401 (Unauthorized)`
- Error: "Authentication failed. Please sign in again."

**Cause:**
- Google OAuth token has expired (tokens last ~1 hour)
- Invalid token stored in localStorage

**Solution:**
1. Refresh the page
2. Click "Sign in with Google" button
3. Complete OAuth flow
4. Deities should now load

**Prevention:**
- Future: Implement automatic token refresh

---

### Issue: "403 Forbidden" - Access Denied

**Symptoms:**
- Console shows: `403 (Forbidden)`
- Error: "Access denied. Please check your Google Drive API permissions."

**Cause:**
- Google Drive API not enabled
- OAuth scope not granted
- Client ID not configured correctly

**Solution:**
1. Check Google Cloud Console:
   - Drive API is enabled
   - OAuth consent screen configured
   - Your email added as test user
2. Check `.env` file:
   - `VITE_GOOGLE_CLIENT_ID` is correct
3. Clear localStorage and re-authenticate

---

## Search Issues

### Issue: Search Component Causes Infinite Loop

**Symptoms:**
- Console warning: "Maximum update depth exceeded"
- Browser becomes unresponsive
- High CPU usage

**Cause:**
- Fuse.js instance created without memoization
- Causes re-render on every keystroke

**Solution:**
Already fixed in code. If you see this:
1. Check `src/components/Search.tsx`
2. Ensure Fuse initialization uses `useMemo`:
```typescript
const fuse = useMemo(() => new Fuse(songs, {...}), [songs])
```

---

### Issue: Search Not Finding Songs

**Symptoms:**
- Search returns "No songs found"
- You know the song exists

**Possible Causes & Solutions:**

1. **Songs not cached:**
   - Navigate to deity folder first
   - Select deity to cache songs
   - Then search should work

2. **Typo in search:**
   - Fuzzy search has threshold of 0.4
   - Try more exact spelling
   - Try different search terms

3. **Metadata not parsed:**
   - Song may not have metadata
   - Search uses filename only
   - Try searching by filename

---

## Database Issues

### Issue: Songs Not Showing After Deity Selection

**Symptoms:**
- Deity selected
- Song list shows "Select a deity to view songs"
- Console may show IndexedDB errors

**Solution:**
1. Open browser DevTools → Application → IndexedDB
2. Check if `GTDatabase` exists
3. If corrupted, delete database:
```javascript
// In browser console:
indexedDB.deleteDatabase('GTDatabase')
```
4. Refresh page - database will recreate
5. Re-fetch songs from Drive

---

### Issue: Favorites Not Persisting

**Symptoms:**
- Star song as favorite
- Refresh page
- Favorite is gone

**Cause:**
- IndexedDB not saving properly
- Browser in private mode
- Storage quota exceeded

**Solution:**
1. Check if browser is in private/incognito mode
2. Check browser storage settings
3. Clear some storage if quota exceeded
4. Check browser console for IndexedDB errors

---

## UI Issues

### Issue: Columns Not Collapsing

**Symptoms:**
- Click collapse button
- Column doesn't hide

**Solution:**
1. Check browser console for errors
2. Try keyboard shortcuts (Alt+1, Alt+2)
3. Clear localStorage:
```javascript
// In browser console:
localStorage.removeItem('column1Collapsed')
localStorage.removeItem('column2Collapsed')
```
4. Refresh page

---

### Issue: Language Switching Not Working

**Symptoms:**
- Change language in dropdown
- Song titles don't change

**Possible Causes:**

1. **Songs don't have language metadata:**
   - Check if songs have `title-tamil` or `title-sanskrit` fields
   - Falls back to `title` or filename

2. **Preference not saving:**
   - Check IndexedDB settings table
   - Should have `language` field

**Solution:**
1. Check song metadata in Google Docs
2. Add language-specific titles:
```yaml
---
title: English Title
title-tamil: தமிழ் தலைப்பு
title-sanskrit: संस्कृत शीर्षक
---
```

---

### Issue: Sorting Not Working

**Symptoms:**
- Change sort option
- Songs don't reorder

**Cause:**
- Songs may not have required fields
- View tracking not working

**Solution:**

For "Recently Viewed" or "Most Viewed":
1. View some songs first
2. Check if `viewCount` and `lastViewed` are updating
3. Check browser console for errors

For "Recently Modified":
1. Ensure songs have `modifiedTime` from Drive
2. Re-fetch songs from Drive if needed

---

## Google Drive Structure Issues

### Issue: No Deities Found

**Symptoms:**
- Successfully authenticated
- Deities list is empty (not loading spinner)
- Console shows successful API calls

**Cause:**
- `/Namasankeerthanam` folder not found in Drive
- Folder name is case-sensitive

**Solution:**
1. Check Google Drive for folder named exactly: `Namasankeerthanam`
2. Create folder if missing:
```
/Namasankeerthanam/
  /Devi/
  /Guru/
  /Ayyappa/
```
3. Ensure folder names don't start with `__` (those are ignored)

---

### Issue: Some Deities Missing

**Symptoms:**
- Some deity folders show up
- Others don't

**Cause:**
- Folders starting with `__` are filtered out
- These are reserved for non-deity folders like `__Media__`

**Solution:**
- Rename folders to not start with `__`
- Or keep as-is if intentional (for special folders)

---

## Performance Issues

### Issue: Search is Slow

**Symptoms:**
- Typing in search has noticeable lag
- Results take >1 second to appear

**Cause:**
- Large number of songs cached
- Browser running other heavy tasks

**Solution:**
1. Check number of songs in IndexedDB
2. If >1000 songs, consider:
   - Clearing old cached songs
   - Searching within specific deity first
3. Close other browser tabs
4. Restart browser

---

### Issue: App is Slow to Load

**Symptoms:**
- White screen for several seconds
- Slow to show login button

**Cause:**
- Large IndexedDB
- Many cached songs with content

**Solution:**
1. Clear browser cache
2. Clear IndexedDB (will re-download on next use)
3. Check network tab for slow API calls

---

## Development Issues

### Issue: Hot Reload Not Working

**Symptoms:**
- Make code changes
- Page doesn't update

**Solution:**
1. Check terminal for Vite errors
2. Restart dev server: `npm run dev`
3. Hard refresh browser: Ctrl+Shift+R

---

### Issue: TypeScript Errors

**Symptoms:**
- Red squiggles in VS Code
- Build fails with type errors

**Solution:**
1. Run: `npm run build` to see all errors
2. Check types in `src/types/index.ts`
3. Ensure all imports are correct
4. Restart TypeScript server in VS Code

---

### Issue: Linter Errors

**Symptoms:**
- ESLint warnings/errors
- Pre-commit hooks fail

**Solution:**
1. Run: `npm run lint`
2. Fix reported issues
3. Some rules can be disabled if needed

---

## Browser Compatibility

### Supported Browsers
- ✅ Chrome 90+
- ✅ Edge 90+
- ✅ Firefox 88+
- ✅ Safari 14+

### Known Issues by Browser

**Firefox:**
- IndexedDB may be slower
- Keyboard shortcuts may conflict

**Safari:**
- PWA features limited
- IndexedDB quota smaller

---

## Clear All Data (Nuclear Option)

If all else fails, completely reset the app:

```javascript
// In browser console:
// 1. Clear localStorage
localStorage.clear()

// 2. Clear sessionStorage
sessionStorage.clear()

// 3. Delete IndexedDB
indexedDB.deleteDatabase('GTDatabase')

// 4. Clear service worker
navigator.serviceWorker.getRegistrations().then(registrations => {
  registrations.forEach(registration => registration.unregister())
})

// 5. Hard refresh
location.reload(true)
```

Then re-authenticate and re-fetch all data.

---

## Getting Help

If issue persists:

1. **Check browser console:**
   - Open DevTools (F12)
   - Look for red errors
   - Copy error messages

2. **Check network tab:**
   - See if API calls are failing
   - Check response codes

3. **Check IndexedDB:**
   - Application tab → IndexedDB → GTDatabase
   - Verify data structure

4. **Document the issue:**
   - What were you doing?
   - What did you expect?
   - What actually happened?
   - Any error messages?
   - Browser and OS version?

---

## Debugging Tips

### Enable Verbose Logging

Add to `src/App.tsx`:
```typescript
// At top of file
const DEBUG = true

// In functions
if (DEBUG) console.log('Loading deities...', { deities })
```

### Inspect IndexedDB

```javascript
// In browser console:
// Open database
const openRequest = indexedDB.open('GTDatabase')
openRequest.onsuccess = (event) => {
  const db = event.target.result
  const transaction = db.transaction(['songs'], 'readonly')
  const store = transaction.objectStore('songs')
  const getAllRequest = store.getAll()
  getAllRequest.onsuccess = () => {
    console.log('All songs:', getAllRequest.result)
  }
}
```

### Check OAuth Token

```javascript
// In browser console:
console.log('Access Token:', localStorage.getItem('google_access_token'))
```

---

**Last Updated:** December 2024


