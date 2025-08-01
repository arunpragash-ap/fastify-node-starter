import { FastifyInstance } from "fastify";
import { verifyJwt } from "../../utils/jwt";
import { verifyAndIssueTokens } from "../../services/MfaService";

export default async function mfaRoutes(app: FastifyInstance) {

  app.post("/mfa-verify", async (request, reply) => {
    try {
      const { mfaToken, mfaCode } = request.body as Record<string, string>;

      if (!mfaToken || !mfaCode) {
        return reply.status(400).send({ error: "mfaToken and mfaCode are required" });
      }

      const mfaPayload = verifyJwt(mfaToken);
      if (!mfaPayload || !mfaPayload.userId || mfaPayload.type !== "mfa" || Date.now() > mfaPayload.exp * 1000) {
        return reply.status(401).send({ error: "Invalid or expired MFA token" });
      }

      const result = await verifyAndIssueTokens(mfaPayload.userId, mfaCode);
      return reply.send(result);

    } catch (err: any) {
      reply.status(err.statusCode || 400).send({ error: err.message || "MFA verification failed" });
    }
  });
}
