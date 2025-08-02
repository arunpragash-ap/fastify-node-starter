import { FastifyInstance } from "fastify";
import { authenticate } from "../../middleware/auth";
import { getMfaStatus } from "../../services/MfaService";

export default async function statusMfaRoute(fastify: FastifyInstance) {

  fastify.get("/status", { preHandler: authenticate }, async (request, reply) => {
    try {
      const userId = request.user!.userId;
      const status = await getMfaStatus(userId);
      return reply.send(status);
    } catch (err: any) {
      return reply.status(400).send({ error: err.message || "MFA status failed" });
    }
  });
}
