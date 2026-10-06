const path = require('path');

/** @type {import('next').NextConfig} */
module.exports = {
  reactStrictMode: true,
  transpilePackages: ['@repo/config', '@repo/api', '@repo/database'],
  serverExternalPackages: ['@prisma/adapter-mariadb', '@prisma/client', 'prisma'],
  turbopack: {
    root: path.join(__dirname, '..', '..'),
  },
  images: {
    remotePatterns: [{ protocol: 'https', hostname: '**' }],
  },
};
