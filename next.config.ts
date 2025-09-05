import { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    domains: ["res.cloudinary.com"], // allow Cloudinary images
  },
  eslint: {
    ignoreDuringBuilds: true, // ✅ prevents build from failing due to ESLint errors
  },
};

export default nextConfig;
