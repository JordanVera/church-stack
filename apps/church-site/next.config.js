const path = require('path');

/** @type {import('next').NextConfig} */
module.exports = {
  reactStrictMode: true,
  transpilePackages: ['@repo/config', '@repo/api'],
  serverExternalPackages: ['@prisma/client', '@repo/database', 'prisma'],
  turbopack: {
    root: path.join(__dirname, '..', '..'),
  },
  images: {
    remotePatterns: [{ protocol: 'https', hostname: '**' }],
  },
};
