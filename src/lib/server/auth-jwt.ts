import crypto from "crypto";

export interface JwtPayload {
  sub: string;
  email: string;
  role: "donor" | "receiver";
  iat: number;
  exp: number;
}

function base64UrlEncode(str: string | Buffer): string {
  const buf = typeof str === "string" ? Buffer.from(str) : str;
  return buf.toString("base64").replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");
}

function base64UrlDecode(str: string): string {
  let base64 = str.replace(/-/g, "+").replace(/_/g, "/");
  while (base64.length % 4) {
    base64 += "=";
  }
  return Buffer.from(base64, "base64").toString("utf8");
}

/**
 * Signs a JWT access token using HMAC-SHA256.
 */
export function signJwt(payload: Omit<JwtPayload, "iat" | "exp">, expiresInSeconds = 7 * 24 * 3600): string {
  const secret = process.env.JWT_SECRET || "super_secret_jwt_key_for_otp_auth_2026";
  const now = Math.floor(Date.now() / 1000);
  
  const fullPayload: JwtPayload = {
    ...payload,
    iat: now,
    exp: now + expiresInSeconds,
  };

  const header = { alg: "HS256", typ: "JWT" };

  const encodedHeader = base64UrlEncode(JSON.stringify(header));
  const encodedPayload = base64UrlEncode(JSON.stringify(fullPayload));

  const signatureInput = `${encodedHeader}.${encodedPayload}`;
  const signature = crypto
    .createHmac("sha256", secret)
    .update(signatureInput)
    .digest();

  const encodedSignature = base64UrlEncode(signature);

  return `${encodedHeader}.${encodedPayload}.${encodedSignature}`;
}

/**
 * Verifies a JWT access token and returns the decoded payload if valid.
 */
export function verifyJwt(token: string): JwtPayload | null {
  try {
    const secret = process.env.JWT_SECRET || "super_secret_jwt_key_for_otp_auth_2026";
    const parts = token.split(".");
    if (parts.length !== 3) return null;

    const [encodedHeader, encodedPayload, encodedSignature] = parts;

    const signatureInput = `${encodedHeader}.${encodedPayload}`;
    const expectedSignature = base64UrlEncode(
      crypto.createHmac("sha256", secret).update(signatureInput).digest()
    );

    if (encodedSignature !== expectedSignature) {
      return null;
    }

    const payloadStr = base64UrlDecode(encodedPayload);
    const payload: JwtPayload = JSON.parse(payloadStr);

    const now = Math.floor(Date.now() / 1000);
    if (payload.exp && payload.exp < now) {
      return null; // Expired token
    }

    return payload;
  } catch (err) {
    return null;
  }
}
