# Troubleshooting 403 Forbidden Error

If you're getting a 403 Forbidden error when trying to scan your Google Drive, follow these steps:

## Step 1: Enable Google Drive API

1. Go to [Google Cloud Console - API Library](https://console.cloud.google.com/apis/library)
2. Search for "Google Drive API"
3. Click on "Google Drive API"
4. Click the **"Enable"** button
5. Wait for it to show "API enabled"

## Step 2: Configure OAuth Consent Screen

1. Go to [OAuth Consent Screen](https://console.cloud.google.com/apis/credentials/consent)
2. Make sure your app is in **"Testing"** mode (for personal use)
3. Scroll down to **"Scopes"** section
4. Click **"+ ADD OR REMOVE SCOPES"**
5. In the filter box, search for: `drive.readonly`
6. Check the box for: **`https://www.googleapis.com/auth/drive.readonly`**
7. Click **"UPDATE"** at the bottom
8. Click **"SAVE AND CONTINUE"** (go through all steps if needed)
9. Wait 1-2 minutes for changes to propagate

## Step 3: Add Test Users (if in Testing mode)

1. In OAuth Consent Screen, scroll to **"Test users"**
2. Click **"+ ADD USERS"**
3. Add your email address: `bsnram@gmail.com`
4. Click **"ADD"**

## Step 4: Re-authenticate

1. In the scanner, click **"Reset"** button
2. Click **"Save Client ID"** again
3. Authorize the app again (this ensures you get the new scopes)
4. Click **"Start Scan"**

## Step 5: Verify Client ID Configuration

1. Go to [Credentials](https://console.cloud.google.com/apis/credentials)
2. Click on your OAuth 2.0 Client ID
3. Verify:
   - **Application type:** Web application
   - **Authorized JavaScript origins:** `http://localhost:8000`
   - **Authorized redirect URIs:** `http://localhost:8000`

## Common Issues

**"API not enabled"**
- Make sure you enabled "Google Drive API" (not "Google Drive Activity API" or others)

**"Scope not found"**
- The scope must be exactly: `https://www.googleapis.com/auth/drive.readonly`
- Check for typos in the OAuth consent screen

**"Still getting 403 after all steps"**
- Wait 2-3 minutes after making changes (Google needs time to propagate)
- Clear browser cache and cookies
- Try in an incognito/private window
- Make sure you're using the same Google account that owns the Cloud project

## Quick Checklist

- [ ] Google Drive API is enabled
- [ ] OAuth consent screen has `drive.readonly` scope
- [ ] Your email is added as a test user (if in Testing mode)
- [ ] Client ID has correct redirect URIs
- [ ] You've re-authenticated after making changes
- [ ] Waited 1-2 minutes for changes to propagate

