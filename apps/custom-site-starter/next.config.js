/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@repo/api', '@repo/config', '@repo/database'],
};

module.exports = nextConfig;
