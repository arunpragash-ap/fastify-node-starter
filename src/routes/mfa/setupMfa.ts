import { FastifyInstance } from "fastify";
import { authenticate } from "../../middleware/auth";
import { setupMfa } from "../../services/MfaService";

export default async function setupMfaRoute(fastify: FastifyInstance): Promise<void> {

  fastify.post("/setup", { preHandler: authenticate }, async (request, reply) => {
    try {
      const userId = request.user!.userId;

      const result = await setupMfa(userId);
      return reply.send(result);
    } catch (err: unknown) {
      return reply.status(400).send({ error: err.message || "MFA setup failed" });
    }
  });
}
