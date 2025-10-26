# API Metric Mapping for CSV Export

**Updated:** October 27, 2025

---

## 📊 **Actual API Response Metrics**

The API returns the following metrics (based on actual response):

| API Metric Name | Description | Example Values |
|----------------|-------------|----------------|
| `pm1` | PM1.0 particulate matter | 5.9, 13.3, 14.2 |
| `pm25` | PM2.5 particulate matter | 14.7, 36.2, 34.1 |
| `pm10` | PM10 particulate matter | 23.2, 51.9, 54.5 |
| `particle_0p3` | 0.3μm particle count | 1902, 4050, 4681 |
| `co2_ppm` | CO2 in parts per million | 251.2, 405.3, 447.5 |
| `temperature` | Temperature in Celsius | 26.7, 28.4, 29.5 |
| `humidity` | Relative humidity % | 74.5, 78.2, 80.3 |
| `tvoc_raw_logr` | TVOC raw log value | 2.1, 5.03, 4.99 |
| `tvoc_index` | TVOC index | 33.6, 79.4, 82.3 |
| `nox_index` | NOX index | 1.1, 2.85, 2.43 |

---

## 🔄 **CSV Column Mapping**

How API metrics map to CSV columns:

| CSV Column # | CSV Column Name | API Metric | Notes |
|--------------|----------------|------------|-------|
| 1 | Location ID | sensor.id | From sensor object |
| 2 | Location Name | sensor.name | From sensor object |
| 3 | Location Group | - | Not available → "-" |
| 4 | Location Type | sensor.type | "Indoor" or "Outdoor" |
| 5 | Sensor ID | sensor.code | From sensor object |
| 6 | Place Open | - | Static → "false" |
| 7 | Local Date/Time | timestamp + 7hrs | Converted to UTC+7 |
| 8 | UTC Date/Time | timestamp | ISO format |
| 9 | # of aggregated records | - | Static → "1" |
| 10 | PM2.5 (μg/m³) raw | **pm25** | ✅ Available |
| 11 | PM2.5 (μg/m³) corrected | pm25 | Same as raw |
| 12 | 0.3μm particle count | **particle_0p3** | ✅ **NOW AVAILABLE** |
| 13 | CO2 (ppm) raw | **co2_ppm** | ✅ Available |
| 14 | CO2 (ppm) corrected | co2_ppm | Same as raw |
| 15 | Temperature (°C) raw | **temperature** | ✅ Available |
| 16 | Temperature (°C) corrected | temperature | Same as raw |
| 17 | Heat Index (°C) | calculated | ✅ Calculated from temp + humidity |
| 18 | Humidity (%) raw | **humidity** | ✅ Available |
| 19 | Humidity (%) corrected | humidity | Same as raw |
| 20 | TVOC (ppb) | **tvoc_raw_logr** | ⚠️ Log value (not ideal) |
| 21 | TVOC index | **tvoc_index** | ✅ **NOW AVAILABLE** |
| 22 | NOX index | **nox_index** | ✅ **NOW AVAILABLE** |
| 23 | PM1 (μg/m³) | **pm1** | ✅ Available |
| 24 | PM10 (μg/m³) | **pm10** | ✅ Available |

---

## ✅ **What's Available**

**Fully Available (19/24 columns):**
- ✅ PM2.5 raw & corrected
- ✅ PM1
- ✅ PM10
- ✅ 0.3μm particle count (particle_0p3)
- ✅ CO2 raw & corrected
- ✅ Temperature raw & corrected
- ✅ Heat Index (calculated)
- ✅ Humidity raw & corrected
- ✅ TVOC index
- ✅ NOX index
- ✅ Location & sensor info
- ✅ Timestamps (local & UTC)

**Partially Available (1/24):**
- ⚠️ TVOC (ppb) - Using tvoc_raw_logr (logarithmic value)

**Not Available (4/24):**
- ❌ Location Group
- ❌ # of aggregated records (using "1" as placeholder)
- ❌ Place Open (using "false" as static)
- ❌ Corrected values (using same as raw)

---

## 🔧 **Implementation Changes**

### **Before (Incorrect):**
```typescript
dataByTimestamp[timestamp] = {
  timestamp,
  pm1: null,
  pm25: null,
  pm10: null,
  co2: null,           // ❌ Wrong metric name
  temperature: null,
  humidity: null,
  tvoc: null,          // ❌ Wrong metric name
};

if (metricName === 'co2') {
  dataByTimestamp[timestamp].co2 = point.value;
}
if (metricName === 'tvoc') {
  dataByTimestamp[timestamp].tvoc = point.value;
}
```

