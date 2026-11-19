/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Cursor port-forward hits 127.0.0.1; Next 15 blocks unknown origins in dev.
  allowedDevOrigins: ["127.0.0.1", "localhost"],
  transpilePackages: ["@colyseus/sdk"],
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
      };
    }
    return config;
  },
};

export default nextConfig;
