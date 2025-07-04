/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    domains: [],
  },
  env: {
    SEPOLIA_RPC_URL: process.env.SEPOLIA_RPC_URL || '',
  },
};

module.exports = nextConfig;





