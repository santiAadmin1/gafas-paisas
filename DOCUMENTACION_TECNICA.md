# Documento Técnico — Gafas Paisas | Probador Virtual

**Versión:** 0.1.0 (primera entrega — prototipo funcional)
**Fecha:** 2026-09-03
**Marca:** Gafas Paisas (Medellín, Colombia)

---

## 1. Resumen ejecutivo

**Gafas Paisas Virtual Try-On** es una aplicación web que permite a cualquier
persona probarse virtualmente cualquier montura de gafas usando la cámara de
su celular o computador, sin necesidad de instalar nada. El usuario sube una
foto de una montura (de Instagram, un catálogo, una tienda, donde sea), la
app la recorta y superpone en tiempo real sobre su rostro, ajustándose
automáticamente al tamaño y giro de la cabeza. Al final, puede capturar la
foto y enviarla directo por WhatsApp a Gafas Paisas para comprar.

La aplicación **no es una tienda**: no tiene catálogo interno, carrito,
usuarios ni base de datos. Es un puente entre la inspiración (ver una gafa en
redes) y la decisión de compra (probártela y escribir por WhatsApp).

Existen **dos implementaciones equivalentes** del mismo producto:

| Versión | Carpeta | Cuándo usarla |
|---|---|---|
| **Next.js / React** | [`gafas-paisas-vto/`](gafas-paisas-vto/) | Versión de referencia, con build, TypeScript y tooling moderno. Ideal para seguir desarrollando el producto (login, analítica, etc. a futuro). |
| **HTML estático** | [`gafas-paisas-html/`](gafas-paisas-html/) | Un solo archivo `index.html`, sin build ni `npm`. Se sube por FTP o se arrastra a Hostinger / cualquier hosting estático. |

Ambas comparten exactamente la misma lógica de negocio y de AR (es un
puerto directo, línea por línea, de una versión a la otra).

---

## 2. Objetivo y alcance del producto

> "Permitir que una persona pruebe cualquier referencia de gafas antes de
> comprar."

**Incluido en esta primera entrega:**

1. Landing inicial minimalista.
2. Activación de cámara.
3. Vista de cámara estilo smartphone (75% cámara / 25% controles).
4. Botón hacia el catálogo externo (hoy: carpeta de Drive).
5. Botón para subir una gafa (galería, cámara o archivos).
6. Procesamiento de la imagen subida (quitar fondo, recortar silueta).
7. Superposición de la gafa sobre el rostro en tiempo real.
8. Ajuste automático de tamaño/rotación/perspectiva al rostro detectado.
9. Captura de foto.
10. Compartir por WhatsApp con mensaje pre-armado.

**Explícitamente fuera de alcance** (por diseño, según el brief del
producto): pagos, inventario, carrito de compras, cuentas de usuario, base
de datos. Todo el estado vive en memoria del navegador durante la sesión.

**Métrica de éxito objetivo:** tiempo desde que el usuario entra hasta que
hace su primera prueba, menor a 10 segundos.

---

## 3. Flujo de usuario

```
┌──────────────┐     tap "Activar     ┌────────────────────────────┐
│   Landing     │ ───  cámara"  ────▶  │   Pantalla de cámara        │
│  Logo + CTA   │                      │  (video + tracking facial)  │
└──────────────┘                      └──────────────┬───────────────┘
                                                       │
                       ┌───────────────────────────────┼───────────────────────────────┐
                       ▼                               ▼                               ▼
              tap "Buscar gafas"              tap "Subir gafas"                tap "Mis favoritas"
              abre catálogo externo    sube imagen → se procesa y      panel de hasta 5 capturas
              (nueva pestaña)          se superpone sobre el rostro    guardadas, con "Comprar esta"
                                                       │
                                                       ▼
                                          tap "📸" (capturar)
                                                       │
                                                       ▼
                                     Preview de la captura:
                              "Guardar en favoritas" · "Quiero estas gafas 💬"
                                                       │
                                                       ▼
                                     Comparte por WhatsApp (+57 304 206 4121)
                                     con mensaje pre-armado y la foto adjunta
```

Con varias gafas cargadas en la sesión, el usuario navega entre ellas con
"‹ Anterior" / "Siguiente ›" sin volver a subir nada.

---

## 4. Arquitectura técnica

La aplicación se organiza en 6 responsabilidades, tal como se definieron en
el brief de producto. En el código (ambas versiones) cada una vive en un
módulo separado:

| Componente lógico | Responsabilidad | Dónde vive (Next.js) | Dónde vive (HTML) |
|---|---|---|---|
| **CameraEngine** | Acceso a la cámara frontal (`getUserMedia`), streaming de video. | [`CameraStage.tsx`](gafas-paisas-vto/src/components/CameraStage.tsx) | función `initCamera()` en `index.html` |
| **FaceTracker** | Detección de landmarks faciales (478 puntos 3D), en cada frame. | [`useFaceLandmarker.ts`](gafas-paisas-vto/src/hooks/useFaceLandmarker.ts) | función `initTracker()` / `detectFace()` |
| **GlassesProcessor** | Carga la imagen subida, quita el fondo, recorta la silueta. | [`glassesProcessor.ts`](gafas-paisas-vto/src/lib/glassesProcessor.ts) | función `processGlassesImage()` |
| **ARRenderer** | Dibuja la gafa procesada sobre el canvas, alineada a los landmarks. | [`arRenderer.ts`](gafas-paisas-vto/src/lib/arRenderer.ts) | función `drawGlassesOnFace()` |
| **SessionManager** | Biblioteca temporal de gafas cargadas + favoritos (máx. 5), en memoria. | [`useSession.ts`](gafas-paisas-vto/src/hooks/useSession.ts) | objeto `session` + funciones asociadas |
| **ShareController** | Captura de pantalla y envío por WhatsApp (Web Share API + fallback). | [`shareController.ts`](gafas-paisas-vto/src/lib/shareController.ts) | función `shareCaptureToWhatsapp()` |

### 4.1 Pipeline de un frame (loop de render)

```
requestAnimationFrame
   │
   ├─ 1. Redimensiona el canvas overlay al tamaño real en pantalla (con devicePixelRatio)
   ├─ 2. FaceLandmarker.detectForVideo(video, timestamp) → 478 landmarks normalizados (0..1)
   ├─ 3. Si hay rostro Y hay una gafa activa en la sesión:
   │       ├─ Convierte landmarks clave a píxeles de canvas (mapeo "object-fit: cover")
   │       ├─ Calcula distancia interocular, ángulo de inclinación (roll) y un factor
   │       │   de "yaw" (giro) a partir de la asimetría cara-izquierda / cara-derecha
   │       └─ Dibuja la gafa rotada, escalada y con un shear (inclinación) que simula
   │           la perspectiva al girar la cabeza
   └─ 4. Vuelve a pedir el siguiente frame
```

### 4.2 Landmarks faciales usados para anclar la montura

MediaPipe Face Mesh numera 478 puntos. Solo se usan 6 para todo el cálculo:

| Índice | Punto | Uso |
|---|---|---|
| 33 | Esquina externa ojo izquierdo | Escala (distancia interocular) y ángulo |
| 263 | Esquina externa ojo derecho | Escala (distancia interocular) y ángulo |
| 168 | Puente nasal (glabela) | Punto de anclaje donde se centra la montura |
| 234 | Mejilla izquierda | Asimetría facial → efecto de giro (yaw) |
| 454 | Mejilla derecha | Asimetría facial → efecto de giro (yaw) |
| 1 | Punta de la nariz | Referencia central para medir la asimetría |

### 4.3 Decisión de diseño: overlay 2D en vez de Three.js/WebGL

El brief original sugería Three.js + WebGL con una malla 3D completa. Se
optó por un **canvas 2D con transformaciones (rotate + scale + shear)**
en su lugar:

- Con solo 6 landmarks (distancia interocular, ángulo, asimetría L/R) se
  logra un resultado visualmente muy cercano al de un modelo 3D completo,
  para el caso de uso real (probarse gafas de frente o con giros moderados).
- Cero dependencia de WebGL, shaders o carga de meshes: menos superficie de
  fallas, menos peso descargado, más fácil de mantener.
- Es el mismo enfoque que usan la mayoría de probadores virtuales de gafas
  en producción (Zenni, Warby Parker, etc.): un sprite 2D anclado a
  landmarks, no un modelo 3D real de la montura.

