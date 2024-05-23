/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    externalDir: true, // https://stackoverflow.com/a/72842944
  },
  reactStrictMode: true,
};

export default nextConfig;
