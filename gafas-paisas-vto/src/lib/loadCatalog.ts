"use client";

// Adaptador: convierte un modelo del catálogo estático (rutas en /public)
// en un ProcessedGlasses listo para el ARRenderer, reutilizando el
// procesador de imágenes existente.

import { processGlassesImage, type ProcessedGlasses } from "./glassesProcessor";
import { getModelResolved, type CatalogModel } from "./catalog";

async function urlToFile(url: string, filename: string, type = "image/png"): Promise<File> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`No se pudo cargar ${url} (HTTP ${res.status})`);
  const blob = await res.blob();
  return new File([blob], filename, { type: blob.type || type });
}

/**
 * Las fotos laterales del catálogo son el perfil completo: a la izquierda
 * está el frente (aro + lente vistos de canto, mucho más alto que la pata).
 * Si se usa entera, ese frente aparece como una barra del color del lente
 * pegada a la montura. Se recorta donde termina el frente (la primera caída
 * sostenida de altura), dejando solo la pata con la bisagra a la izquierda.
 * `startOverride` (fracción del ancho) fuerza el corte para los modelos en
 * que la pata es tan alta como el aro.
 */
function cropProfileToTemple(canvas: HTMLCanvasElement, startOverride?: number): HTMLCanvasElement {
  const ctx = canvas.getContext("2d");
  if (!ctx) return canvas;
  const { width, height } = canvas;
  const data = ctx.getImageData(0, 0, width, height).data;

  let x0: number;
  if (startOverride !== undefined) {
    x0 = Math.round(width * Math.max(0, Math.min(0.9, startOverride)));
  } else {
    const colHeight = new Uint32Array(width);
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        if (data[(y * width + x) * 4 + 3] > 128) colHeight[x]++;
      }
    }
    const maxH = colHeight.reduce((m, h) => Math.max(m, h), 0);
    if (maxH === 0) return canvas;

    // El frente es mucho más alto que la pata. Se busca solo en la parte
    // izquierda para no confundirlo con la curva de la punta.
    const threshold = maxH * 0.45;
    let firstFront = -1;
    for (let x = 0; x < width * 0.5; x++) {
      if (colHeight[x] > threshold) {
        firstFront = x;
        break;
      }
    }
    // Ya viene solo la pata (sin frente): se deja igual.
    if (firstFront < 0) return canvas;

    // Fin del frente: la altura cae bajo el umbral y se mantiene baja un
    // tramo (evita cortar en una muesca del aro).
    const minRun = Math.max(3, Math.round(width * 0.02));
    let run = 0;
    let cut = -1;
    for (let x = firstFront; x < width * 0.6; x++) {
      if (colHeight[x] < threshold) {
        if (++run >= minRun) {
          cut = x - run + 1;
          break;
        }
      } else {
        run = 0;
      }
    }
    if (cut < 0) return canvas;
    x0 = cut;
  }

  let minY = height,
    maxY = -1;
  for (let y = 0; y < height; y++) {
    for (let x = x0; x < width; x++) {
      if (data[(y * width + x) * 4 + 3] > 10) {
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
        break;
      }
    }
  }
  if (maxY < minY) return canvas;

  const out = document.createElement("canvas");
  out.width = width - x0;
  out.height = maxY - minY + 1;
  out.getContext("2d")!.drawImage(canvas, x0, minY, out.width, out.height, 0, 0, out.width, out.height);
  return out;
}

/** Carpeta con las imágenes ya procesadas (fondo transparente, recortadas). */
const PREPROCESSED_DIR = "/catalogo/listas";

function loadImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`No se pudo cargar ${url}`));
    img.src = url;
  });
}

function imageToCanvas(img: HTMLImageElement): HTMLCanvasElement {
  const canvas = document.createElement("canvas");
  canvas.width = img.naturalWidth;
  canvas.height = img.naturalHeight;
  canvas.getContext("2d")!.drawImage(img, 0, 0);
  return canvas;
}