**Limitación conocida:** en giros de cabeza muy extremos (más de ~45°) el
efecto de perspectiva (shear) es una aproximación, no una proyección 3D
real. Suficiente para el caso de uso ("me pruebo la gafas de frente y giro
un poco la cabeza"), documentado para una futura iteración si se requiere.

### 4.4 GlassesProcessor: cómo se quita el fondo

No hay backend ni modelo de segmentación por IA (fuera de alcance para este
prototipo). En su lugar, un algoritmo de **chroma-key sobre el color de las
4 esquinas** de la imagen subida:

1. Si la imagen ya tiene transparencia real (PNG con alpha), se respeta tal
   cual.
2. Si no, se promedia el color de las 4 esquinas (asumiendo que ahí está el
   fondo, como en cualquier foto de catálogo con fondo blanco/lo liso).
3. Cada píxel cuya distancia de color al fondo estimado es menor a un
   umbral se vuelve transparente.
4. Se recorta la imagen al bounding-box de los píxeles que quedaron
   visibles (la silueta de la montura), con un pequeño margen.

Funciona bien con la inmensa mayoría de fotos de catálogo (fondo blanco o
de color sólido). No está pensado para fotos con fondos complejos o gafas
puestas sobre un modelo — en ese caso el usuario debería recortar antes.

### 4.5 Cómo se calcula el tamaño y la posición de la gafa

No hay detección real de "dónde están los lentes" dentro de la imagen
subida (no hay ground truth de eso sin IA de segmentación). Se usa una
heurística estándar en la industria:

- El **ancho total de la montura** (recorte completo) se asume equivalente
  a `2.35×` la distancia interocular del usuario (`FRAME_TO_INTEROCULAR_RATIO`
  en el código) — proporción típica de una montura estándar.
- El **punto de anclaje vertical** asume que el puente de la gafa está al
  `42%` de la altura del recorte (`BRIDGE_HEIGHT_FRACTION`) — proporción
  típica también.

Ambas constantes son fácilmente ajustables en el código
(`src/lib/arRenderer.ts` línea ~20, o el bloque equivalente en
`index.html`) si se detecta que sistemáticamente las gafas quedan muy
grandes/pequeñas o muy arriba/abajo.

---

## 5. Stack tecnológico

### Versión Next.js (`gafas-paisas-vto/`)

| Capa | Tecnología | Versión |
|---|---|---|
| Framework | Next.js (App Router, Turbopack) | 16.3.4 |
| UI | React | 19.2.8 |
| Lenguaje | TypeScript | ^5 |
| Estilos | Tailwind CSS v4 (config vía CSS, sin `tailwind.config.js`) | ^4 |
| Animaciones | Framer Motion | ^13 |
| Tracking facial | `@mediapipe/tasks-vision` (`FaceLandmarker`) | ^1.0.1 |
| Fuentes | Google Fonts (Poppins, Dancing Script) vía `<link>` | — |
| Lint | ESLint (config de Next.js) | ^9 |

### Versión HTML estática (`gafas-paisas-html/`)

Un único `index.html` con CSS y JavaScript (ES modules) inline. Sin
`npm`, sin build, sin dependencias instaladas. El único recurso externo es
el propio `@mediapipe/tasks-vision`, cargado en tiempo de ejecución desde
CDN (`jsdelivr`, build `+esm`) — igual que las fuentes de Google.

### Servicios externos usados en tiempo de ejecución (ambas versiones)

| Servicio | Para qué | URL |
|---|---|---|
| MediaPipe (modelo) | Pesos del modelo `face_landmarker` (float16) | `storage.googleapis.com/mediapipe-models/...` |
| MediaPipe (runtime WASM) | Motor de inferencia en el navegador | `cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@1.0.1/wasm` |
| Google Fonts | Poppins + Dancing Script | `fonts.googleapis.com` |
| WhatsApp click-to-chat | Enviar mensaje pre-armado | `wa.me/<número>` |

No hay backend propio: todo corre en el navegador del usuario.

---

## 6. Estructura del repositorio

```
APP  BY CLAUDE/
├── gafas-paisas-vto/                 # Versión Next.js (referencia)
│   ├── src/
│   │   ├── app/
│   │   │   ├── layout.tsx            # <html>, fuentes, metadata
│   │   │   ├── globals.css           # Tokens de marca + Tailwind
│   │   │   └── page.tsx              # Orquesta Landing / CameraStage / modales
│   │   ├── components/
│   │   │   ├── Landing.tsx           # Pantalla 1: logo + CTA
│   │   │   ├── CameraStage.tsx       # CameraEngine + loop de tracking/render
│   │   │   ├── ControlPanel.tsx      # Panel inferior (25%): acciones
│   │   │   ├── CapturePreview.tsx    # Modal post-captura
│   │   │   ├── FavoritesDrawer.tsx   # Modal de favoritas
│   │   │   └── Logo.tsx              # Isotipo SVG reconstruido
│   │   ├── hooks/
│   │   │   ├── useFaceLandmarker.ts  # FaceTracker
│   │   │   └── useSession.ts         # SessionManager
│   │   └── lib/
│   │       ├── constants.ts          # WhatsApp, catálogo, marca
│   │       ├── glassesProcessor.ts   # GlassesProcessor
│   │       ├── arRenderer.ts         # ARRenderer
│   │       └── shareController.ts    # ShareController
│   └── package.json
│
├── gafas-paisas-html/
│   └── index.html                    # Versión estática, todo-en-uno
│
└── DOCUMENTACION_TECNICA.md          # Este documento
```

---

## 7. Configuración de negocio

Todos los valores específicos del negocio están centralizados y son el
único lugar que hay que tocar para actualizarlos:

- **Next.js:** [`src/lib/constants.ts`](gafas-paisas-vto/src/lib/constants.ts)
- **HTML:** bloque `// ---------- Constantes de marca / negocio ----------`
  al inicio del `<script>` en `index.html`

| Constante | Valor actual | Notas |
|---|---|---|
| `WHATSAPP_NUMBER` | `573042064121` (+57 304 206 4121) | Formato internacional sin `+` ni espacios, como lo exige `wa.me`. |
| `CATALOG_URL` | Carpeta de Google Drive provista | Botón "Buscar gafas". Cambiar cuando exista tienda online / catálogo de WhatsApp Business. |
| `WHATSAPP_INTEREST_MESSAGE` | *"Hola Gafas Paisas, probé esta referencia virtualmente y estoy interesado en comprarla."* | Mensaje pre-armado al compartir una captura. |
| `MAX_FAVORITES` | `5` | Límite del panel "Mis favoritas". |

### Identidad de marca

El logo (gafas con el skyline de Medellín recortado dentro de los lentes +
wordmark "Gafas Paisas") se reconstruyó como **SVG vectorial** a partir de
las variantes de marca compartidas en el chat (no se tenía el archivo
fuente en disco). Vive en:

- Next.js: componente [`Logo.tsx`](gafas-paisas-vto/src/components/Logo.tsx), reutilizable con `variant` (`mark` / `full`) y `theme` (`blue` / `white` / `dark`).
- HTML: función `logoSvg()` / `mountLogo()` en `index.html`.

Paleta: azul de marca `#0b5fdb`, negro `#0a0a0f`, blanco. Tipografías:
Poppins (texto general / "PAISAS" en bold) y Dancing Script (el script
"Gafas").

---

## 8. Instalación, desarrollo y despliegue

### Versión Next.js

```bash
cd gafas-paisas-vto
npm install
npm run dev      # http://localhost:3000
```

Build de producción:

```bash
npm run build
npm run start
```

Despliegue recomendado: Vercel (soporte nativo de Next.js) o cualquier
plataforma Node. **Importante:** `getUserMedia` (acceso a cámara) exige
HTTPS en producción — solo `localhost` está exento de esa regla.

### Versión HTML estática

No requiere build. Se sube tal cual (`index.html`) a Hostinger, o
cualquier hosting estático, por FTP o arrastrando el archivo. Para probarla
localmente con un servidor real (recomendado, porque usa `<script
type="module">` e imports que algunos navegadores restringen bajo
`file://`):

```bash
npx http-server gafas-paisas-html -p 3001
```

---

## 9. Limitaciones conocidas y próximos pasos

- **Sin persistencia:** cerrar la pestaña borra la sesión (gafas cargadas y
  favoritas). Es intencional para esta entrega (sin base de datos), pero es
  el primer punto a resolver si se quiere que el usuario vuelva más tarde.
- **Quitado de fondo por chroma-key:** funciona bien con fotos de catálogo
  de fondo liso; no con fondos complejos. Mejora futura: segmentación por
  IA (ej. un modelo tipo `rembg` corriendo en el navegador con ONNX/WASM, o
  un endpoint serverless).
- **Ajuste de la gafa por heurística, no por detección real de los lentes:**
  ver sección 4.5. Funciona bien para monturas de proporciones estándar;
  monturas muy atípicas (redondas extra grandes, de una sola pieza, etc.)
  pueden requerir ajustar las constantes.
- **Compartir a WhatsApp con imagen adjunta** depende de que el navegador
  soporte `navigator.share` con archivos (la mayoría de navegadores móviles
  sí; Safari/desktop antiguos no) — hay un *fallback* automático que
  descarga la imagen y abre el chat de WhatsApp con el texto, para que el
  usuario adjunte manualmente.
- **HTTPS obligatorio en producción** para que el navegador permita acceso
  a la cámara (excepto en `localhost`).

---

## 10. Anexo A — Código fuente completo (versión Next.js)

### `package.json`

```json
{
  "name": "gafas-paisas-vto",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "eslint"
  },
  "dependencies": {
    "@mediapipe/tasks-vision": "^1.0.1",
    "framer-motion": "^13.2.0",
    "next": "16.3.4",
    "react": "19.2.8",
    "react-dom": "19.2.8"
  },
  "devDependencies": {
    "@tailwindcss/postcss": "^4",
    "@types/node": "^20",
    "@types/react": "^19",
    "@types/react-dom": "^19",
    "eslint": "^9",
    "eslint-config-next": "16.3.4",
    "tailwindcss": "^4",
    "typescript": "^5"
  }
}
```

### `src/lib/constants.ts`

```ts
// Datos de marca y negocio — Gafas Paisas Virtual Try-On

export const BRAND_NAME = "Gafas Paisas";

// Número de WhatsApp Business (formato internacional, sin "+" ni espacios)
export const WHATSAPP_NUMBER = "573042064121";

// Catálogo externo (hoy: carpeta de Drive con las referencias). Cambiar aquí
// cuando exista tienda online / catálogo de WhatsApp Business.
export const CATALOG_URL =
  "https://drive.google.com/drive/folders/1JF5SdGNVkwzYRchjVZN_u6oifwxRNMgg?usp=drive_link";

export const WHATSAPP_INTEREST_MESSAGE =
  "Hola Gafas Paisas, probé esta referencia virtualmente y estoy interesado en comprarla.";

export const WHATSAPP_GENERIC_MESSAGE =
  "Hola Gafas Paisas, quiero ver el catálogo de monturas.";

export const MAX_FAVORITES = 5;
```

### `src/lib/glassesProcessor.ts`

```ts
// GlassesProcessor
// Carga una imagen de montura, quita el fondo (chroma-key sobre el color
// de las esquinas, típico en fotos de catálogo con fondo blanco/liso),
// recorta al bounding box de la silueta y calcula los puntos de anclaje
// (centro de lentes) usados por el ARRenderer para ajustar la gafa al rostro.

export type ProcessedGlasses = {
  id: string;
  name: string;
  /** Canvas ya recortado y con fondo transparente. */
  canvas: HTMLCanvasElement;
  /** Ancho "de montura completa" relativo al centro óptico, en fracción del canvas. */
  width: number;
  height: number;
  /** Miniatura para la barra de sesión / favoritos. */
  thumbnail: string;
};

function colorDistance(r1: number, g1: number, b1: number, r2: number, g2: number, b2: number) {
  return Math.sqrt((r1 - r2) ** 2 + (g1 - g2) ** 2 + (b1 - b2) ** 2);
}

export async function processGlassesImage(file: File): Promise<ProcessedGlasses> {
  const imgUrl = URL.createObjectURL(file);
  const img = await loadImage(imgUrl);
  URL.revokeObjectURL(imgUrl);

  const srcCanvas = document.createElement("canvas");
  srcCanvas.width = img.naturalWidth;
  srcCanvas.height = img.naturalHeight;
  const sctx = srcCanvas.getContext("2d")!;
  sctx.drawImage(img, 0, 0);

  const { width, height } = srcCanvas;
  const imageData = sctx.getImageData(0, 0, width, height);
  const data = imageData.data;

  // Color de fondo estimado: promedio de las 4 esquinas.
  const corners = [
    [0, 0],
    [width - 1, 0],
    [0, height - 1],
    [width - 1, height - 1],
  ];
  let br = 0,
    bg = 0,
    bb = 0;
  for (const [x, y] of corners) {
    const i = (y * width + x) * 4;
    br += data[i];
    bg += data[i + 1];
    bb += data[i + 2];
  }
  br /= 4;
  bg /= 4;
  bb /= 4;

  // Si el fondo ya es transparente (PNG con alpha real), no forzamos chroma-key.
  let hasRealAlpha = false;
  for (let i = 3; i < data.length; i += 4 * 97) {
    if (data[i] < 250) {
      hasRealAlpha = true;
      break;
    }
  }

  const threshold = 42;
  let minX = width,
    minY = height,
    maxX = 0,
    maxY = 0;
  let found = false;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const i = (y * width + x) * 4;
      const r = data[i],
        g = data[i + 1],
        b = data[i + 2];
      let alpha = data[i + 3];

      if (!hasRealAlpha) {
        const dist = colorDistance(r, g, b, br, bg, bb);
        if (dist < threshold) {
          alpha = 0;
        }
        data[i + 3] = alpha;
      }

      if (alpha > 10) {
        found = true;
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }
    }
  }

  sctx.putImageData(imageData, 0, 0);

  if (!found) {
    minX = 0;
    minY = 0;
    maxX = width;
    maxY = height;
  }

  const pad = Math.round(Math.max(maxX - minX, maxY - minY) * 0.03);
  minX = Math.max(0, minX - pad);
  minY = Math.max(0, minY - pad);
  maxX = Math.min(width, maxX + pad);
  maxY = Math.min(height, maxY + pad);

  const cropW = Math.max(1, maxX - minX);
  const cropH = Math.max(1, maxY - minY);

  const out = document.createElement("canvas");
  out.width = cropW;
  out.height = cropH;
  out.getContext("2d")!.drawImage(srcCanvas, minX, minY, cropW, cropH, 0, 0, cropW, cropH);

  const thumbCanvas = document.createElement("canvas");
  thumbCanvas.width = 160;
  thumbCanvas.height = Math.round((cropH / cropW) * 160);
  thumbCanvas.getContext("2d")!.drawImage(out, 0, 0, thumbCanvas.width, thumbCanvas.height);

  return {
    id: crypto.randomUUID(),
    name: file.name.replace(/\.[^.]+$/, ""),
    canvas: out,
    width: cropW,
    height: cropH,
    thumbnail: thumbCanvas.toDataURL("image/png"),
  };
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}
```

### `src/lib/arRenderer.ts`

```ts
import type { FaceLandmark } from "@/hooks/useFaceLandmarker";
import type { ProcessedGlasses } from "./glassesProcessor";

// Índices de MediaPipe Face Mesh usados para anclar la montura.
const L_EYE_OUTER = 33;
const R_EYE_OUTER = 263;
const NOSE_BRIDGE = 168;
const L_CHEEK = 234;
const R_CHEEK = 454;
const NOSE_TIP = 1;

// Cuánto más ancha es la montura completa que la distancia interocular
// (medida ojo-exterior a ojo-exterior). Valor típico para monturas estándar.
const FRAME_TO_INTEROCULAR_RATIO = 2.35;
// Fracción de la altura de la imagen de la gafa que queda por ENCIMA del
// puente nasal (anclaje). Las fotos de catálogo suelen centrar el puente
// un poco por encima del centro vertical del recorte.
const BRIDGE_HEIGHT_FRACTION = 0.42;

type Point = { x: number; y: number };

function clamp(v: number, min: number, max: number) {
  return Math.max(min, Math.min(max, v));
}

/**
 * Dibuja la gafa procesada sobre el canvas, alineada a los landmarks
 * faciales detectados en el frame de video actual.
 *
 * `videoNaturalW/H` son las dimensiones reales del stream; el canvas puede
 * tener otro tamaño (se asume que el <video> se muestra con object-fit:
 * cover dentro de esas mismas dimensiones de canvas).
 */
export function drawGlassesOnFace(
  ctx: CanvasRenderingContext2D,
  canvasW: number,
  canvasH: number,
  videoNaturalW: number,
  videoNaturalH: number,
  landmarks: FaceLandmark[],
  glasses: ProcessedGlasses
) {
  const scale = Math.max(canvasW / videoNaturalW, canvasH / videoNaturalH);
  const drawnW = videoNaturalW * scale;
  const drawnH = videoNaturalH * scale;
  const offsetX = (canvasW - drawnW) / 2;
  const offsetY = (canvasH - drawnH) / 2;

  const toPx = (lm: FaceLandmark): Point => ({
    x: offsetX + lm.x * drawnW,
    y: offsetY + lm.y * drawnH,
  });

  const eyeL = toPx(landmarks[L_EYE_OUTER]);
  const eyeR = toPx(landmarks[R_EYE_OUTER]);
  const bridge = toPx(landmarks[NOSE_BRIDGE]);
  const cheekL = toPx(landmarks[L_CHEEK]);
  const cheekR = toPx(landmarks[R_CHEEK]);
  const noseTip = toPx(landmarks[NOSE_TIP]);

  const interocular = Math.hypot(eyeR.x - eyeL.x, eyeR.y - eyeL.y);
  if (!interocular || interocular < 2) return;

  const angle = Math.atan2(eyeR.y - eyeL.y, eyeR.x - eyeL.x);

  // Pseudo-perspectiva: al girar la cabeza, una mitad del rostro se
  // "acorta" respecto a la otra. Usamos esa asimetría para inclinar
  // levemente la gafa (shear) y simular el giro sin un modelo 3D completo.
  const leftHalf = Math.hypot(noseTip.x - cheekL.x, noseTip.y - cheekL.y);
  const rightHalf = Math.hypot(cheekR.x - noseTip.x, cheekR.y - noseTip.y);
  const yaw = clamp((rightHalf - leftHalf) / interocular, -0.6, 0.6);
  const shear = clamp(yaw * 0.35, -0.25, 0.25);
  const widthCompensation = 1 - Math.abs(yaw) * 0.12;

  const frameWidth = interocular * FRAME_TO_INTEROCULAR_RATIO * widthCompensation;
  const glassesScale = frameWidth / glasses.width;
  const drawW = glasses.width * glassesScale;
  const drawH = glasses.height * glassesScale;

  ctx.save();
  ctx.translate(bridge.x, bridge.y);
  ctx.rotate(angle);
  ctx.transform(1, 0, shear, 1, 0, 0);
  ctx.drawImage(glasses.canvas, -drawW / 2, -drawH * BRIDGE_HEIGHT_FRACTION, drawW, drawH);
  ctx.restore();
}
```

### `src/lib/shareController.ts`

```ts
import { WHATSAPP_INTEREST_MESSAGE, WHATSAPP_NUMBER } from "./constants";

function dataUrlToFile(dataUrl: string, filename: string): File {
  const [header, base64] = dataUrl.split(",");
  const mime = header.match(/data:(.*);base64/)?.[1] ?? "image/png";
  const bytes = atob(base64);
  const arr = new Uint8Array(bytes.length);
  for (let i = 0; i < bytes.length; i++) arr[i] = bytes.charCodeAt(i);
  return new File([arr], filename, { type: mime });
}

function whatsappLink(message: string) {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}

/**
 * ShareController: comparte la captura del usuario con la gafa puesta.
 * En móviles con Web Share API (con soporte de archivos) abre la hoja
 * nativa de compartir para que el usuario elija WhatsApp y la imagen
 * viaje adjunta junto al texto. Como respaldo (desktop / navegadores sin
 * soporte), descarga la captura y abre el chat de WhatsApp con el mensaje
 * pre-armado para que el usuario adjunte la imagen manualmente.
 */
export async function shareCaptureToWhatsapp(
  captureDataUrl: string,
  message: string = WHATSAPP_INTEREST_MESSAGE
) {
  const file = dataUrlToFile(captureDataUrl, "gafas-paisas-prueba.png");

  if (
    typeof navigator !== "undefined" &&
    "share" in navigator &&
    "canShare" in navigator &&
    navigator.canShare({ files: [file] })
  ) {
    try {
      await navigator.share({ files: [file], text: message, title: "Gafas Paisas" });
      return { method: "native-share" as const };
    } catch {
      // El usuario canceló o falló: seguimos con el respaldo.
    }
  }

  downloadDataUrl(captureDataUrl, "gafas-paisas-prueba.png");
  window.open(whatsappLink(message), "_blank", "noopener,noreferrer");
  return { method: "download-and-link" as const };
}

export function downloadDataUrl(dataUrl: string, filename: string) {
  const a = document.createElement("a");
  a.href = dataUrl;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
}

export function openCatalogWhatsapp(message: string) {
  window.open(whatsappLink(message), "_blank", "noopener,noreferrer");
}
```

### `src/hooks/useFaceLandmarker.ts`

```ts
"use client";

import { useEffect, useRef, useState } from "react";
import type { FaceLandmarker as FaceLandmarkerType } from "@mediapipe/tasks-vision";

export type FaceLandmark = { x: number; y: number; z: number };
export type FaceResult = { landmarks: FaceLandmark[] } | null;

const WASM_URL = "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@1.0.1/wasm";
const MODEL_URL =
  "https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task";

/**
 * FaceTracker: carga MediaPipe FaceLandmarker (478 landmarks 3D) y expone
 * una función detect() para correr sobre cada frame de video.
 */
export function useFaceLandmarker() {
  const landmarkerRef = useRef<FaceLandmarkerType | null>(null);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const { FaceLandmarker, FilesetResolver } = await import("@mediapipe/tasks-vision");
        const fileset = await FilesetResolver.forVisionTasks(WASM_URL);
        const landmarker = await FaceLandmarker.createFromOptions(fileset, {
          baseOptions: { modelAssetPath: MODEL_URL, delegate: "GPU" },
          runningMode: "VIDEO",
          numFaces: 1,
        });
        if (cancelled) {
          landmarker.close();
          return;
        }
        landmarkerRef.current = landmarker;
        setReady(true);
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : "No se pudo iniciar el tracking facial");
        }
      }
    })();

    return () => {
      cancelled = true;
      landmarkerRef.current?.close();
      landmarkerRef.current = null;
    };
  }, []);

  function detect(video: HTMLVideoElement, timestampMs: number): FaceResult {
    const landmarker = landmarkerRef.current;
    if (!landmarker || video.readyState < 2) return null;
    const result = landmarker.detectForVideo(video, timestampMs);
    if (!result.faceLandmarks || result.faceLandmarks.length === 0) return null;
    return { landmarks: result.faceLandmarks[0] as FaceLandmark[] };
  }

  return { ready, error, detect };
}
```

### `src/hooks/useSession.ts`

```ts
"use client";

import { useCallback, useState } from "react";
import { processGlassesImage, type ProcessedGlasses } from "@/lib/glassesProcessor";
import { MAX_FAVORITES } from "@/lib/constants";

export type Favorite = {
  id: string;
  glassesName: string;
  /** Captura del usuario con la gafa puesta (data URL). */
  capture: string;
};

/**
 * SessionManager: biblioteca temporal de gafas cargadas en la sesión
 * (sin persistencia ni backend) + favoritos (máx. 5).
 */
export function useSession() {
  const [items, setItems] = useState<ProcessedGlasses[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [processing, setProcessing] = useState(false);

  const addGlasses = useCallback(async (file: File) => {
    setProcessing(true);
    try {
      const processed = await processGlassesImage(file);
      setItems((prev) => {
        const next = [...prev, processed];
        setCurrentIndex(next.length - 1);
        return next;
      });
    } finally {
      setProcessing(false);
    }
  }, []);

  const removeCurrent = useCallback(() => {
    setItems((prev) => {
      if (prev.length === 0) return prev;
      const next = prev.filter((_, i) => i !== currentIndex);
      setCurrentIndex((idx) => Math.max(0, Math.min(idx, next.length - 1)));
      return next;
    });
  }, [currentIndex]);

  const next = useCallback(() => {
    setCurrentIndex((i) => (items.length ? (i + 1) % items.length : 0));
  }, [items.length]);

  const prev = useCallback(() => {
    setCurrentIndex((i) => (items.length ? (i - 1 + items.length) % items.length : 0));
  }, [items.length]);

  const addFavorite = useCallback((capture: string, glassesName: string) => {
    setFavorites((prev) => {
      if (prev.length >= MAX_FAVORITES) return prev;
      return [...prev, { id: crypto.randomUUID(), capture, glassesName }];
    });
  }, []);

  const removeFavorite = useCallback((id: string) => {
    setFavorites((prev) => prev.filter((f) => f.id !== id));
  }, []);

  const current = items[currentIndex] ?? null;

  return {
    items,
    current,
    currentIndex,
    processing,
    addGlasses,
    removeCurrent,
    next,
    prev,
    favorites,
    addFavorite,
    removeFavorite,
    favoritesFull: favorites.length >= MAX_FAVORITES,
  };
}
```

### `src/components/Logo.tsx`

```tsx
type LogoProps = {
  /** "mark": solo el icono de gafas con skyline. "full": icono + wordmark. */
  variant?: "mark" | "full";
  /**
   * "blue": chip azul con icono blanco (sobre fondos claros).
   * "white": icono/texto azul, sin relleno (para fondos blancos).
   * "dark": icono/texto blanco, sin relleno (para fondos negros/oscuros).
   */
  theme?: "blue" | "white" | "dark";
  className?: string;
};

/**
 * Logo vectorial de Gafas Paisas: silueta de gafas con el skyline de
 * Medellín recortado dentro de los lentes, más el wordmark en script.
 * Reconstruido en SVG a partir de la identidad de marca provista.
 */
export function Logo({ variant = "full", theme = "dark", className = "" }: LogoProps) {
  const ink = theme === "blue" || theme === "dark" ? "#ffffff" : "#0b5fdb";
  const bg = theme === "blue" ? "#0b5fdb" : "transparent";

  return (
    <div className={`inline-flex items-center gap-3 no-select ${className}`}>
      <svg
        viewBox="0 0 200 100"
        className="h-9 w-auto shrink-0"
        role="img"
        aria-label="Gafas Paisas"
      >
        {bg !== "transparent" && (
          <rect x="0" y="0" width="200" height="100" rx="14" fill={bg} />
        )}
        <clipPath id="lensClip">
          <rect x="8" y="26" width="72" height="50" rx="25" />
          <rect x="120" y="26" width="72" height="50" rx="25" />
        </clipPath>

        {/* Skyline recortado dentro de los lentes */}
        <g clipPath="url(#lensClip)" fill={ink}>
          <rect x="0" y="60" width="200" height="20" />
          <rect x="10" y="50" width="14" height="30" />
          <rect x="28" y="58" width="12" height="22" />
          <rect x="44" y="44" width="16" height="36" />
          <rect x="64" y="56" width="10" height="24" />
          <rect x="86" y="40" width="14" height="40" />
          <rect x="104" y="52" width="12" height="28" />
          <rect x="120" y="60" width="10" height="20" />
          <rect x="134" y="46" width="16" height="34" />
          <rect x="154" y="58" width="12" height="22" />
          <rect x="170" y="38" width="6" height="42" />
          <rect x="167" y="34" width="12" height="6" />
          <rect x="184" y="54" width="12" height="26" />
        </g>

        {/* Montura */}
        <g fill="none" stroke={ink} strokeWidth="7" strokeLinecap="round">
          <rect x="8" y="26" width="72" height="50" rx="25" />
          <rect x="120" y="26" width="72" height="50" rx="25" />
          <path d="M80 46 Q100 36 120 46" />
          <path d="M8 40 L-2 34" />
          <path d="M192 40 L202 34" />
        </g>
      </svg>

      {variant === "full" && (
        <span className="flex flex-col leading-none">
          <span
            className="font-script text-2xl -mb-1"
            style={{ color: ink, fontFamily: "var(--font-script)" }}
          >
            Gafas
          </span>
          <span
            className="font-sans font-extrabold tracking-wide text-lg"
            style={{ color: ink }}
          >
            PAISAS
          </span>
        </span>
      )}
    </div>
  );
}
```

### `src/components/Landing.tsx`

```tsx
"use client";

import { motion } from "framer-motion";
import { Logo } from "./Logo";

export function Landing({ onActivate }: { onActivate: () => void }) {
  return (
    <div className="relative flex min-h-dvh flex-col items-center justify-between overflow-hidden bg-brand-black px-6 py-10 text-center">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_20%,rgba(11,95,219,0.35),transparent_60%)]" />

      <div />

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="relative z-10 flex flex-col items-center gap-6"
      >
        <Logo variant="full" theme="dark" className="scale-125" />
        <p className="max-w-xs text-balance text-lg text-white/80">
          Prueba cómo se ven tus gafas antes de comprarlas
        </p>
      </motion.div>

      <motion.button
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.15, ease: "easeOut" }}
        whileTap={{ scale: 0.96 }}
        onClick={onActivate}
        className="relative z-10 w-full max-w-xs rounded-full bg-brand-blue px-8 py-4 text-base font-semibold tracking-wide text-white shadow-[0_8px_30px_rgba(11,95,219,0.5)] active:brightness-90"
      >
        Activar cámara
      </motion.button>
    </div>
  );
}
```

### `src/components/CameraStage.tsx`

```tsx
"use client";

import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from "react";
import { useFaceLandmarker } from "@/hooks/useFaceLandmarker";
import { drawGlassesOnFace } from "@/lib/arRenderer";
import type { ProcessedGlasses } from "@/lib/glassesProcessor";

export type CameraStageHandle = {
  /** Captura el frame actual (video + gafa) como data URL PNG. */
  capture: () => string | null;
};

type Props = {
  glasses: ProcessedGlasses | null;
  onFaceDetected?: (detected: boolean) => void;
};

/**
 * CameraEngine + ARRenderer: acceso a cámara frontal, tracking facial en
 * vivo y superposición de la montura seleccionada sobre el rostro.
 */
export const CameraStage = forwardRef<CameraStageHandle, Props>(function CameraStage(
  { glasses, onFaceDetected },
  ref
) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const glassesRef = useRef<ProcessedGlasses | null>(glasses);
  const rafRef = useRef<number | null>(null);
  const { ready, error: trackerError, detect } = useFaceLandmarker();
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [faceFound, setFaceFound] = useState(false);

  glassesRef.current = glasses;

  useImperativeHandle(ref, () => ({
    capture: () => {
      const canvas = canvasRef.current;
      const video = videoRef.current;
      if (!canvas || !video) return null;
      const out = document.createElement("canvas");
      out.width = canvas.width;
      out.height = canvas.height;
      const octx = out.getContext("2d")!;
      // Replica el mismo encuadre "cover" espejado que ve el usuario:
      // video + overlay de gafas se dibujan juntos dentro del mismo flip
      // para que ambos queden alineados en la captura final.
      octx.save();
      octx.translate(out.width, 0);
      octx.scale(-1, 1);
      const scale = Math.max(out.width / video.videoWidth, out.height / video.videoHeight);
      const w = video.videoWidth * scale;
      const h = video.videoHeight * scale;
      octx.drawImage(video, (out.width - w) / 2, (out.height - h) / 2, w, h);
      octx.drawImage(canvas, 0, 0, out.width, out.height);
      octx.restore();
      return out.toDataURL("image/png");
    },
  }));

  useEffect(() => {
    let stream: MediaStream | null = null;
    let cancelled = false;

    (async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "user", width: { ideal: 1280 }, height: { ideal: 720 } },
          audio: false,
        });
        if (cancelled || !videoRef.current) return;
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      } catch {
        if (!cancelled) setCameraError("No pudimos acceder a tu cámara. Revisa los permisos del navegador.");
      }
    })();

    return () => {
      cancelled = true;
      stream?.getTracks().forEach((t) => t.stop());
    };
  }, []);

  useEffect(() => {
    if (!ready) return;

    function loop() {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      if (video && canvas && video.readyState >= 2) {
        const rect = canvas.getBoundingClientRect();
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        const w = Math.round(rect.width * dpr);
        const h = Math.round(rect.height * dpr);
        if (canvas.width !== w || canvas.height !== h) {
          canvas.width = w;
          canvas.height = h;
        }
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          const result = detect(video, performance.now());
          const found = !!result;
          setFaceFound((prev) => (prev !== found ? found : prev));
          onFaceDetected?.(found);
          if (result && glassesRef.current) {
            drawGlassesOnFace(
              ctx,
              canvas.width,
              canvas.height,
              video.videoWidth,
              video.videoHeight,
              result.landmarks,
              glassesRef.current
            );
          }
        }
      }
      rafRef.current = requestAnimationFrame(loop);
    }

    rafRef.current = requestAnimationFrame(loop);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready]);

  return (
    <div className="relative h-full w-full overflow-hidden bg-black">
      <div className="absolute inset-0 [transform:scaleX(-1)]">
        <video
          ref={videoRef}
          playsInline
          muted
          className="h-full w-full object-cover"
        />
        <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />
      </div>

      {(cameraError || trackerError) && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/80 p-6 text-center text-sm text-white">
          {cameraError ?? trackerError}
        </div>
      )}

      {!cameraError && !trackerError && !ready && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/40 text-sm text-white/80">
          Cargando tracking facial…
        </div>
      )}

      {!cameraError && !trackerError && ready && !faceFound && (
        <div className="pointer-events-none absolute inset-x-0 top-6 flex justify-center">
          <span className="rounded-full bg-black/50 px-4 py-2 text-xs text-white/90 backdrop-blur">
            Centra tu rostro en la cámara
          </span>
        </div>
      )}
    </div>
  );
});
```

### `src/components/ControlPanel.tsx`

```tsx
"use client";

import { CATALOG_URL } from "@/lib/constants";
import type { ProcessedGlasses } from "@/lib/glassesProcessor";

type Props = {
  items: ProcessedGlasses[];
  current: ProcessedGlasses | null;
  processing: boolean;
  onUpload: (file: File) => void;
  onPrev: () => void;
  onNext: () => void;
  onRemoveCurrent: () => void;
  onCapture: () => void;
  onOpenFavorites: () => void;
  favoritesCount: number;
};

export function ControlPanel({
  items,
  current,
  processing,
  onUpload,
  onPrev,
  onNext,
  onRemoveCurrent,
  onCapture,
  onOpenFavorites,
  favoritesCount,
}: Props) {
  return (
    <div className="flex h-full w-full flex-col justify-between gap-2 bg-brand-black px-4 pb-[max(env(safe-area-inset-bottom),0.75rem)] pt-3 text-white">
      {items.length > 0 && (
        <div className="flex items-center justify-between gap-2 text-xs text-white/70">
          <button
            onClick={onPrev}
            disabled={items.length < 2}
            className="rounded-full bg-white/10 px-3 py-1.5 disabled:opacity-30"
          >
            ‹ Anterior
          </button>
          <div className="flex items-center gap-2 overflow-hidden">
            {current && (
              <img
                src={current.thumbnail}
                alt={current.name}
                className="h-8 w-8 rounded-md border border-white/20 object-contain bg-white/5"
              />
            )}
            <span className="max-w-[9rem] truncate">
              {current ? current.name : "Sin gafas"} · {items.length}{" "}
              {items.length === 1 ? "referencia" : "referencias"}
            </span>
            {current && (
              <button
                onClick={onRemoveCurrent}
                className="text-white/50 underline decoration-dotted"
                aria-label="Eliminar esta referencia de la sesión"
              >
                quitar
              </button>
            )}
          </div>
          <button
            onClick={onNext}
            disabled={items.length < 2}
            className="rounded-full bg-white/10 px-3 py-1.5 disabled:opacity-30"
          >
            Siguiente ›
          </button>
        </div>
      )}

      <div className="grid grid-cols-3 items-center gap-3">
        <a
          href={CATALOG_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="flex flex-col items-center gap-1 rounded-2xl bg-white/10 py-3 text-xs font-medium active:bg-white/20"
        >
          <span aria-hidden className="text-xl">🛍️</span>
          Buscar gafas
        </a>

        <button
          onClick={onCapture}
          disabled={!current}
          className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border-4 border-white bg-brand-blue text-2xl shadow-lg active:scale-95 disabled:opacity-30"
          aria-label="Capturar foto"
        >
          📸
        </button>

        <label className="flex flex-col items-center gap-1 rounded-2xl bg-brand-blue py-3 text-xs font-medium active:brightness-90">
          <span aria-hidden className="text-xl">{processing ? "⏳" : "🕶️"}</span>
          {processing ? "Procesando…" : "Subir gafas"}
          <input
            type="file"
            accept="image/png,image/jpeg,image/webp"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) onUpload(file);
              e.target.value = "";
            }}
          />
        </label>
      </div>

      <button
        onClick={onOpenFavorites}
        className="flex items-center justify-center gap-2 rounded-full bg-white/5 py-2 text-xs text-white/80"
      >
        ⭐ Mis favoritas ({favoritesCount}/5)
      </button>
    </div>
  );
}
```

### `src/components/CapturePreview.tsx`

```tsx
"use client";

import { useState } from "react";
import { shareCaptureToWhatsapp } from "@/lib/shareController";

type Props = {
  captureDataUrl: string;
  glassesName: string;
  onClose: () => void;
  onSaveFavorite: () => void;
  favoritesFull: boolean;
};

export function CapturePreview({
  captureDataUrl,
  glassesName,
  onClose,
  onSaveFavorite,
  favoritesFull,
}: Props) {
  const [sharing, setSharing] = useState(false);

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-black/95 p-4 text-white">
      <div className="flex items-center justify-between pb-3">
        <span className="text-sm font-medium">{glassesName}</span>
        <button onClick={onClose} className="rounded-full bg-white/10 px-3 py-1 text-sm">
          ✕ Cerrar
        </button>
      </div>

      <div className="flex flex-1 items-center justify-center overflow-hidden rounded-2xl bg-black">
        <img src={captureDataUrl} alt="Captura con gafas" className="max-h-full max-w-full object-contain" />
      </div>

      <div className="grid grid-cols-2 gap-3 pt-4">
        <button
          onClick={onSaveFavorite}
          disabled={favoritesFull}
          className="rounded-2xl bg-white/10 py-3 text-sm font-medium disabled:opacity-30"
        >
          ⭐ Guardar en favoritas
        </button>
        <button
          onClick={async () => {
            setSharing(true);
            try {
              await shareCaptureToWhatsapp(captureDataUrl);
            } finally {
              setSharing(false);
            }
          }}
          disabled={sharing}
          className="rounded-2xl bg-brand-blue py-3 text-sm font-semibold disabled:opacity-60"
        >
          {sharing ? "Abriendo…" : "Quiero estas gafas 💬"}
        </button>
      </div>
    </div>
  );
}
```

### `src/components/FavoritesDrawer.tsx`

```tsx
"use client";

import { shareCaptureToWhatsapp } from "@/lib/shareController";
import type { Favorite } from "@/hooks/useSession";

type Props = {
  favorites: Favorite[];
  onClose: () => void;
  onRemove: (id: string) => void;
};

export function FavoritesDrawer({ favorites, onClose, onRemove }: Props) {
  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-black/95 p-4 text-white">
      <div className="flex items-center justify-between pb-4">
        <h2 className="text-base font-semibold">Mis favoritas</h2>
        <button onClick={onClose} className="rounded-full bg-white/10 px-3 py-1 text-sm">
          ✕ Cerrar
        </button>
      </div>

      {favorites.length === 0 ? (
        <p className="flex-1 text-center text-sm text-white/60">
          Aún no guardas ninguna referencia. Captura una foto con tus gafas puestas y
          presiona “Guardar en favoritas”.
        </p>
      ) : (
        <div className="grid flex-1 grid-cols-2 gap-3 overflow-y-auto">
          {favorites.map((fav) => (
            <div key={fav.id} className="flex flex-col gap-2 rounded-2xl bg-white/5 p-2">
              <img
                src={fav.capture}
                alt={fav.glassesName}
                className="aspect-[3/4] w-full rounded-xl object-cover"
              />
              <span className="truncate text-xs text-white/70">{fav.glassesName}</span>
              <button
                onClick={() => shareCaptureToWhatsapp(fav.capture)}
                className="rounded-full bg-brand-blue py-2 text-xs font-semibold"
              >
                Comprar esta
              </button>
              <button
                onClick={() => onRemove(fav.id)}
                className="text-[11px] text-white/50 underline decoration-dotted"
              >
                quitar de favoritas
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
```

### `src/app/page.tsx`

```tsx
"use client";

import { useRef, useState } from "react";
import { Landing } from "@/components/Landing";
import { CameraStage, type CameraStageHandle } from "@/components/CameraStage";
import { ControlPanel } from "@/components/ControlPanel";
import { CapturePreview } from "@/components/CapturePreview";
import { FavoritesDrawer } from "@/components/FavoritesDrawer";
import { Logo } from "@/components/Logo";
import { useSession } from "@/hooks/useSession";

export default function Home() {
  const [cameraActive, setCameraActive] = useState(false);
  const [showFavorites, setShowFavorites] = useState(false);
  const [capture, setCapture] = useState<string | null>(null);
  const stageRef = useRef<CameraStageHandle>(null);

  const session = useSession();

  if (!cameraActive) {
    return <Landing onActivate={() => setCameraActive(true)} />;
  }

  return (
    <div className="flex h-dvh w-full flex-col bg-brand-black">
      <div className="flex items-center justify-center py-2">
        <Logo variant="mark" theme="dark" />
      </div>

      <div className="min-h-0 flex-1">
        <CameraStage ref={stageRef} glasses={session.current} />
      </div>

      <div className="h-[30%] min-h-[210px]">
        <ControlPanel
          items={session.items}
          current={session.current}
          processing={session.processing}
          onUpload={(file) => session.addGlasses(file)}
          onPrev={session.prev}
          onNext={session.next}
          onRemoveCurrent={session.removeCurrent}
          onCapture={() => {
            const dataUrl = stageRef.current?.capture();
            if (dataUrl) setCapture(dataUrl);
          }}
          onOpenFavorites={() => setShowFavorites(true)}
          favoritesCount={session.favorites.length}
        />
      </div>

      {capture && (
        <CapturePreview
          captureDataUrl={capture}
          glassesName={session.current?.name ?? "Gafas Paisas"}
          favoritesFull={session.favoritesFull}
          onClose={() => setCapture(null)}
          onSaveFavorite={() => {
            session.addFavorite(capture, session.current?.name ?? "Gafas Paisas");
            setCapture(null);
          }}
        />
      )}

      {showFavorites && (
        <FavoritesDrawer
          favorites={session.favorites}
          onClose={() => setShowFavorites(false)}
          onRemove={session.removeFavorite}
        />
      )}
    </div>
  );
}
```

### `src/app/layout.tsx`

```tsx
import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Gafas Paisas | Probador Virtual",
  description: "Prueba cómo se ven tus gafas antes de comprarlas.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#050608",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="es" className="h-full antialiased">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800&family=Dancing+Script:wght@600;700&display=swap"
        />
      </head>
      <body className="min-h-full flex flex-col bg-background text-foreground">
        {children}
      </body>
    </html>
  );
}
```

### `src/app/globals.css`

```css
@import "tailwindcss";

:root {
  --background: #050608;
  --foreground: #ffffff;
  --brand-blue: #0b5fdb;
  --brand-blue-dark: #073e94;
  --brand-black: #0a0a0f;
}

@theme inline {
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --color-brand-blue: var(--brand-blue);
  --color-brand-blue-dark: var(--brand-blue-dark);
  --color-brand-black: var(--brand-black);
  --font-sans: "Poppins", Arial, Helvetica, sans-serif;
  --font-script: "Dancing Script", cursive;
}

body {
  background: var(--background);
  color: var(--foreground);
  font-family: var(--font-sans);
  overscroll-behavior: none;
}

/* Evita el menú contextual / selección al usar la app como una cámara */
.no-select {
  -webkit-user-select: none;
  user-select: none;
  -webkit-touch-callout: none;
}
```

---

## 11. Anexo B — Código fuente completo (versión HTML estática)

Archivo único: `gafas-paisas-html/index.html`. Contiene HTML + CSS +
JavaScript (ES module) inline — sin dependencias instaladas, sin build.

```html
<!doctype html>
<html lang="es">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
<title>Gafas Paisas | Probador Virtual</title>
<meta name="description" content="Prueba cómo se ven tus gafas antes de comprarlas." />
<meta name="theme-color" content="#050608" />
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800&family=Dancing+Script:wght@600;700&display=swap" />
<style>
  :root {
    --background: #050608;
    --brand-blue: #0b5fdb;
    --brand-black: #0a0a0f;
    --font-sans: "Poppins", Arial, Helvetica, sans-serif;
    --font-script: "Dancing Script", cursive;
  }
  * { box-sizing: border-box; }
  html, body {
    height: 100%;
    margin: 0;
    background: var(--background);
    color: #fff;
    font-family: var(--font-sans);
    overscroll-behavior: none;
    -webkit-user-select: none;
    user-select: none;
    -webkit-touch-callout: none;
  }
  button, input { font-family: inherit; }
  img { max-width: 100%; }
  [hidden] { display: none !important; }

  /* ---------- Landing ---------- */
  #landing {
    position: relative;
    min-height: 100dvh;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: space-between;
    overflow: hidden;
    background: var(--brand-black);
    padding: 40px 24px;
    text-align: center;
  }
  #landing::before {
    content: "";
    position: absolute;
    inset: 0;
    pointer-events: none;
    background: radial-gradient(circle at 50% 20%, rgba(11,95,219,0.35), transparent 60%);
  }
  .landing-mid {
    position: relative;
    z-index: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 24px;
    opacity: 0;
    transform: translateY(16px);
    animation: fadeUp .6s ease-out forwards;
  }
  .landing-tagline {
    max-width: 320px;
    font-size: 18px;
    color: rgba(255,255,255,0.8);
  }
  #activate-btn {
    position: relative;
    z-index: 1;
    width: 100%;
    max-width: 320px;
    border: none;
    border-radius: 999px;
    background: var(--brand-blue);
    color: #fff;
    padding: 16px 32px;
    font-size: 16px;
    font-weight: 600;
    letter-spacing: 0.02em;
    box-shadow: 0 8px 30px rgba(11,95,219,0.5);
    cursor: pointer;
    opacity: 0;
    transform: translateY(16px);
    animation: fadeUp .6s ease-out .15s forwards;
  }
  #activate-btn:active { filter: brightness(0.9); transform: scale(0.98); }
  @keyframes fadeUp { to { opacity: 1; transform: translateY(0); } }

  /* ---------- Logo ---------- */
  .logo { display: inline-flex; align-items: center; gap: 12px; }
  .logo svg { height: 36px; width: auto; flex-shrink: 0; }
  .logo-words { display: flex; flex-direction: column; line-height: 1; }
  .logo-script { font-family: var(--font-script); font-size: 24px; margin-bottom: -4px; }
  .logo-bold { font-family: var(--font-sans); font-weight: 800; letter-spacing: 0.04em; font-size: 18px; }

  /* ---------- App screen ---------- */
  #app-screen { display: flex; flex-direction: column; height: 100dvh; width: 100%; background: var(--brand-black); }
  #app-header { display: flex; align-items: center; justify-content: center; padding: 8px 0; }
  #camera-stage { position: relative; flex: 1 1 auto; min-height: 0; width: 100%; overflow: hidden; background: #000; }
  #mirror-wrap { position: absolute; inset: 0; transform: scaleX(-1); }
  #video { height: 100%; width: 100%; object-fit: cover; }
  #overlay { position: absolute; inset: 0; height: 100%; width: 100%; }
  .stage-message {
    position: absolute; inset: 0; display: flex; align-items: center; justify-content: center;
    background: rgba(0,0,0,0.8); padding: 24px; text-align: center; font-size: 14px;
  }
  .stage-hint {
    position: absolute; top: 24px; left: 0; right: 0; display: flex; justify-content: center; pointer-events: none;
  }
  .stage-hint span { background: rgba(0,0,0,0.5); backdrop-filter: blur(4px); border-radius: 999px; padding: 8px 16px; font-size: 12px; color: rgba(255,255,255,0.9); }

  #control-panel {
    height: 30%; min-height: 220px; width: 100%;
    display: flex; flex-direction: column; justify-content: space-between; gap: 8px;
    background: var(--brand-black); padding: 12px 16px calc(env(safe-area-inset-bottom, 0px) + 12px);
  }
  #session-row { display: flex; align-items: center; justify-content: space-between; gap: 8px; font-size: 12px; color: rgba(255,255,255,0.7); }
  #session-row button { background: rgba(255,255,255,0.1); border: none; color: #fff; border-radius: 999px; padding: 6px 12px; font-size: 12px; }
  #session-row button:disabled { opacity: 0.3; }
  #session-info { display: flex; align-items: center; gap: 8px; overflow: hidden; }
  #session-info img { height: 32px; width: 32px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.2); object-fit: contain; background: rgba(255,255,255,0.05); }
  #session-info span { max-width: 144px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  #remove-current { color: rgba(255,255,255,0.5); text-decoration: underline dotted; background: none; padding: 0 !important; }

  #main-actions { display: grid; grid-template-columns: 1fr auto 1fr; align-items: center; gap: 12px; }
  .action-btn {
    display: flex; flex-direction: column; align-items: center; gap: 4px;
    border: none; border-radius: 16px; padding: 12px; font-size: 12px; font-weight: 500;
    color: #fff; text-decoration: none; cursor: pointer;
  }
  .action-btn .icon { font-size: 20px; }
  #catalog-btn { background: rgba(255,255,255,0.1); }
  #catalog-btn:active { background: rgba(255,255,255,0.2); }
  #upload-label { background: var(--brand-blue); }
  #upload-label:active { filter: brightness(0.9); }
  #capture-btn {
    margin: 0 auto; display: flex; align-items: center; justify-content: center;
    height: 64px; width: 64px; border-radius: 999px; border: 4px solid #fff;
    background: var(--brand-blue); font-size: 24px; box-shadow: 0 4px 16px rgba(0,0,0,0.4);
    cursor: pointer;
  }
  #capture-btn:active { transform: scale(0.95); }
  #capture-btn:disabled { opacity: 0.3; }

  #favorites-toggle {
    display: flex; align-items: center; justify-content: center; gap: 8px;
    background: rgba(255,255,255,0.05); border: none; color: rgba(255,255,255,0.8);
    border-radius: 999px; padding: 8px; font-size: 12px; cursor: pointer;
  }

  /* ---------- Modals ---------- */
  .modal {
    position: fixed; inset: 0; z-index: 50; display: flex; flex-direction: column;
    background: rgba(0,0,0,0.95); padding: 16px; color: #fff;
  }
  .modal-head { display: flex; align-items: center; justify-content: space-between; padding-bottom: 12px; }
  .modal-close { background: rgba(255,255,255,0.1); border: none; color: #fff; border-radius: 999px; padding: 6px 12px; font-size: 14px; cursor: pointer; }
  #capture-image-wrap { flex: 1; display: flex; align-items: center; justify-content: center; overflow: hidden; border-radius: 16px; background: #000; }
  #capture-image-wrap img { max-height: 100%; max-width: 100%; object-fit: contain; }
  .modal-actions { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; padding-top: 16px; }
  .modal-actions button { border: none; border-radius: 16px; padding: 12px; font-size: 14px; font-weight: 600; cursor: pointer; color: #fff; }
  #save-fav-btn { background: rgba(255,255,255,0.1); font-weight: 500; }
  #save-fav-btn:disabled { opacity: 0.3; }
  #share-wa-btn { background: var(--brand-blue); }
  #share-wa-btn:disabled { opacity: 0.6; }

  #favorites-empty { flex: 1; display: flex; align-items: center; justify-content: center; text-align: center; font-size: 14px; color: rgba(255,255,255,0.6); padding: 0 24px; }
  #favorites-grid { flex: 1; overflow-y: auto; display: grid; grid-template-columns: 1fr 1fr; gap: 12px; align-content: start; }
  .fav-card { display: flex; flex-direction: column; gap: 8px; background: rgba(255,255,255,0.05); border-radius: 16px; padding: 8px; }
  .fav-card img { aspect-ratio: 3/4; width: 100%; border-radius: 12px; object-fit: cover; }
  .fav-card .fav-name { font-size: 12px; color: rgba(255,255,255,0.7); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .fav-card .fav-buy { background: var(--brand-blue); border: none; color: #fff; border-radius: 999px; padding: 8px; font-size: 12px; font-weight: 600; cursor: pointer; }
  .fav-card .fav-remove { background: none; border: none; color: rgba(255,255,255,0.5); text-decoration: underline dotted; font-size: 11px; cursor: pointer; padding: 0; }
</style>
</head>
<body>

<!-- ============ Landing ============ -->
<div id="landing">
  <div></div>
  <div class="landing-mid">
    <div class="logo" id="logo-landing"></div>
    <p class="landing-tagline">Prueba cómo se ven tus gafas antes de comprarlas</p>
  </div>
  <button id="activate-btn">Activar cámara</button>
</div>

<!-- ============ App screen ============ -->
<div id="app-screen" hidden>
  <div id="app-header">
    <div class="logo" id="logo-header"></div>
  </div>

  <div id="camera-stage">
    <div id="mirror-wrap">
      <video id="video" playsinline muted></video>
      <canvas id="overlay"></canvas>
    </div>
    <div id="camera-error" class="stage-message" hidden></div>
    <div id="tracker-loading" class="stage-message">Cargando tracking facial…</div>
    <div id="face-hint" class="stage-hint" hidden><span>Centra tu rostro en la cámara</span></div>
  </div>

  <div id="control-panel">
    <div id="session-row" hidden>
      <button id="prev-btn">‹ Anterior</button>
      <div id="session-info">
        <img id="session-thumb" src="" alt="" hidden />
        <span id="session-label"></span>
        <button id="remove-current">quitar</button>
      </div>
      <button id="next-btn">Siguiente ›</button>
    </div>

    <div id="main-actions">
      <a id="catalog-btn" class="action-btn" href="#" target="_blank" rel="noopener noreferrer">
        <span class="icon">🛍️</span>Buscar gafas
      </a>
      <button id="capture-btn" disabled aria-label="Capturar foto">📸</button>
      <label id="upload-label" class="action-btn">
        <span class="icon" id="upload-icon">🕶️</span>
        <span id="upload-text">Subir gafas</span>
        <input id="file-input" type="file" accept="image/png,image/jpeg,image/webp" hidden />
      </label>
    </div>

    <button id="favorites-toggle">⭐ Mis favoritas (<span id="fav-count">0</span>/5)</button>
  </div>
</div>

<!-- ============ Capture preview modal ============ -->
<div id="capture-modal" class="modal" hidden>
  <div class="modal-head">
    <span id="capture-glasses-name"></span>
    <button class="modal-close" id="close-capture">✕ Cerrar</button>
  </div>
  <div id="capture-image-wrap"><img id="capture-image" src="" alt="Captura con gafas" /></div>
  <div class="modal-actions">
    <button id="save-fav-btn">⭐ Guardar en favoritas</button>
    <button id="share-wa-btn">Quiero estas gafas 💬</button>
  </div>
</div>

<!-- ============ Favorites drawer ============ -->
<div id="favorites-modal" class="modal" hidden>
  <div class="modal-head">
    <h2 style="margin:0;font-size:16px;font-weight:600;">Mis favoritas</h2>
    <button class="modal-close" id="close-favorites">✕ Cerrar</button>
  </div>
  <p id="favorites-empty">Aún no guardas ninguna referencia. Captura una foto con tus gafas puestas y presiona “Guardar en favoritas”.</p>
  <div id="favorites-grid" hidden></div>
</div>

<script type="module">
// ============================================================
// Gafas Paisas — Probador Virtual (versión HTML estática, sin build)
// Puerto directo de la lógica de la versión Next.js del proyecto.
// ============================================================

// ---------- Constantes de marca / negocio ----------
const WHATSAPP_NUMBER = "573042064121";
const CATALOG_URL = "https://drive.google.com/drive/folders/1JF5SdGNVkwzYRchjVZN_u6oifwxRNMgg?usp=drive_link";
const WHATSAPP_INTEREST_MESSAGE = "Hola Gafas Paisas, probé esta referencia virtualmente y estoy interesado en comprarla.";
const MAX_FAVORITES = 5;

document.getElementById("catalog-btn").href = CATALOG_URL;

// ---------- Logo SVG (gafas + skyline Medellín + wordmark) ----------
function logoSvg(ink) {
  return `
  <svg viewBox="0 0 200 100" role="img" aria-label="Gafas Paisas">
    <clipPath id="lensClip"><rect x="8" y="26" width="72" height="50" rx="25"/><rect x="120" y="26" width="72" height="50" rx="25"/></clipPath>
    <g clip-path="url(#lensClip)" fill="${ink}">
      <rect x="0" y="60" width="200" height="20"/><rect x="10" y="50" width="14" height="30"/>
      <rect x="28" y="58" width="12" height="22"/><rect x="44" y="44" width="16" height="36"/>
      <rect x="64" y="56" width="10" height="24"/><rect x="86" y="40" width="14" height="40"/>
      <rect x="104" y="52" width="12" height="28"/><rect x="120" y="60" width="10" height="20"/>
      <rect x="134" y="46" width="16" height="34"/><rect x="154" y="58" width="12" height="22"/>
      <rect x="170" y="38" width="6" height="42"/><rect x="167" y="34" width="12" height="6"/>
      <rect x="184" y="54" width="12" height="26"/>
    </g>
    <g fill="none" stroke="${ink}" stroke-width="7" stroke-linecap="round">
      <rect x="8" y="26" width="72" height="50" rx="25"/><rect x="120" y="26" width="72" height="50" rx="25"/>
      <path d="M80 46 Q100 36 120 46"/><path d="M8 40 L-2 34"/><path d="M192 40 L202 34"/>
    </g>
  </svg>`;
}
function mountLogo(el, { full = true, ink = "#ffffff" } = {}) {
  el.innerHTML = logoSvg(ink) + (full
    ? `<span class="logo-words"><span class="logo-script" style="color:${ink}">Gafas</span><span class="logo-bold" style="color:${ink}">PAISAS</span></span>`
    : "");
}
mountLogo(document.getElementById("logo-landing"), { full: true });
mountLogo(document.getElementById("logo-header"), { full: false });

// ---------- GlassesProcessor: quita fondo + recorta silueta ----------
function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}
function colorDistance(r1,g1,b1,r2,g2,b2){ return Math.sqrt((r1-r2)**2+(g1-g2)**2+(b1-b2)**2); }

async function processGlassesImage(file) {
  const url = URL.createObjectURL(file);
  const img = await loadImage(url);
  URL.revokeObjectURL(url);

  const srcCanvas = document.createElement("canvas");
  srcCanvas.width = img.naturalWidth;
  srcCanvas.height = img.naturalHeight;
  const sctx = srcCanvas.getContext("2d");
  sctx.drawImage(img, 0, 0);

  const { width, height } = srcCanvas;
  const imageData = sctx.getImageData(0, 0, width, height);
  const data = imageData.data;

  const corners = [[0,0],[width-1,0],[0,height-1],[width-1,height-1]];
  let br=0,bg=0,bb=0;
  for (const [x,y] of corners) { const i=(y*width+x)*4; br+=data[i]; bg+=data[i+1]; bb+=data[i+2]; }
  br/=4; bg/=4; bb/=4;

  let hasRealAlpha = false;
  for (let i = 3; i < data.length; i += 4*97) { if (data[i] < 250) { hasRealAlpha = true; break; } }

  const threshold = 42;
  let minX=width, minY=height, maxX=0, maxY=0, found=false;

  for (let y=0; y<height; y++) {
    for (let x=0; x<width; x++) {
      const i=(y*width+x)*4;
      const r=data[i], g=data[i+1], b=data[i+2];
      let alpha = data[i+3];
      if (!hasRealAlpha) {
        if (colorDistance(r,g,b,br,bg,bb) < threshold) alpha = 0;
        data[i+3] = alpha;
      }
      if (alpha > 10) { found = true; if (x<minX)minX=x; if (x>maxX)maxX=x; if (y<minY)minY=y; if (y>maxY)maxY=y; }
    }
  }
  sctx.putImageData(imageData, 0, 0);

  if (!found) { minX=0; minY=0; maxX=width; maxY=height; }
  const pad = Math.round(Math.max(maxX-minX, maxY-minY) * 0.03);
  minX = Math.max(0, minX-pad); minY = Math.max(0, minY-pad);
  maxX = Math.min(width, maxX+pad); maxY = Math.min(height, maxY+pad);
  const cropW = Math.max(1, maxX-minX), cropH = Math.max(1, maxY-minY);

  const out = document.createElement("canvas");
  out.width = cropW; out.height = cropH;
  out.getContext("2d").drawImage(srcCanvas, minX, minY, cropW, cropH, 0, 0, cropW, cropH);

  const thumb = document.createElement("canvas");
  thumb.width = 160; thumb.height = Math.round((cropH/cropW)*160);
  thumb.getContext("2d").drawImage(out, 0, 0, thumb.width, thumb.height);

  return {
    id: crypto.randomUUID(),
    name: file.name.replace(/\.[^.]+$/, ""),
    canvas: out, width: cropW, height: cropH,
    thumbnail: thumb.toDataURL("image/png"),
  };
}

// ---------- FaceTracker: MediaPipe FaceLandmarker ----------
const WASM_URL = "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@1.0.1/wasm";
const MODEL_URL = "https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task";

let landmarker = null;
let trackerReady = false;
let trackerError = null;

async function initTracker() {
  try {
    const { FaceLandmarker, FilesetResolver } = await import("https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@1.0.1/+esm");
    const fileset = await FilesetResolver.forVisionTasks(WASM_URL);
    landmarker = await FaceLandmarker.createFromOptions(fileset, {
      baseOptions: { modelAssetPath: MODEL_URL, delegate: "GPU" },
      runningMode: "VIDEO",
      numFaces: 1,
    });
    trackerReady = true;
    document.getElementById("tracker-loading").hidden = true;
  } catch (e) {
    trackerError = e instanceof Error ? e.message : "No se pudo iniciar el tracking facial";
    const el = document.getElementById("camera-error");
    el.textContent = trackerError;
    el.hidden = false;
    document.getElementById("tracker-loading").hidden = true;
  }
}

function detectFace(video, timestampMs) {
  if (!landmarker || video.readyState < 2) return null;
  const result = landmarker.detectForVideo(video, timestampMs);
  if (!result.faceLandmarks || result.faceLandmarks.length === 0) return null;
  return result.faceLandmarks[0];
}

// ---------- ARRenderer: dibuja la gafa sobre el rostro ----------
const L_EYE_OUTER = 33, R_EYE_OUTER = 263, NOSE_BRIDGE = 168, L_CHEEK = 234, R_CHEEK = 454, NOSE_TIP = 1;
const FRAME_TO_INTEROCULAR_RATIO = 2.35;
const BRIDGE_HEIGHT_FRACTION = 0.42;
function clamp(v, min, max) { return Math.max(min, Math.min(max, v)); }

function drawGlassesOnFace(ctx, canvasW, canvasH, videoW, videoH, landmarks, glasses) {
  const scale = Math.max(canvasW/videoW, canvasH/videoH);
  const drawnW = videoW*scale, drawnH = videoH*scale;
  const offsetX = (canvasW-drawnW)/2, offsetY = (canvasH-drawnH)/2;
  const toPx = (lm) => ({ x: offsetX + lm.x*drawnW, y: offsetY + lm.y*drawnH });

  const eyeL = toPx(landmarks[L_EYE_OUTER]), eyeR = toPx(landmarks[R_EYE_OUTER]);
  const bridge = toPx(landmarks[NOSE_BRIDGE]);
  const cheekL = toPx(landmarks[L_CHEEK]), cheekR = toPx(landmarks[R_CHEEK]);
  const noseTip = toPx(landmarks[NOSE_TIP]);

  const interocular = Math.hypot(eyeR.x-eyeL.x, eyeR.y-eyeL.y);
  if (!interocular || interocular < 2) return;

  const angle = Math.atan2(eyeR.y-eyeL.y, eyeR.x-eyeL.x);
  const leftHalf = Math.hypot(noseTip.x-cheekL.x, noseTip.y-cheekL.y);
  const rightHalf = Math.hypot(cheekR.x-noseTip.x, cheekR.y-noseTip.y);
  const yaw = clamp((rightHalf-leftHalf)/interocular, -0.6, 0.6);
  const shear = clamp(yaw*0.35, -0.25, 0.25);
  const widthCompensation = 1 - Math.abs(yaw)*0.12;

  const frameWidth = interocular * FRAME_TO_INTEROCULAR_RATIO * widthCompensation;
  const glassesScale = frameWidth / glasses.width;
  const drawW = glasses.width*glassesScale, drawH = glasses.height*glassesScale;

  ctx.save();
  ctx.translate(bridge.x, bridge.y);
  ctx.rotate(angle);
  ctx.transform(1, 0, shear, 1, 0, 0);
  ctx.drawImage(glasses.canvas, -drawW/2, -drawH*BRIDGE_HEIGHT_FRACTION, drawW, drawH);
  ctx.restore();
}

// ---------- ShareController ----------
function dataUrlToFile(dataUrl, filename) {
  const [header, base64] = dataUrl.split(",");
  const mime = header.match(/data:(.*);base64/)?.[1] ?? "image/png";
  const bytes = atob(base64);
  const arr = new Uint8Array(bytes.length);
  for (let i = 0; i < bytes.length; i++) arr[i] = bytes.charCodeAt(i);
  return new File([arr], filename, { type: mime });
}
function whatsappLink(message) { return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`; }
function downloadDataUrl(dataUrl, filename) {
  const a = document.createElement("a");
  a.href = dataUrl; a.download = filename;
  document.body.appendChild(a); a.click(); a.remove();
}
async function shareCaptureToWhatsapp(captureDataUrl, message = WHATSAPP_INTEREST_MESSAGE) {
  const file = dataUrlToFile(captureDataUrl, "gafas-paisas-prueba.png");
  if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
    try {
      await navigator.share({ files: [file], text: message, title: "Gafas Paisas" });
      return;
    } catch { /* el usuario canceló: seguimos con el respaldo */ }
  }
  downloadDataUrl(captureDataUrl, "gafas-paisas-prueba.png");
  window.open(whatsappLink(message), "_blank", "noopener,noreferrer");
}

