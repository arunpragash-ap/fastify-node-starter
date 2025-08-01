import { FastifyInstance } from "fastify";
import { authenticate } from "../../middleware/auth";
import { setupMfa } from "../../services/MfaService";

export default async function setupMfaRoute(app: FastifyInstance) {

  app.post("/setup", { preHandler: authenticate }, async (request, reply) => {
    try {
      const userId = request.user!.userId;

      const result = await setupMfa(userId);
      return reply.send(result);
    } catch (err: any) {
      return reply.status(400).send({ error: err.message || "MFA setup failed" });
    }
  });
}
