import { readFileSync } from "node:fs";
import { join } from "node:path";

export const runtime = "nodejs";

let cachedPlans = null;

function loadPlans() {
  if (cachedPlans) return cachedPlans;
  try {
    const filePath = join(process.cwd(), "public", "workout-plans.json");
    const raw = readFileSync(filePath, "utf-8");
    cachedPlans = JSON.parse(raw);
  } catch (error) {
    console.error("Failed to load workout-plans.json:", error);
    cachedPlans = { plans: [] };
  }
  return cachedPlans;
}

export async function GET(request) {
  const data = loadPlans();
  const url = new URL(request.url);
  const category = (url.searchParams.get("category") || "").trim().toLowerCase();
  const level = (url.searchParams.get("level") || "").trim().toLowerCase();

  let plans = data.plans || [];

  if (category) {
    plans = plans.filter((p) => (p.category || "").toLowerCase() === category);
  }
  if (level) {
    plans = plans.filter((p) => (p.level || "").toLowerCase().includes(level));
  }

  return Response.json(
    { plans, total: plans.length, source: data.source },
    { headers: { "Cache-Control": "public, max-age=3600, stale-while-revalidate=86400" } }
  );
}
