import { FastifyInstance } from "fastify";
import { forgotPassword, resetPassword, verifyForgotOtp } from "../../services/AuthService";

export default async function forgotPasswordRoutes(app: FastifyInstance): Promise<void> {

  app.post("/forgot-password", async (request, reply) => {
    try {
      const { email } = request.body as Record<string, string>;
      if (!email) return reply.status(400).send({ error: "Email is required." });

      await forgotPassword({ email });
      return reply.send({ success: true, message: "OTP sent to email." });

    } catch (err: unknown) {
      const error = err as { statusCode?: number; message?: string };
      reply.status(error.statusCode || 400).send({ error: error.message || "Forgot password failed" });
    }
  });

  app.post("/forgot-password/verifyOtp", async(request, _reply) => {
    const { email, otp }: { email: string; otp: string } = request.body as Record<string, string>;
    await verifyForgotOtp({email, otp });
  })

  app.post("/reset-password", async (request, reply) => {
    try {
      const { email, otp, newPassword } = request.body as Record<string, string>;
      if (!email || !otp || !newPassword) {
        return reply.status(400).send({ error: "Email, OTP, and new password are required." });
      }

      await resetPassword({ email, otp, newPassword });
      return reply.send({ success: true, message: "Password reset successfully." });

    } catch (err: unknown) {
      const error = err as { statusCode?: number; message?: string };
      reply.status(error.statusCode || 400).send({ error: error.message || "Password reset failed" });
    }
  });
}
