import type { NextConfig } from 'next';

const backendUrl =
  process.env.MARKOS_BACKEND_INTERNAL_URL ?? 'http://localhost:3008';

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: '/:orgSlug/lists',
        destination: '/:orgSlug/email/lists',
        permanent: false,
      },
      {
        source: '/:orgSlug/lists/:path*',
        destination: '/:orgSlug/email/lists/:path*',
        permanent: false,
      },
      {
        source: '/:orgSlug/email/settings/templates',
        destination: '/:orgSlug/email/templates',
        permanent: true,
      },
      {
        source: '/:orgSlug/email/settings/templates/:path*',
        destination: '/:orgSlug/email/templates/:path*',
        permanent: true,
      },
      {
        source: '/:orgSlug/email/excluded',
        destination: '/:orgSlug/email/lists?tab=excluded',
        permanent: false,
      },
    ];
  },
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `${backendUrl}/:path*`,
      },
    ];
  },
};

export default nextConfig;
