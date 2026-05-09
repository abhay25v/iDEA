import type { NextConfig } from "next";

const config: NextConfig = {
  reactStrictMode: true,
  images: {
    unoptimized: true,
  },
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000',
    NEXT_PUBLIC_ML_URL: process.env.NEXT_PUBLIC_ML_URL || 'http://localhost:8000',
  },
};

export default config;
