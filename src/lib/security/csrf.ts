import { createHash, randomBytes } from "crypto";

/**
 * Generate a new CSRF token
 */
export function generateCSRFToken(): string {
  return randomBytes(32).toString("hex");
}

/**
 * Hash a CSRF token for storage
 */
export function hashCSRFToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

/**
 * Verify a CSRF token against its hash
 */
export function verifyCSRFToken(token: string, hash: string): boolean {
  const tokenHash = hashCSRFToken(token);
  return tokenHash === hash;
}
