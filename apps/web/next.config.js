const path = require('path');

/** @type {import('next').NextConfig} */
module.exports = {
  reactStrictMode: true,
  // Transpile the shared workspace packages that ship TypeScript source.
  transpilePackages: ['@repo/api', '@repo/config', '@repo/database'],
  // Keep Prisma runtime packages external; @repo/database is transpiled from source.
  serverExternalPackages: ['@prisma/adapter-mariadb', '@prisma/client', 'prisma'],
  // Pin the monorepo root so Next doesn't infer a parent lockfile.
  turbopack: {
    root: path.join(__dirname, '..', '..'),
  },
  images: {
    remotePatterns: [{ protocol: 'https', hostname: '**' }],
  },
};
