import { FastifyInstance } from "fastify";
import { authenticate } from "../../middleware/auth";
import { verifyMfa } from "../../services/MfaService";

export default async function verifyMfaRoute(app: FastifyInstance) {

  app.post("/verify", { preHandler: authenticate }, async (request, reply) => {
    try {
      const { token } = request.body as Record<string, string>;
      const userId = request.user!.userId;
      if (!token) {
        return reply.status(400).send({ error: "Token is required" });
      }

      const isValid = await verifyMfa(userId, token);
      return reply.send({ success: isValid });
    } catch (err: any) {
      return reply.status(400).send({ error: err.message || "MFA verify failed" });
    }
  });
}