/**
 * Versión rápida: usa las imágenes ya procesadas en `public/catalogo/listas`
 * (`<id>_frontal.png` sin fondo y `<id>_pata.png` ya recortada, generadas
 * una vez con `processCatalogModelFromOriginals`), así el dispositivo no
 * corre la IA. Si no existen (modelo nuevo), devuelve null y se procesa
 * desde la foto original.
 */
async function loadPreprocessed(model: CatalogModel): Promise<ProcessedGlasses | null> {
  let front: HTMLImageElement;
  try {
    front = await loadImage(`${PREPROCESSED_DIR}/${model.id}_frontal.png`);
  } catch {
    return null;
  }
  const canvas = imageToCanvas(front);
  const thumb = document.createElement("canvas");
  thumb.width = 160;
  thumb.height = Math.round((canvas.height / canvas.width) * 160);
  thumb.getContext("2d")!.drawImage(canvas, 0, 0, thumb.width, thumb.height);

  const result: ProcessedGlasses = {
    id: model.id,
    name: model.name,
    canvas,
    width: canvas.width,
    height: canvas.height,
    thumbnail: thumb.toDataURL("image/png"),
    possiblyUnsegmented: false,
    frameWidthMm: model.anchoMm,
  };
  if (usesPhotoTemple(model)) {
    try {
      result.temple = imageToCanvas(await loadImage(`${PREPROCESSED_DIR}/${model.id}_pata.png`));
    } catch {
      // Sin pata preprocesada: el ARRenderer dibuja una pata genérica.
    }
  }
  return result;
}

/**
 * La foto lateral solo se usa si de verdad es la pata de esa montura. Con
 * emparejamiento de confianza "baja" (foto de otro producto) es mejor una
 * pata genérica del color de la montura que la pata de otra gafa.
 */
function usesPhotoTemple(model: CatalogModel) {
  return model.parConfianza !== "baja";
}

/**
 * Procesa un modelo del catálogo: usa las imágenes preprocesadas si existen
 * y, si no, procesa las fotos originales en el dispositivo (lento: IA).
 */
export async function processCatalogModel(model: CatalogModel): Promise<ProcessedGlasses> {
  return (await loadPreprocessed(model)) ?? processCatalogModelFromOriginals(model);
}

/**
 * Procesa las fotos originales: frontal → montura, lateral → pata.
 * Conserva el id/nombre del catálogo (estables) en lugar del nombre de archivo.
 *
 * Las fotos laterales son el PERFIL COMPLETO del producto (2048×768, incluye
 * frente); `cropProfileToTemple` le quita el frente antes de usarla como
 * pata. La calibración fina de escala/offset por modelo sigue pendiente
 * (ver CATALOGO.md).
 */
export async function processCatalogModelFromOriginals(model: CatalogModel): Promise<ProcessedGlasses> {
  const frontFile = await urlToFile(model.frontal, `${model.id}_frontal.png`);
  const base = await processGlassesImage(frontFile, { clearLenses: model.lenteClara });
  const result: ProcessedGlasses = { ...base, id: model.id, name: model.name, frameWidthMm: model.anchoMm };
  if (!usesPhotoTemple(model)) return result;

  try {
    const sideFile = await urlToFile(model.lateral, `${model.id}_lateral.png`);
    const side = await processGlassesImage(sideFile);
    result.temple = model.lateralEsPata ? side.canvas : cropProfileToTemple(side.canvas, model.pataInicio);
  } catch (e) {
    // Sin pata: el ARRenderer dibuja una pata genérica del color de la montura.
    console.warn(`[loadCatalog] No se pudo procesar la pata de ${model.id}:`, e);
  }

  return result;
}

/** Carga un modelo por código, resolviendo alias para el probador. */
export async function loadModelById(id: string): Promise<ProcessedGlasses> {
  const model = getModelResolved(id);
  if (!model) throw new Error(`Modelo no encontrado en el catálogo: ${id}`);
  return processCatalogModel(model);
}
