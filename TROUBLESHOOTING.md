# Troubleshooting Guide

## Problem: Map showing but no markers visible

If you see 20 sensors in console but no markers on the map, follow these steps:

### Step 1: Check if you ran npm install

```bash
npm install
```

The `@react-google-maps/api` package must be installed. Check if `node_modules/@react-google-maps` exists.

### Step 2: Check Google Maps API Key

1. **Check if `.env.local` exists:**
```bash
ls -la .env.local
```

2. **Create if missing:**
```bash
cp .env.example .env.local
```

3. **Edit `.env.local` and add your API key:**
```env
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=AIzaSyB...your_actual_key_here
```

**Important:** The environment variable MUST start with `NEXT_PUBLIC_` to be available in the browser.

### Step 3: Restart Development Server

After adding/changing `.env.local`, you MUST restart:

```bash
# Stop the server (Ctrl+C)
# Then restart:
npm run dev
```

### Step 4: Check Browser Console

Open browser console (F12) and look for:

1. ✅ **Good output:**
```
📍 Sensors to render: 20
🗺️ Map loaded: true
🔑 API Key exists: true
🔑 API Key value: AIzaSyB...
📊 First sensor: {id: "sensor-001", ...}
```

2. ❌ **Bad output:**
```
🔑 API Key exists: false
```
→ API key not set or `.env.local` not loaded

3. ❌ **Error about billing:**
```
Google Maps: You must enable Billing on the Google Cloud Project...
```
→ You need to enable billing on your Google Cloud project

4. ❌ **Error about API not enabled:**
```
This API project is not authorized to use this API
```
→ Enable Maps JavaScript API in Google Cloud Console

### Step 5: Verify Google Cloud Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your project
3. Go to **APIs & Services > Library**
4. Search for "Maps JavaScript API"
5. Click and ensure it's **ENABLED**
6. Go to **APIs & Services > Credentials**
7. Find your API key
8. Click "Edit API key"
9. Under "API restrictions", select "Restrict key"
10. Check "Maps JavaScript API"
11. Save

### Step 6: Check Network Tab

1. Open browser DevTools (F12)
2. Go to Network tab
3. Filter by "maps"
4. Look for:
   - `maps.googleapis.com/maps/api/js` should return 200 OK
   - If 400/403 error → API key issue

### Step 7: Test with Simple Map

If still not working, test if Google Maps loads at all:

**Check console output when page loads:**

```javascript
// In browser console, you should see:
📍 Sensors to render: 20
🗺️ Map loaded: true
🔑 API Key exists: true
```

If you see `false` for API Key → `.env.local` not loaded properly

### Step 8: Common Issues

#### Issue: "API Key exists: false"

**Solution:**
1. Create `.env.local` file in project root (same level as `package.json`)
2. Add: `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_key`
3. Restart dev server (Ctrl+C, then `npm run dev`)

#### Issue: Map shows but no markers

**Solution:**
Check if `@react-google-maps/api` is installed:
```bash
npm list @react-google-maps/api
```

If not found:
```bash
npm install @react-google-maps/api
```

#### Issue: "For development purposes only" watermark

**Solution:**
This means billing is not enabled. You need to:
1. Go to Google Cloud Console
2. Enable billing for your project
3. Get a new API key

#### Issue: Markers show but clicking doesn't work

**Solution:**
This is a z-index or event handling issue. Check:
- Remove any `pointer-events: none` CSS
- Ensure markers are not covered by other elements

### Step 9: Quick Test

Run this in your browser console when on the page:

```javascript
console.log('API Key:', process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY);
console.log('Window google exists:', typeof window.google !== 'undefined');
```

### Step 10: Still Not Working?

Create a minimal test:

1. Check if the map container has height:
   - Open DevTools → Elements
   - Find the div with Google Map
   - Should have height > 0px

2. Check for JavaScript errors in console

3. Try a different browser

4. Clear browser cache and reload

## Getting a Free Google Maps API Key

1. Go to https://console.cloud.google.com/
2. Create new project
3. Enable "Maps JavaScript API"
4. Create credentials → API Key
5. Copy the key to `.env.local`

Note: Google gives $200/month free credit, which is more than enough for development and small projects.

## Need More Help?

Check the browser console logs and look for any error messages. The console.log statements will show you exactly what's happening.
