import { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    domains: ["res.cloudinary.com"], // allow Cloudinary images
  },
};

export default nextConfig;
