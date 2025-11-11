# Threshold Context Integration Complete

## Summary

Successfully created a **ThresholdContext** system that provides API-based threshold data throughout the application. All sensor tables now use dynamic thresholds from the admin configuration instead of hardcoded constants.

## What Was Implemented

### 1. Updated Type System

**File:** `/features/admin/types/threshold.ts`

Updated `ThresholdMetric` type to use explicit unit names:
```typescript
export type ThresholdMetric =
  | 'pm1'
  | 'pm25'
  | 'pm10'
  | 'co2_ppm'        // Updated from 'co2'
  | 'tvoc_ppb'       // Updated from 'tvoc'
  | 'temperature_c'  // Updated from 'temperature'
  | 'humidity_rh';   // Updated from 'humidity'
```

### 2. Created ThresholdContext

**File:** `/contexts/ThresholdContext.tsx`

Features:
- **Loads thresholds from API** on app mount
- **Caches thresholds** in context to avoid repeated API calls
- **Auto-maps old parameter names** to new metric names for backward compatibility
- **Provides helper functions:**
  - `getColorForValue(parameter, value)` - Get color for any value
  - `getThresholdsForMetric(parameter)` - Get all thresholds for a metric
  - `refreshThresholds()` - Manually refresh from API
- **Error handling** with fallback to empty array

**Parameter Mapping:**
```typescript
temperature → temperature_c
humidity → humidity_rh
co2 → co2_ppm
tvoc → tvoc_ppb
pm1, pm25, pm10 → unchanged
```

### 3. Wrapped App with ThresholdProvider

**File:** `/pages/_app.tsx`

Added `ThresholdProvider` wrapping:
```typescript
<AuthProvider>
  <ThresholdProvider>
    <Component {...pageProps} />
  </ThresholdProvider>
</AuthProvider>
```

### 4. Updated Components to Use Context

#### ✅ sensor-table
**File:** `/features/sensor-table/components/SensorDataTable.tsx`
- Replaced `getParameterColor` import with `useThreshold` hook
- Now uses `getColorForValue` from context
- Colors update dynamically when admin changes thresholds

#### ✅ mobile-sensor-table  
**File:** `/features/mobile-sensor-table/components/MobileSensorDataTable.tsx`
- Same pattern as sensor-table
- Uses dynamic thresholds from context

#### ✅ ThresholdConfiguration (Admin)
**File:** `/features/admin/components/ThresholdConfiguration.tsx`
- Added `refreshContextThresholds()` call after saving changes
- Ensures threshold updates immediately reflect across the entire app
- Real-time synchronization between admin panel and user-facing components

#### ✅ analytics-charts, map-dashboard, mobile-routes
These features don't currently use threshold colors but now have access to the context if needed in future enhancements.

## How It Works

### 1. On App Load
```
App starts → ThresholdProvider loads thresholds from API
           → Thresholds cached in context
           → Available to all components
```

### 2. Rendering Colors
```
Component → useThreshold() hook
         → getColorForValue('pm25', 45)
         → Context finds matching threshold
         → Returns color_hex (#fa8c16)
```

### 3. Admin Updates
```
Admin saves threshold → API updates database
                      → Local state refreshes
                      → refreshContextThresholds() called
                      → Context reloads from API
                      → All tables re-render with new colors
```

## Benefits

### ✅ Centralized Control
- Admins can change thresholds without code changes
- No need to redeploy for threshold adjustments

### ✅ Real-time Updates
- Changes reflect immediately across all features
- No page refresh required

### ✅ Backward Compatible
- Old parameter names still work (auto-mapped)
- Gradual migration path for codebase

### ✅ Type-Safe
- Full TypeScript support
- Compile-time parameter checking

### ✅ Performance
- Single API call on app load
- Cached in memory
- No repeated network requests

### ✅ Maintainable
- Single source of truth
- Easy to add new parameters
- Clear separation of concerns

## Usage Example

### Before (Old Way)
```typescript
import { getParameterColor } from '@/utils/airQualityUtils';

const color = getParameterColor('pm25', 45);
```

### After (New Way with Context)
```typescript
import { useThreshold } from '@/contexts/ThresholdContext';

const { getColorForValue } = useThreshold();
const color = getColorForValue('pm25', 45);
```

### Adding to New Components
```typescript
'use client';

import { useThreshold } from '@/contexts/ThresholdContext';

export const MyComponent = () => {
  const { getColorForValue, getThresholdsForMetric } = useThreshold();
  
  // Get color for a specific value
  const pm25Color = getColorForValue('pm25', 35.5);
  
  // Get all thresholds for a metric (for legends, etc.)
  const pm25Thresholds = getThresholdsForMetric('pm25');
  
  return (
    <div style={{ backgroundColor: pm25Color }}>
      PM2.5: 35.5 µg/m³
    </div>
  );
};
```

## Migration Notes

### Old Constants (Deprecated)
```typescript
// ❌ No longer used directly
import { PARAMETER_COLOR_RANGES } from '@/constants/airQualityRanges';
import { getParameterColor } from '@/utils/airQualityUtils';
```

### New Context (Current)
```typescript
// ✅ Use this instead
import { useThreshold } from '@/contexts/ThresholdContext';
```

**Note:** The old constants and utilities still exist for reference but should not be used in new code.

## Testing Checklist

- [x] ThresholdContext loads on app start
- [x] Context provides thresholds to all components
- [x] sensor-table displays correct colors
- [x] mobile-sensor-table displays correct colors
- [x] Admin threshold updates refresh context
- [x] Color changes reflect immediately in tables
- [x] Old parameter names map correctly to new names
- [x] Error handling works (empty array fallback)
- [x] Loading states handled gracefully

## Future Enhancements

1. **Analytics Charts** - Add threshold reference lines to charts
2. **Map Dashboard** - Color-code map markers by thresholds
3. **Mobile Routes** - Use thresholds for route safety ratings
4. **Notifications** - Alert when values exceed certain threshold levels
5. **Historical Comparison** - Show how thresholds have changed over time
6. **Export** - Include threshold data in exported reports

## API Dependency

This system depends on:
- `/api/thresholds` endpoint (GET)
- `thresholdService.getThresholds()` method
- Authentication via `localStorage` pm25_auth_user token

If API is unavailable:
- Context returns empty array
- Components gracefully fall back to gray colors (#d9d9d9)
- No app crashes or errors

## Files Changed

1. `/features/admin/types/threshold.ts` - Updated ThresholdMetric type
2. `/contexts/ThresholdContext.tsx` - Created context (NEW)
3. `/pages/_app.tsx` - Added ThresholdProvider
4. `/features/sensor-table/components/SensorDataTable.tsx` - Use context
5. `/features/mobile-sensor-table/components/MobileSensorDataTable.tsx` - Use context
6. `/features/admin/components/ThresholdConfiguration.tsx` - Refresh context on save

## Summary

The threshold system is now fully integrated and centralized. Admins can configure thresholds that immediately affect the entire application, providing a flexible and maintainable air quality monitoring system. 🎉
