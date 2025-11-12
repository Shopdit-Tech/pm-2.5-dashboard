'use client';

import Image from 'next/image';

type LegendItem = {
  icon: string;
  label: string;
  range?: string;
};

type AirQualityLegendProps = {
  showRanges?: boolean;
  compact?: boolean;
};

const LEGEND_ITEMS: LegendItem[] = [
  {
    icon: '/blue.png',
    label: 'คุณภาพอากาศดีมาก',
    range: '0-25',
  },
  {
    icon: '/green.png',
    label: 'คุณภาพอากาศดี',
    range: '25-37.5',
  },
  {
    icon: '/yellow.png',
    label: 'คุณภาพอากาศปานกลาง',
    range: '37.5-55',
  },
  {
    icon: '/orange.png',
    label: 'เริ่มมีผลกระทบต่อสุขภาพ',
    range: '55-75',
  },
  {
    icon: '/red.png',
    label: 'มีผลกระทบต่อสุขภาพ',
    range: '>75',
  },
];

export const AirQualityLegend = ({ showRanges = false, compact = false }: AirQualityLegendProps) => {
  return (
    <div
      style={{
        padding: compact ? '12px 16px' : '16px 20px',
        background: 'rgba(255, 255, 255, 0.95)',
        borderRadius: 12,
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
      }}
    >
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'center',
          alignItems: 'center',
          gap: compact ? '16px' : '20px',
        }}
        className="air-quality-legend"
      >
        {LEGEND_ITEMS.map((item, index) => (
          <div
            key={index}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              minWidth: compact ? '140px' : '160px',
            }}
          >
            <div
              style={{
                width: compact ? '36px' : '44px',
                height: compact ? '36px' : '44px',
                position: 'relative',
                flexShrink: 0,
              }}
            >
              <Image
                src={item.icon}
                alt={item.label}
                width={compact ? 36 : 44}
                height={compact ? 36 : 44}
                style={{
                  objectFit: 'contain',
                }}
              />
            </div>
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '2px',
              }}
            >
              <span
                style={{
                  fontSize: compact ? '12px' : '13px',
                  fontWeight: 600,
                  color: '#262626',
                  lineHeight: 1.2,
                }}
              >
                {item.label}
              </span>
              {showRanges && (
                <span
                  style={{
                    fontSize: '11px',
                    color: '#8c8c8c',
                    fontWeight: 500,
                  }}
                >
                  ({item.range})
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Responsive CSS */}
      <style jsx>{`
        @media (max-width: 1024px) {
          .air-quality-legend {
            gap: 16px !important;
          }
          .air-quality-legend > div {
            min-width: 140px !important;
          }
        }
        
        @media (max-width: 768px) {
          .air-quality-legend {
            gap: 12px !important;
          }
          .air-quality-legend > div {
            min-width: 120px !important;
            flex: 0 0 calc(50% - 6px);
          }
        }
        
        @media (max-width: 480px) {
          .air-quality-legend > div {
            flex: 0 0 100%;
            justify-content: flex-start;
          }
        }
      `}</style>
    </div>
  );
};
