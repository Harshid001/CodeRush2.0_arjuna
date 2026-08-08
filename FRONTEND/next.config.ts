import path from 'path';

/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      {
        source: '/api/v1/:path*',
        destination: 'https://code-rush2-0-arjuna-backend.vercel.app/api/v1/:path*',
      },
    ];
  },
  webpack: (config: any) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      '@web3auth/modal': path.resolve(__dirname, 'empty-module.js'),
      '@web3auth/single-factor-auth': path.resolve(__dirname, 'empty-module.js'),
      '@web3auth/base': path.resolve(__dirname, 'empty-module.js'),
      '@web3auth/base-provider': path.resolve(__dirname, 'empty-module.js'),
    };
    return config;
  },
  turbopack: {
    resolveAlias: {
      '@web3auth/modal': './empty-module.js',
      '@web3auth/single-factor-auth': './empty-module.js',
      '@web3auth/base': './empty-module.js',
      '@web3auth/base-provider': './empty-module.js',
    },
  },
};

export default nextConfig;
