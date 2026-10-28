import { getWhatsappBusinessNumber } from "../../../lib/serverConfig.js";

const MAX_BODY_BYTES = 1024;
const BODY_TIMEOUT_MS = 5000;

function json(body: unknown, status = 200) {
  return Response.json(body, { status, headers: { "Cache-Control": "no-store" } });
}

export async function POST(request: Request) {
  const mediaType = request.headers.get("content-type")?.split(";")[0].trim().toLowerCase();
  if (mediaType !== "application/json") return json({ error: "Envía la consulta como application/json." }, 415);

  const contentLength = request.headers.get("content-length");
  if (contentLength && /^\d+$/.test(contentLength) && Number(contentLength) > MAX_BODY_BYTES) {
    return json({ error: "La consulta supera 1024 bytes." }, 413);
  }

  const reader = request.body?.getReader();
  if (!reader) return json({ error: "La consulta está vacía." }, 400);
  const bytes = new Uint8Array(MAX_BODY_BYTES);
  let size = 0;
  let timedOut = false;
  let timer: ReturnType<typeof setTimeout> | undefined;
  const deadline = new Promise<never>((_, reject) => {
    timer = setTimeout(() => {
      timedOut = true;
      reject(new Error("Body timeout"));
      void reader.cancel().catch(() => {});
    }, BODY_TIMEOUT_MS);
  });

  let input: unknown;
  try {
    while (true) {
      const { done, value } = await Promise.race([reader.read(), deadline]);
      if (done) break;
      if (size + value.byteLength > MAX_BODY_BYTES) {
        void reader.cancel().catch(() => {});
        return json({ error: "La consulta supera 1024 bytes." }, 413);
      }
      bytes.set(value, size);
      size += value.byteLength;
    }
    input = JSON.parse(new TextDecoder("utf-8", { fatal: true }).decode(bytes.subarray(0, size)));
  } catch {
    return timedOut
      ? json({ error: "Se agotó el tiempo para recibir la consulta." }, 408)
      : json({ error: "El cuerpo debe contener JSON válido." }, 400);
  } finally {
    clearTimeout(timer);
    reader.releaseLock();
  }

  if (!input || typeof input !== "object" || Array.isArray(input)) return json({ error: "Se requiere un objeto con reference." }, 400);
  const fields = input as Record<string, unknown>;
  if (Object.keys(fields).some((key) => key !== "reference") || typeof fields.reference !== "string") {
    return json({ error: "Solo se admite el campo reference de texto." }, 400);
  }
  const reference = fields.reference.trim();
  if (!reference || reference.length > 120 || !reference.isWellFormed() || /[\u0000-\u001f\u007f-\u009f]/u.test(reference)) {
    return json({ error: "reference debe tener entre 1 y 120 caracteres válidos, sin caracteres de control." }, 400);
  }

  const number = getWhatsappBusinessNumber();
  if (!number) return json({ error: "El canal de consultas no está configurado." }, 503);
  const message = `Hola Gafas Paisas, probé esta referencia virtualmente y quiero consultar disponibilidad. Referencia: ${reference}`;
  return json({ status: "ready_to_contact", reference, whatsappUrl: `https://wa.me/${number}?text=${encodeURIComponent(message)}` });
}
