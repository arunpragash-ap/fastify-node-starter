import { FastifyInstance } from "fastify";
import { verifyJwt } from "../utils/jwt";
import { AuthService } from "../services/AuthService";
import { MfaService } from "../services/MfaService";

export default async function authRoutes(app: FastifyInstance) {
  const authService = new AuthService();
  const mfaService = new MfaService();
  // Register
  app.post("/register", async (request, reply) => {
    try {
      const { username, email, password } = request.body as Record<
        string,
        string
      >;
      // Basic validation
      if (!username || !email || !password) {
        return reply
          .status(400)
          .send({ error: "Username, email, and password are required." });
      }
      if (username.length < 3 || username.length > 30) {
        return reply
          .status(400)
          .send({ error: "Username must be 3-30 characters." });
      }
      if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
        return reply.status(400).send({ error: "Invalid email address." });
      }
      if (password.length < 6) {
        return reply
          .status(400)
          .send({ error: "Password must be at least 6 characters." });
      }
      const result = await authService.registerWithCode({
        username,
        email,
        password,
      });
      return reply
        .status(201)
        .send({
          success: true,
          message:
            "User registered. Please check your email for the verification code.",
        });
    } catch (err: any) {
      reply
        .status(err.statusCode || 400)
        .send({ error: err.message || "Registration failed" });
    }
  });

  // Login
  app.post("/login", async (request, reply) => {
    try {
      const { identifier, password } = request.body as Record<string, string>;
      const result = await authService.loginWithMfaSupport({
        identifier,
        password,
      });
      if (result.mfaRequired) {
        return reply.status(206).send(result);
      }
      return reply.send(result);
    } catch (err: any) {
      reply
        .status(err.statusCode || 400)
        .send({ error: err.message || "Login failed" });
    }
  });

  // MFA Verification
  app.post("/mfa-verify", async (request, reply) => {
    try {
      const { mfaToken, mfaCode } = request.body as Record<string, string>;
      if (!mfaToken || !mfaCode) {
        return reply
          .status(400)
          .send({ error: "mfaToken and mfaCode are required" });
      }
      const mfaPayload = verifyJwt(mfaToken);
      if (
        !mfaPayload ||
        !mfaPayload.userId ||
        mfaPayload.type !== "mfa" ||
        Date.now() > mfaPayload.exp * 1000
      ) {
        return reply
          .status(401)
          .send({ error: "Invalid or expired MFA token" });
      }
      const userId = mfaPayload.userId;
      const result = await mfaService.verifyAndIssueTokens(userId, mfaCode);
      return reply.send(result);
    } catch (err: any) {
      reply
        .status(err.statusCode || 400)
        .send({ error: err.message || "MFA verification failed" });
    }
  });

  // Refresh JWT
  app.post("/refresh", async (request, reply) => {
    try {
      const { refreshToken } = request.body as Record<string, string>;
      if (!refreshToken) {
        return reply.status(400).send({ error: "Refresh token is required." });
      }
      const result = await authService.refresh({ refreshToken });
      return reply.send(result);
    } catch (err: any) {
      reply
        .status(err.statusCode || 400)
        .send({ error: err.message || "Token refresh failed" });
    }
  });

  // Logout
  app.post("/logout", async (request, reply) => {
    try {
      const { refreshToken } = request.body as Record<string, string>;
      if (!refreshToken) {
        return reply.status(400).send({ error: "Refresh token is required." });
      }
      await authService.logout({ refreshToken });
      return reply.send({ success: true, message: "Logged out successfully." });
    } catch (err: any) {
      reply
        .status(err.statusCode || 400)
        .send({ error: err.message || "Logout failed" });
    }
  });

  // Send email verification (token-based, legacy/alternative)
  app.post("/email/send-verification", async (request, reply) => {
    try {
      const { userId } = request.body as Record<string, string>;
      if (!userId) {
        return reply.status(400).send({ error: "User ID is required." });
      }
      await authService.sendEmailVerification({ userId });
      return reply.send({ success: true, message: "Verification email sent." });
    } catch (err: any) {
      reply
        .status(err.statusCode || 400)
        .send({ error: err.message || "Send verification failed" });
    }
  });

  // Verify email with token (legacy/alternative)
  app.post("/email/verify", async (request, reply) => {
    try {
      const { token } = request.body as Record<string, string>;
      if (!token) {
        return reply
          .status(400)
          .send({ error: "Verification token is required." });
      }
      await authService.verifyEmail({ token });
      return reply.send({
        success: true,
        message: "Email verified successfully.",
      });
    } catch (err: any) {
      reply
        .status(err.statusCode || 400)
        .send({ error: err.message || "Email verification failed" });
    }
  });

  // Verify email with 6-character code (default)
  app.post("/email/verify-code", async (request, reply) => {
    try {
      const { email, code } = request.body as Record<string, string>;
      if (!email || !code) {
        return reply
          .status(400)
          .send({ error: "Email and code are required." });
      }
      await authService.verifyEmailWithCode({ email, code });
      return reply.send({
        success: true,
        message: "Email verified successfully.",
      });
    } catch (err: any) {
      reply
        .status(err.statusCode || 400)
        .send({ error: err.message || "Email verification failed" });
    }
  });

  // Resend 6-character email verification code
  app.post("/email/resend-code", async (request, reply) => {
    try {
      const { email } = request.body as Record<string, string>;
      if (!email) {
        return reply.status(400).send({ error: "Email is required." });
      }
      await authService.resendVerificationCode({ email });
      return reply.send({
        success: true,
        message: "Verification code resent.",
      });
    } catch (err: any) {
      reply
        .status(err.statusCode || 400)
        .send({ error: err.message || "Resend verification code failed" });
    }
  });

  // Forgot password (send OTP)
  app.post("/forgot-password", async (request, reply) => {
    try {
      const { email } = request.body as Record<string, string>;
      if (!email) {
        return reply.status(400).send({ error: "Email is required." });
      }
      await authService.forgotPassword({ email });
      return reply.send({ success: true, message: "OTP sent to email." });
    } catch (err: any) {
      reply
        .status(err.statusCode || 400)
        .send({ error: err.message || "Forgot password failed" });
    }
  });

  // Forgot password verify (reset password)
  app.post("/forgot-password/verify", async (request, reply) => {
    try {
      const { email, otp, newPassword } = request.body as Record<
        string,
        string
      >;
      if (!email || !otp || !newPassword) {
        return reply
          .status(400)
          .send({ error: "Email, OTP, and new password are required." });
      }
      await authService.resetPassword({ email, otp, newPassword });
      return reply.send({
        success: true,
        message: "Password reset successfully.",
      });
    } catch (err: any) {
      reply
        .status(err.statusCode || 400)
        .send({ error: err.message || "Password reset failed" });
    }
  });
}
