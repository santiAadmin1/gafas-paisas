import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Exportación estática: todas las páginas son estáticas, así que `next build`
  // genera HTML/CSS/JS en out/ y se publica tal cual (Netlify u otro hosting).
  output: "export",
  // Sin servidor no hay optimización de imágenes: se sirven tal cual.
  images: { unoptimized: true },
  // Permite abrir el servidor de desarrollo desde el celular (red local o
  // túnel temporal de Cloudflare).
  allowedDevOrigins: ["10.*.*.*", "192.168.*.*", "*.trycloudflare.com"],
};

export default nextConfig;
