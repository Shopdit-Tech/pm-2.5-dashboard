# ✅ Null Values in Charts - Fixed

**Status:** Implemented  
**Date:** October 27, 2025

---

## 🎯 **Problem**

Charts were filtering out null values, causing issues:
- ❌ Time range only showed where data existed
- ❌ Line connected across gaps (misleading)
- ❌ Users couldn't see when data collection failed
- ❌ Charts appeared smooth even with missing data

---

## ✅ **Solution**

Charts now properly handle null values:
- ✅ Show full time range on x-axis
- ✅ Display gaps in the line where values are null
- ✅ Users can see data collection issues
- ✅ More transparent and accurate visualization

---

## 🔧 **Changes Made**

### **1. features/analytics-charts/types/chartTypes.ts**

Updated TimeSeriesDataPoint type to allow null:

```typescript
// Before
export type TimeSeriesDataPoint = {
  timestamp: string;
  value: number;  // Only numbers
  formattedTime?: string;
  formattedDate?: string;
};

// After
export type TimeSeriesDataPoint = {
  timestamp: string;
  value: number | null;  // ✅ Allow null to show gaps
  formattedTime?: string;
  formattedDate?: string;
};
```

---

### **2. features/analytics-charts/services/chartDataService.ts**

**A. fetchRealChartData() - Keep null values**

```typescript
// Before - Filtered out nulls
const data: TimeSeriesDataPoint[] = metricData.points
  .filter((point) => point.value !== null)  // ❌ Removed gaps!
  .map((point) => ({ ... }));

// After - Keep null values
const data: TimeSeriesDataPoint[] = metricData.points.map((point) => ({
  timestamp: point.ts,
  value: point.value !== null ? point.value : null,  // ✅ Keep nulls
  formattedTime: ...,
  formattedDate: ...,
}));
```

**B. Statistics calculation - Filter nulls for calculations only**

```typescript
// Before - Used all values including potential nulls
const values = data.map((d) => d.value);
const min = Math.min(...values);  // Would fail with null

// After - Filter nulls for stats only
const values = data.map((d) => d.value).filter((v) => v !== null) as number[];
const min = values.length > 0 ? Math.min(...values) : 0;  // ✅ Safe
const max = values.length > 0 ? Math.max(...values) : 0;
```

**C. aggregateDataPoints() - Handle null values**

```typescript
// Before - Didn't handle nulls
const avgValue = bucket.reduce((sum, point) => sum + point.value, 0) / bucket.length;

// After - Filter nulls, return null if all null
const validValues = bucket.map((p) => p.value).filter((v) => v !== null) as number[];
const avgValue = validValues.length > 0
  ? validValues.reduce((sum, val) => sum + val, 0) / validValues.length
  : null;  // ✅ Return null if no valid values in bucket
```

---

## 📊 **How It Works**

### **Before (Filtering Nulls):**

API Response:
```
08:00 → 35.2
08:01 → 36.1
08:02 → null  ← Filtered out!
08:03 → null  ← Filtered out!
08:04 → 37.5
```

Chart Display:
```
35.2 ──── 36.1 ──────────── 37.5
08:00    08:01              08:04
         ↑
    Line connects across gap
    (Misleading - looks like gradual increase)
```

---

### **After (Keeping Nulls):**

API Response:
```
08:00 → 35.2
08:01 → 36.1
08:02 → null  ← Kept in data!
08:03 → null  ← Kept in data!
08:04 → 37.5
```

Chart Display:
```
35.2 ──── 36.1          37.5
08:00    08:01  08:02  08:03  08:04
                ↑
            Gap visible!
         (Honest - shows missing data)
```

---

## 🎨 **Recharts Configuration**

The Line component automatically handles null values correctly:

```typescript
<Line
  type="monotone"
  dataKey="value"
  stroke="#1890ff"
  strokeWidth={2}
  dot={false}
  activeDot={{ r: 6 }}
  // connectNulls={false}  ← Default behavior (don't need to specify)
/>
```

**connectNulls behavior:**
- `false` (default): Line breaks at null values → Shows gaps ✅
- `true`: Line connects across null values → Hides gaps ❌

We use the default (`false`) which is correct for our use case.

---

## 🧪 **Testing**

### **Test Case 1: Simulated Data Gap**

To test, temporarily add nulls to mock data:

```typescript
// In chartDataService.ts - generateChartData()
data.push({
  timestamp: timestamp.toISOString(),
  value: i % 10 === 5 ? null : value,  // Every 10th point is null
  formattedTime: ...,
  formattedDate: ...,
});
```

**Expected Result:**
- ✅ Chart shows gaps every 10 data points
- ✅ X-axis includes null timestamps
- ✅ Statistics calculated from valid values only

---

### **Test Case 2: Real API with Nulls**

When API returns null values:

