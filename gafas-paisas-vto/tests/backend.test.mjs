import { test, after } from "node:test";
import assert from "node:assert/strict";
import { POST } from "../src/app/api/consultations/route.ts";
import { GET } from "../src/app/api/health/route.ts";
import { requestConsultation } from "../src/lib/consultationClient.js";

const originalNumber = process.env.WHATSAPP_BUSINESS_NUMBER;
after(() => originalNumber === undefined ? delete process.env.WHATSAPP_BUSINESS_NUMBER : process.env.WHATSAPP_BUSINESS_NUMBER = originalNumber);
const request = (body, type = "application/json") => new Request("http://localhost/api/consultations", { method: "POST", headers: { "Content-Type": type }, body });

test("health reports readiness without exposing configuration", async () => {
  delete process.env.WHATSAPP_BUSINESS_NUMBER;
  let response = GET();
  assert.equal(response.status, 503);
  assert.deepEqual(await response.json(), { status: "degraded", checks: { whatsapp: "missing" } });
  process.env.WHATSAPP_BUSINESS_NUMBER = "573000000000";
  response = GET();
  assert.equal(response.status, 200);
  assert.equal(response.headers.get("cache-control"), "no-store");
  const body = await response.json();
  assert.deepEqual(body, { status: "ok", checks: { whatsapp: "configured" } });
  assert.equal(JSON.stringify(body).includes("573000000000"), false);
});

test("consultation trims and safely URL-encodes a reference", async () => {
  process.env.WHATSAPP_BUSINESS_NUMBER = "573000000000";
  const response = await POST(request(JSON.stringify({ reference: "  Montura café & azul? 😎  " })));
  assert.equal(response.status, 200);
  const body = await response.json();
  assert.equal(body.status, "ready_to_contact");
  assert.equal(body.reference, "Montura café & azul? 😎");
  assert.equal(new URL(body.whatsappUrl).pathname, "/573000000000");
  assert.equal(body.orderId, undefined);
});

test("rejects invalid content and payloads", async () => {
  assert.equal((await POST(request("{}", "text/plain"))).status, 415);
  for (const body of ["{", "null", "[]", "{}", '{"reference":3}', '{"reference":"ok","photo":"x"}', ...["", "a".repeat(121), "a\nb", "\ud800"].map(reference => JSON.stringify({ reference }))]) {
    assert.equal((await POST(request(body))).status, 400, body);
  }
});

test("enforces body size using actual bytes", async () => {
  assert.equal((await POST(request('{"reference":"ok"}'.padEnd(1024)))).status, 200);
  assert.equal((await POST(request('{"reference":"ok"}'.padEnd(1025)))).status, 413);
  assert.equal((await POST(new Request("http://localhost/api/consultations", { method: "POST", headers: { "Content-Type": "application/json", "Content-Length": "1" }, body: JSON.stringify({ reference: "é".repeat(600) }) }))).status, 413);
});

test("rejects a body whose declared size exceeds the limit", async () => {
  const response = await POST(new Request("http://localhost/api/consultations", {
    method: "POST",
    headers: { "Content-Type": "application/json", "Content-Length": "1025" },
    body: "{}",
  }));
  assert.equal(response.status, 413);
});

test("cancels an overflowing chunked stream", async () => {
  let cancelled = false;
  const stream = new ReadableStream({ start(c) { c.enqueue(new Uint8Array(600)); c.enqueue(new Uint8Array(600)); }, cancel() { cancelled = true; } });
  const response = await POST(new Request("http://localhost/api/consultations", { method: "POST", headers: { "Content-Type": "application/json" }, body: stream, duplex: "half" }));
  assert.equal(response.status, 413);
  assert.equal(cancelled, true);
});

