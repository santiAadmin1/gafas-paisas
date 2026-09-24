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
  /**
   * true si la remoción de fondo probablemente falló (quedó casi toda la
   * foto opaca): el recorte no representa solo la montura, así que el
   * ajuste automático puede salir mal. La UI debe avisarle al usuario que
   * use el ajuste manual.
   */
  possiblyUnsegmented: boolean;
};

function colorDistance(r1: number, g1: number, b1: number, r2: number, g2: number, b2: number) {
  return Math.sqrt((r1 - r2) ** 2 + (g1 - g2) ** 2 + (b1 - b2) ** 2);
}

/**
 * Quita el fondo con flood-fill desde los bordes de la imagen: cada píxel
 * se compara con su VECINO ya marcado como fondo (no contra un promedio
 * global), así que sigue degradados/viñetas de fotos de producto en vez de
 * fallar apenas el fondo no es un color plano uniforme. Solo lo que queda
 * conectado al borde se vuelve transparente — el objeto en el centro
 * (la montura) queda intacto aunque tenga tonos oscuros o similares al fondo.
 */
/** Promedio de color muestreado en el borde de la imagen (referencia de fondo). */
function estimateBorderColor(data: Uint8ClampedArray, width: number, height: number) {
  let r = 0,
    g = 0,
    b = 0,
    n = 0;
  const stepX = Math.max(1, Math.floor(width / 40));
  const stepY = Math.max(1, Math.floor(height / 40));
  for (let x = 0; x < width; x += stepX) {
    for (const y of [0, height - 1]) {
      const i = (y * width + x) * 4;
      r += data[i];
      g += data[i + 1];
      b += data[i + 2];
      n++;
    }
  }
  for (let y = 0; y < height; y += stepY) {
    for (const x of [0, width - 1]) {
      const i = (y * width + x) * 4;
      r += data[i];
      g += data[i + 1];
      b += data[i + 2];
      n++;
    }
  }
  return { r: r / n, g: g / n, b: b / n };
}

/**
 * Quita el fondo con flood-fill desde los bordes de la imagen: cada píxel
 * se compara con su VECINO ya marcado como fondo (no contra un promedio
 * global), así que sigue degradados/viñetas de fotos de producto en vez de
 * fallar apenas el fondo no es un color plano uniforme. Solo lo que queda
 * conectado al borde se vuelve transparente — el objeto en el centro
 * (la montura) queda intacto aunque tenga tonos oscuros o similares al fondo.
 *
 * Además de la tolerancia local (vecino a vecino), se exige que el color
 * no se aleje demasiado del color de fondo original (`bgRef`): evita que el
 * flood-fill "se cuele" por una sombra o reflejo suave hasta comerse la
 * propia montura si esta tiene tonos oscuros similares a alguna zona del
 * fondo.
 */
function floodFillBackground(
  data: Uint8ClampedArray,
  width: number,
  height: number,
  localTolerance: number,
  bgRef: { r: number; g: number; b: number },
  globalTolerance: number
) {
  const total = width * height;
  const visited = new Uint8Array(total);
  const queue = new Int32Array(total);
  let qHead = 0;
  let qTail = 0;

  const enqueue = (x: number, y: number) => {
    if (x < 0 || y < 0 || x >= width || y >= height) return;
    const idx = y * width + x;
    if (visited[idx]) return;
    visited[idx] = 1;
    queue[qTail++] = idx;
  };

  for (let x = 0; x < width; x++) {
    enqueue(x, 0);
    enqueue(x, height - 1);
  }
  for (let y = 0; y < height; y++) {
    enqueue(0, y);
    enqueue(width - 1, y);
  }

  while (qHead < qTail) {
    const idx = queue[qHead++];
    const x = idx % width;
    const y = (idx / width) | 0;
    const i = idx * 4;
    data[i + 3] = 0;
    const r = data[i],
      g = data[i + 1],
      b = data[i + 2];

    const neighbors: [number, number][] = [
      [x - 1, y],
      [x + 1, y],
      [x, y - 1],
      [x, y + 1],
    ];
    for (const [nx, ny] of neighbors) {
      if (nx < 0 || ny < 0 || nx >= width || ny >= height) continue;
      const nIdx = ny * width + nx;
      if (visited[nIdx]) continue;
      const ni = nIdx * 4;
      const nr = data[ni],
        ng = data[ni + 1],
        nb = data[ni + 2];
      if (
        colorDistance(r, g, b, nr, ng, nb) < localTolerance &&
        colorDistance(nr, ng, nb, bgRef.r, bgRef.g, bgRef.b) < globalTolerance
      ) {
        visited[nIdx] = 1;
        queue[qTail++] = nIdx;
      }
    }
  }
}

