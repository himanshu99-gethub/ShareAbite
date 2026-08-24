// Vercel Serverless Function — wraps TanStack Start SSR server and handles /auth/* endpoints
import nodemailer from "nodemailer";
import tls from "tls";
import crypto from "crypto";
import server from "../dist/server/server.js";

// In-memory fallback store for OTP records
const memoryOtpStore = new Map();
const userPasswordStore = new Map();
const userFullNameStore = new Map();

const GMAIL_USER = process.env.EMAIL || "himanshu.projectai@gmail.com";
const GMAIL_PASS = (process.env.EMAIL_PASSWORD || "unqhbprwkfcxvbko").replace(/[\s\u00A0]+/g, "");
const JWT_SECRET = process.env.JWT_SECRET || "super_secret_jwt_key_for_otp_auth_2026";

// Reusable Nodemailer Transporter
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: GMAIL_USER,
    pass: GMAIL_PASS,
  },
  pool: true,
  maxConnections: 3,
  maxMessages: 100,
});

function base64UrlEncode(str) {
  const buf = typeof str === "string" ? Buffer.from(str) : str;
  return buf.toString("base64").replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");
}

function signJwt(payload, expiresInSeconds = 7 * 24 * 3600) {
  const now = Math.floor(Date.now() / 1000);
  const fullPayload = { ...payload, iat: now, exp: now + expiresInSeconds };
  const header = { alg: "HS256", typ: "JWT" };
  const encodedHeader = base64UrlEncode(JSON.stringify(header));
  const encodedPayload = base64UrlEncode(JSON.stringify(fullPayload));
  const signatureInput = `${encodedHeader}.${encodedPayload}`;
  const signature = crypto.createHmac("sha256", JWT_SECRET).update(signatureInput).digest();
  const encodedSignature = base64UrlEncode(signature);
  return `${encodedHeader}.${encodedPayload}.${encodedSignature}`;
}

