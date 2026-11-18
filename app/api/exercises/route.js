import { readFileSync } from "node:fs";
import { join } from "node:path";

export const runtime = "nodejs";

let cachedExercises = null;

function loadExercises() {
  if (cachedExercises) return cachedExercises;
  try {
    const filePath = join(process.cwd(), "public", "exercises.json");
    const raw = readFileSync(filePath, "utf-8");
    const data = JSON.parse(raw);
    cachedExercises = data.exercises || [];
  } catch (error) {
    console.error("Failed to load RepDB exercises:", error);
    cachedExercises = [];
  }
  return cachedExercises;
}

function formatMuscle(muscle) {
  return muscle
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

export async function GET(request) {
  const exercises = loadExercises();
  const url = new URL(request.url);
  const query = (url.searchParams.get("query") || "").trim().toLowerCase();
  const category = (url.searchParams.get("category") || "").trim().toLowerCase();
  const bodyPart = (url.searchParams.get("bodyPart") || "").trim().toLowerCase();
  const difficulty = (url.searchParams.get("difficulty") || "").trim().toLowerCase();
  const muscle = (url.searchParams.get("muscle") || "").trim().toLowerCase();
  const goal = (url.searchParams.get("goal") || "").trim().toLowerCase();
  const limitValue = Math.min(Math.max(Number(url.searchParams.get("limit") || 24), 1), 100);
  const offsetValue = Math.max(Number(url.searchParams.get("offset") || 0), 0);

  let filtered = exercises;

  if (query) {
    filtered = filtered.filter((e) => {
      const searchable = [
        e.name_en,
        e.description_en,
        e.category,
        e.body_part,
        ...(e.primary_muscles || []),
        ...(e.secondary_muscles || []),
        ...(e.tags || []),
        ...(e.goals || []),
      ]
        .join(" ")
        .toLowerCase();
      return searchable.includes(query);
    });
  }

  if (category) {
    filtered = filtered.filter((e) => e.category === category);
  }
  if (bodyPart) {
    filtered = filtered.filter((e) => e.body_part === bodyPart.replace(/ /g, "_"));
  }
  if (difficulty) {
    filtered = filtered.filter((e) => e.difficulty === difficulty);
  }
  if (muscle) {
    filtered = filtered.filter((e) =>
      [...(e.primary_muscles || []), ...(e.secondary_muscles || [])].some(
        (m) => m.toLowerCase().replace(/_/g, " ").includes(muscle)
      )
    );
  }
  if (goal) {
    filtered = filtered.filter((e) => (e.goals || []).includes(goal));
  }

  const total = filtered.length;
  const paged = filtered.slice(offsetValue, offsetValue + limitValue);

  const items = paged.map((e) => {
    const flat = e.images?.flat || {};
    const imageFile = flat.main || flat.start || flat.peak || null;
    const imageUrl = imageFile
      ? `https://exercise-dataset.com/${imageFile}`
      : null;

    return {
      id: e.id,
      name: e.name_en,
      description: e.description_en,
      category: e.category,
      bodyPart: formatMuscle(e.body_part),
      difficulty: e.difficulty,
      forceType: e.force_type,
      mechanic: e.mechanic,
      primaryMuscles: (e.primary_muscles || []).map(formatMuscle),
      secondaryMuscles: (e.secondary_muscles || []).map(formatMuscle),
      goals: e.goals || [],
      tags: e.tags || [],
      isBodyweight: e.is_bodyweight,
      isUnilateral: e.is_unilateral,
      instructions: e.instructions_en || [],
      tips: e.tips_en || [],
      met: e.met,
      imageUrl,
      youtubeSearchUrl: `https://www.youtube.com/results?search_query=${encodeURIComponent(e.name_en + " exercise tutorial")}`,
    };
  });

  /* Category/filter metadata for the client */
  const meta = {
    categories: [...new Set(exercises.map((e) => e.category))].sort(),
    bodyParts: [...new Set(exercises.map((e) => e.body_part))].sort(),
    difficulties: [...new Set(exercises.map((e) => e.difficulty))].sort(),
    goals: [...new Set(exercises.flatMap((e) => e.goals || []))].sort(),
    totalExercises: exercises.length,
  };

  return Response.json(
    { items, total, offset: offsetValue, limit: limitValue, meta, source: "RepDB" },
    { headers: { "Cache-Control": "public, max-age=3600, stale-while-revalidate=86400" } }
  );
}