export async function processGlassesImage(file: File): Promise<ProcessedGlasses> {
  // Segmentación real por IA (modelo isnet corriendo en el navegador vía
  // WASM, sin backend): separa la montura del fondo aunque sean del mismo
  // tono (estuches, sombras, texturas) — el chroma-key nunca puede hacer
  // eso. Si falla (sin internet, CDN del modelo caído), seguimos con el
  // flood-fill por color como respaldo para no dejar al usuario sin nada.
  let usedAI = false;
  let workingSrc: string;
  // Si el archivo ya trae transparencia (PNG/WebP recortado de antemano, ej.
  // fotos de catálogo ya editadas), se usa tal cual: la IA tardaría ~30 s y
  // además aplanaría los lentes semitransparentes.
  const alreadyTransparent = await fileHasTransparency(file);
  if (alreadyTransparent) {
    workingSrc = URL.createObjectURL(file);
  } else try {
    const { removeBackground } = await import("@imgly/background-removal");
    const resultBlob = await removeBackground(file, { output: { format: "image/png" } });
    workingSrc = URL.createObjectURL(resultBlob);
    usedAI = true;
  } catch (err) {
    console.error("[glassesProcessor] Falló la remoción de fondo con IA, usando respaldo por color:", err);
    workingSrc = URL.createObjectURL(file);
  }

  const img = await loadImage(workingSrc);
  URL.revokeObjectURL(workingSrc);

  const srcCanvas = document.createElement("canvas");
  srcCanvas.width = img.naturalWidth;
  srcCanvas.height = img.naturalHeight;
  const sctx = srcCanvas.getContext("2d")!;
  sctx.drawImage(img, 0, 0);

  const { width, height } = srcCanvas;
  const imageData = sctx.getImageData(0, 0, width, height);
  const data = imageData.data;

  // Si el fondo ya quedó transparente (por la IA, o porque el archivo ya
  // era un PNG con alpha real), no forzamos chroma-key.
  let hasRealAlpha = usedAI;
  if (!hasRealAlpha) {
    for (let i = 3; i < data.length; i += 4 * 97) {
      if (data[i] < 250) {
        hasRealAlpha = true;
        break;
      }
    }
  }

  let possiblyUnsegmented = false;

  if (usedAI) {
    // La IA trata los lentes de forma inconsistente (a veces borra uno y deja
    // el otro medio opaco). Los rehacemos como vidrio tintado a partir de los
    // colores originales de la foto.
    const orig = await loadImage(URL.createObjectURL(file)).catch(() => null);
    if (orig && orig.naturalWidth === width && orig.naturalHeight === height) {
      const oc = document.createElement("canvas");
      oc.width = width;
      oc.height = height;
      const octx = oc.getContext("2d")!;
      octx.drawImage(orig, 0, 0);
      fillLensHoles(data, octx.getImageData(0, 0, width, height).data, width, height);
    }
    if (orig) URL.revokeObjectURL(orig.src);
  }

  if (!hasRealAlpha) {
    const backup = data.slice();
    const bgRef = estimateBorderColor(data, width, height);
    floodFillBackground(data, width, height, 26, bgRef, 90);

    let kept = 0;
    for (let i = 3; i < data.length; i += 4) if (data[i] > 10) kept++;
    const total = width * height;
    // Si se borró casi todo, probablemente se comió la propia montura:
    // mejor mostrar la foto completa que una gafa invisible.
    if (kept < total * 0.04) {
      data.set(backup);
      possiblyUnsegmented = true;
    } else if (kept > total * 0.92) {
      // Casi nada se removió: el fondo no se pudo diferenciar por color
      // (ej. montura y fondo del mismo tono). El recorte final probablemente
      // sea la foto completa, no solo la montura.
      possiblyUnsegmented = true;
    }
  }

  let minX = width,
    minY = height,
    maxX = 0,
    maxY = 0;
  let found = false;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const alpha = data[(y * width + x) * 4 + 3];
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
    possiblyUnsegmented,
    canvas: out,
    width: cropW,
    height: cropH,
    thumbnail: thumbCanvas.toDataURL("image/png"),
  };
}

