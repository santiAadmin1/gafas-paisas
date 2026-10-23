// Catálogo de monturas — Gafas Paisas Virtual Try-On
// FUENTE ÚNICA DE DATOS del catálogo. No dupliques esta info en JSON aparte.
// Generado desde TANDA 1 - ORGANIZADA (CATALOGO_TANDA1.csv). Para agregar
// un modelo: ver src/../CATALOGO.md.

export type ParConfianza = "alta" | "media" | "baja";

export type CatalogModel = {
  /** Código estable (SKU interno). Nunca cambiar: lo usa el flujo de pedido. */
  id: string;
  name: string;
  tipo: string;
  colorMontura: string;
  colorLente: string;
  /** Ruta pública de la foto frontal (montura). */
  frontal: string;
  /** Ruta pública de la foto lateral (perfil / pata). */
  lateral: string;
  /** Miniatura liviana para la galería (se carga antes de procesar). */
  thumb: string;
  /** Si está activo se muestra en la galería. Los alias quedan inactivos. */
  activo: boolean;
  /** Si es un duplicado visual de otro código, apunta al código "canónico". */
  duplicadoDe?: string;
  /** Confianza del emparejamiento frontal↔pata (clasificación visual). */
  parConfianza: ParConfianza;
  /** Avisos de calidad para el panel interno / documentación. */
  avisos?: string[];
  /**
   * Dónde empieza la pata en la foto lateral (fracción 0–1 del ancho del
   * recorte, desde la izquierda). Solo hace falta cuando el recorte
   * automático no distingue el frente de la pata (pata tan alta como el aro).
   */
  pataInicio?: number;
  /**
   * Ancho total del frente de la montura en mm (de bisagra a bisagra), para
   * mostrarla a tamaño real en el probador. APROXIMADO según el estilo del
   * modelo: reemplazar por la medida real cuando se tenga (suele venir
   * grabada en la pata, p. ej. "52□18 145" → ~2×52 + 18 + ~10 mm de aros).
   */
  anchoMm: number;
};

