import { FastifyRequest, FastifyReply } from "fastify";
import { verifyJwt } from "../utils/jwt";

// Extend FastifyRequest interface to include user property
declare module "fastify" {
  interface FastifyRequest {
    user?: { userId?: string; [key: string]: any };
  }
}

/**
 * Authentication middleware that validates JWT tokens
 * and adds the userId to the request object
 */
export const authenticate = async (
  request: FastifyRequest,
  reply: FastifyReply,
) => {
  try {
    // Extract the authorization header
    const authHeader = request.headers.authorization;

    if (!authHeader) {
      return reply.status(401).send({ error: "Authentication required" });
    }

    // Check if it's a Bearer token
    const parts = authHeader.split(" ");
    if (parts.length !== 2 || parts[0] !== "Bearer") {
      return reply.status(401).send({ error: "Invalid authentication format" });
    }

    const token = parts[1];
    const payload = verifyJwt(token);

    if (!payload || !payload.userId) {
      return reply.status(401).send({ error: "Invalid or expired token" });
    }

    // Add userId to request for downstream handlers
    request.user = { userId: payload.userId };

    // Continue to the route handler
    return;
  } catch (error) {
    return reply.status(401).send({ error: "Authentication failed" });
  }
};
