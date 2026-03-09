/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: [],
  output: 'export', // Static export for single-container Docker (Railway)
};

module.exports = nextConfig;
