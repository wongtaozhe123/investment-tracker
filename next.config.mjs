const withPWA = (await import("next-pwa")).default;

/** @type {import('next').NextConfig} */
const nextConfig = withPWA({
  dest: "public",
})(
  {
    reactStrictMode: true,
  }
);

export default nextConfig;