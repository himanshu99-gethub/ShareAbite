import tls from "tls";
import fs from "fs";
import path from "path";

export interface SendEmailOptions {
  to: string;
  otp: string;
  type?: "login" | "reset_password";
}

/**
 * Dynamically reads the latest .env file from disk to ensure
 * changes to EMAIL and EMAIL_PASSWORD are immediately picked up.
 */
function getFreshEnv(): Record<string, string> {
  const env: Record<string, string> = { ...(process.env as Record<string, string>) };
  try {
    const envPath = path.resolve(process.cwd(), ".env");
    if (fs.existsSync(envPath)) {
      const content = fs.readFileSync(envPath, "utf-8");
      const lines = content.split(/\r?\n/);
      for (const line of lines) {
        const trimmed = line.trim();
        if (trimmed && !trimmed.startsWith("#") && trimmed.includes("=")) {
          const idx = trimmed.indexOf("=");
          const key = trimmed.substring(0, idx).trim();
          let val = trimmed.substring(idx + 1).trim();
          if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
            val = val.slice(1, -1);
          }
          env[key] = val;
        }
      }
    }
  } catch (e) {
    console.warn("[EmailService] Failed to read .env file dynamically:", e);
  }
  return env;
}

/**
 * Renders the email text & HTML templates for Login or Password Reset.
 */
export function renderEmailContent(otp: string, type: "login" | "reset_password" = "login") {
  const isReset = type === "reset_password";
  const subject = isReset ? "Password Reset Verification Code" : "Your Login Verification Code";
  const title = isReset ? "ShareABite Password Reset" : "ShareABite Verification";
  const messageLine = isReset 
    ? "Your One-Time Password (OTP) to reset your password is:" 
    : "Your One-Time Password (OTP) is:";

  const textBody = `Hello,\n\n${messageLine}\n\n${otp}\n\nThis OTP is valid for 5 minutes.\n\nIf you did not request this ${isReset ? "password reset" : "login"}, you can safely ignore this email.\n\nRegards,\nFood Donation & Redistribution Platform`;
  
  const htmlBody = `
    <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 520px; margin: 0 auto; padding: 32px 24px; background-color: #ffffff; border-radius: 16px; border: 1px solid #e5e7eb; box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.05);">
      <div style="text-align: center; margin-bottom: 24px;">
        <div style="display: inline-block; width: 48px; height: 48px; background-color: #10b981; border-radius: 12px; line-height: 48px; color: #ffffff; font-size: 24px; font-weight: bold;">🌱</div>
        <h2 style="color: #111827; margin-top: 12px; margin-bottom: 4px; font-size: 20px; font-weight: 700; tracking-tight;">${title}</h2>
        <p style="color: #6b7280; font-size: 13px; margin: 0;">Food Donation & Redistribution Platform</p>
      </div>

      <div style="background-color: #f0faf4; border-radius: 12px; padding: 24px; text-align: center; margin-bottom: 24px; border: 1px solid #d1fae5;">
        <p style="color: #374151; font-size: 14px; margin-top: 0; margin-bottom: 12px;">Hello,</p>
        <p style="color: #374151; font-size: 14px; margin-bottom: 16px;">${messageLine}</p>
        <div style="font-size: 36px; font-weight: 800; letter-spacing: 8px; color: #059669; font-family: monospace; padding: 12px; background: #ffffff; border-radius: 8px; display: inline-block; border: 1px dashed #10b981;">
          ${otp}
        </div>
        <p style="color: #047857; font-size: 13px; margin-top: 16px; margin-bottom: 0; font-weight: 600;">
          ⏱️ This OTP is valid for 5 minutes.
        </p>
      </div>

      <p style="color: #6b7280; font-size: 13px; line-height: 1.5; margin-bottom: 24px;">
        If you did not request this ${isReset ? "password reset" : "login"}, you can safely ignore this email.
      </p>

      <hr style="border: none; border-top: 1px solid #f3f4f6; margin-bottom: 20px;" />

      <p style="color: #9ca3af; font-size: 12px; text-align: center; margin: 0;">
        Regards,<br/>
        <strong>Food Donation & Redistribution Platform</strong>
      </p>
    </div>
  `;

  return { subject, textBody, htmlBody };
}

/**
 * Sends an email using Gmail SMTP server.
 * Reads EMAIL, EMAIL_PASSWORD dynamically from .env file.
 */
