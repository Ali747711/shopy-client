import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    // Enables the React ViewTransition component for declarative page
    // transitions via the browser's View Transitions API.
    viewTransition: true,
  },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "picsum.photos" },
      { protocol: "https", hostname: "img.kwcdn.com" },
    ],
  },
  // Proxy API requests to the backend so the browser only talks to one origin.
  // This eliminates cross-origin cookie issues that break session persistence.
  async rewrites() {
    const backendUrl = process.env.BACKEND_URL || "http://localhost:4000";
    return [
      {
        source: "/api/:path*",
        destination: `${backendUrl}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;
