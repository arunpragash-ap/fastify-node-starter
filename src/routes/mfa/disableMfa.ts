import { FastifyInstance } from "fastify";
import { authenticate } from "../../middleware/auth";
import { disableMfa } from "../../services/MfaService";

export default async function disableMfaRoute(app: FastifyInstance) {

  app.post("/disable", { preHandler: authenticate }, async (request, reply) => {
    try {
      const userId = request.user!.userId;
      const { token } = request.body as Record<string, string>;
      if (!token) {
        return reply.status(400).send({ error: "Token is required" });
      }

      await disableMfa(userId, token);
      return reply.send({ success: true });
    } catch (err: any) {
      return reply.status(400).send({ error: err.message || "MFA disable failed" });
    }
  });
}
