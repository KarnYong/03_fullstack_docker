/** @type {import('next').NextConfig} */
const API_HOST = process.env.API_HOST || 'http://localhost:5000';

const nextConfig = {
  output: 'standalone',
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `${API_HOST}/:path*`, // dynamically use API_HOST
      },
    ];
  },
  env: {
    NEXT_PUBLIC_API_HOST: API_HOST,
  },
};

export default nextConfig;