import { FastifyInstance } from "fastify";
import { registerWithCode } from "../../services/AuthService";

export default async function registerRoute(app: FastifyInstance): Promise<void> {

  app.post("/register", async (request, reply) => {
    try {
      const { username, email, password } = request.body as Record<string, string>;

      if (!username || !email || !password) {
        return reply.status(400).send({ error: "Username, email, and password are required." });
      }
      if (username.length < 3 || username.length > 30) {
        return reply.status(400).send({ error: "Username must be 3-30 characters." });
      }
      if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
        return reply.status(400).send({ error: "Invalid email address." });
      }
      if (password.length < 6) {
        return reply.status(400).send({ error: "Password must be at least 6 characters." });
      }

      await registerWithCode({ username, email, password });
      return reply.status(201).send({
        success: true,
        message: "User registered. Please check your email for the verification code.",
      });

    } catch (err: unknown) {
      reply.status(err.statusCode || 400).send({ error: err.message || "Registration failed" });
    }
  });
}
