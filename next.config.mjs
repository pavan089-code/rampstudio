/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    qualities: [75, 86, 90],
    remotePatterns: [{ protocol: "https", hostname: "ik.imagekit.io", pathname: "/ramp/**" }],
  },
};

export default nextConfig;