test("times out a request body that never completes", async () => {
  let cancelled = false;
  const stream = new ReadableStream({ cancel() { cancelled = true; } });
  const response = await POST(new Request("http://localhost/api/consultations", { method: "POST", headers: { "Content-Type": "application/json" }, body: stream, duplex: "half" }));
  assert.equal(response.status, 408);
  assert.equal(cancelled, true);
});

test("fails closed for missing or invalid server configuration", async () => {
  for (const value of [undefined, "", "+573000000000", "invalid", "0123456789", "1234567", "1".repeat(16)]) {
    if (value === undefined) delete process.env.WHATSAPP_BUSINESS_NUMBER; else process.env.WHATSAPP_BUSINESS_NUMBER = value;
    assert.equal((await POST(request('{"reference":"Montura negra"}'))).status, 503);
  }
});

test("client accepts only a valid consultation response", async () => {
  const fetcher = async (url, init) => {
    assert.equal(url, "/api/consultations");
    assert.deepEqual(JSON.parse(init.body), { reference: "Montura azul" });
    return Response.json({
      status: "ready_to_contact",
      reference: "Montura azul",
      whatsappUrl: "https://wa.me/573000000000?text=Consulta%20segura",
    });
  };
  const result = await requestConsultation("Montura azul", fetcher);
  assert.equal(result.reference, "Montura azul");
});

test("client preserves API errors and rejects malformed or foreign links", async () => {
  await assert.rejects(
    requestConsultation("Montura", async () => Response.json({ error: "Canal sin configurar" }, { status: 503 })),
    /Canal sin configurar/,
  );
  for (const body of [
    null,
    {},
    { status: "ready_to_contact", reference: "Montura", whatsappUrl: "https://evil.example/573000000000?text=x" },
    { status: "ready_to_contact", reference: "Montura", whatsappUrl: "http://wa.me/573000000000?text=x" },
    { status: "ready_to_contact", reference: "Montura", whatsappUrl: "https://wa.me/+573000000000?text=x" },
    { status: "ready_to_contact", reference: "Montura", whatsappUrl: "https://wa.me/573000000000" },
  ]) {
    await assert.rejects(requestConsultation("Montura", async () => Response.json(body)), /no es válida|no es válido/);
  }
});

test("client aborts a consultation that exceeds its deadline", async () => {
  let observedSignal;
  const hangingFetcher = async (_url, init) => {
    observedSignal = init.signal;
    return await new Promise((_, reject) => {
      init.signal.addEventListener("abort", () => reject(new DOMException("Aborted", "AbortError")), { once: true });
    });
  };
  await assert.rejects(
    requestConsultation("Montura lenta", hangingFetcher, 20),
    /tardó demasiado/,
  );
  assert.equal(observedSignal.aborted, true);
});

test("client deadline also covers a response body that never completes", async () => {
  let observedSignal;
  const stalledBodyFetcher = async (_url, init) => {
    observedSignal = init.signal;
    let streamController;
    const stream = new ReadableStream({
      start(controller) {
        streamController = controller;
        controller.enqueue(new TextEncoder().encode('{"status":"ready_to_contact"'));
      },
    });
    init.signal.addEventListener("abort", () => {
      streamController.error(new DOMException("Aborted", "AbortError"));
    }, { once: true });
    return new Response(stream, { headers: { "Content-Type": "application/json" } });
  };
  await assert.rejects(
    requestConsultation("Montura lenta", stalledBodyFetcher, 20),
    /tardó demasiado/,
  );
  assert.equal(observedSignal.aborted, true);
});

test("client clears its deadline after a completed response", async () => {
  let signal;
  const result = await requestConsultation("Montura rápida", async (_url, init) => {
    signal = init.signal;
    return Response.json({
      status: "ready_to_contact",
      reference: "Montura rápida",
      whatsappUrl: "https://wa.me/573000000000?text=Consulta",
    });
  }, 20);
  assert.equal(result.reference, "Montura rápida");
  await new Promise((resolve) => setTimeout(resolve, 30));
  assert.equal(signal.aborted, false);
});
