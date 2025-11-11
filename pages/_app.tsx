import '@/styles/globals.css';
import { ConfigProvider } from 'antd';
import type { AppProps } from 'next/app';
import { AuthProvider } from '@/contexts/AuthContext';
import { ThresholdProvider } from '@/contexts/ThresholdContext';

export default function App({ Component, pageProps }: AppProps) {
  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: '#1890ff',
        },
      }}
    >
      <AuthProvider>
        <ThresholdProvider>
          <Component {...pageProps} />
        </ThresholdProvider>
      </AuthProvider>
    </ConfigProvider>
  );
}
