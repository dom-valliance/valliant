const path = require('path');

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Removed transpilePackages - use pre-compiled dist/ instead
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000',
    NEXT_PUBLIC_GRAPHQL_URL: process.env.NEXT_PUBLIC_GRAPHQL_URL || 'http://localhost:4000/graphql',
  },
  webpack: (config) => {
    // Force webpack to resolve @vrm/* packages to their dist/ folders
    config.resolve.alias = {
      ...config.resolve.alias,
      '@vrm/shared-types': path.resolve(__dirname, '../../packages/shared-types/dist'),
      '@vrm/events': path.resolve(__dirname, '../../packages/events/dist'),
      '@vrm/database': path.resolve(__dirname, '../../packages/database/dist'),
    };
    return config;
  },
};

module.exports = nextConfig;
