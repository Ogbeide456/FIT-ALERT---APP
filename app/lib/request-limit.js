const buckets = globalThis.fitalertRequestBuckets ?? new Map();
globalThis.fitalertRequestBuckets = buckets;

export function checkRequestLimit(request, name, limit, windowMs) {
  const forwardedFor = request.headers.get("x-forwarded-for");
  const address = request.headers.get("x-real-ip") ?? forwardedFor?.split(",").at(-1)?.trim() ?? "unknown";
  const key = `${name}:${address}`;
  const now = Date.now();
  const current = buckets.get(key);

  if (!current || now >= current.resetAt) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
  } else if (current.count >= limit) {
    return false;
  } else {
    current.count += 1;
  }

  if (buckets.size > 5000) {
    for (const [bucketKey, value] of buckets) {
      if (now >= value.resetAt) buckets.delete(bucketKey);
    }
  }
  return true;
}
