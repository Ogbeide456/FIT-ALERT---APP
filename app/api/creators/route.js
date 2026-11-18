import { checkRequestLimit } from "../../lib/request-limit.js";

export const runtime = "nodejs";

export async function GET(request) {
  if (!checkRequestLimit(request, "creators", 20, 60_000)) {
    return Response.json({ error: "Too many creator searches. Please wait a minute and try again." }, { status: 429 });
  }
  const incoming = new URL(request.url);
  const backendUrl = process.env.FITALERT_AI_BACKEND_URL ?? "http://127.0.0.1:8000";
  const backendToken = process.env.FITALERT_BACKEND_TOKEN;
  if (!backendToken) {
    return Response.json({ error: "Creator search is not configured. Set FITALERT_BACKEND_TOKEN on the Next.js server." }, { status: 503 });
  }
  const target = new URL(`${backendUrl.replace(/\/$/, "")}/api/coaches`);
  for (const key of ["query", "category", "pageToken"]) {
    const value = incoming.searchParams.get(key);
    if (value) target.searchParams.set(key, value);
  }

  let upstream;
  try {
    upstream = await fetch(target, {
      cache: "no-store",
      headers: { "X-Fitalert-Backend-Token": backendToken },
      signal: AbortSignal.timeout(20_000),
    });
  } catch (error) {
    console.error("Fitalert creator search failed:", error);
    return Response.json(
      { error: "Creator search is unavailable. Start the Python service and configure a YouTube Data API key." },
      { status: 503 },
    );
  }

  const body = await upstream.text();
  return new Response(body, {
    status: upstream.status,
    headers: { "Content-Type": upstream.headers.get("content-type") ?? "application/json" },
  });
}
