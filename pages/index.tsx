import Head from 'next/head';
import { MainLayout } from '@/components/MainLayout';
import { MapDashboard } from '@/features/map-dashboard/components/MapDashboard';
import { MobileRouteDashboard } from '@/features/mobile-routes/components/MobileRouteDashboard';
import { SensorDataTable } from '@/features/sensor-table/components/SensorDataTable';

export default function Home() {
  return (
    <>
      <Head>
        <title>PM2.5 Air Quality Dashboard</title>
        <meta name="description" content="Real-time PM2.5 air quality monitoring dashboard" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main style={{ height: '100vh', overflow: 'hidden' }}>
        <MainLayout>
          {(activeView) => {
            if (activeView === 'static-sensors') {
              return <MapDashboard />;
            }
            if (activeView === 'mobile-routes') {
              return <MobileRouteDashboard />;
            }
            if (activeView === 'sensor-data-table') {
              return <SensorDataTable />;
            }
            return null;
          }}
        </MainLayout>
      </main>
    </>
  );
}
