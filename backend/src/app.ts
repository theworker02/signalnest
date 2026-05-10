import compress from "@fastify/compress";
import cookie from "@fastify/cookie";
import cors from "@fastify/cors";
import csrf from "@fastify/csrf-protection";
import helmet from "@fastify/helmet";
import rateLimit from "@fastify/rate-limit";
import websocket from "@fastify/websocket";
import Fastify, { type FastifyInstance } from "fastify";
import { alertRoutes } from "./routes/alerts.js";
import { authRoutes } from "./routes/auth.js";
import { checkoutRoutes } from "./routes/checkout.js";
import { healthRoutes } from "./routes/health.js";
import { metricsRoutes } from "./routes/metrics.js";
import { trackerRoutes } from "./routes/trackers.js";
import { env } from "./lib/env.js";
import { incrementGauge, incrementHttpStatus, setGauge } from "./lib/metrics.js";
import { runDueTrackerChecks } from "./lib/monitoringEngine.js";

export async function buildApp(options: { logger?: boolean } = {}): Promise<FastifyInstance> {
  const app = Fastify({
    logger: options.logger ?? true,
    trustProxy: true,
  });

  app.addHook("onResponse", async (_request, reply) => {
    incrementHttpStatus(reply.statusCode);
  });

  await app.register(helmet, {
    contentSecurityPolicy: env.NODE_ENV === "production",
  });
  await app.register(cors, {
    origin: (origin, callback) => {
      if (!origin || origin === env.WEB_ORIGIN || /^http:\/\/(127\.0\.0\.1|localhost):\d+$/.test(origin)) {
        callback(null, true);
        return;
      }
      callback(new Error("Origin not allowed"), false);
    },
    credentials: true,
  });
  await app.register(cookie, {
    secret: env.JWT_REFRESH_SECRET,
  });
  await app.register(csrf, { cookieOpts: { sameSite: "strict", secure: env.NODE_ENV === "production" } });
  await app.register(rateLimit, {
    max: 120,
    timeWindow: "1 minute",
  });
  await app.register(compress);
  await app.register(websocket);

  await app.register(healthRoutes, { prefix: "/api" });
  await app.register(authRoutes, { prefix: "/api" });
  await app.register(trackerRoutes, { prefix: "/api" });
  await app.register(alertRoutes, { prefix: "/api" });
  await app.register(checkoutRoutes, { prefix: "/api" });
  await app.register(metricsRoutes, { prefix: "/api" });

  app.get("/api/live", { websocket: true }, (connection) => {
    incrementGauge("signalnest_websocket_connections");
    const timer = setInterval(() => {
      const [event] = runDueTrackerChecks();
      connection.send(
        JSON.stringify({
          type: "signal.event",
          event: event
            ? {
                id: crypto.randomUUID(),
                title: event.changed ? "Tracker change detected" : "Tracker heartbeat",
                severity: event.nextHealth < 75 ? "high" : "low",
                source: event.tracker.source,
                timestamp: new Date().toISOString(),
                health: event.nextHealth,
              }
            : {
                id: crypto.randomUUID(),
                title: "Heartbeat signal",
                severity: "low",
                timestamp: new Date().toISOString(),
              },
        }),
      );
    }, 5000);
    connection.on("close", () => {
      clearInterval(timer);
      incrementGauge("signalnest_websocket_connections", -1);
    });
  });

  app.setErrorHandler((error: unknown, _request, reply) => {
    if (typeof error === "object" && error !== null && "issues" in error) {
      reply.status(400).send({ error: "Validation failed", details: error });
      return;
    }
    app.log.error(error);
    reply.status(500).send({ error: "Internal server error" });
  });

  setGauge("signalnest_websocket_connections", 0);
  return app;
}
