const path = require('path');

/** @type {import('next').NextConfig} */
module.exports = {
  reactStrictMode: true,
  // Transpile the shared workspace packages that ship TypeScript source.
  transpilePackages: ['@repo/api', '@repo/config'],
  // Keep Prisma out of the bundle; it must run as a Node dependency.
  serverExternalPackages: ['@prisma/client', '@repo/database', 'prisma'],
  // Pin the monorepo root so Next doesn't infer a parent lockfile.
  turbopack: {
    root: path.join(__dirname, '..', '..'),
  },
  images: {
    remotePatterns: [{ protocol: 'https', hostname: '**' }],
  },
};