// ---------- SessionManager (estado en memoria, sin backend) ----------
const session = { items: [], currentIndex: 0, favorites: [] };

function currentGlasses() { return session.items[session.currentIndex] ?? null; }

function renderSessionUI() {
  const row = document.getElementById("session-row");
  const has = session.items.length > 0;
  row.hidden = !has;
  document.getElementById("prev-btn").disabled = session.items.length < 2;
  document.getElementById("next-btn").disabled = session.items.length < 2;
  const cur = currentGlasses();
  const thumb = document.getElementById("session-thumb");
  if (cur) { thumb.src = cur.thumbnail; thumb.hidden = false; } else { thumb.hidden = true; }
  document.getElementById("session-label").textContent = cur
    ? `${cur.name} · ${session.items.length} ${session.items.length === 1 ? "referencia" : "referencias"}`
    : "Sin gafas";
  document.getElementById("capture-btn").disabled = !cur;
  document.getElementById("fav-count").textContent = String(session.favorites.length);
}

document.getElementById("prev-btn").addEventListener("click", () => {
  if (!session.items.length) return;
  session.currentIndex = (session.currentIndex - 1 + session.items.length) % session.items.length;
  renderSessionUI();
});
document.getElementById("next-btn").addEventListener("click", () => {
  if (!session.items.length) return;
  session.currentIndex = (session.currentIndex + 1) % session.items.length;
  renderSessionUI();
});
document.getElementById("remove-current").addEventListener("click", () => {
  if (!session.items.length) return;
  session.items.splice(session.currentIndex, 1);
  session.currentIndex = Math.max(0, Math.min(session.currentIndex, session.items.length - 1));
  renderSessionUI();
});

