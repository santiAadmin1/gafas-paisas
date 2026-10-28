import { getWhatsappBusinessNumber } from "../../../lib/serverConfig.js";

export const dynamic = "force-dynamic";

export function GET() {
  const configured = getWhatsappBusinessNumber() !== null;
  return Response.json(
    {
      status: configured ? "ok" : "degraded",
      checks: { whatsapp: configured ? "configured" : "missing" },
    },
    {
      status: configured ? 200 : 503,
      headers: { "Cache-Control": "no-store" },
    },
  );
}
