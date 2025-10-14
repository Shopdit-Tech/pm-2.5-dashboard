import Head from 'next/head';
import { MainLayout } from '@/components/MainLayout';
import { MapDashboard } from '@/features/map-dashboard/components/MapDashboard';
import { MobileRouteDashboard } from '@/features/mobile-routes/components/MobileRouteDashboard';
import { SensorDataTable } from '@/features/sensor-table/components/SensorDataTable';
import { MobileSensorDataTable } from '@/features/mobile-sensor-table/components/MobileSensorDataTable';
import { AnalyticsView } from '@/features/analytics-charts/components/AnalyticsView';
import { AdminSettings } from '@/features/admin/components/AdminSettings';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { SENSOR_TABLE_DATA } from '@/features/sensor-table/services/sensorTableData';
import { MOBILE_SENSOR_DATA } from '@/features/mobile-sensor-table/services/mobileSensorData';

export default function Home() {
  // Combine all sensors for analytics
  const allSensors = [...SENSOR_TABLE_DATA, ...MOBILE_SENSOR_DATA];

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
            if (activeView === 'mobile-data-table') {
              return <MobileSensorDataTable />;
            }
            if (activeView === 'analytics') {
              return <AnalyticsView sensors={allSensors} />;
            }
            if (activeView === 'admin-settings') {
              return (
                <ProtectedRoute requireAdmin>
                  <AdminSettings />
                </ProtectedRoute>
              );
            }
            return null;
          }}
        </MainLayout>
      </main>
    </>
  );
}
