/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  experimental: {
    // Ensure CSS is properly handled in standalone builds
    optimizeCss: true,
  },
};

export default nextConfig;
