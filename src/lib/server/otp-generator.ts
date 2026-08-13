import crypto from "crypto";

/**
 * Generates a cryptographically secure random 6-digit OTP string.
 */
export function generateOtp(): string {
  // Generates a random integer between 100000 (inclusive) and 1000000 (exclusive)
  const num = crypto.randomInt(100000, 1000000);
  return num.toString();
}

/**
 * Validates basic email format using standard regex.
 */
export function isValidEmail(email: string): boolean {
  if (!email || typeof email !== "string") return false;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email.trim().toLowerCase());
}
