/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  webpack: (config) => {
    config.externals.push("encoding", "bufferutil", "utf-8-validate");
    return config;
  },
}

module.exports = nextConfig
