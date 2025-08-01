import { FastifyInstance } from "fastify";
import { refreshSession } from "../../services/AuthService";

export default async function refreshRoute(app: FastifyInstance) {

  app.post("/refresh", async (request, reply) => {
    try {
      const { refreshToken } = request.body as Record<string, string>;

      if (!refreshToken) {
        return reply.status(400).send({ error: "Refresh token is required." });
      }

      const result = await refreshSession({ refreshToken });
      return reply.send(result);

    } catch (err: any) {
      reply.status(err.statusCode || 400).send({ error: err.message || "Token refresh failed" });
    }
  });
}
