import Head from 'next/head';
import { MainLayout } from '@/components/MainLayout';
import { MapDashboard } from '@/features/map-dashboard/components/MapDashboard';
import { MobileRouteDashboard } from '@/features/mobile-routes/components/MobileRouteDashboard';

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
            return null;
          }}
        </MainLayout>
      </main>
    </>
  );
}
