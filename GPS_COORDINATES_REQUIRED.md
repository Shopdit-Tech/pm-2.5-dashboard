# 🚨 GPS Coordinates Missing from API

## Problem

Your API returns data but **NO GPS coordinates** (latitude, longitude).

**Current API Response:**
```json
{
  "metrics": [
    {
      "metric": "pm1",
      "points": [
        {
          "ts": "2025-10-25T16:06:00+00:00",
          "value": 17.2
        }
      ]
    }
  ]
}
```

**Required API Response:**
```json
{
  "metrics": [
    {
      "metric": "pm1",
      "points": [
        {
          "ts": "2025-10-25T16:06:00+00:00",
          "value": 17.2,
          "latitude": 13.7369,    // ← REQUIRED
          "longitude": 100.5698   // ← REQUIRED
        }
      ]
    }
  ]
}
```

---

## Solution

### Update your Supabase function to return GPS coordinates:

```sql
SELECT 
  timestamp as ts,
  pm1,
  pm25,
  pm10,
  temperature,
  humidity,
  co2,
  tvoc,
  latitude,   -- ← ADD THIS
  longitude   -- ← ADD THIS
FROM sensor_readings
WHERE sensor_code = $1
  AND timestamp >= $2
  AND timestamp <= $3
ORDER BY timestamp;
```

---

## What I Fixed

✅ **Updated mobileRouteService.ts:**
- Now checks for `ts` field (your API uses this instead of `timestamp`)
- Throws a helpful error when GPS coordinates are missing
- Error message tells you exactly what's wrong

✅ **Updated MobileSensorsDashboard.tsx:**
- Added error state display
- Shows clear error message when GPS coordinates missing
- Includes solution instructions in the UI

---

## What You'll See Now

When you select a sensor + date, you'll see:

**❌ Error Alert:**
```
Failed to Load Route

API returned 1000 data points but none have GPS coordinates.
Your Supabase function must include 'latitude' and 'longitude' fields in the response.

💡 Solution:
Update your Supabase function to include latitude and longitude fields in each data point.
```

---

## Testing After Fix

1. Update your Supabase function to include GPS coordinates
2. Refresh the dashboard
3. Select a mobile sensor
4. Select a date
5. You should now see:
   - ✅ Route path on map
   - ✅ Green START marker
   - ✅ Red END marker
   - ✅ Route colored by PM2.5
   - ✅ Route summary card

---

## Alternative: Mock GPS for Testing

If you want to test the UI before updating your Supabase function, I can add temporary mock GPS coordinates. This will let you see how the route visualization works.

Let me know if you want me to add this!

---

## File Changes Made

1. **features/mobile-routes/services/mobileRouteService.ts**
   - Line 120: Now supports `ts` field from your API
   - Lines 129-130: Sets GPS to `null` instead of `0` if missing
   - Lines 167-178: Throws specific error when GPS missing

2. **features/mobile-routes/components/MobileSensorsDashboard.tsx**
   - Line 22: Added `routeError` state
   - Lines 43-83: Updated `loadRoute` to capture errors
   - Lines 331-352: Display error alert with solution

---

## Summary

**Your API works but is missing GPS data.**

✅ Data is being fetched (1000 points)  
❌ No latitude/longitude in response  
✅ Error now displayed clearly in UI  
✅ Solution instructions shown to user  

**Next step:** Update Supabase function to include GPS coordinates.
