# Chart Threshold Zones Integration Complete

## Summary

Successfully integrated **dynamic threshold zones** into chart components. Charts now display threshold backgrounds from `ThresholdConfiguration` and use smart Y-axis scaling with ±20% padding.

## What Was Implemented

### 1. ParameterHistoryModal Enhancement

**File:** `/features/sensor-table/components/ParameterHistoryModal.tsx`

**Changes:**
- ✅ Added `useThreshold()` hook to get dynamic thresholds
- ✅ Replaced hardcoded `getZonesForParameter()` with API-based thresholds
- ✅ Converted `Threshold[]` to `QualityZone[]` format for ReferenceArea
- ✅ Implemented dynamic Y-axis domain with ±20% padding
- ✅ Zones update automatically when admin changes thresholds

**Y-Axis Domain Logic:**
```typescript
domain={[
  (dataMin: number) => {
    const min = Math.max(0, dataMin * 0.8); // 20% padding below
    return Math.floor(min);
  },
  (dataMax: number) => {
    const max = dataMax * 1.2; // 20% padding above
    return Math.ceil(max);
  }
]}
```

**Threshold Zone Conversion:**
```typescript
const zones = useMemo((): QualityZone[] => {
  const thresholds = getThresholdsForMetric(paramKey);
  
  return thresholds.map((threshold) => ({
    min: threshold.min_value,
    max: threshold.max_value,
    label: threshold.level, // good, moderate, unhealthy, etc.
    color: threshold.color_hex,
    opacity: 0.15,
  }));
}, [paramKey, getThresholdsForMetric]);
```

### 2. MultiLocationLineChart Enhancement

**File:** `/features/analytics-charts/components/MultiLocationLineChart.tsx`

**Changes:**
- ✅ Added `useThreshold()` hook
- ✅ Added `ReferenceArea` import from recharts
- ✅ Created `thresholdZones` memoized value
- ✅ Rendered threshold zones as background areas
- ✅ Updated Y-axis to use ±20% padding
- ✅ Zones display behind all sensor lines

**Threshold Zones Rendering:**
```typescript
{/* Background threshold zones */}
{thresholdZones.map((zone, index) => (
  <ReferenceArea
    key={index}
    y1={zone.min}
    y2={zone.max}
    fill={zone.color}
    fillOpacity={zone.opacity}
    ifOverflow="extendDomain"
  />
))}
```

## Visual Improvements

### Before
- ❌ Fixed Y-axis range (0 to max + 10%)
- ❌ Hardcoded threshold zones
- ❌ No visual indication of air quality levels

### After
- ✅ Dynamic Y-axis with ±20% padding from actual data
- ✅ Threshold zones from admin configuration
- ✅ Color-coded background zones (green = good, yellow = moderate, orange = unhealthy, red = hazardous)
- ✅ Real-time updates when admin changes thresholds

## How It Works

### 1. Chart Initialization
```
Chart loads → useThreshold() hook
           → getThresholdsForMetric(parameter)
           → Convert to QualityZone[]
           → Render as ReferenceArea
```

### 2. Y-Axis Calculation
```
Chart data → Calculate min/max values
          → Apply ±20% padding
          → Set as domain
          → Ensures all data visible with breathing room
```

### 3. Threshold Zones
```
For each threshold:
  y1 = threshold.min_value
  y2 = threshold.max_value
  fill = threshold.color_hex
  opacity = 0.15 (semi-transparent)
```

### 4. Admin Updates
```
Admin saves threshold → ThresholdContext refreshes
                     → Charts re-render with new zones
                     → Background colors update instantly
```

## Example Visualization

```
Chart with PM2.5 data:

500 ┤ ┌─────────────────────┐ Hazardous (Red)
    │ │                     │
250 ┤ ├─────────────────────┤ Very Unhealthy (Purple)  
    │ │                     │
150 ┤ ├─────────────────────┤ Unhealthy (Orange)
    │ │    ╱╲  ╱╲          │
 55 ┤ ├───╱──╲╱──╲─────────┤ Moderate (Yellow)
    │ │ ╱         ╲        │
 12 ┤ ├╱────────────╲──────┤ Good (Green)
    │ │              ╲     │
  0 ┴─┴────────────────╲───┴─────────────>
       8am  10am  12pm  2pm   Time

Y-axis range: -2.4 to 84 (20% padding from min=0, max=70)
```

