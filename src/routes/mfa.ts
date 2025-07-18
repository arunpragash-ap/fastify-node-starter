import { FastifyInstance } from "fastify";
import { MfaService } from "../services/MfaService";
import { authenticate } from "../middleware/auth";

export default async function mfaRoutes(app: FastifyInstance) {
  const mfaService = new MfaService();

  // Setup MFA (generate TOTP secret and QR code)
  app.post("/setup", { preHandler: authenticate }, async (request, reply) => {
    try {
      // Use the authenticated user's ID from the request
      const userId = request.user?.userId;
      if (!userId)
        return reply
          .status(400)
          .send({ error: "User authentication required" });

      const result = await mfaService.setup(userId);
      return reply.send(result);
    } catch (err: any) {
      return reply
        .status(400)
        .send({ error: err.message || "MFA setup failed" });
    }
  });

  // Verify MFA (TOTP code)
  app.post("/verify", { preHandler: authenticate }, async (request, reply) => {
    try {
      const { token } = request.body as Record<string, string>;
      const userId = request.user?.userId;
      if (!userId || !token)
        return reply
          .status(400)
          .send({ error: "userId and token are required" });
      const isValid = await mfaService.verify(userId, token);
      return reply.send({ success: isValid });
    } catch (err: any) {
      return reply
        .status(400)
        .send({ error: err.message || "MFA verify failed" });
    }
  });

  // Disable MFA
  app.post("/disable", { preHandler: authenticate }, async (request, reply) => {
    try {
      // Use the authenticated user's ID from the request
      const userId = request.user?.userId;
      const { token } = request.body as Record<string, string>;
      if (!userId || !token)
        return reply
          .status(400)
          .send({ error: "userId and token are required" });
      await mfaService.disable(userId, token);
      return reply.send({ success: true });
    } catch (err: any) {
      return reply
        .status(400)
        .send({ error: err.message || "MFA disable failed" });
    }
  });

  app.get("/status", { preHandler: authenticate }, async (request, reply) => {
    try {
      const userId = request.user?.userId;
      const status = await mfaService.status(userId);
      return reply.send(status);
    } catch (err: any) {
      return reply
        .status(400)
        .send({ error: err.message || "MFA status failed" });
    }
  });
}
