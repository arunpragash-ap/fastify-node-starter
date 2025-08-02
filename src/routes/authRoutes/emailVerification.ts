import { FastifyInstance } from "fastify";
import { resendVerificationCode, sendEmailVerification, verifyEmail, verifyEmailWithCode } from "../../services/AuthService";

export default async function emailVerificationRoutes(app: FastifyInstance): Promise<void> {

  app.post("/email/send-verification", async (request, reply) => {
    try {
      const { userId } = request.body as Record<string, string>;
      if (!userId) return reply.status(400).send({ error: "User ID is required." });

      await sendEmailVerification({ userId });
      return reply.send({ success: true, message: "Verification email sent." });

    } catch (err: unknown) {
      const error = err as { statusCode?: number; message?: string };
      reply.status(error.statusCode || 400).send({ error: error.message || "Send verification failed" });
    }
  });

  app.post("/email/verify", async (request, reply) => {
    try {
      const { token } = request.body as Record<string, string>;
      if (!token) return reply.status(400).send({ error: "Verification token is required." });

      await verifyEmail({ token });
      return reply.send({ success: true, message: "Email verified successfully." });

    } catch (err: unknown) {
      const error = err as { statusCode?: number; message?: string };
      reply.status(error.statusCode || 400).send({ error: error.message || "Email verification failed" });
    }
  });

  app.post("/email/verify-code", async (request, reply) => {
    try {
      const { email, code } = request.body as Record<string, string>;
      if (!email || !code) return reply.status(400).send({ error: "Email and code are required." });

      await verifyEmailWithCode({ email, code });
      return reply.send({ success: true, message: "Email verified successfully." });

    } catch (err: unknown) {
      const error = err as { statusCode?: number; message?: string };
      reply.status(error.statusCode || 400).send({ error: error.message || "Email verification failed" });
    }
  });

  app.post("/email/resend-code", async (request, reply) => {
    try {
      const { email } = request.body as Record<string, string>;
      if (!email) return reply.status(400).send({ error: "Email is required." });

      await resendVerificationCode({ email });
      return reply.send({ success: true, message: "Verification code resent." });

    } catch (err: unknown) {
      const error = err as { statusCode?: number; message?: string };
      reply.status(error.statusCode || 400).send({ error: error.message || "Resend verification code failed" });
    }
  });
}