const uploadIcon = document.getElementById("upload-icon");
const uploadText = document.getElementById("upload-text");
document.getElementById("file-input").addEventListener("change", async (e) => {
  const file = e.target.files?.[0];
  e.target.value = "";
  if (!file) return;
  uploadIcon.textContent = "⏳";
  uploadText.textContent = "Procesando…";
  try {
    const processed = await processGlassesImage(file);
    session.items.push(processed);
    session.currentIndex = session.items.length - 1;
    renderSessionUI();
  } finally {
    uploadIcon.textContent = "🕶️";
    uploadText.textContent = "Subir gafas";
  }
});

// ---------- Cámara + loop de tracking/render ----------
const video = document.getElementById("video");
const overlay = document.getElementById("overlay");
const octx = overlay.getContext("2d");
let faceFound = false;

async function initCamera() {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: "user", width: { ideal: 1280 }, height: { ideal: 720 } },
      audio: false,
    });
    video.srcObject = stream;
    await video.play();
  } catch {
    const el = document.getElementById("camera-error");
    el.textContent = "No pudimos acceder a tu cámara. Revisa los permisos del navegador.";
    el.hidden = false;
  }
}

function loop() {
  if (video.readyState >= 2) {
    const rect = overlay.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const w = Math.round(rect.width * dpr), h = Math.round(rect.height * dpr);
    if (overlay.width !== w || overlay.height !== h) { overlay.width = w; overlay.height = h; }
    octx.clearRect(0, 0, overlay.width, overlay.height);

    if (trackerReady) {
      const landmarks = detectFace(video, performance.now());
      const found = !!landmarks;
      if (found !== faceFound) {
        faceFound = found;
        document.getElementById("face-hint").hidden = found;
      }
      const glasses = currentGlasses();
      if (landmarks && glasses) {
        drawGlassesOnFace(octx, overlay.width, overlay.height, video.videoWidth, video.videoHeight, landmarks, glasses);
      }
    }
  }
  requestAnimationFrame(loop);
}

