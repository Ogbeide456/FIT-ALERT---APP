import { checkRequestLimit } from "../../lib/request-limit.js";

export const runtime = "nodejs";

export async function POST(request) {
  if (!checkRequestLimit(request, "coach", 10, 60_000)) {
    return Response.json({ error: "Too many coach requests. Please wait a minute and try again." }, { status: 429 });
  }
  const body = await request.text();
  if (new TextEncoder().encode(body).byteLength > 64_000) {
    return Response.json({ error: "The chat request is too large." }, { status: 413 });
  }
  let payload;
  try {
    payload = JSON.parse(body);
  } catch {
    return Response.json({ error: "Request body must be valid JSON." }, { status: 400 });
  }

  const backendUrl = process.env.FITALERT_AI_BACKEND_URL ?? "http://127.0.0.1:8000";
  const backendToken = process.env.FITALERT_BACKEND_TOKEN;
  if (!backendToken) {
    return Response.json({ error: "The AI backend is not configured. Set FITALERT_BACKEND_TOKEN on the Next.js server." }, { status: 503 });
  }
  let upstream;
  try {
    upstream = await fetch(`${backendUrl.replace(/\/$/, "")}/api/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-Fitalert-Backend-Token": backendToken },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(90_000),
      cache: "no-store",
    });
  } catch (error) {
    console.error("Fitalert AI backend request failed:", error);
    return Response.json(
      { error: "The AI coach service is unavailable. Start the Python service and configure its selected AI provider." },
      { status: 503 },
    );
  }

  if (!upstream.ok || !upstream.body) {
    const body = await upstream.text();
    return new Response(body || JSON.stringify({ error: "The AI coach could not complete this request." }), {
      status: upstream.status,
      headers: { "Content-Type": upstream.headers.get("content-type") ?? "application/json" },
    });
  }

  return new Response(upstream.body, {
    status: upstream.status,
    headers: {
      "Content-Type": upstream.headers.get("content-type") ?? "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      "X-Accel-Buffering": "no",
    },
  });
}
