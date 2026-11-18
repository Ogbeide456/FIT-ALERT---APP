import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { join } from "node:path";

export const runtime = "nodejs";

const cachePath = join(process.cwd(), "public", "exercise-videos-cache.json");

let memoryCache = null;

function loadCache() {
  if (memoryCache) return memoryCache;
  try {
    if (existsSync(cachePath)) {
      const raw = readFileSync(cachePath, "utf-8");
      memoryCache = JSON.parse(raw);
    } else {
      memoryCache = {};
    }
  } catch (err) {
    console.error("Failed to load exercise-videos-cache.json:", err);
    memoryCache = {};
  }
  return memoryCache;
}

function saveCache(cache) {
  try {
    writeFileSync(cachePath, JSON.stringify(cache, null, 2), "utf-8");
  } catch (err) {
    console.error("Failed to persist exercise-videos-cache.json:", err);
  }
}

export async function GET(request) {
  const url = new URL(request.url);
  const name = (url.searchParams.get("name") || "").trim();
  const id = (url.searchParams.get("id") || "").trim();

  if (!name && !id) {
    return Response.json({ error: "Exercise name or id is required" }, { status: 400 });
  }

  const cacheKey = (name || id).toLowerCase().trim();
  const cache = loadCache();

  // Check cache first
  if (cache[cacheKey]) {
    return Response.json({
      success: true,
      cached: true,
      video: cache[cacheKey],
    }, {
      headers: { "Cache-Control": "public, max-age=86400" },
    });
  }

  // Also try lookup by matching substrings in cached titles
  for (const [key, val] of Object.entries(cache)) {
    if (key.includes(cacheKey) || cacheKey.includes(key)) {
      return Response.json({
        success: true,
        cached: true,
        video: val,
      }, {
        headers: { "Cache-Control": "public, max-age=86400" },
      });
    }
  }

  // Fetch from YouTube Data API v3 if API key is configured
  const apiKey = (process.env.YOUTUBE_API_KEY || "").trim();
  if (!apiKey) {
    return Response.json({
      success: false,
      reason: "YOUTUBE_API_KEY is not configured",
      searchUrl: `https://www.youtube.com/results?search_query=${encodeURIComponent((name || id) + " exercise form tutorial")}`,
    });
  }

  try {
    const query = encodeURIComponent(`${name || id} exercise form tutorial`);
    const ytUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${query}&type=video&maxResults=1&key=${apiKey}`;

    const res = await fetch(ytUrl);
    const data = await res.json();

    if (!res.ok) {
      console.warn("YouTube API error:", data.error?.message || "Unknown error");
      return Response.json({
        success: false,
        reason: data.error?.message || "YouTube API error",
        searchUrl: `https://www.youtube.com/results?search_query=${encodeURIComponent((name || id) + " exercise form tutorial")}`,
      });
    }

    if (data.items && data.items.length > 0) {
      const item = data.items[0];
      const videoRecord = {
        videoId: item.id.videoId,
        title: item.snippet.title,
        channelTitle: item.snippet.channelTitle,
        thumbnail: item.snippet.thumbnails?.high?.url || item.snippet.thumbnails?.medium?.url || item.snippet.thumbnails?.default?.url,
        fetchedAt: new Date().toISOString(),
      };

      // Store in memory & file cache
      cache[cacheKey] = videoRecord;
      saveCache(cache);

      return Response.json({
        success: true,
        cached: false,
        video: videoRecord,
      });
    }

    return Response.json({
      success: false,
      reason: "No videos found",
      searchUrl: `https://www.youtube.com/results?search_query=${encodeURIComponent((name || id) + " exercise form tutorial")}`,
    });
  } catch (error) {
    console.error("YouTube search fetch exception:", error);
    return Response.json({
      success: false,
      reason: error.message || "Network error",
      searchUrl: `https://www.youtube.com/results?search_query=${encodeURIComponent((name || id) + " exercise form tutorial")}`,
    });
  }
}
