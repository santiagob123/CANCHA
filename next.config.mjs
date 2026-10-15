/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [{ protocol: "https", hostname: "media.api-sports.io", pathname: "/football/**" }],
  },
  // Set CANCHA_USE_WASM=1 only in environments where native SWC cannot access the workspace.
  experimental: { useWasmBinary: process.env.CANCHA_USE_WASM === "1" },
};

export default nextConfig;