export const CATALOGO: CatalogModel[] = [
  { id: "GP-01", name: "Wayfarer Negra", tipo: "Wayfarer", colorMontura: "Negro", colorLente: "Verde oliva", frontal: "/catalogo/GP-01_Wayfarer-Negra_frontal.png", lateral: "/catalogo/GP-01_Wayfarer-Negra_lateral.png", thumb: "/catalogo/thumbs/GP-01.jpg", anchoMm: 142, activo: true, parConfianza: "alta" },
  { id: "GP-02", name: "Cat-Eye Chanel", tipo: "Cat-eye", colorMontura: "Negro", colorLente: "Borgoña", frontal: "/catalogo/GP-02_Cat-Eye-Chanel_frontal.png", lateral: "/catalogo/GP-02_Cat-Eye-Chanel_lateral.png", thumb: "/catalogo/thumbs/GP-02.jpg", anchoMm: 140, activo: true, parConfianza: "alta", pataInicio: 0.18 },
  { id: "GP-03", name: "Deportiva Oval Gris", tipo: "Deportiva / Oval", colorMontura: "Gris", colorLente: "Multicolor espejo", frontal: "/catalogo/GP-03_Deportiva-Oval-Gris_frontal.png", lateral: "/catalogo/GP-03_Deportiva-Oval-Gris_lateral.png", thumb: "/catalogo/thumbs/GP-03.jpg", anchoMm: 137, activo: false, parConfianza: "alta", duplicadoDe: "GP-06", avisos: ["Misma gafa que GP-06 (confirmado). Su foto 'frontal' es en ángulo; su lateral es la pata real que usa GP-06."] },
  { id: "GP-04", name: "Deportiva Rect Negra", tipo: "Deportiva / Rectangular", colorMontura: "Negro", colorLente: "Espejo azul-verde", frontal: "/catalogo/GP-04_Deportiva-Rect-Negra_frontal.png", lateral: "/catalogo/GP-04_Deportiva-Rect-Negra_lateral.png", thumb: "/catalogo/thumbs/GP-04.jpg", anchoMm: 142, activo: true, parConfianza: "media", avisos: ["Emparejamiento de pata por verificar visualmente."] },
  { id: "GP-05", name: "Deportiva Shield Roja", tipo: "Deportiva / Shield", colorMontura: "Rojo", colorLente: "Espejo rojo", frontal: "/catalogo/GP-05_Deportiva-Shield-Roja_frontal.png", lateral: "/catalogo/GP-05_Deportiva-Shield-Roja_lateral.png", thumb: "/catalogo/thumbs/GP-05.jpg", anchoMm: 140, activo: true, parConfianza: "media", avisos: ["Emparejamiento de pata por verificar visualmente."] },
  { id: "GP-06", name: "Deportiva Oval Rosa", tipo: "Deportiva / Oval", colorMontura: "Gris-Rosa", colorLente: "Espejo multicolor", frontal: "/catalogo/GP-06_Deportiva-Oval-Rosa_frontal.png", lateral: "/catalogo/GP-03_Deportiva-Oval-Gris_lateral.png", thumb: "/catalogo/thumbs/GP-06.jpg", anchoMm: 137, activo: true, parConfianza: "alta", avisos: ["Usa la lateral de GP-03 (misma gafa); la lateral propia de GP-06 era la Oakley roja de GP-05."] },
  { id: "GP-07", name: "Champagne Cristal", tipo: "Clásica", colorMontura: "Champagne", colorLente: "Café", frontal: "/catalogo/GP-07_Champagne-Cristal_frontal.png", lateral: "/catalogo/GP-07_Champagne-Cristal_lateral.png", thumb: "/catalogo/thumbs/GP-07.jpg", anchoMm: 138, activo: true, parConfianza: "media", avisos: ["Emparejamiento de pata por verificar visualmente."] },
  { id: "GP-08", name: "Octagonal Metálica", tipo: "Octagonal", colorMontura: "Dorado", colorLente: "Verde oliva", frontal: "/catalogo/GP-08_Octagonal-Met-lica_frontal.png", lateral: "/catalogo/GP-08_Octagonal-Met-lica_lateral.png", thumb: "/catalogo/thumbs/GP-08.jpg", anchoMm: 136, activo: true, parConfianza: "media", avisos: ["Emparejamiento de pata por verificar visualmente."] },
  { id: "GP-09", name: "Rimless Ahumada", tipo: "Sin marco", colorMontura: "Dorado", colorLente: "Gradiente ahumado", frontal: "/catalogo/GP-09_Rimless-Ahumada_frontal.png", lateral: "/catalogo/GP-09_Rimless-Ahumada_lateral.png", thumb: "/catalogo/thumbs/GP-09.jpg", anchoMm: 138, activo: true, parConfianza: "media", avisos: ["Emparejamiento de pata por verificar visualmente."] },
  { id: "GP-10", name: "Envolvente Marfil", tipo: "Envolvente / Wrap", colorMontura: "Marfil", colorLente: "Café", frontal: "/catalogo/GP-10_Envolvente-Marfil_frontal.png", lateral: "/catalogo/GP-10_Envolvente-Marfil_lateral.png", thumb: "/catalogo/thumbs/GP-10.jpg", anchoMm: 145, activo: true, parConfianza: "media", avisos: ["Emparejamiento de pata por verificar visualmente."] },
  { id: "GP-11", name: "Rectangular Marfil", tipo: "Rectangular", colorMontura: "Marfil", colorLente: "Café", frontal: "/catalogo/GP-11_Rectangular-Marfil_frontal.png", lateral: "/catalogo/GP-11_Rectangular-Marfil_lateral.png", thumb: "/catalogo/thumbs/GP-11.jpg", anchoMm: 140, activo: true, parConfianza: "baja", avisos: ["Emparejamiento de pata por verificar visualmente."] },
  { id: "GP-12", name: "Oval Dorada Ciruela", tipo: "Oval", colorMontura: "Dorado", colorLente: "Ciruela", frontal: "/catalogo/GP-12_Oval-Dorada-Ciruela_frontal.png", lateral: "/catalogo/GP-12_Oval-Dorada-Ciruela_lateral.png", thumb: "/catalogo/thumbs/GP-12.jpg", anchoMm: 132, activo: true, parConfianza: "baja", avisos: ["Emparejamiento de pata por verificar visualmente."] },
  { id: "GP-13", name: "Oval Dorada Cristales", tipo: "Oval", colorMontura: "Dorado", colorLente: "Ciruela cristal", frontal: "/catalogo/GP-13_Oval-Dorada-Cristales_frontal.png", lateral: "/catalogo/GP-13_Oval-Dorada-Cristales_lateral.png", thumb: "/catalogo/thumbs/GP-13.jpg", anchoMm: 132, activo: false, parConfianza: "baja", duplicadoDe: "GP-12", avisos: ["Emparejamiento de pata por verificar visualmente."] },
  { id: "GP-14", name: "Rectangular Dorada Magenta", tipo: "Rectangular", colorMontura: "Dorado", colorLente: "Magenta degradado", frontal: "/catalogo/GP-14_Rectangular-Dorada-Magenta_frontal.png", lateral: "/catalogo/GP-14_Rectangular-Dorada-Magenta_lateral.png", thumb: "/catalogo/thumbs/GP-14.jpg", anchoMm: 140, activo: true, parConfianza: "baja", avisos: ["Emparejamiento de pata por verificar visualmente."] },
  { id: "GP-15", name: "Transparente Ahumada", tipo: "Rectangular", colorMontura: "Cristal", colorLente: "Ahumado", frontal: "/catalogo/GP-15_Transparente-Ahumada_frontal.png", lateral: "/catalogo/GP-15_Transparente-Ahumada_lateral.png", thumb: "/catalogo/thumbs/GP-15.jpg", anchoMm: 140, activo: true, parConfianza: "baja", avisos: ["Emparejamiento de pata por verificar visualmente."] },
  { id: "GP-16", name: "Cuadrada Cristal", tipo: "Cuadrada", colorMontura: "Cristal/Dorado-Negro", colorLente: "Transparente", frontal: "/catalogo/GP-16_Cuadrada-Cristal_frontal.png", lateral: "/catalogo/GP-16_Cuadrada-Cristal_lateral.png", thumb: "/catalogo/thumbs/GP-16.jpg", anchoMm: 135, activo: true, parConfianza: "baja", avisos: ["Emparejamiento de pata por verificar visualmente."] },
];

/** Modelos visibles en la galería (activos, sin alias). */
export const MODELOS_ACTIVOS: CatalogModel[] = CATALOGO.filter((m) => m.activo);

export function getModel(id: string): CatalogModel | undefined {
  return CATALOGO.find((m) => m.id === id);
}

/**
 * Resuelve un alias a su código canónico para EL PROBADOR (qué imágenes
 * cargar). Devuelve el mismo id si no es alias. El código solicitado debe
 * conservarse por separado en el flujo comercial (ver buildOrder).
 */
export function resolveAlias(id: string): string {
  const seen = new Set<string>();
  let cur = id;
  while (true) {
    const m = getModel(cur);
    if (!m || !m.duplicadoDe || seen.has(cur)) return cur;
    seen.add(cur);
    cur = m.duplicadoDe;
  }
}

/** Modelo canónico (resuelto) para cargar en el probador. */
export function getModelResolved(id: string): CatalogModel | undefined {
  return getModel(resolveAlias(id));
}
