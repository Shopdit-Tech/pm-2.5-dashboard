# PM 2.5 Dashboard

Air Quality Monitoring System for tracking PM 2.5 and other environmental parameters.

## 🚀 Tech Stack

- **Framework**: Next.js 15 (Pages Router)
- **UI Library**: Ant Design 5
- **Styling**: TailwindCSS 3
- **Forms**: Formik + Yup
- **Maps**: React Leaflet
- **Charts**: Recharts
- **Language**: TypeScript
- **HTTP Client**: Axios

## 📋 Features

Based on the business requirements, this dashboard will support:

### 1. Interactive Map Dashboard
- Display PM 2.5 values on a map with ~20 monitoring stations
- Real-time data updates without refresh
- Indoor/Outdoor sensor differentiation
- Color-coded air quality indicators
- Click to view all 7 parameters (Temperature, Humidity, CO2, PM1, PM2.5, PM10, TVOC)

### 2. Mobile Device Route Tracking
- Display movement paths of ~5 mobile air quality devices
- Color-coded routes based on PM 2.5 levels
- Historical route playback with date selection

### 3. Data Tables
- Real-time parameter display for stationary sensors
- Mobile device status monitoring
- Online/Offline status indicators
- Color-coded quality levels

### 4. Charts & Analytics
- Bar charts for parameter comparison
- Line charts for historical data
- Multi-location comparison
- Date/time filtering

### 5. Data Export
- CSV download functionality
- Historical data access

### 6. Authentication & Admin
- Login system (no public registration)
- Admin configuration panel
- Sensor naming and configuration
- Color range customization per parameter

## 🛠️ Getting Started

### Prerequisites

- Node.js 18+ 
- npm, yarn, or pnpm

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd pm-2.5-dashboard
```

2. Install dependencies:
```bash
npm install
# or
yarn install
# or
pnpm install
```

3. Create environment file:
```bash
cp .env.example .env
```

4. Update `.env` with your configuration

5. Run the development server:
```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

6. Open [http://localhost:3000](http://localhost:3000) in your browser

## 📁 Project Structure

```
pm-2.5-dashboard/
├── pages/                  # Next.js pages (Pages Router)
│   ├── _app.tsx           # App wrapper with providers
│   ├── _document.tsx      # HTML document wrapper
│   ├── index.tsx          # Home page
│   └── api/               # API routes
├── components/            # Shared UI components
├── features/              # Feature-based modules
│   └── {feature}/
│       ├── components/    # Feature components
│       ├── hooks/         # Feature hooks
│       ├── services/      # API services
│       └── schemas/       # Validation schemas
├── lib/                   # Utility libraries
│   └── axios.ts          # Axios configuration
├── types/                 # TypeScript type definitions
├── styles/                # Global styles
│   └── globals.css       # Global CSS with Tailwind
└── public/                # Static assets
```

## 🎨 Code Style

This project follows strict coding standards:

- **TypeScript**: Strict mode enabled, no `any` types
- **ESLint**: Configured with Next.js and TypeScript rules
- **Prettier**: 2-space indentation, single quotes, 100-char max width
- **Components**: Functional components only (React 19)
- **Forms**: Formik + Yup for validation
- **Styling**: TailwindCSS with Ant Design

## 🧪 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint errors
- `npm run format` - Format code with Prettier

## 📝 Environment Variables

See `.env.example` for required environment variables.

## 🤝 Contributing

1. Follow the existing code structure
2. Use TypeScript types for all data
3. Follow the ESLint and Prettier rules
4. Test your changes locally

## 📄 License

[Add your license here]

## 📞 Support

[Add support information here]
