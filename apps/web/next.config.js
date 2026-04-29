/** @type {import('next').NextConfig} */
module.exports = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "http", hostname: "localhost" },
    ],
  },
  async rewrites() {
    return [
      { source: "/uploads/:path*", destination: "http://localhost:4000/uploads/:path*" },
    ];
  },
};
