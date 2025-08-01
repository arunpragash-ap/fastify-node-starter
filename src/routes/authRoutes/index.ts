import { FastifyInstance } from "fastify";
import registerRoute from "./register";
import loginRoute from "./login";
import mfaRoutes from "./mfa";
import refreshRoute from "./refresh";
import logoutRoute from "./logout";
import emailVerificationRoutes from "./emailVerification";
import forgotPasswordRoutes from "./forgotPassword";

export default async function authRoutes(fastify: FastifyInstance) {

  fastify.register(registerRoute);
  fastify.register(loginRoute);
  fastify.register(mfaRoutes);
  fastify.register(refreshRoute);
  fastify.register(logoutRoute);
  fastify.register(emailVerificationRoutes);
  fastify.register(forgotPasswordRoutes);
}
