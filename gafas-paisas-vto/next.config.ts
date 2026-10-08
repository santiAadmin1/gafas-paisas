import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Permite abrir el servidor de desarrollo desde el celular en la red local.
  allowedDevOrigins: ["10.1.41.191", "10.*.*.*", "192.168.*.*"],
};

export default nextConfig;