/**
 * Rellena los "huecos" encerrados por la montura (los lentes) como vidrio
 * tintado semitransparente. Un hueco = zona no opaca que NO está conectada
 * con el borde de la imagen. El color/alpha del vidrio se obtiene
 * "des-componiendo" el píxel original contra el fondo blanco de la foto:
 * un lente gris oscuro queda casi negro al ~70%, uno degradado claro queda
 * con su tinte y más transparente abajo.
 */
function fillLensHoles(
  data: Uint8ClampedArray,
  orig: Uint8ClampedArray,
  width: number,
  height: number
) {
  const total = width * height;
  const opaque = (idx: number) => data[idx * 4 + 3] > 200;
  const outside = new Uint8Array(total);
  const queue = new Int32Array(total);

  const flood = (seeds: number[], mark: Uint8Array, value: number) => {
    let head = 0,
      tail = 0;
    for (const s of seeds) {
      if (!mark[s] && !opaque(s)) {
        mark[s] = value;
        queue[tail++] = s;
      }
    }
    while (head < tail) {
      const idx = queue[head++];
      const x = idx % width;
      const y = (idx / width) | 0;
      const nbs = [x > 0 ? idx - 1 : -1, x < width - 1 ? idx + 1 : -1, y > 0 ? idx - width : -1, y < height - 1 ? idx + width : -1];
      for (const n of nbs) {
        if (n >= 0 && !mark[n] && !opaque(n)) {
          mark[n] = value;
          queue[tail++] = n;
        }
      }
    }
    return tail;
  };

  const border: number[] = [];
  for (let x = 0; x < width; x++) border.push(x, (height - 1) * width + x);
  for (let y = 0; y < height; y++) border.push(y * width, y * width + width - 1);
  flood(border, outside, 1);

  // Cada componente encerrado de tamaño "de lente" (≥0,5% de la imagen).
  const hole = new Uint8Array(total);
  const minArea = total * 0.005;
  for (let i = 0; i < total; i++) {
    if (outside[i] || hole[i] || opaque(i)) continue;
    const area = flood([i], hole, 1);
    if (area < minArea) {
      // hueco pequeño (ej. entre bisagras): se deja como lo dejó la IA
      for (let k = 0; k < area; k++) hole[queue[k]] = 2;
    }
  }

  for (let i = 0; i < total; i++) {
    if (hole[i] !== 1) continue;
    const p = i * 4;
    const r = orig[p],
      g = orig[p + 1],
      b = orig[p + 2];
    const a = Math.min(0.92, Math.max(0.35, (1 - Math.min(r, g, b) / 255) * 1.1));
    const un = (c: number) => Math.max(0, Math.min(255, (c - 255 * (1 - a)) / a));
    data[p] = un(r);
    data[p + 1] = un(g);
    data[p + 2] = un(b);
    data[p + 3] = Math.round(a * 255);
  }
}

async function fileHasTransparency(file: File): Promise<boolean> {
  if (!/png|webp/i.test(file.type)) return false;
  const src = URL.createObjectURL(file);
  try {
    const img = await loadImage(src);
    const c = document.createElement("canvas");
    // Muestra reducida: basta para saber si hay píxeles transparentes.
    const scale = Math.min(1, 256 / Math.max(img.naturalWidth, img.naturalHeight));
    c.width = Math.max(1, Math.round(img.naturalWidth * scale));
    c.height = Math.max(1, Math.round(img.naturalHeight * scale));
    const ctx = c.getContext("2d")!;
    ctx.drawImage(img, 0, 0, c.width, c.height);
    const d = ctx.getImageData(0, 0, c.width, c.height).data;
    let transparent = 0;
    for (let i = 3; i < d.length; i += 4) if (d[i] < 250) transparent++;
    // Más de un 5% transparente = ya viene recortada.
    return transparent > (d.length / 4) * 0.05;
  } catch {
    return false;
  } finally {
    URL.revokeObjectURL(src);
  }
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
