import { FastifyInstance } from "fastify";
import { forgotPassword, resetPassword, verifyForgotOtp } from "../../services/AuthService";

export default async function forgotPasswordRoutes(app: FastifyInstance) {

  app.post("/forgot-password", async (request, reply) => {
    try {
      const { email } = request.body as Record<string, string>;
      if (!email) return reply.status(400).send({ error: "Email is required." });

      await forgotPassword({ email });
      return reply.send({ success: true, message: "OTP sent to email." });

    } catch (err: any) {
      reply.status(err.statusCode || 400).send({ error: err.message || "Forgot password failed" });
    }
  });

  app.post("/forgot-password/verifyOtp", async(request, reply)=>{
    const { email, otp }: { email: string; otp: string } = request.body as any;
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

    } catch (err: any) {
      reply.status(err.statusCode || 400).send({ error: err.message || "Password reset failed" });
    }
  });
}
