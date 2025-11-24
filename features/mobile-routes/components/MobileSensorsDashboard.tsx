import { useState, useEffect } from 'react';
import {
  Card,
  Alert,
  Button,
  Space,
  Tag,
  Statistic,
  Row,
  Col,
  Select,
  Empty,
  DatePicker,
} from 'antd';
import {
  ReloadOutlined,
  CarOutlined,
  EnvironmentOutlined,
  CalendarOutlined,
} from '@ant-design/icons';
import type { Dayjs } from 'dayjs';
import { GoogleMapComponent } from '@/features/map-dashboard/components/GoogleMapComponent';
import { RouteMap } from './RouteMap';
import { useMobileSensors } from '../hooks/useMobileSensors';
import { MobileRoute } from '@/types/route';
import { mobileRouteService } from '../services/mobileRouteService';
import { MobileSensorDataTable } from '@/features/mobile-sensor-table/components';
import { AirQualityLegend } from '@/components/AirQualityLegend';

const { Option } = Select;

export const MobileSensorsDashboard = () => {
  const { sensors, error, refetch, loading } = useMobileSensors(30000); // Auto-refresh every 30 seconds
  const [refreshing, setRefreshing] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Route viewing state
  const [selectedSensorId, setSelectedSensorId] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState<[Dayjs | null, Dayjs | null] | null>(null);
  const [selectedRoute, setSelectedRoute] = useState<MobileRoute | null>(null);
  const [loadingRoute, setLoadingRoute] = useState(false);
  const [routeError, setRouteError] = useState<string | null>(null);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setTimeout(() => setRefreshing(false), 500);
  };

  // Handle sensor selection
  const handleSensorSelect = (sensorId: string) => {
    setSelectedSensorId(sensorId);
  };

  // Auto-submit when both sensor and date range are selected
  useEffect(() => {
    if (selectedSensorId && dateRange && dateRange[0] && dateRange[1]) {
      loadRoute(selectedSensorId, dateRange[0], dateRange[1]);
    }
  }, [selectedSensorId, dateRange]);

  // Load route for selected sensor and date range
  const loadRoute = async (sensorId: string | null, start: Dayjs | null, end: Dayjs | null) => {
    if (!sensorId || !start || !end) {
      setSelectedRoute(null);
      setRouteError(null);
      return;
    }

    const sensor = sensors.find((s) => s.id === sensorId);
    if (!sensor) {
      console.error('❌ Sensor not found:', sensorId);
      setSelectedRoute(null);
      setRouteError('Sensor not found');
      return;
    }

    setSelectedRoute(null);
    setLoadingRoute(true);
    setRouteError(null);

    try {
      // Use selected time directly
      console.log('🗺️ Loading route for:', sensor.name, 'from:', start.toISOString(), 'to:', end.toISOString());

      // Call real API to fetch route
      const route = await mobileRouteService.getSensorRouteRange(sensor, start.toISOString(), end.toISOString());

      if (route) {
        setSelectedRoute(route);
        setRouteError(null);
        console.log('✅ Successfully loaded route with', route.points.length, 'points');
      } else {
        setSelectedRoute(null);
        setRouteError('No route data available for this sensor and date');
        console.log('⚠️ No route data available for this sensor and date');
      }
    } catch (error: any) {
      console.error('❌ Error loading route:', error);
      setSelectedRoute(null);
      setRouteError(error.message || 'Failed to load route data');
    } finally {
      setLoadingRoute(false);
    }
  };

  // Clear route selection
  const handleClearRoute = () => {
    setSelectedSensorId(null);
    setDateRange(null);
    setSelectedRoute(null);
    setRouteError(null);
  };

  // Calculate statistics
  const onlineSensors = sensors.filter((s) => s.status === 'online');
  const offlineSensors = sensors.filter((s) => s.status === 'offline');

  return (
    <div
      style={{
        background: 'linear-gradient(135deg, #f5f7fa 0%, #e8eef3 100%)',
        minHeight: '100%',
        padding: isMobile ? '12px 0' : '16px 0',
      }}
    >
      <div style={{ maxWidth: 1400, margin: '0 auto', padding: isMobile ? '0 16px' : '0 50px' }}>

      {/* Route Selector */}
      <Card
        style={{
          borderRadius: 12,
          border: 'none',
          boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
          marginBottom: 16,
        }}
      >
        <div style={{ marginBottom: 12, fontWeight: 600, fontSize: 15 }}>
          <CalendarOutlined style={{ marginRight: 8, color: '#1890ff' }} />
          ดูเส้นทาง
        </div>
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} md={8}>
            <div style={{ marginBottom: 4, fontSize: 13, color: '#595959' }}>
              เลือกเซ็นเซอร์เคลื่อนที่
            </div>
            <Select
              placeholder="เลือกเซ็นเซอร์"
              value={selectedSensorId}
              onChange={handleSensorSelect}
              style={{ width: '100%' }}
              size="large"
              allowClear
              onClear={handleClearRoute}
              className="font-noto-sans-thai"
              popupClassName="font-noto-sans-thai"
              getPopupContainer={(trigger) => trigger.parentElement}
            >
              {sensors.map((sensor) => (
                <Option key={sensor.id} value={sensor.id}>
                  <CarOutlined style={{ marginRight: 8 }} />
                  {sensor.name}
                </Option>
              ))}
            </Select>
          </Col>
          <Col xs={24} sm={12} md={12}>
            <div style={{ marginBottom: 4, fontSize: 13, color: '#595959' }}>เลือกช่วงวันที่และเวลา (สูงสุด 5 วัน)</div>
            <DatePicker.RangePicker
              format="YYYY-MM-DD HH:mm"
              showTime={{ format: 'HH:mm' }}
              value={dateRange}
              onChange={(dates) => {
                console.log('✅ Date & time range selected:', dates);
                // Validate max 5-day (120 hours) range
                if (dates && dates[0] && dates[1]) {
                  const hoursDiff = dates[1].diff(dates[0], 'hours');
                  if (hoursDiff > 120) {
                    alert('กรุณาเลือกช่วงเวลาไม่เกิน 5 วัน (120 ชั่วโมง)');
                    return;
                  }
                }
                setDateRange(dates);
              }}
              disabledDate={(current) => {
                if (!current || !dateRange || !dateRange[0] || dateRange[1]) {
                  return false;
                }
                // Disable dates more than 5 days from the selected start date
                const startDate = dateRange[0];
                const maxDate = startDate.clone().add(5, 'days');
                const minDate = startDate.clone().subtract(5, 'days');
                return current.isAfter(maxDate) || current.isBefore(minDate);
              }}
              placeholder={['วันเวลาเริ่มต้น', 'วันเวลาสิ้นสุด']}
              style={{ width: '100%' }}
              size="large"
              className="font-noto-sans-thai"
            />
          </Col>
          {selectedRoute && (
            <Col xs={24} sm={24} md={8}>
              <div style={{ marginBottom: 4, fontSize: 13, color: '#595959' }}>ข้อมูลเส้นทาง</div>
              <Space>
                <Tag color="blue">{selectedRoute.points.length} จุด</Tag>
                <Tag color="green">{selectedRoute.totalDistance} km</Tag>
                <Tag color="orange">PM2.5 เฉลี่ย: {selectedRoute.averagePm25}</Tag>
              </Space>
            </Col>
          )}
        </Row>
      </Card>

      {/* Map Container */}
      <Card
        style={{
          borderRadius: 12,
          border: 'none',
          boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
          overflow: 'hidden',
        }}
        bodyStyle={{ padding: 0 }}
      >
        <div
          style={{
            height:
              typeof window !== 'undefined' && window.innerWidth < 768
                ? '400px'
                : 'calc(100vh - 500px)',
            minHeight: typeof window !== 'undefined' && window.innerWidth < 768 ? '400px' : '500px',
          }}
        >
          {loadingRoute ? (
            <div
              style={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 16,
              }}
            >
              <ReloadOutlined spin style={{ fontSize: 48, color: '#1890ff' }} />
              <div style={{ fontSize: 16, color: '#595959' }}>กำลังโหลดข้อมูลเส้นทาง...</div>
            </div>
          ) : routeError ? (
            <div
              style={{
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: 24,
              }}
            >
              <Alert
                type="error"
                message="ไม่สามารถโหลดเส้นทาง"
                description={
                  <div>
                    <p style={{ marginBottom: 12 }}>{routeError}</p>
                    {routeError.includes('GPS coordinates') && (
                      <div
                        style={{
                          marginTop: 12,
                          padding: 12,
                          background: '#fff7e6',
                          border: '1px solid #ffd591',
                          borderRadius: 4,
                        }}
                      >
                        <strong>💡 Solution:</strong>
                        <p style={{ marginTop: 8, marginBottom: 0 }}>
                          Update your Supabase function to include <code>latitude</code> and{' '}
                          <code>longitude</code> fields in each data point.
                        </p>
                      </div>
                    )}
                  </div>
                }
                showIcon
                style={{ maxWidth: 600 }}
              />
            </div>
          ) : selectedRoute ? (
            <RouteMap key={selectedRoute.id} route={selectedRoute} />
          ) : selectedSensorId && dateRange && dateRange[0] && dateRange[1] ? (
            <div
              style={{
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Empty
                description="ไม่มีข้อมูลเส้นทางสำหรับเซ็นเซอร์และวันที่ที่เลือก"
                image={Empty.PRESENTED_IMAGE_SIMPLE}
              />
            </div>
          ) : (
            <GoogleMapComponent sensors={sensors} />
          )}
        </div>
      </Card>

      {/* Route Summary Card */}
      {selectedRoute && (
        <Card
          style={{
            marginTop: 16,
            borderRadius: 12,
            border: '1px solid #1890ff40',
            background: 'linear-gradient(135deg, #1890ff15 0%, #096dd915 100%)',
          }}
        >
          <Row gutter={[12, 12]}>
            <Col xs={12} sm={12} md={6}>
              <Statistic
                title="เวลาเริ่มต้น"
                value={new Date(selectedRoute.startTime).toLocaleTimeString('en-US', {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
                valueStyle={{
                  fontSize: typeof window !== 'undefined' && window.innerWidth < 768 ? 16 : 20,
                  color: '#52c41a',
                }}
              />
            </Col>
            <Col xs={12} sm={12} md={6}>
              <Statistic
                title="เวลาสิ้นสุด"
                value={new Date(selectedRoute.endTime).toLocaleTimeString('en-US', {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
                valueStyle={{
                  fontSize: typeof window !== 'undefined' && window.innerWidth < 768 ? 16 : 20,
                  color: '#ff4d4f',
                }}
              />
            </Col>
            <Col xs={12} sm={12} md={6}>
              <Statistic
                title="ระยะเวลา"
                value={(() => {
                  const duration =
                    new Date(selectedRoute.endTime).getTime() -
                    new Date(selectedRoute.startTime).getTime();
                  const hours = Math.floor(duration / (1000 * 60 * 60));
                  const minutes = Math.floor((duration % (1000 * 60 * 60)) / (1000 * 60));
                  return `${hours}h ${minutes}m`;
                })()}
                valueStyle={{
                  fontSize: typeof window !== 'undefined' && window.innerWidth < 768 ? 16 : 20,
                  color: '#722ed1',
                }}
              />
            </Col>
            <Col xs={8} sm={8} md={6}>
              <Statistic
                title="ระยะทาง"
                value={selectedRoute.totalDistance}
                suffix="km"
                valueStyle={{
                  fontSize: typeof window !== 'undefined' && window.innerWidth < 768 ? 16 : 20,
                  color: '#1890ff',
                }}
              />
            </Col>
            <Col xs={8} sm={8} md={6}>
              <Statistic
                title="PM2.5 เฉลี่ย"
                value={selectedRoute.averagePm25}
                suffix="µg/m³"
                valueStyle={{
                  fontSize: typeof window !== 'undefined' && window.innerWidth < 768 ? 16 : 20,
                  color: '#faad14',
                }}
              />
            </Col>
            <Col xs={8} sm={8} md={6}>
              <Statistic
                title="PM2.5 ต่ำสุด"
                value={selectedRoute.minPm25}
                suffix="µg/m³"
                valueStyle={{
                  fontSize: typeof window !== 'undefined' && window.innerWidth < 768 ? 16 : 20,
                  color: '#52c41a',
                }}
              />
            </Col>
            <Col xs={8} sm={8} md={6}>
              <Statistic
                title="PM2.5 สูงสุด"
                value={selectedRoute.maxPm25}
                suffix="µg/m³"
                valueStyle={{
                  fontSize: typeof window !== 'undefined' && window.innerWidth < 768 ? 16 : 20,
                  color: '#ff4d4f',
                }}
              />
            </Col>
          </Row>
          <div style={{ marginTop: 12, fontSize: 12, color: '#595959' }}>
            <EnvironmentOutlined style={{ marginRight: 8 }} />
            แสดงเส้นทางสำหรับ {selectedRoute.deviceName} ด้วย {selectedRoute.points.length} จุด
          </div>
        </Card>
      )}

      {/* Legend */}
      <div style={{ marginTop: 16 }}>
        <AirQualityLegend showRanges compact />
      </div>

      {/* Info Banner */}
      {!selectedRoute && (
        <Card
          style={{
            marginTop: 16,
            borderRadius: 12,
            background: 'linear-gradient(135deg, #667eea15 0%, #764ba215 100%)',
            border: '1px solid #667eea40',
          }}
        >
          <Space direction="vertical" size={8}>
            <div style={{ fontWeight: 600, color: '#262626' }}>
              <EnvironmentOutlined style={{ marginRight: 8, color: '#667eea' }} />
              ติดตามเซ็นเซอร์เคลื่อนที่แบบเรียลไทม์
            </div>
            <div style={{ fontSize: 13, color: '#595959' }}>
              แสดงตำแหน่งปัจจุบันของเซ็นเซอร์คุณภาพอากาศเคลื่อนที่
              เลือกเซ็นเซอร์และวันที่ด้านบนเพื่อดูเส้นทาง
            </div>
          </Space>
        </Card>
      )}
      <div style={{ marginTop: 24 }}>
        <MobileSensorDataTable />
      </div>
      </div>
    </div>
  );
};
