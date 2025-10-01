# Setup Instructions

## Prerequisites

1. **Node.js 18+** installed
2. **Google Maps API Key** (required)

## Step 1: Install Dependencies

```bash
npm install
```

## Step 2: Get Google Maps API Key

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the following APIs:
   - Maps JavaScript API
   - Geocoding API (optional, for future features)
4. Create credentials (API Key)
5. Restrict the API key:
   - Application restrictions: HTTP referrers
   - Add `localhost:3000` and your production domain
   - API restrictions: Maps JavaScript API

## Step 3: Configure Environment Variables

Create a `.env.local` file in the root directory:

```bash
cp .env.example .env.local
```

Edit `.env.local` and add your Google Maps API key:

```env
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_actual_api_key_here
NEXT_PUBLIC_API_URL=http://localhost:3000/api
```

**Important:** Never commit `.env.local` to git. It's already in `.gitignore`.

## Step 4: Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Features Implemented

### ✅ 4.1.1 Dashboard แผนที่แสดงค่าพารามิเตอร์

- **Google Maps Integration**: Interactive map centered on Bangkok/Thailand
- **20 Sensor Locations**: Mock data for 20 sensors (19 in Bangkok, 1 in Saraburi)
- **Indoor/Outdoor Distinction**: Different badge icons (Home for indoor, Shop for outdoor)
- **PM2.5 Display**: Default parameter shown on markers with color coding
- **Color-Coded Markers**:
  - Green (Good): 0-12 µg/m³
  - Yellow (Moderate): 12-35 µg/m³
  - Orange (Unhealthy): 35-55 µg/m³
  - Red (Hazardous): >55 µg/m³
- **Click to View Details**: Popup shows all 7 parameters:
  1. Temperature (อุณหภูมิ)
  2. Humidity (ความชื้นสัมพัทธ์)
  3. CO2 (คาร์บอนไดออกไซด์)
  4. PM1 (optional, for mobile sensors)
  5. PM2.5 (ฝุ่น PM2.5)
  6. PM10 (ฝุ่น PM10)
  7. TVOC (สารระเหยง่าย)
- **Real-Time Updates**: Auto-refresh every 60 seconds
- **Offline Detection**: Shows offline sensors with warnings
- **Statistics Dashboard**: Summary cards showing online/offline status and averages
- **Responsive Design**: Works on desktop, tablet, and mobile
- **Thai Language**: All labels in Thai

## Project Structure

```
features/map-dashboard/
├── components/
│   ├── MapDashboard.tsx          # Main dashboard container
│   ├── GoogleMapComponent.tsx    # Google Maps wrapper
│   ├── SensorMarker.tsx          # Custom marker component
│   └── SensorInfoWindow.tsx      # Sensor detail popup
├── hooks/
│   └── useSensorData.ts          # Data fetching hook with auto-refresh
└── services/
    ├── sensorService.ts          # API service (ready for backend)
    └── mockSensorData.ts         # Mock data (20 sensors)
```

## Next Steps

1. **Install dependencies**: `npm install`
2. **Configure Google Maps API key** in `.env.local`
3. **Run the app**: `npm run dev`
4. **Replace mock data** with real API when backend is ready

## Troubleshooting

### Map not loading?
- Check if Google Maps API key is set correctly in `.env.local`
- Verify the API key has Maps JavaScript API enabled
- Check browser console for errors

### TypeScript errors about google namespace?
- These will resolve after `npm install` completes
- The `@react-google-maps/api` package includes Google Maps types

### Sensors not showing?
- Check browser console for errors
- Verify mock data is loading correctly
- Try refreshing the page

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint errors
- `npm run format` - Format code with Prettier
