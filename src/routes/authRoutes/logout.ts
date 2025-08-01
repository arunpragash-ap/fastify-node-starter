import { FastifyInstance } from "fastify";
import { logout } from "../../services/AuthService";

export default async function logoutRoute(app: FastifyInstance) {

  app.post("/logout", async (request, reply) => {
    try {
      const { refreshToken } = request.body as Record<string, string>;

      if (!refreshToken) {
        return reply.status(400).send({ error: "Refresh token is required." });
      }

      await logout({ refreshToken });
      return reply.send({ success: true, message: "Logged out successfully." });

    } catch (err: any) {
      reply.status(err.statusCode || 400).send({ error: err.message || "Logout failed" });
    }
  });
}
