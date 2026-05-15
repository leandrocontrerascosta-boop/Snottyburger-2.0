import type { NextRequest } from "next/server";

type RateLimitRecord = {
  count: number;
  resetAt: number;
};

// Store in-memory (for production, use Redis)
const requestCounts = new Map<string, RateLimitRecord>();

/**
 * Extract client IP from request
 */
export function getClientIp(request: NextRequest): string {
  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) {
    return forwardedFor.split(",")[0]?.trim() || "unknown";
  }

  const realIp = request.headers.get("x-real-ip");
  if (realIp) {
    return realIp.trim();
  }

  return "unknown";
}

/**
 * Check rate limit for a key
 * @param key Unique identifier (e.g., "ip:promo-validate:192.168.1.1")
 * @param limit Max requests allowed
 * @param windowMs Time window in milliseconds
 */
export function checkRateLimit(
  key: string,
  limit: number = 100,
  windowMs: number = 60000
): { allowed: boolean; remaining: number; resetAt?: number } {
  const now = Date.now();
  const record = requestCounts.get(key);

  // First request or window expired
  if (!record || now > record.resetAt) {
    requestCounts.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, remaining: limit - 1, resetAt: now + windowMs };
  }

  // Check limit
  if (record.count >= limit) {
    return {
      allowed: false,
      remaining: 0,
      resetAt: record.resetAt,
    };
  }

  // Increment count
  record.count++;
  return {
    allowed: true,
    remaining: limit - record.count,
    resetAt: record.resetAt,
  };
}

/**
 * Clean up expired records (call periodically)
 */
export function cleanupExpiredRecords(): void {
  const now = Date.now();
  for (const [key, record] of requestCounts.entries()) {
    if (now > record.resetAt) {
      requestCounts.delete(key);
    }
  }
}

// Cleanup every 5 minutes
if (typeof global !== "undefined") {
  if (!("rateLimitCleanupInterval" in global)) {
    (global as any).rateLimitCleanupInterval = setInterval(
      cleanupExpiredRecords,
      5 * 60 * 1000
    );
  }
}
