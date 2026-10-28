This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Probador virtual — Catálogo Gafas Paisas

Esta app es un probador virtual (AR) de gafas. El catálogo de monturas está
integrado desde `src/lib/catalog.ts` (16 referencias, TANDA 1). Ver
**[CATALOGO.md](./CATALOGO.md)** para operar el catálogo (agregar modelos,
emparejar pata, alias, pedido por WhatsApp y limitaciones conocidas).

Chequeos:

```bash
node scripts/check-catalog.mjs   # integridad del catálogo
npm run lint
npm run build                    # typecheck + build
```

> **Validación manual pendiente:** el calce real de las gafas depende de la
> cámara y del face-tracking (MediaPipe), que no se pueden verificar sin
> dispositivo. Probar en `npm run dev` con cámara: selección de modelo, calce,
> cambio entre referencias, ajuste manual (🔧) y botón "Pedir por WhatsApp".

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
