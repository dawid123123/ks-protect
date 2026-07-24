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
              "frame-ancestors 'self' https://leigsida.vercel.app http://localhost:3001 http://127.0.0.1:3001 http://localhost:3020 http://127.0.0.1:3020 http://localhost:3000 http://127.0.0.1:3000",
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
