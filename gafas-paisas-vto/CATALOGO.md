# Catálogo de monturas — Gafas Paisas VTO

Guía operativa del catálogo integrado al probador virtual (TANDA 1).

## Fuente única de datos

Todo el catálogo vive en **`src/lib/catalog.ts`**. No hay JSON aparte ni base
de datos: ese archivo es la fuente de verdad. El array `CATALOGO` contiene los
16 modelos `GP-01`…`GP-16`.

Cada modelo (`CatalogModel`):

| Campo | Qué es |
|---|---|
| `id` | Código estable (SKU). **Nunca cambiar**: lo usa el pedido por WhatsApp. |
| `name`, `tipo`, `colorMontura`, `colorLente` | Metadatos visibles / de catálogo. |
| `frontal` | Ruta pública de la foto **frontal** (la montura, plano del frente). |
| `lateral` | Ruta pública de la foto **lateral** (perfil → se usa como pata). |
| `thumb` | Miniatura liviana para la galería. |
| `activo` | Si se muestra en la galería. Los alias quedan en `false`. |
| `duplicadoDe` | Si es duplicado visual de otro, apunta al código canónico. |
| `parConfianza` | `alta` / `media` / `baja`: confianza del emparejamiento frontal↔pata. |
| `avisos` | Notas de calidad para QA interno. |

Las imágenes están en **`public/catalogo/`** (32 PNG: `_frontal` y `_lateral`
por modelo) y **`public/catalogo/thumbs/`** (16 JPG).

## Cómo…

### Agregar un modelo nuevo
1. Deja las fotos en `public/catalogo/` como `GP-XX_Nombre-Slug_frontal.png` y
   `..._lateral.png`, y una miniatura en `public/catalogo/thumbs/GP-XX.jpg`.
2. Agrega una línea al array `CATALOGO` en `src/lib/catalog.ts` con su `id`,
   metadatos y rutas.
3. Corre el chequeo de integridad (abajo).

### Emparejar frontal + pata
La pata se toma del campo `lateral`. El probador usa `frontal` como plano del
frente y `lateral` como textura de la pata (temple). Si el emparejamiento no es
seguro, baja `parConfianza` y deja una nota en `avisos`.

### Activar / desactivar un modelo
Pon `activo: true | false`. Solo los activos aparecen en la galería
(`MODELOS_ACTIVOS`).

### Resolver un alias / duplicado
Marca el duplicado con `activo: false` y `duplicadoDe: "GP-YY"`. El probador
carga las imágenes del **canónico** (`resolveAlias`), pero el flujo comercial
conserva el **código solicitado** (lo que se manda por WhatsApp). Ejemplo vivo:
`GP-13` es alias de `GP-12`.

### Calibrar el calce (escala / posición)
Por ahora el calce es automático (`FRAME_TO_FACE_RATIO` en `arRenderer.ts`) más
el **ajuste manual** del usuario (🔧). No hay calibración por-modelo todavía
(ver limitaciones).

### Correr los chequeos
```bash
node scripts/check-catalog.mjs   # integridad del catálogo (ids, rutas, alias)
npm run lint                     # ESLint
npm run build                    # typecheck + build de producción
```

## Flujo de pedido (WhatsApp)
`buildOrderMessage(code, name)` arma el texto conservando **código + nombre**;
`buildWhatsAppUrl(msg)` lo codifica contra `WHATSAPP_NUMBER` (`573042064121`).
El botón solo abre `wa.me` — **no envía nada automáticamente**. El código que
viaja es el **solicitado** (alias incluido), no el canónico.

## Limitaciones conocidas (pendientes)
- **La foto `lateral` es el perfil completo**, no la pata aislada. El probador
  la usa como textura de temple; puede verse grande o desalineada en algunos
  modelos. Pendiente: extraer/aislar la pata por modelo y calibrar.
- **Emparejamiento frontal↔pata** verificado visualmente solo en parte: 3 en
  `alta`, 6 en `media`, 7 en `baja`. Revisar los `media`/`baja` con producto real.
- **Transparencia de lentes**: la segmentación aproxima lentes tintados/espejo;
  algunos quedan con relleno. Usar el ajuste manual si hace falta.
- **Sin calibración por-modelo** de escala/offset (hoy global + manual).
- **Sin test runner** configurado: validación E2E (cámara + face-tracking) es
  manual (ver README).
