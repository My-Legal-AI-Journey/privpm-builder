/** @type {import('next').NextConfig} */
const isStatic = process.env.STATIC_EXPORT === "1";

const nextConfig = {
  reactStrictMode: true,
  ...(isStatic
    ? {
        output: "export",
        basePath: "/privpm-builder",
        assetPrefix: "/privpm-builder",
        images: { unoptimized: true },
      }
    : {}),
};

export default nextConfig;
