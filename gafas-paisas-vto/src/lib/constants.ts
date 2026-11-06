// Datos de marca y negocio — Gafas Paisas Virtual Try-On

export const BRAND_NAME = "Gafas Paisas";

// Número de WhatsApp Business (formato internacional, sin "+" ni espacios)
export const WHATSAPP_NUMBER = "573042064121";

// Catálogo externo (hoy: carpeta de Drive con las referencias). Cambiar aquí
// cuando exista tienda online / catálogo de WhatsApp Business.
export const CATALOG_URL =
  "https://drive.google.com/drive/folders/1JF5SdGNVkwzYRchjVZN_u6oifwxRNMgg?usp=drive_link";

export const WHATSAPP_INTEREST_MESSAGE =
  "¡Hola Gafas Paisas! 😎 Me las probé en el probador virtual y me encantaron. ¿Cuánto valen y me llegan hoy?";

export const WHATSAPP_GENERIC_MESSAGE =
  "¡Hola Gafas Paisas! 😎 Quiero ver los modelos que tienen disponibles.";

export const MAX_FAVORITES = 5;

/** URL de WhatsApp con un mensaje ya codificado. */
export function buildWhatsAppUrl(message: string): string {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}

/**
 * Mensaje de pedido conservando código y nombre del modelo (lo que la app
 * ya conoce). No inventa precio ni disponibilidad.
 */
export function buildOrderMessage(code: string, name: string): string {
  return `¡Hola Gafas Paisas! 😎 Me probé la ${name} (${code}) en el probador virtual y me encantó. ¿Cuánto vale y me llega hoy?`;
}
