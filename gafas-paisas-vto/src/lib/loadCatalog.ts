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
 * Procesa un modelo del catálogo: frontal → montura, lateral → pata.
 * Conserva el id/nombre del catálogo (estables) en lugar del nombre de archivo.
 *
 * Limitación conocida (ver CATALOGO.md): las fotos laterales son el PERFIL
 * COMPLETO del producto (2048×768, incluye frente), no un recorte de la pata
 * aislada. El renderizador la ancla desde la bisagra; el frente residual
 * puede notarse en giros fuertes. La extracción/calibración fina de la pata
 * por modelo queda documentada como pendiente.
 */
export async function processCatalogModel(model: CatalogModel): Promise<ProcessedGlasses> {
  const frontFile = await urlToFile(model.frontal, `${model.id}_frontal.png`);
  const base = await processGlassesImage(frontFile);
  const result: ProcessedGlasses = { ...base, id: model.id, name: model.name };

  try {
    const sideFile = await urlToFile(model.lateral, `${model.id}_lateral.png`);
    const side = await processGlassesImage(sideFile);
    result.temple = side.canvas;
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