async function dispatchOtpEmail({ to, otp, type = "login" }) {
  const isReset = type === "reset_password";
  const subject = isReset ? "Password Reset Verification Code" : "Your Login Verification Code";
  const title = isReset ? "ShareABite Password Reset" : "ShareABite Verification";
  const messageLine = isReset 
    ? "Your One-Time Password (OTP) to reset your password is:" 
    : "Your One-Time Password (OTP) is:";

  const textBody = `Hello,\n\n${messageLine}\n\n${otp}\n\nThis OTP is valid for 5 minutes.\n\nRegards,\nShareABite Platform`;
  const htmlBody = `
    <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 24px; background-color: #ffffff; border-radius: 12px; border: 1px solid #e5e7eb;">
      <div style="text-align: center; margin-bottom: 20px;">
        <h2 style="color: #10b981; margin: 0; font-size: 22px;">🌱 ${title}</h2>
        <p style="color: #6b7280; font-size: 13px; margin-top: 4px;">Food Donation & Redistribution Platform</p>
      </div>
      <div style="background-color: #f0faf4; border-radius: 8px; padding: 20px; text-align: center; margin-bottom: 20px; border: 1px solid #d1fae5;">
        <p style="color: #374151; font-size: 14px; margin: 0 0 12px 0;">${messageLine}</p>
        <div style="font-size: 32px; font-weight: bold; letter-spacing: 6px; color: #059669; font-family: monospace; padding: 10px; background: #ffffff; border-radius: 6px; display: inline-block; border: 1px dashed #10b981;">
          ${otp}
        </div>
        <p style="color: #047857; font-size: 12px; margin: 12px 0 0 0; font-weight: bold;">⏱️ Valid for 5 minutes.</p>
      </div>
      <p style="color: #9ca3af; font-size: 12px; text-align: center; margin: 0;">If you did not request this code, please ignore this email.</p>
    </div>
  `;

  // 1. Primary: Nodemailer Fast Pool
  try {
    const info = await transporter.sendMail({
      from: `"ShareABite Authentication" <${GMAIL_USER}>`,
      to,
      subject,
      text: textBody,
      html: htmlBody,
    });
    console.log(`[EmailService] Nodemailer sent OTP to ${to} (MessageId: ${info.messageId})`);
    return { success: true, messageId: info.messageId };
  } catch (nmErr) {
    console.warn("[EmailService] Nodemailer error, trying direct TLS socket fallback:", nmErr?.message);
  }

  // 2. Fallback: Direct TLS Socket on Port 465
  return new Promise((resolve) => {
    let resolved = false;
    const timeout = setTimeout(() => {
      if (!resolved) {
        resolved = true;
        console.error("[EmailService] SMTP timeout");
        resolve({ success: false, error: "SMTP timeout" });
      }
    }, 8000);

    try {
      const client = tls.connect(465, "smtp.gmail.com", { rejectUnauthorized: false }, () => {
        let step = 0;
        const send = (str) => client.write(str + "\r\n");

        client.on("data", (data) => {
          const resp = data.toString();
          if (resp.startsWith("220") && step === 0) {
            step = 1;
            send("EHLO smtp.gmail.com");
          } else if (resp.startsWith("250") && step === 1) {
            step = 2;
            send("AUTH LOGIN");
          } else if (resp.startsWith("334") && step === 2) {
            step = 3;
            send(Buffer.from(GMAIL_USER).toString("base64"));
          } else if (resp.startsWith("334") && step === 3) {
            step = 4;
            send(Buffer.from(GMAIL_PASS).toString("base64"));
          } else if (resp.startsWith("235") && step === 4) {
            step = 5;
            send(`MAIL FROM:<${GMAIL_USER}>`);
          } else if (resp.startsWith("250") && step === 5) {
            step = 6;
            send(`RCPT TO:<${to}>`);
          } else if (resp.startsWith("250") && step === 6) {
            step = 7;
            send("DATA");
          } else if (resp.startsWith("354") && step === 7) {
            step = 8;
            const mime = [
              `From: "ShareABite Authentication" <${GMAIL_USER}>`,
              `To: ${to}`,
              `Subject: ${subject}`,
              `MIME-Version: 1.0`,
              `Content-Type: multipart/alternative; boundary="b-otp"`,
              ``,
              `--b-otp`,
              `Content-Type: text/plain; charset=UTF-8`,
              ``,
              textBody,
              ``,
              `--b-otp`,
              `Content-Type: text/html; charset=UTF-8`,
              ``,
              htmlBody,
              ``,
              `--b-otp--`,
              `.`
            ].join("\r\n");
            send(mime);
          } else if (resp.startsWith("250") && step === 8) {
            step = 9;
            send("QUIT");
            client.end();
            if (!resolved) {
              resolved = true;
              clearTimeout(timeout);
              resolve({ success: true });
            }
          } else if (resp.startsWith("5") || resp.startsWith("4")) {
            client.end();
            if (!resolved) {
              resolved = true;
              clearTimeout(timeout);
              resolve({ success: false, error: resp.trim() });
            }
          }
        });

        client.on("error", (err) => {
          client.end();
          if (!resolved) {
            resolved = true;
            clearTimeout(timeout);
            resolve({ success: false, error: err?.message });
          }
        });
      });
    } catch (e) {
      if (!resolved) {
        resolved = true;
        clearTimeout(timeout);
        resolve({ success: false, error: e?.message });
      }
    }
  });
}