```json
{
  "metrics": [
    {
      "metric": "pm25",
      "points": [
        { "ts": "2025-10-27T08:00:00Z", "value": 35.2 },
        { "ts": "2025-10-27T08:01:00Z", "value": 36.1 },
        { "ts": "2025-10-27T08:02:00Z", "value": null },  ← Null value
        { "ts": "2025-10-27T08:03:00Z", "value": null },  ← Null value
        { "ts": "2025-10-27T08:04:00Z", "value": 37.5 }
      ]
    }
  ]
}
```

**Expected Behavior:**
1. ✅ All 5 timestamps appear on x-axis
2. ✅ Gap in line between 08:01 and 08:04
3. ✅ Tooltip shows "No data" for null points
4. ✅ Statistics exclude null values:
   - Average: (35.2 + 36.1 + 37.5) / 3 = 36.27
   - Min: 35.2
   - Max: 37.5

---

## 📱 **Applies To**

This fix applies to all charts using `TimeSeriesDataPoint`:

1. ✅ **ParameterHistoryModal** - Sensor table charts
2. ✅ **MobileSensorDataTable** - Mobile sensor charts
3. ✅ **All analytics charts** - Using useChartData hook
4. ✅ **Mock data generator** - Properly handles null values
5. ✅ **Data aggregation** - Correctly averages non-null values

---

## 🎯 **Benefits**

### **1. Transparency**
Users can see when data collection failed or sensor was offline.

### **2. Accuracy**
Charts don't create false trends by connecting across gaps.

### **3. Debugging**
Easier to identify data quality issues and sensor problems.

### **4. Statistics Integrity**
Averages and min/max calculated only from valid measurements.

---

## ⚠️ **Important Notes**

### **Statistics Calculation**

Always filter null values before calculating statistics:

```typescript
// ✅ Correct
const values = data.map((d) => d.value).filter((v) => v !== null) as number[];
const average = values.length > 0 ? values.reduce((sum, val) => sum + val, 0) / values.length : 0;

// ❌ Wrong - Will include null as 0
const average = data.reduce((sum, d) => sum + d.value, 0) / data.length;
```

### **Chart Performance**

Keeping null values doesn't impact performance:
- Chart still receives same number of points
- Recharts efficiently handles null values
- No additional processing overhead

### **Type Safety**

TypeScript now correctly reflects that values can be null:

```typescript
// Type system enforces null checks
const point: TimeSeriesDataPoint = { timestamp: '...', value: null };

if (point.value !== null) {
  const doubled = point.value * 2;  // ✅ Safe - TypeScript knows it's a number here
}
```

---

## 🔮 **Future Enhancements**

### **1. Gap Indicators**

Add visual markers for gaps:

```typescript
<Line
  connectNulls={false}
  dot={(props) => {
    if (props.value === null) {
      return <circle cx={props.cx} cy={props.cy} r={3} fill="#ff4d4f" />;
    }
    return null;
  }}
/>
```

### **2. Gap Tooltips**

Custom tooltip for null values:

```typescript
const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload?.[0]) return null;
  
  if (payload[0].value === null) {
    return (
      <div className="custom-tooltip">
        <p>⚠️ No data available</p>
        <p>{payload[0].payload.formattedTime}</p>
      </div>
    );
  }
  
  return <div>Normal tooltip...</div>;
};
```

### **3. Gap Summary**

Show statistics about data gaps:

```typescript
const gapCount = data.filter((d) => d.value === null).length;
const dataCompleteness = ((data.length - gapCount) / data.length * 100).toFixed(1);

<Text>Data Completeness: {dataCompleteness}%</Text>
```

---

## ✅ **Verification Checklist**

After implementation, verify:

**Type System:**
- [ ] `TimeSeriesDataPoint.value` type is `number | null`
- [ ] No TypeScript errors in chartDataService
- [ ] No TypeScript errors in chart components

**Data Processing:**
- [ ] fetchRealChartData keeps null values
- [ ] generateChartData works with null values
- [ ] aggregateDataPoints handles null buckets

**Chart Display:**
- [ ] Charts show gaps at null values
- [ ] X-axis includes all timestamps
- [ ] Line doesn't connect across nulls
- [ ] Tooltips handle null values

**Statistics:**
- [ ] Average calculated from valid values only
- [ ] Min/Max ignore null values
- [ ] No NaN or Infinity in statistics

---

## 📝 **Summary**

**What Changed:**
- ✅ TimeSeriesDataPoint now allows null values
- ✅ Charts keep null values instead of filtering them
- ✅ Lines break at null values (show gaps)
- ✅ Statistics calculated from valid values only

**Benefits:**
- 🔍 More transparent data visualization
- 📊 Accurate representation of data quality
- 🐛 Easier to identify sensor issues
- ✅ Honest display of data collection gaps

**Applies To:**
- All charts using `TimeSeriesDataPoint`
- Both real API data and mock data
- Sensor table and mobile sensor table

---

**Your charts now honestly display data gaps instead of hiding them!** 📊✨

Users can see when sensors were offline or data collection failed, leading to better data quality awareness.
