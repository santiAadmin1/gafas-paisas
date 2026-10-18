import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Permite abrir el servidor de desarrollo desde el celular (red local o
  // túnel temporal de Cloudflare).
  allowedDevOrigins: ["10.*.*.*", "192.168.*.*", "*.trycloudflare.com"],
};

export default nextConfig;
