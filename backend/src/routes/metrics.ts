import type { FastifyPluginAsync } from "fastify";
import { renderMetrics } from "../lib/metrics.js";

export const metricsRoutes: FastifyPluginAsync = async (app) => {
  app.get("/metrics", async (_request, reply) => {
    reply.header("content-type", "text/plain; version=0.0.4; charset=utf-8");
    return renderMetrics();
  });
};
