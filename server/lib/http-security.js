const rateLimitBuckets = new Map();
const maxRateLimitBuckets = 10000;
const defaultAllowedOrigins = new Set([
  "https://allavostra.com",
  "https://www.allavostra.com",
  "http://localhost:8081",
  "http://localhost:19006",
]);

function setCorsHeaders(request, response) {
  const origin = String(request.headers?.origin || "").trim();
  const configuredOrigins = String(process.env.CORS_ALLOWED_ORIGINS || "")
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean);
  const allowedOrigins = new Set([
    ...defaultAllowedOrigins,
    ...configuredOrigins,
  ]);

  response.setHeader("Access-Control-Allow-Headers", "Content-Type");
  response.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  response.setHeader("Vary", "Origin");

  if (origin && allowedOrigins.has(origin)) {
    response.setHeader("Access-Control-Allow-Origin", origin);
  }
}

function enforceRateLimit(
  request,
  response,
  { keyPrefix, limit, windowMs },
) {
  const now = Date.now();
  const clientIp = getClientIp(request);
  const key = `${keyPrefix}:${clientIp}`;
  let bucket = rateLimitBuckets.get(key);

  if (!bucket || bucket.resetAt <= now) {
    bucket = { count: 0, resetAt: now + windowMs };
  }

  bucket.count += 1;
  rateLimitBuckets.set(key, bucket);
  pruneRateLimitBuckets(now);

  const remaining = Math.max(0, limit - bucket.count);
  response.setHeader("RateLimit-Limit", String(limit));
  response.setHeader("RateLimit-Remaining", String(remaining));
  response.setHeader("RateLimit-Reset", String(Math.ceil(bucket.resetAt / 1000)));

  if (bucket.count <= limit) {
    return true;
  }

  response.setHeader(
    "Retry-After",
    String(Math.max(1, Math.ceil((bucket.resetAt - now) / 1000))),
  );
  response.status(429).json({
    error: "Too many requests. Please wait and try again.",
  });
  return false;
}

function getClientIp(request) {
  const forwardedFor = String(request.headers?.["x-forwarded-for"] || "")
    .split(",")[0]
    .trim();

  return (
    forwardedFor ||
    String(request.headers?.["x-real-ip"] || "").trim() ||
    String(request.socket?.remoteAddress || "unknown")
  );
}

function pruneRateLimitBuckets(now) {
  if (rateLimitBuckets.size <= maxRateLimitBuckets) {
    return;
  }

  for (const [key, bucket] of rateLimitBuckets) {
    if (bucket.resetAt <= now || rateLimitBuckets.size > maxRateLimitBuckets) {
      rateLimitBuckets.delete(key);
    }
  }
}

module.exports = {
  enforceRateLimit,
  setCorsHeaders,
};
