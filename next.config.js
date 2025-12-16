/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  
  // Transpile ESM-only packages
  transpilePackages: [
    'antd',
    '@ant-design/icons',
    '@ant-design/icons-svg',
    'rc-util',
    'rc-picker',
    'rc-pagination',
    'rc-table',
    'rc-input',
    'rc-tree',
    'rc-select',
    'rc-cascader',
    'rc-checkbox',
    'rc-dropdown',
    'rc-menu',
    'rc-motion',
    'rc-notification',
    'rc-tooltip',
    'rc-upload',
  ],
  
  // Skip linting and type checking during build
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
  webpack: (config) => {
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
    };
    return config;
  },
};

module.exports = nextConfig;