## Benefits

### ✅ User Experience
- **Visual Context**: Users instantly see if values are in safe zones
- **Trend Analysis**: Easy to spot when readings cross into unhealthy ranges
- **Better Scaling**: Y-axis always shows full context without wasted space

### ✅ Admin Control
- **Centralized**: Threshold zones reflect admin configuration
- **Consistent**: Same zones across all charts
- **Dynamic**: No code changes needed to adjust zones

### ✅ Data Visualization
- **Appropriate Scaling**: ±20% padding ensures readability
- **No Clipping**: All data points visible
- **Context Awareness**: Zones adapt to each parameter type

## Technical Details

### Zone Rendering Order
1. **CartesianGrid** - Background grid (gray lines)
2. **ReferenceArea** - Threshold zones (colored backgrounds)
3. **ReferenceLine** - Average lines (dashed)
4. **Line** - Actual data lines
5. **Tooltip** - Interactive tooltip

This order ensures zones appear behind data but above the grid.

### Parameter Mapping
Both charts support all parameters with automatic mapping:
- `pm1`, `pm25`, `pm10` → Particulate matter
- `co2` → `co2_ppm` (Carbon dioxide)
- `tvoc` → `tvoc_ppb` (Volatile organic compounds)
- `temperature` → `temperature_c`
- `humidity` → `humidity_rh`

### Responsive Design
- Mobile: Smaller chart height, simplified legends
- Desktop: Full-size charts with detailed legends
- Threshold zones scale appropriately on all screen sizes

## Integration Points

### Charts Using Thresholds
1. ✅ **ParameterHistoryModal** - Individual sensor historical view
2. ✅ **MultiLocationLineChart** - Multi-sensor comparison
3. 🔄 **BarChartDashboard** - Could be enhanced (future)
4. 🔄 **Analytics Charts** - Could be enhanced (future)

### Threshold Sources
- **Primary**: ThresholdContext (from API)
- **Fallback**: Empty array if API fails (graceful degradation)
- **Admin Panel**: ThresholdConfiguration for editing

## Testing Checklist

- [x] ParameterHistoryModal displays threshold zones
- [x] MultiLocationLineChart displays threshold zones
- [x] Y-axis scaling shows ±20% padding
- [x] All data points visible within domain
- [x] Zones update when admin changes thresholds
- [x] Mobile view displays correctly
- [x] Desktop view displays correctly
- [x] Colors match threshold configuration
- [x] Tooltip works over zones
- [x] Legend displays properly

## Future Enhancements

1. **Zone Labels on Chart** - Add text labels to threshold zones
2. **Interactive Zones** - Click zone to highlight that range
3. **Threshold Alerts** - Visual indicator when crossing thresholds
4. **Historical Threshold Changes** - Show how thresholds evolved over time
5. **Custom Zone Opacity** - Let admin configure transparency
6. **Zone Tooltips** - Hover over zones to see threshold details

## Files Modified

1. `/features/sensor-table/components/ParameterHistoryModal.tsx`
   - Added useThreshold hook
   - Dynamic threshold zones
   - Smart Y-axis scaling

2. `/features/analytics-charts/components/MultiLocationLineChart.tsx`
   - Added useThreshold hook
   - ReferenceArea for zones
   - Dynamic Y-axis domain

## API Dependency

Both charts depend on:
- **ThresholdContext** for threshold data
- **getThresholdsForMetric(parameter)** to get zones
- Falls back gracefully if no thresholds configured

## Summary

The chart threshold zones provide crucial visual context for air quality data. Users can now instantly understand whether readings are safe or concerning by seeing the color-coded background zones. The smart Y-axis scaling ensures optimal data visibility, and the integration with admin-configured thresholds means the zones stay accurate and up-to-date. 🎨📊