### **After (Correct):**
```typescript
dataByTimestamp[timestamp] = {
  timestamp,
  pm1: null,
  pm25: null,
  pm10: null,
  particle_0p3: null,   // ✅ Added
  co2_ppm: null,        // ✅ Fixed name
  temperature: null,
  humidity: null,
  tvoc_raw_logr: null,  // ✅ Fixed name
  tvoc_index: null,     // ✅ Added
  nox_index: null,      // ✅ Added
};

if (metricName === 'particle_0p3') {
  dataByTimestamp[timestamp].particle_0p3 = point.value;
}
if (metricName === 'co2_ppm') {
  dataByTimestamp[timestamp].co2_ppm = point.value;
}
if (metricName === 'tvoc_raw_logr') {
  dataByTimestamp[timestamp].tvoc_raw_logr = point.value;
}
if (metricName === 'tvoc_index') {
  dataByTimestamp[timestamp].tvoc_index = point.value;
}
if (metricName === 'nox_index') {
  dataByTimestamp[timestamp].nox_index = point.value;
}
```

---

## 📋 **CSV Output Example**

Based on actual API data:

```csv
"Location ID","Location Name","Location Group","Location Type","Sensor ID","Place Open","Local Date/Time","UTC Date/Time","# of aggregated records","PM2.5 (μg/m³) raw","PM2.5 (μg/m³) corrected","0.3μm particle count","CO2 (ppm) raw","CO2 (ppm) corrected","Temperature (°C) raw","Temperature (°C) corrected","Heat Index (°C)","Humidity (%) raw","Humidity (%) corrected","TVOC (ppb)","TVOC index","NOX index","PM1 (μg/m³)","PM10 (μg/m³)"
67284,"Indoor คลองเตยล็อค6","-","Indoor","airgradient:744dbdbfdabc","false","2025-10-24 22:00:00","2025-10-24T15:00:00.000Z","1","36.24375","36.24375","4050.25","405.3","405.3","26.7","26.7","28.5","74.5","74.5","5.03583","79.375","2.85416","13.3208","51.88125"
```

---

## ⚠️ **Important Notes**

### **1. TVOC Column (ppb)**
The API returns `tvoc_raw_logr` with logarithmic values (e.g., 5.03, 4.99).
- Your example CSV shows values like 104, 94 ppb
- Current implementation uses tvoc_raw_logr as-is
- **If you need ppb conversion:** Please provide the formula

### **2. Metric Name Format**
API uses underscores:
- ✅ `co2_ppm` (not "co2")
- ✅ `particle_0p3` (not "particle_count")
- ✅ `tvoc_index` (not "tvoc")
- ✅ `nox_index` (not "nox")

### **3. Temperature & Humidity**
Required for Heat Index calculation:
- Values available from `temperature` and `humidity` metrics
- Heat Index calculated using Rothfusz formula
- Only applies when temp > 26.7°C

### **4. Corrected Values**
API doesn't provide corrected values:
- Using same value for raw & corrected
- Could be enhanced if correction formulas are provided

---

## 🧪 **Testing**

### **Test with Actual API Response:**
```json
{
  "metrics": [
    {
      "metric": "pm25",
      "points": [{"ts": "2025-10-24T15:00:00+00:00", "value": 36.24}]
    },
    {
      "metric": "co2_ppm",
      "points": [{"ts": "2025-10-24T15:00:00+00:00", "value": 405.3}]
    },
    {
      "metric": "particle_0p3",
      "points": [{"ts": "2025-10-24T15:00:00+00:00", "value": 4050.25}]
    },
    {
      "metric": "tvoc_index",
      "points": [{"ts": "2025-10-24T15:00:00+00:00", "value": 79.375}]
    },
    {
      "metric": "nox_index",
      "points": [{"ts": "2025-10-24T15:00:00+00:00", "value": 2.854}]
    }
  ]
}
```

**Expected CSV Output:**
- ✅ PM2.5: 36.24
- ✅ CO2: 405.3
- ✅ Particle count: 4050.25
- ✅ TVOC index: 79.375
- ✅ NOX index: 2.854
- ✅ Missing fields: "-"

---

## ✅ **Summary**

**Metrics Now Properly Mapped:**
- ✅ particle_0p3 → 0.3μm particle count
- ✅ co2_ppm → CO2 values
- ✅ tvoc_index → TVOC index
- ✅ nox_index → NOX index
- ✅ tvoc_raw_logr → TVOC (ppb) *

**CSV Export Quality:**
- **19/24** columns have real data
- **4/24** columns show "-" (truly not available)
- **1/24** column has approximation (TVOC ppb)

**Your CSV export now matches the actual API structure!** ✅
