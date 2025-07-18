import Fastify from "fastify";
import cors from "@fastify/cors";
import jwt from "@fastify/jwt";
import { rateLimit } from "./middleware/rateLimit";
import { AppDataSource } from "./config/database";
import "dotenv/config";
import authRoutes from "./routes/auth";
import usersRoutes from "./routes/users";
import mfaRoutes from "./routes/mfa";

const app = Fastify({ logger: true });

// Register CORS
app.register(cors, {
  origin: process.env.CORS_ORIGIN || "http://localhost:3001",
  credentials: true,
});

// Register JWT
app.register(jwt, {
  secret: process.env.JWT_SECRET || "supersecret",
  sign: { algorithm: "HS256" },
});

// Apply custom rate limit middleware
app.addHook(
  "onRequest",
  rateLimit({
    max: 100,
    timeWindow: 60 * 1000, // 1 minute in milliseconds
  }),
);

// Register routes
app.register(authRoutes, { prefix: "/auth" });
app.register(usersRoutes, { prefix: "/users" });
app.register(mfaRoutes, { prefix: "/auth/mfa" });

// Health check route
app.get("/health", async (request, reply) => {
  return { status: "ok", uptime: process.uptime() };
});

// Start server after DB connection
const start = async () => {
  try {
    await AppDataSource.initialize();
    app.log.info("Database connected");
    await app.listen({
      port: Number(process.env.PORT) || 3000,
      host: "0.0.0.0",
    });
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
};

start();

// Graceful shutdown
process.on("SIGINT", async () => {
  app.log.info("SIGINT received, shutting down...");
  await app.close();
  process.exit(0);
});
process.on("SIGTERM", async () => {
  app.log.info("SIGTERM received, shutting down...");
  await app.close();
  process.exit(0);
});
