import '@/styles/globals.css';
import { ConfigProvider } from 'antd';
import type { AppProps } from 'next/app';
import { AuthProvider } from '@/contexts/AuthContext';
import { ThresholdProvider } from '@/contexts/ThresholdContext';
import { Noto_Sans_Thai } from 'next/font/google';

// Configure Noto Sans Thai font with Thai and Latin support
const notoSansThai = Noto_Sans_Thai({
  subsets: ['thai', 'latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-noto-sans-thai',
  display: 'swap',
});

export default function App({ Component, pageProps }: AppProps) {
  return (
    <div className={notoSansThai.variable}>
      <ConfigProvider
        theme={{
          token: {
            colorPrimary: '#00bcd4',
            fontFamily: 'var(--font-noto-sans-thai), -apple-system, BlinkMacSystemFont, sans-serif',
          },
        }}
      >
        <AuthProvider>
          <ThresholdProvider>
            <Component {...pageProps} />
          </ThresholdProvider>
        </AuthProvider>
      </ConfigProvider>
    </div>
  );
}
