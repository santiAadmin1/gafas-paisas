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
