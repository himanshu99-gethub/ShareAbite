import {
  requestSendOtp,
  requestVerifyOtp,
  requestResendOtp,
  requestPasswordResetOtp,
  requestConfirmPasswordReset,
  requestVerifyPassword,
} from "./otp-service";

export async function handleSendOtpRequest(body: any) {
  try {
    const { email, role, type } = body || {};
    if (!email) {
      return { status: 400, body: { success: false, error: "Email is required." } };
    }
    const result = await requestSendOtp(email, role, type || "login");
    return { status: result.status || 200, body: result };
  } catch (err: any) {
    console.error("[AuthController] Error in send-otp:", err);
    return { status: 500, body: { success: false, error: err?.message || "Internal server error." } };
  }
}

export async function handleVerifyOtpRequest(body: any) {
  try {
    const { email, otp, role, fullName, password } = body || {};
    if (!email || !otp) {
      return { status: 400, body: { success: false, error: "Email and OTP code are required." } };
    }
    const result = await requestVerifyOtp(email, otp, role, fullName, password);
    return { status: result.status || 200, body: result };
  } catch (err: any) {
    console.error("[AuthController] Error in verify-otp:", err);
    return { status: 500, body: { success: false, error: err?.message || "Internal server error." } };
  }
}

export async function handleResendOtpRequest(body: any) {
  try {
    const { email, role, type } = body || {};
    if (!email) {
      return { status: 400, body: { success: false, error: "Email is required." } };
    }
    const result = await requestResendOtp(email, role);
    return { status: result.status || 200, body: result };
  } catch (err: any) {
    console.error("[AuthController] Error in resend-otp:", err);
    return { status: 500, body: { success: false, error: err?.message || "Internal server error." } };
  }
}

export async function handleResetPasswordOtpRequest(body: any) {
  try {
    const { email } = body || {};
    if (!email) {
      return { status: 400, body: { success: false, error: "Email is required." } };
    }
    const result = await requestPasswordResetOtp(email);
    return { status: result.status || 200, body: result };
  } catch (err: any) {
    console.error("[AuthController] Error in reset-password-otp:", err);
    return { status: 500, body: { success: false, error: err?.message || "Internal server error." } };
  }
}

export async function handleConfirmPasswordResetRequest(body: any) {
  try {
    const { email, otp, newPassword } = body || {};
    if (!email || !otp || !newPassword) {
      return { status: 400, body: { success: false, error: "Email, OTP code, and new password are required." } };
    }
    const result = await requestConfirmPasswordReset(email, otp, newPassword);
    return { status: result.status || 200, body: result };
  } catch (err: any) {
    console.error("[AuthController] Error in confirm-password-reset:", err);
    return { status: 500, body: { success: false, error: err?.message || "Internal server error." } };
  }
}

export async function handleVerifyPasswordRequest(body: any) {
  try {
    const { email, password } = body || {};
    if (!email || !password) {
      return { status: 400, body: { success: false, error: "Email and password are required." } };
    }
    const result = await requestVerifyPassword(email, password);
    return { status: result.status || 200, body: result };
  } catch (err: any) {
    console.error("[AuthController] Error in verify-password:", err);
    return { status: 500, body: { success: false, error: err?.message || "Internal server error." } };
  }
}
