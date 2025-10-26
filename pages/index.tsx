import { useMemo } from 'react';
import Head from 'next/head';
import { MainLayout } from '@/components/MainLayout';
import { MapDashboard } from '@/features/map-dashboard/components/MapDashboard';
import { MobileSensorsDashboard } from '@/features/mobile-routes/components/MobileSensorsDashboard';
import { SensorDataTable } from '@/features/sensor-table/components/SensorDataTable';
import { MobileSensorDataTable } from '@/features/mobile-sensor-table/components/MobileSensorDataTable';
import { AnalyticsView } from '@/features/analytics-charts/components/AnalyticsView';
import { AdminSettings } from '@/features/admin/components/AdminSettings';
import { DataExportPage } from '@/features/data-export/components';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { useSensorTableData } from '@/features/sensor-table/hooks/useSensorTableData';
import { useMobileSensorTableData } from '@/features/mobile-sensor-table/hooks/useMobileSensorTableData';

export default function Home() {
  // Fetch real sensors from both sources
  const { sensors: staticSensors } = useSensorTableData();
  const { sensors: mobileSensors } = useMobileSensorTableData();
  
  // Combine all sensors for analytics
  const allSensors = useMemo(
    () => [...staticSensors, ...mobileSensors],
    [staticSensors, mobileSensors]
  );

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
              return <MobileSensorsDashboard />;
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
            if (activeView === 'data-export') {
              return (
                <ProtectedRoute requireAdmin>
                  <DataExportPage sensors={allSensors} />
                </ProtectedRoute>
              );
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