export async function sendOtpEmail({ to, otp, type = "login" }: SendEmailOptions): Promise<{ success: boolean; messageId?: string; error?: string }> {
  const currentEnv = getFreshEnv();
  const rawEmail = currentEnv.EMAIL || process.env.EMAIL || "himanshu.projectai@gmail.com";
  const rawPass = currentEnv.EMAIL_PASSWORD || process.env.EMAIL_PASSWORD || "unqhbprwkfcxvbko";
  const smtpServer = (currentEnv.SMTP_SERVER || process.env.SMTP_SERVER || "smtp.gmail.com").trim();

  // Clean email and strip ALL spaces and non-breaking spaces (\u00A0) from App Password
  const emailUser = rawEmail.trim();
  const emailPass = rawPass.replace(/[\s\u00A0]+/g, "");

  const { subject, textBody, htmlBody } = renderEmailContent(otp, type);

  console.log(`[EmailService] Preparing ${type} OTP dispatch for recipient: ${to} (Sender: ${emailUser})...`);

  // Check if credentials are placeholders
  if (!emailUser || emailUser === "yourgmail@gmail.com" || !emailPass || emailPass === "YOUR_GOOGLE_APP_PASSWORD") {
    console.log(`\n======================================================`);
    console.log(`[DEV OTP NOTIFICATION] Gmail Credentials missing or placeholder.`);
    console.log(`Recipient: ${to}`);
    console.log(`Type:      ${type}`);
    console.log(`OTP Code:  ${otp}`);
    console.log(`======================================================\n`);
    return { success: true, messageId: `dev-simulated-${Date.now()}` };
  }

  // Attempt Nodemailer first if available
  try {
    const nodemailer = await import("nodemailer");
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: emailUser,
        pass: emailPass,
      },
    });

    const info = await transporter.sendMail({
      from: `"ShareABite Authentication" <${emailUser}>`,
      to,
      subject,
      text: textBody,
      html: htmlBody,
    });

    console.log(`[EmailService] Nodemailer sent ${type} OTP successfully! Message ID: ${info.messageId}`);
    return { success: true, messageId: info.messageId };
  } catch (err: any) {
    // Continue to native TLS socket
  }

  // Direct SSL on Port 465 (Fastest & most reliable for Gmail)
  return new Promise((resolve) => {
    let resolved = false;

    const timeoutTimer = setTimeout(() => {
      if (!resolved) {
        resolved = true;
        console.error(`[EmailService] SMTP Connection timeout.`);
        resolve({ success: false, error: "SMTP Connection timed out. Please check network/credentials." });
      }
    }, 12000);

    try {
      const client = tls.connect(465, smtpServer, { rejectUnauthorized: false }, () => {
        console.log(`[EmailService] TLS Socket connected to ${smtpServer}:465`);
      });

      let step = 0;

      const send = (str: string) => {
        client.write(str + "\r\n");
      };

      client.on("data", (data) => {
        const response = data.toString();

        if (response.startsWith("220") && step === 0) {
          step = 1;
          send(`EHLO ${smtpServer}`);
        } else if (response.startsWith("250") && step === 1) {
          step = 2;
          send("AUTH LOGIN");
        } else if (response.startsWith("334") && step === 2) {
          step = 3;
          send(Buffer.from(emailUser).toString("base64"));
        } else if (response.startsWith("334") && step === 3) {
          step = 4;
          send(Buffer.from(emailPass).toString("base64"));
        } else if (response.startsWith("235") && step === 4) {
          step = 5;
          send(`MAIL FROM:<${emailUser}>`);
        } else if (response.startsWith("250") && step === 5) {
          step = 6;
          send(`RCPT TO:<${to}>`);
        } else if (response.startsWith("250") && step === 6) {
          step = 7;
          send("DATA");
        } else if (response.startsWith("354") && step === 7) {
          step = 8;
          const mimeMessage = [
            `From: "ShareABite Authentication" <${emailUser}>`,
            `To: ${to}`,
            `Subject: ${subject}`,
            `MIME-Version: 1.0`,
            `Content-Type: multipart/alternative; boundary="boundary-otp"`,
            ``,
            `--boundary-otp`,
            `Content-Type: text/plain; charset=UTF-8`,
            ``,
            textBody,
            ``,
            `--boundary-otp`,
            `Content-Type: text/html; charset=UTF-8`,
            ``,
            htmlBody,
            ``,
            `--boundary-otp--`,
            `.`
          ].join("\r\n");
          send(mimeMessage);
        } else if (response.startsWith("250") && step === 8) {
          step = 9;
          send("QUIT");
          client.end();
          if (!resolved) {
            resolved = true;
            clearTimeout(timeoutTimer);
            console.log(`[EmailService] ${type} OTP email sent successfully to ${to}!`);
            resolve({ success: true, messageId: `smtp-465-${Date.now()}` });
          }
        } else if (response.startsWith("5") || response.startsWith("4")) {
          console.error(`[EmailService] SMTP Error Response: ${response.trim()}`);
          client.end();
          if (!resolved) {
            resolved = true;
            clearTimeout(timeoutTimer);
            resolve({ success: false, error: response.trim() });
          }
        }
      });

      client.on("error", (err) => {
        console.error(`[EmailService] TLS Socket Error:`, err);
        client.end();
        if (!resolved) {
          resolved = true;
          clearTimeout(timeoutTimer);
          resolve({ success: false, error: err?.message || "SMTP Socket error." });
        }
      });
    } catch (err: any) {
      console.error(`[EmailService] Exception establishing socket:`, err);
      if (!resolved) {
        resolved = true;
        clearTimeout(timeoutTimer);
        resolve({ success: false, error: err?.message || "Internal SMTP dispatch error." });
      }
    }
  });
}
