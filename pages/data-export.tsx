import { useState, useEffect } from 'react';
import Head from 'next/head';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { DataExportPage } from '@/features/data-export/components';
import type { SensorData } from '@/types/sensor';
import { getLatestSensors } from '@/services/sensorApi';
import { mapApiSensorsToAppSensors } from '@/utils/sensorMapper';

export default function DataExport() {
  const [sensors, setSensors] = useState<SensorData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSensors = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch both static and mobile sensors
        const [staticResponse, mobileResponse] = await Promise.all([
          getLatestSensors(false), // Static sensors
          getLatestSensors(true),  // Mobile sensors
        ]);

        // Combine and map all sensors
        const allItems = [...staticResponse.items, ...mobileResponse.items];
        const mappedSensors = mapApiSensorsToAppSensors(allItems);

        // Filter to only sensors with codes (required for export)
        const sensorsWithCode = mappedSensors.filter((s) => s.code);

        setSensors(sensorsWithCode);
      } catch (err: any) {
        console.error('Error fetching sensors:', err);
        setError(err.message || 'Failed to load sensors');
      } finally {
        setLoading(false);
      }
    };

    fetchSensors();
  }, []);

  return (
    <>
      <Head>
        <title>Data Export | Air Quality Monitoring</title>
        <meta name="description" content="Export sensor data as CSV" />
      </Head>

      <ProtectedRoute>
        <DataExportPage sensors={sensors} loading={loading} error={error} />
      </ProtectedRoute>
    </>
  );
}
