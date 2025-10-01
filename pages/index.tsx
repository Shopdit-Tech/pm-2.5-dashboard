import Head from 'next/head';
import { MapDashboard } from '@/features/map-dashboard/components/MapDashboard';

export default function Home() {
  return (
    <>
      <Head>
        <title>PM 2.5 Dashboard - แผนที่ติดตามคุณภาพอากาศ</title>
        <meta
          name="description"
          content="ระบบติดตามคุณภาพอากาศแบบเรียลไทม์ แสดงค่า PM2.5 และพารามิเตอร์สิ่งแวดล้อม"
        />
      </Head>
      <MapDashboard />
    </>
  );
}
