import { FastifyInstance } from "fastify";
import setupMfaRoute from "./setupMfa";
import verifyMfaRoute from "./verifyMfa";
import disableMfaRoute from "./disableMfa";
import statusMfaRoute from "./statusMfa";

export default async function mfaRoutes(fastify: FastifyInstance): Promise<void> {
  fastify.register(setupMfaRoute);
  fastify.register(verifyMfaRoute);
  fastify.register(disableMfaRoute);
  fastify.register(statusMfaRoute);
}
