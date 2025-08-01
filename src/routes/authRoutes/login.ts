import { FastifyInstance } from "fastify";
import { loginWithMfaSupport } from "../../services/AuthService";

export default async function loginRoute(app: FastifyInstance) {
  

  app.post("/login", async (request, reply) => {
    try {
      const { identifier, password } = request.body as Record<string, string>;
      if (!identifier || !password) {
        return reply.status(400).send({ error: "Identifier and password are required" });
      }
      const result = await loginWithMfaSupport({ identifier, password });

      if (result.mfaRequired) {
        return reply.status(206).send(result);
      }
      return reply.send(result);

    } catch (err: any) {
      reply.status(err.statusCode || 400).send({ error: err.message || "Login failed" });
    }
  });
}