// ── Auth Route Handlers ──
async function handleAuthRoute(pathname, body) {
  const email = body?.email?.trim().toLowerCase();
  const role = body?.role || "donor";
  const fullName = body?.fullName || "";
  const password = body?.password || "";
  const otp = body?.otp?.trim();
  const type = body?.type || "login";

  if (pathname === "/auth/send-otp" || pathname === "/auth/resend-otp") {
    if (!email) return { status: 400, body: { success: false, error: "Email is required." } };

    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000).toISOString();

    memoryOtpStore.set(email, { otp: otpCode, expires_at: expiresAt, attempts: 0 });

    // Race fast dispatch so the client response is returned in <1 second
    const emailPromise = dispatchOtpEmail({ to: email, otp: otpCode, type });
    await Promise.race([
      emailPromise,
      new Promise((resolve) => setTimeout(resolve, 1200)),
    ]);

    return { status: 200, body: { success: true, message: "OTP sent successfully to your email." } };
  }

  if (pathname === "/auth/verify-otp") {
    if (!email || !otp) return { status: 400, body: { success: false, error: "Email and OTP are required." } };

    const record = memoryOtpStore.get(email);
    if (!record || new Date(record.expires_at) < new Date()) {
      return { status: 400, body: { success: false, error: "OTP has expired or is invalid. Please request a new code." } };
    }

    if (record.otp !== otp) {
      record.attempts = (record.attempts || 0) + 1;
      return { status: 400, body: { success: false, error: "Incorrect OTP code. Please try again." } };
    }

    memoryOtpStore.delete(email);

    const displayName = fullName || userFullNameStore.get(email) || email.split("@")[0];
    const userId = `user-${email.replace(/[^a-z0-9]/gi, "_")}`;

    if (password) {
      userPasswordStore.set(email, password);
    }
    userFullNameStore.set(email, displayName);

    const token = signJwt({ sub: userId, email, role });
    return {
      status: 200,
      body: {
        success: true,
        message: "OTP verified successfully!",
        token,
        user: { id: userId, email, role, full_name: displayName }
      }
    };
  }

  if (pathname === "/auth/reset-password-otp") {
    if (!email) return { status: 400, body: { success: false, error: "Email is required." } };

    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000).toISOString();

    memoryOtpStore.set(email, { otp: otpCode, expires_at: expiresAt, attempts: 0 });

    const emailRes = await dispatchOtpEmail({ to: email, otp: otpCode, type: "reset_password" });
    if (!emailRes.success) {
      return { status: 500, body: { success: false, error: emailRes.error || "Failed to dispatch email." } };
    }

    return { status: 200, body: { success: true, message: "Password reset OTP sent." } };
  }

  if (pathname === "/auth/verify-reset-password") {
    const newPassword = body?.newPassword;
    if (!email || !otp || !newPassword) {
      return { status: 400, body: { success: false, error: "Email, OTP and new password are required." } };
    }

    const record = memoryOtpStore.get(email);
    if (!record || record.otp !== otp || new Date(record.expires_at) < new Date()) {
      return { status: 400, body: { success: false, error: "Invalid or expired OTP." } };
    }

    memoryOtpStore.delete(email);
    userPasswordStore.set(email, newPassword);

    const userId = `user-${email.replace(/[^a-z0-9]/gi, "_")}`;
    const token = signJwt({ sub: userId, email, role: "donor" });
    return {
      status: 200,
      body: {
        success: true,
        message: "Password reset successful!",
        token,
        user: { id: userId, email, role: "donor", full_name: userFullNameStore.get(email) || email.split("@")[0] }
      }
    };
  }

  if (pathname === "/auth/verify-password") {
    if (!email || !password) {
      return { status: 400, body: { success: false, error: "Email and password are required." } };
    }

    const savedPass = userPasswordStore.get(email);
    if (savedPass && savedPass !== password) {
      return { status: 401, body: { success: false, error: "Invalid password." } };
    }

    userPasswordStore.set(email, password);
    const userId = `user-${email.replace(/[^a-z0-9]/gi, "_")}`;
    const token = signJwt({ sub: userId, email, role: "donor" });
    return {
      status: 200,
      body: {
        success: true,
        token,
        user: { id: userId, email, role: "donor", full_name: userFullNameStore.get(email) || email.split("@")[0] }
      }
    };
  }

  return null;
}

// ── Main Vercel Serverless Function ──
export default async function handler(req, res) {
  try {
    const proto = req.headers["x-forwarded-proto"] || "https";
    const host = req.headers["x-forwarded-host"] || req.headers["host"] || "localhost";
    const url = `${proto}://${host}${req.url}`;
    const parsedUrl = new URL(url);
    const pathname = parsedUrl.pathname;

    // Collect request body
    let bodyBuffer = undefined;
    let bodyJson = {};
    if (req.method !== "GET" && req.method !== "HEAD") {
      const chunks = [];
      for await (const chunk of req) {
        chunks.push(typeof chunk === "string" ? Buffer.from(chunk) : chunk);
      }
      if (chunks.length > 0) {
        bodyBuffer = Buffer.concat(chunks);
        try {
          bodyJson = JSON.parse(bodyBuffer.toString("utf-8"));
        } catch (_) {}
      }
    }

    // Direct /auth/* API Router Handler
    if (pathname.startsWith("/auth/")) {
      const authResult = await handleAuthRoute(pathname, bodyJson);
      if (authResult) {
        res.statusCode = authResult.status;
        res.setHeader("Content-Type", "application/json");
        return res.end(JSON.stringify(authResult.body));
      }
    }

    // SSR Page Rendering via TanStack Start
    const headers = {};
    for (const [key, val] of Object.entries(req.headers)) {
      if (val != null) headers[key] = Array.isArray(val) ? val.join(", ") : val;
    }

    const webRequest = new Request(url, {
      method: req.method,
      headers,
      body: bodyBuffer,
      duplex: "half",
    });

    const response = await server.fetch(webRequest);

    res.statusCode = response.status;
    for (const [key, value] of response.headers.entries()) {
      res.setHeader(key, value);
    }

    if (response.body) {
      const reader = response.body.getReader();
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        res.write(value);
      }
    }

    res.end();
  } catch (err) {
    console.error("[SSR] Error:", err);
    res.statusCode = 500;
    res.end(`Internal Server Error: ${err.message}`);
  }
}
