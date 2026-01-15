/** @type {import('next').NextConfig} */
const config = {
  reactStrictMode: true,

  // Disable x-powered-by header
  poweredByHeader: false,

  // Typed routes
  typedRoutes: true,

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

export default config;
