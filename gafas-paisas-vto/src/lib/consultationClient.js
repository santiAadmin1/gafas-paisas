const DEFAULT_TIMEOUT_MS = 8000;

export async function requestConsultation(reference, fetcher = fetch, timeoutMs = DEFAULT_TIMEOUT_MS) {
  const expectedReference = reference.trim();
  const controller = new AbortController();
  let timedOut = false;
  const timer = setTimeout(() => {
    timedOut = true;
    controller.abort();
  }, timeoutMs);
  let response;
  let body;
  try {
    response = await fetcher("/api/consultations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reference }),
      signal: controller.signal,
    });
    body = await response.json().catch((error) => {
      if (timedOut) throw error;
      return null;
    });
  } catch (error) {
    if (timedOut) throw new Error("La consulta tardó demasiado. Revisa tu conexión e intenta de nuevo.");
    throw error;
  } finally {
    clearTimeout(timer);
  }
  if (!response.ok) {
    const message = body && typeof body === "object" && typeof body.error === "string"
      ? body.error
      : "No pudimos preparar la consulta.";
    throw new Error(message);
  }
  if (!body || typeof body !== "object") throw new Error("La respuesta de consulta no es válida.");
  if (body.status !== "ready_to_contact" || typeof body.reference !== "string" || typeof body.whatsappUrl !== "string") {
    throw new Error("La respuesta de consulta no es válida.");
  }
  let url;
  try {
    url = new URL(body.whatsappUrl);
  } catch {
    throw new Error("El canal de consulta recibido no es válido.");
  }
  const message = url.searchParams.get("text");
  if (
    body.reference !== expectedReference
    || url.protocol !== "https:"
    || url.hostname !== "wa.me"
    || !/^\/[1-9]\d{7,14}$/.test(url.pathname)
    || !message?.includes(expectedReference)
  ) {
    throw new Error("El canal de consulta recibido no es válido.");
  }
  return body;
}
