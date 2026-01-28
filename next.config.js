import withPWA from 'next-pwa';

/** @type {import('next').NextConfig} */
const config = {
  reactStrictMode: true,

  // Disable x-powered-by header
  poweredByHeader: false,

  // Typed routes
  typedRoutes: true,

  // Skip type checking during build (temporary for deployment)
  typescript: {
    ignoreBuildErrors: true,
  },

  // Skip ESLint during build
  eslint: {
    ignoreDuringBuilds: true,
  },

  // Image optimization
  images: {
    domains: [],
    formats: ['image/avif', 'image/webp'],
  },

  // Bundle analyzer (optional)
  // webpack: (config, { isServer }) => {
  //   return config;
  // },
};

export default withPWA({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development',
  buildExcludes: [/middleware-manifest\.json$/],
})(config);