function captureFrame() {
  const out = document.createElement("canvas");
  out.width = overlay.width; out.height = overlay.height;
  const ctx = out.getContext("2d");
  ctx.save();
  ctx.translate(out.width, 0);
  ctx.scale(-1, 1);
  const scale = Math.max(out.width / video.videoWidth, out.height / video.videoHeight);
  const w = video.videoWidth * scale, h = video.videoHeight * scale;
  ctx.drawImage(video, (out.width - w) / 2, (out.height - h) / 2, w, h);
  ctx.drawImage(overlay, 0, 0, out.width, out.height);
  ctx.restore();
  return out.toDataURL("image/png");
}

// ---------- Navegación landing -> app ----------
document.getElementById("activate-btn").addEventListener("click", () => {
  document.getElementById("landing").hidden = true;
  document.getElementById("app-screen").hidden = false;
  initCamera();
  initTracker();
  requestAnimationFrame(loop);
}, { once: true });

// ---------- Captura ----------
document.getElementById("capture-btn").addEventListener("click", () => {
  const glasses = currentGlasses();
  if (!glasses) return;
  const dataUrl = captureFrame();
  document.getElementById("capture-image").src = dataUrl;
  document.getElementById("capture-glasses-name").textContent = glasses.name;
  document.getElementById("save-fav-btn").disabled = session.favorites.length >= MAX_FAVORITES;
  document.getElementById("capture-modal").hidden = false;
});
document.getElementById("close-capture").addEventListener("click", () => {
  document.getElementById("capture-modal").hidden = true;
});
document.getElementById("save-fav-btn").addEventListener("click", () => {
  if (session.favorites.length >= MAX_FAVORITES) return;
  const glasses = currentGlasses();
  session.favorites.push({
    id: crypto.randomUUID(),
    glassesName: glasses ? glasses.name : "Gafas Paisas",
    capture: document.getElementById("capture-image").src,
  });
  renderSessionUI();
  document.getElementById("capture-modal").hidden = true;
});
document.getElementById("share-wa-btn").addEventListener("click", async (e) => {
  const btn = e.currentTarget;
  btn.disabled = true;
  const original = btn.textContent;
  btn.textContent = "Abriendo…";
  try {
    await shareCaptureToWhatsapp(document.getElementById("capture-image").src);
  } finally {
    btn.disabled = false;
    btn.textContent = original;
  }
});

