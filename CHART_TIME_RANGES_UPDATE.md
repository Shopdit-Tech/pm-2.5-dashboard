# ✅ Chart Time Ranges - Complete Update

**Status:** Implemented  
**Date:** October 27, 2025

---

## 🎯 **Requirements Implemented**

Updated chart time ranges with 12 new options and appropriate aggregation intervals:

| Time Range | Aggregation Interval | since_hours | agg_minutes |
|------------|---------------------|-------------|-------------|
| Last 8 hours | 5 min | 8 | 5 |
| Last 12 hours | 10 min | 12 | 10 |
| Last 24 hours | 15 min | 24 | 15 |
| Last 48 hours | 15 min | 48 | 15 |
| Last Week | 1 hour | 168 | 60 |
| Last 30 days | 1 day | 720 | 1440 |
| Last 30 days | 1 hour | 720 | 60 |
| Last 90 days | 1 day | 2160 | 1440 |
| Last 180 days | 1 day | 4320 | 1440 |
| Last 360 days | 1 day | 8640 | 1440 |
| Last 720 days | 1 week | 17280 | 10080 |
| Last 1080 days | 1 week | 25920 | 10080 |

---

## 📂 **Files Created**

### **1. features/analytics-charts/constants/timeRanges.ts** ✨ NEW
Central configuration for all time ranges:

```typescript
export type TimeRangeConfig = {
  id: string;
  label: string;
  since_hours: number;
  agg_minutes: number;
};

export const TIME_RANGES: TimeRangeConfig[] = [
  { id: '8h', label: 'Last 8 hours (5 min)', since_hours: 8, agg_minutes: 5 },
  { id: '12h', label: 'Last 12 hours (10 min)', since_hours: 12, agg_minutes: 10 },
  // ... 12 total options
];
```

**Functions:**
- `getTimeRangeById(id)` - Get config by ID
- `getTimeRangeByIdOrDefault(id)` - Get config with fallback to default

---

## 🔧 **Files Modified**

### **2. features/analytics-charts/types/chartTypes.ts**
- ✅ Added `TimeRangeConfig` type support
- ✅ Maintained backward compatibility with legacy string format
- ✅ Updated helper functions:
  - `getTimeRangeHours()` - Extract hours from config or legacy string
  - `getTimeRangeLabel()` - Get display label
  - `getAggregationInterval()` - Map to aggregation interval
  - `getAggregationMinutes()` ✨ NEW - Direct access to agg_minutes
  - `getTimeRangeId()` ✨ NEW - Get ID for UI keys

### **3. features/analytics-charts/services/chartDataService.ts**
- ✅ Updated to use `getAggregationMinutes()` directly
- ✅ Passes correct `agg_minutes` to API based on time range config

### **4. features/sensor-table/components/ParameterHistoryModal.tsx**
- ✅ Replaced button group with dropdown selector
- ✅ Shows all 12 time range options
- ✅ Uses TimeRangeConfig objects instead of strings
- ✅ Default time range: 24h (15 min intervals)

---

## 🎨 **UI Changes**

### **Before:**
```
[8H] [24H] [48H] [7D]  (4 button options)
```

### **After:**
```
[Dropdown: Last 24 hours (15 min) ▼]  (12 select options)

Options:
- Last 8 hours (5 min)
- Last 12 hours (10 min)
- Last 24 hours (15 min)
- Last 48 hours (15 min)
- Last Week (1 hour)
- Last 30 days (1 day)
- Last 30 days (1 hour)
- Last 90 days (1 day)
- Last 180 days (1 day)
- Last 360 days (1 day)
- Last 720 days (1 week)
- Last 1080 days (1 week)
```

---

## ⚙️ **How It Works**

### **Data Flow:**

```
User selects "Last 90 days (1 day)" from dropdown
        ↓
TimeRangeConfig: { id: '90d', since_hours: 2160, agg_minutes: 1440 }
        ↓
useChartData hook receives TimeRangeConfig
        ↓
chartDataService extracts:
  - since_hours: 2160 (90 days)
  - agg_minutes: 1440 (daily aggregation)
        ↓
API call: GET /api/sensors/history?since_hours=2160&agg_minutes=1440
        ↓
Supabase returns daily aggregated data for 90 days
        ↓
Chart displays ~90 data points (one per day)
```

---

## 🔄 **Backward Compatibility**

The system still supports legacy string format:

```typescript
// Old way (still works)
const timeRange = '24h';

// New way (preferred)
const timeRange = getTimeRangeByIdOrDefault('24h');
// Returns: { id: '24h', label: 'Last 24 hours (15 min)', since_hours: 24, agg_minutes: 15 }
```

**All helper functions handle both formats:**
```typescript
getTimeRangeHours('24h')                  // Returns: 24
getTimeRangeHours(timeRangeConfig)        // Returns: 24

getAggregationMinutes('24h')              // Returns: 15
getAggregationMinutes(timeRangeConfig)    // Returns: 15
```

---

## 📊 **Benefits**

### **1. Fine-Grained Control**
Users can now choose the exact aggregation level they want:
- Hourly data for last 30 days vs daily summary
- View 3 years of data with weekly aggregation

