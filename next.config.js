/** @type {import('next').NextConfig} */
const nextConfig = {
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Content-Security-Policy',
            value:
              "frame-ancestors 'self' http://localhost:3020 http://127.0.0.1:3020 http://localhost:3000",
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
