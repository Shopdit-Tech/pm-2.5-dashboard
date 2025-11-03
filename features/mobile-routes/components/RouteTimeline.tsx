import { useState, useEffect } from 'react';
import { Slider, Button, Space, Select, Typography } from 'antd';
import {
  PlayCircleOutlined,
  PauseCircleOutlined,
  FastBackwardOutlined,
  FastForwardOutlined,
} from '@ant-design/icons';
import { MobileRoute } from '@/types/route';

const { Text } = Typography;

type RouteTimelineProps = {
  route: MobileRoute;
  currentIndex: number;
  onIndexChange: (index: number) => void;
  isPlaying: boolean;
  onPlayPause: () => void;
};

export const RouteTimeline = ({
  route,
  currentIndex,
  onIndexChange,
  isPlaying,
  onPlayPause,
}: RouteTimelineProps) => {
  const [playbackSpeed, setPlaybackSpeed] = useState(1);

  const maxIndex = route.points.length - 1;
  const currentPoint = route.points[currentIndex];
  const progress = maxIndex > 0 ? (currentIndex / maxIndex) * 100 : 0;

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('th-TH', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  const handleSkipBack = () => {
    onIndexChange(Math.max(0, currentIndex - 10));
  };

  const handleSkipForward = () => {
    onIndexChange(Math.min(maxIndex, currentIndex + 10));
  };

  return (
    <div className="p-4">
      {/* Timeline Slider */}
      <div className="mb-4">
        <Slider
          min={0}
          max={maxIndex}
          value={currentIndex}
          onChange={onIndexChange}
          tooltip={{
            formatter: (value) => {
              if (value !== undefined && route.points[value]) {
                const point = route.points[value];
                return (
                  <div>
                    <div>{formatTime(point.timestamp)}</div>
                    <div>PM2.5: {point.pm25.toFixed(1)}</div>
                  </div>
                );
              }
              return null;
            },
          }}
          trackStyle={{ backgroundColor: '#1890ff', height: 6 }}
          railStyle={{ height: 6 }}
          handleStyle={{
            width: 18,
            height: 18,
            marginTop: -6,
            backgroundColor: '#1890ff',
            border: '3px solid white',
            boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
          }}
        />
      </div>

      {/* Controls and Info */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        {/* Playback Controls */}
        <Space size="middle">
          <Button
            icon={<FastBackwardOutlined />}
            onClick={handleSkipBack}
            size={typeof window !== 'undefined' && window.innerWidth < 768 ? 'middle' : 'large'}
            disabled={currentIndex === 0}
          />
          
          <Button
            type="primary"
            icon={isPlaying ? <PauseCircleOutlined /> : <PlayCircleOutlined />}
            onClick={onPlayPause}
            size={typeof window !== 'undefined' && window.innerWidth < 768 ? 'middle' : 'large'}
            style={{ 
              width: typeof window !== 'undefined' && window.innerWidth < 768 ? 48 : 60, 
              height: typeof window !== 'undefined' && window.innerWidth < 768 ? 48 : 60, 
              fontSize: typeof window !== 'undefined' && window.innerWidth < 768 ? 20 : 24 
            }}
          />
          
          <Button
            icon={<FastForwardOutlined />}
            onClick={handleSkipForward}
            size={typeof window !== 'undefined' && window.innerWidth < 768 ? 'middle' : 'large'}
            disabled={currentIndex === maxIndex}
          />
          
          <Select
            value={playbackSpeed}
            onChange={setPlaybackSpeed}
            size={typeof window !== 'undefined' && window.innerWidth < 768 ? 'middle' : undefined}
            style={{ width: 90 }}
            options={[
              { label: '0.5x', value: 0.5 },
              { label: '1x', value: 1 },
              { label: '2x', value: 2 },
              { label: '4x', value: 4 },
              { label: '8x', value: 8 },
            ]}
          />
        </Space>

        {/* Current Info */}
        <Space direction="vertical" size="small" style={{ 
          textAlign: typeof window !== 'undefined' && window.innerWidth < 768 ? 'center' : 'right',
          width: typeof window !== 'undefined' && window.innerWidth < 768 ? '100%' : 'auto'
        }}>
          <Text strong style={{ fontSize: typeof window !== 'undefined' && window.innerWidth < 768 ? 13 : 14 }}>
            Point {currentIndex + 1} / {route.points.length}
          </Text>
          <Text type="secondary" style={{ fontSize: 11 }}>
            {formatTime(currentPoint.timestamp)}
          </Text>
          <Text style={{ fontSize: 11 }}>
            PM2.5: <span style={{ fontWeight: 'bold', color: '#1890ff' }}>
              {currentPoint.pm25.toFixed(1)} µg/m³
            </span>
          </Text>
          <Text type="secondary" style={{ fontSize: 11 }}>
            Progress: {progress.toFixed(0)}%
          </Text>
        </Space>
      </div>
    </div>
  );
};

// Hook for automatic playback
export const useRoutePlayback = (
  route: MobileRoute,
  playbackSpeed: number = 1,
  interval: number = 500 // ms between points
) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    if (!isPlaying) return;

    const adjustedInterval = interval / playbackSpeed;
    const timer = setInterval(() => {
      setCurrentIndex((prev) => {
        if (prev >= route.points.length - 1) {
          setIsPlaying(false);
          return prev;
        }
        return prev + 1;
      });
    }, adjustedInterval);

    return () => clearInterval(timer);
  }, [isPlaying, playbackSpeed, interval, route.points.length]);

  const togglePlayPause = () => {
    if (currentIndex >= route.points.length - 1) {
      setCurrentIndex(0);
    }
    setIsPlaying(!isPlaying);
  };

  const reset = () => {
    setCurrentIndex(0);
    setIsPlaying(false);
  };

  return {
    currentIndex,
    setCurrentIndex,
    isPlaying,
    setIsPlaying,
    togglePlayPause,
    reset,
  };
};