### **2. Performance Optimization**
Longer time periods use coarser aggregation:
- 8 hours = 96 points (5min intervals)
- 1080 days = 154 points (weekly intervals)
- Keeps chart responsive even with years of data

### **3. Centralized Configuration**
All time ranges defined in one place (`timeRanges.ts`)
- Easy to add new options
- Consistent across all charts
- No hardcoded values scattered in code

### **4. Clear Labels**
Users see exactly what they're getting:
- "Last 30 days (1 hour)" vs "Last 30 days (1 day)"
- No guessing about aggregation level

---

## 🧪 **Testing**

### **1. Test ParameterHistoryModal:**

```bash
# Start dev server
npm run dev

# Navigate to Sensor Table
http://localhost:3000

# Click any parameter value in the table
# Opens ParameterHistoryModal

# Test:
- ✅ Dropdown shows all 12 time range options
- ✅ Select "Last 8 hours (5 min)" → Chart loads with 5-min data
- ✅ Select "Last 1080 days (1 week)" → Chart loads with weekly data
- ✅ Default is "Last 24 hours (15 min)"
```

### **2. Check Console Logs:**

```
📈 Fetching real history for Sensor-001 - pm25
API Request: GET /api/sensors/history
  ├─ sensor_code: airgradient:abc123
  ├─ metric: pm25
  ├─ since_hours: 2160
  └─ agg_minutes: 1440
✅ Fetched 90 points for Sensor-001 - pm25
```

### **3. Verify API Calls:**

Check Network tab in DevTools:
```
GET /api/sensors/history?sensor_code=...&metric=pm25&since_hours=2160&agg_minutes=1440
```

---

## 🚀 **Performance Considerations**

### **Data Volume by Time Range:**

| Time Range | Points (approx) | API Response Size |
|------------|-----------------|-------------------|
| 8 hours (5 min) | 96 | ~5 KB |
| 24 hours (15 min) | 96 | ~5 KB |
| 7 days (1 hour) | 168 | ~8 KB |
| 30 days (1 hour) | 720 | ~35 KB |
| 30 days (1 day) | 30 | ~1.5 KB |
| 90 days (1 day) | 90 | ~4.5 KB |
| 360 days (1 day) | 360 | ~18 KB |
| 1080 days (1 week) | 154 | ~8 KB |

**Key Points:**
- ✅ Aggregation keeps response sizes manageable
- ✅ Charts remain responsive even with years of data
- ✅ API supports efficient queries with `agg_minutes` parameter

---

## 📱 **Mobile Sensor Table**

The mobile sensor table automatically uses the updated ParameterHistoryModal:

```typescript
// features/mobile-sensor-table/components/MobileSensorDataTable.tsx
import { ParameterHistoryModal } from '@/features/sensor-table/components/ParameterHistoryModal';
```

✅ All 12 time range options available for mobile sensors too!

---

## 🎯 **Default Time Range**

**Current Default:** `24h` (Last 24 hours with 15-min intervals)

**To Change Default:**
Edit `features/analytics-charts/constants/timeRanges.ts`:
```typescript
export const DEFAULT_TIME_RANGE_ID = '48h'; // Change to any time range ID
```

---

## 🔮 **Future Enhancements**

### **1. Custom Time Ranges**
Allow users to specify exact start/end dates:
```typescript
{
  id: 'custom',
  label: 'Custom Range',
  start_date: '2025-01-01',
  end_date: '2025-01-31',
  agg_minutes: 60,
}
```

### **2. Save User Preferences**
Remember user's preferred time range per parameter:
```typescript
localStorage.setItem('pm25_timeRange', '7d');
```

### **3. Compare Time Periods**
Show multiple time ranges on same chart:
```typescript
// Last 24 hours vs same time yesterday
[
  { range: 'Last 24 hours', data: [...] },
  { range: 'Previous 24 hours', data: [...] }
]
```

---

## ✅ **Success Checklist**

After update, verify:

**Time Range Options:**
- [ ] Dropdown shows all 12 options
- [ ] Labels include aggregation interval
- [ ] Default is "Last 24 hours (15 min)"

**API Integration:**
- [ ] API receives correct `since_hours` parameter
- [ ] API receives correct `agg_minutes` parameter
- [ ] Response has expected number of data points

**Chart Display:**
- [ ] Chart loads without errors
- [ ] X-axis shows appropriate time labels
- [ ] Data points match selected time range

**Performance:**
- [ ] Charts load quickly (<2 seconds)
- [ ] No lag when switching time ranges
- [ ] Long time periods (1080 days) render smoothly

---

## 📝 **Summary**

**What Changed:**
- ✅ 12 time range options (was 4)
- ✅ Precise aggregation control
- ✅ Dropdown UI (was buttons)
- ✅ Up to 3 years of historical data

**Backward Compatible:**
- ✅ Existing code still works
- ✅ Legacy string format supported
- ✅ No breaking changes

**Benefits:**
- 🚀 Better performance with smart aggregation
- 📊 More flexible data visualization
- 🎨 Cleaner, more scalable UI
- 🔧 Centralized configuration

---

**Your chart time ranges are now fully updated with all 12 options!** 🎉

Users can now view historical data from 8 hours to 3 years with appropriate aggregation intervals.