// ---------- Favoritas ----------
function renderFavorites() {
  const grid = document.getElementById("favorites-grid");
  const empty = document.getElementById("favorites-empty");
  if (session.favorites.length === 0) {
    empty.hidden = false; grid.hidden = true; grid.innerHTML = "";
    return;
  }
  empty.hidden = true; grid.hidden = false;
  grid.innerHTML = "";
  for (const fav of session.favorites) {
    const card = document.createElement("div");
    card.className = "fav-card";
    card.innerHTML = `
      <img src="${fav.capture}" alt="${fav.glassesName}" />
      <span class="fav-name">${fav.glassesName}</span>
      <button class="fav-buy">Comprar esta</button>
      <button class="fav-remove">quitar de favoritas</button>
    `;
    card.querySelector(".fav-buy").addEventListener("click", () => shareCaptureToWhatsapp(fav.capture));
    card.querySelector(".fav-remove").addEventListener("click", () => {
      session.favorites = session.favorites.filter((f) => f.id !== fav.id);
      renderSessionUI();
      renderFavorites();
    });
    grid.appendChild(card);
  }
}
document.getElementById("favorites-toggle").addEventListener("click", () => {
  renderFavorites();
  document.getElementById("favorites-modal").hidden = false;
});
document.getElementById("close-favorites").addEventListener("click", () => {
  document.getElementById("favorites-modal").hidden = true;
});
</script>
</body>
</html>
```

---

*Fin del documento.*
