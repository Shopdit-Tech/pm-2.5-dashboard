import { useState } from 'react';
import { Card, Alert, Button, Space, Tag, Statistic, Row, Col, Select, DatePicker, Empty } from 'antd';
import { ReloadOutlined, CarOutlined, EnvironmentOutlined, CalendarOutlined } from '@ant-design/icons';
import type { Dayjs } from 'dayjs';
import { GoogleMapComponent } from '@/features/map-dashboard/components/GoogleMapComponent';
import { RouteMap } from './RouteMap';
import { useMobileSensors } from '../hooks/useMobileSensors';
import { MobileRoute } from '@/types/route';
import { mobileRouteService } from '../services/mobileRouteService';

const { Option } = Select;

export const MobileSensorsDashboard = () => {
  const { sensors, error, refetch, loading } = useMobileSensors(30000); // Auto-refresh every 30 seconds
  const [refreshing, setRefreshing] = useState(false);
  
  // Route viewing state
  const [selectedSensorId, setSelectedSensorId] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<Dayjs | null>(null);
  const [selectedRoute, setSelectedRoute] = useState<MobileRoute | null>(null);
  const [loadingRoute, setLoadingRoute] = useState(false);
  const [routeError, setRouteError] = useState<string | null>(null);

  const handleRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setTimeout(() => setRefreshing(false), 500);
  };

  // Handle sensor selection
  const handleSensorSelect = (sensorId: string) => {
    setSelectedSensorId(sensorId);
    loadRoute(sensorId, selectedDate);
  };

  // Handle date selection
  const handleDateSelect = (date: Dayjs | null) => {
    setSelectedDate(date);
    loadRoute(selectedSensorId, date);
  };

  // Load route for selected sensor and date
  const loadRoute = async (sensorId: string | null, date: Dayjs | null) => {
    if (!sensorId || !date) {
      setSelectedRoute(null);
      setRouteError(null);
      return;
    }

    const sensor = sensors.find(s => s.id === sensorId);
    if (!sensor) {
      console.error('❌ Sensor not found:', sensorId);
      setSelectedRoute(null);
      setRouteError('Sensor not found');
      return;
    }

    // Clear current route first to force RouteMap unmount (like manual clear/select)
    setSelectedRoute(null);
    setLoadingRoute(true);
    setRouteError(null);
    
    try {
      console.log('📍 Loading route for sensor:', sensor.name, 'on date:', date.format('YYYY-MM-DD'));
      
      // Call real API to fetch route
      const route = await mobileRouteService.getSensorRoute(sensor, date.format('YYYY-MM-DD'));
      
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
    setSelectedDate(null);
    setSelectedRoute(null);
    setRouteError(null);
  };

  // Calculate statistics
  const onlineSensors = sensors.filter((s) => s.status === 'online');
  const offlineSensors = sensors.filter((s) => s.status === 'offline');

  const avgPM25 =
    onlineSensors.length > 0
      ? onlineSensors.reduce((sum, s) => sum + s.pm25, 0) / onlineSensors.length
      : 0;

  const maxPM25 =
    onlineSensors.length > 0
      ? Math.max(...onlineSensors.map((s) => s.pm25))
      : 0;

  return (
    <div style={{ padding: '32px', background: 'linear-gradient(135deg, #f5f7fa 0%, #e8eef3 100%)', minHeight: '100%' }}>
      {/* Header */}
      <div className="mb-8" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: 28, fontWeight: 700, margin: 0, color: '#1a1a1a', letterSpacing: '-0.5px' }}>
            <CarOutlined style={{ marginRight: 12, color: '#f5576c' }} />
            Mobile Sensor Monitoring
          </h2>
          <p style={{ margin: '8px 0 0 0', color: '#666', fontSize: 15 }}>
            Real-time tracking of mobile air quality sensors
          </p>
        </div>
        <Button
          icon={<ReloadOutlined spin={refreshing} />}
          onClick={handleRefresh}
          loading={refreshing}
          size="large"
          style={{
            borderRadius: 12,
            height: 48,
            padding: '0 24px',
            background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
            borderColor: 'transparent',
            color: 'white',
            fontWeight: 600,
            boxShadow: '0 4px 12px rgba(245,87,108,0.3)',
          }}
        >
          Refresh
        </Button>
      </div>

      {/* Statistics Cards */}
      <Row gutter={[20, 20]} className="mb-8">
        <Col xs={12} sm={12} md={6}>
          <Card
            style={{
              borderRadius: 16,
              border: '1px solid rgba(255,255,255,0.6)',
              boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
              background: 'linear-gradient(135deg, rgba(240,147,251,0.1) 0%, rgba(245,87,108,0.1) 100%)',
              backdropFilter: 'blur(10px)',
            }}
            bodyStyle={{ padding: '24px' }}
          >
            <div style={{ fontSize: 13, color: '#666', fontWeight: 600, marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Total Mobile</div>
            <div style={{ fontSize: 36, fontWeight: 700, color: '#f5576c', marginBottom: 4 }}>{sensors.length}</div>
            <div style={{ fontSize: 12, color: '#999' }}>🚗 tracking devices</div>
          </Card>
        </Col>
        <Col xs={12} sm={12} md={6}>
          <Card
            style={{
              borderRadius: 16,
              border: '1px solid rgba(255,255,255,0.6)',
              boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
              background: 'linear-gradient(135deg, rgba(82,196,26,0.1) 0%, rgba(115,209,61,0.1) 100%)',
              backdropFilter: 'blur(10px)',
            }}
            bodyStyle={{ padding: '24px' }}
          >
            <div style={{ fontSize: 13, color: '#666', fontWeight: 600, marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Active Now</div>
            <div style={{ fontSize: 36, fontWeight: 700, color: '#52c41a', marginBottom: 4 }}>{onlineSensors.length}</div>
            <div style={{ fontSize: 12, color: '#999' }}>of {sensors.length} online</div>
          </Card>
        </Col>
        <Col xs={12} sm={12} md={6}>
          <Card
            style={{
              borderRadius: 16,
              border: '1px solid rgba(255,255,255,0.6)',
              boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
              background: 'linear-gradient(135deg, rgba(24,144,255,0.08) 0%, rgba(24,144,255,0.05) 100%)',
              backdropFilter: 'blur(10px)',
            }}
            bodyStyle={{ padding: '24px' }}
          >
            <div style={{ marginBottom: 8 }}>
              <Tag color="blue" style={{ borderRadius: 8, padding: '4px 12px', fontWeight: 600, border: 'none' }}>📊 Average</Tag>
            </div>
            <div style={{ fontSize: 32, fontWeight: 700, color: '#1890ff', marginBottom: 4 }}>{avgPM25.toFixed(1)}</div>
            <div style={{ fontSize: 12, color: '#999' }}>µg/m³ PM2.5</div>
          </Card>
        </Col>
        <Col xs={12} sm={12} md={6}>
          <Card
            style={{
              borderRadius: 16,
              border: '1px solid rgba(255,255,255,0.6)',
              boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
              background: 'linear-gradient(135deg, rgba(255,77,79,0.08) 0%, rgba(255,77,79,0.05) 100%)',
              backdropFilter: 'blur(10px)',
            }}
            bodyStyle={{ padding: '24px' }}
          >
            <div style={{ marginBottom: 8 }}>
              <Tag color="red" style={{ borderRadius: 8, padding: '4px 12px', fontWeight: 600, border: 'none' }}>⚠️ Maximum</Tag>
            </div>
            <div style={{ fontSize: 32, fontWeight: 700, color: '#ff4d4f', marginBottom: 4 }}>{maxPM25.toFixed(1)}</div>
            <div style={{ fontSize: 12, color: '#999' }}>µg/m³ PM2.5</div>
          </Card>
        </Col>
      </Row>

      {/* Alerts */}
      {error && (
        <Alert
          message="Error Loading Data"
          description="Unable to load mobile sensor data. Please try again."
          type="error"
          closable
          className="mb-4"
          style={{ borderRadius: 8 }}
        />
      )}

      {loading && sensors.length === 0 && (
        <Alert
          message="Loading Mobile Sensors"
          description="Fetching real-time mobile sensor data..."
          type="info"
          className="mb-4"
          style={{ borderRadius: 8 }}
        />
      )}

      {!loading && sensors.length === 0 && !error && (
        <Alert
          message="No Mobile Sensors Available"
          description="There are no mobile sensors currently active."
          type="warning"
          className="mb-4"
          style={{ borderRadius: 8 }}
        />
      )}

      {offlineSensors.length > 0 && (
        <Alert
          message={`${offlineSensors.length} Mobile Sensors Offline`}
          description={offlineSensors.map((s) => s.name).join(', ')}
          type="warning"
          closable
          className="mb-4"
          style={{ borderRadius: 8 }}
        />
      )}

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
          View Historical Route
        </div>
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} md={8}>
            <div style={{ marginBottom: 4, fontSize: 13, color: '#595959' }}>Select Mobile Sensor</div>
            <Select
              placeholder="Choose a sensor"
              value={selectedSensorId}
              onChange={handleSensorSelect}
              style={{ width: '100%' }}
              size="large"
              allowClear
              onClear={handleClearRoute}
            >
              {sensors.map(sensor => (
                <Option key={sensor.id} value={sensor.id}>
                  <CarOutlined style={{ marginRight: 8 }} />
                  {sensor.name}
                </Option>
              ))}
            </Select>
          </Col>
          <Col xs={24} sm={12} md={8}>
            <div style={{ marginBottom: 4, fontSize: 13, color: '#595959' }}>Select Date</div>
            <DatePicker
              placeholder="Choose date"
              value={selectedDate}
              onChange={handleDateSelect}
              style={{ width: '100%' }}
              size="large"
              format="YYYY-MM-DD"
            />
          </Col>
          {selectedRoute && (
            <Col xs={24} sm={24} md={8}>
              <div style={{ marginBottom: 4, fontSize: 13, color: '#595959' }}>Route Information</div>
              <Space>
                <Tag color="blue">{selectedRoute.points.length} points</Tag>
                <Tag color="green">{selectedRoute.totalDistance} km</Tag>
                <Tag color="orange">Avg PM2.5: {selectedRoute.averagePm25}</Tag>
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
        <div style={{ height: 'calc(100vh - 500px)', minHeight: '600px' }}>
          {loadingRoute ? (
            <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16 }}>
              <ReloadOutlined spin style={{ fontSize: 48, color: '#1890ff' }} />
              <div style={{ fontSize: 16, color: '#595959' }}>Loading route data...</div>
            </div>
          ) : routeError ? (
            <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
              <Alert
                type="error"
                message="Failed to Load Route"
                description={
                  <div>
                    <p style={{ marginBottom: 12 }}>{routeError}</p>
                    {routeError.includes('GPS coordinates') && (
                      <div style={{ marginTop: 12, padding: 12, background: '#fff7e6', border: '1px solid #ffd591', borderRadius: 4 }}>
                        <strong>💡 Solution:</strong>
                        <p style={{ marginTop: 8, marginBottom: 0 }}>
                          Update your Supabase function to include <code>latitude</code> and <code>longitude</code> fields in each data point.
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
          ) : selectedSensorId && selectedDate ? (
            <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Empty
                description="No route data available for selected sensor and date"
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
          <Row gutter={[16, 16]}>
            <Col xs={24} md={6}>
              <Statistic
                title="Start Time"
                value={new Date(selectedRoute.startTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                valueStyle={{ fontSize: 20, color: '#52c41a' }}
              />
            </Col>
            <Col xs={24} md={6}>
              <Statistic
                title="End Time"
                value={new Date(selectedRoute.endTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                valueStyle={{ fontSize: 20, color: '#ff4d4f' }}
              />
            </Col>
            <Col xs={24} md={4}>
              <Statistic
                title="Distance"
                value={selectedRoute.totalDistance}
                suffix="km"
                valueStyle={{ fontSize: 20, color: '#1890ff' }}
              />
            </Col>
            <Col xs={24} md={4}>
              <Statistic
                title="Avg PM2.5"
                value={selectedRoute.averagePm25}
                suffix="µg/m³"
                valueStyle={{ fontSize: 20, color: '#faad14' }}
              />
            </Col>
            <Col xs={24} md={4}>
              <Statistic
                title="Max PM2.5"
                value={selectedRoute.maxPm25}
                suffix="µg/m³"
                valueStyle={{ fontSize: 20, color: '#ff4d4f' }}
              />
            </Col>
          </Row>
          <div style={{ marginTop: 16, fontSize: 13, color: '#595959' }}>
            <EnvironmentOutlined style={{ marginRight: 8 }} />
            Showing complete route for {selectedRoute.deviceName} with {selectedRoute.points.length} data points
          </div>
        </Card>
      )}

      {/* Legend */}
      <div style={{ marginTop: 16, textAlign: 'center', color: '#8c8c8c', fontSize: 13 }}>
        <Space size="large">
          <span><CarOutlined /> Mobile Sensors</span>
          <span>🟢 Good (0-12)</span>
          <span>🟡 Moderate (12-35)</span>
          <span>🟠 Unhealthy (35-55)</span>
          <span>🔴 Hazardous (&gt;55)</span>
        </Space>
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
              Real-time Mobile Sensor Tracking
            </div>
            <div style={{ fontSize: 13, color: '#595959' }}>
              Showing current positions of mobile air quality sensors. Select a sensor and date above to view historical route.
            </div>
          </Space>
        </Card>
      )}
    </div>
  );
};
