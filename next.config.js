/** @type {import('next').NextConfig} */
const securityHeaders = [
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "X-DNS-Prefetch-Control", value: "on" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=()",
  },
];

const nextConfig = {
  poweredByHeader: false,
  async redirects() {
    // Profile and Settings merged into one Account surface. Fragments survive
    // these redirects, so old deep links still land on the right page.
    return [
      { source: "/dashboard/profile", destination: "/dashboard/account", permanent: false },
      { source: "/dashboard/profile/:path*", destination: "/dashboard/account", permanent: false },
      { source: "/dashboard/settings", destination: "/dashboard/account", permanent: false },
      { source: "/dashboard/settings/:path*", destination: "/dashboard/account", permanent: false },
    ];
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;
