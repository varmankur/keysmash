import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: [
    '192.168.0.22',
    '192.168.0.23',
    '192.168.0.24',
    '192.168.0.25',
    '192.168.0.26',
    '192.168.1.5'
  ],
};

export default nextConfig;
