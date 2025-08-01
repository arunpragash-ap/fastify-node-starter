import { FastifyInstance } from "fastify";
import setupMfaRoute from "./setupMfa";
import verifyMfaRoute from "./verifyMfa";
import disableMfaRoute from "./disableMfa";
import statusMfaRoute from "./statusMfa";

export default async function mfaRoutes(app: FastifyInstance) {
  app.register(setupMfaRoute);
  app.register(verifyMfaRoute);
  app.register(disableMfaRoute);
  app.register(statusMfaRoute);
}
