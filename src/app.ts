import Fastify from "fastify";
import cors from "@fastify/cors";
import jwt from "@fastify/jwt";
import { rateLimit } from "./middleware/rateLimit";
import { AppDataSource } from "./config/database";
import "dotenv/config";
import routes from "./routes";
import { sendEmail } from "./utils/email";

const app = Fastify({ logger: true });
const allowedOrigins = (process.env.CORS_ORIGIN || "http://localhost:3000")
  .split(",");
// Register CORS
app.register(cors, {
  origin: (origin, cb) => {
    if (!origin || allowedOrigins.includes(origin)) {
      cb(null, true); // Allow request
    } else {
      cb(new Error("Not allowed by CORS"), false);
    }
  },
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
app.register(routes, { prefix: "/api"});
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

