import type { FastifyPluginAsync } from "fastify";
import { z } from "zod";
import { alertStore, paginate } from "../lib/repository.js";

const alertSchema = z.object({
  name: z.string().min(2).max(140),
  condition: z.string().min(4).max(500),
  priority: z.enum(["low", "medium", "high", "critical"]),
  enabled: z.boolean().default(true),
});

const listSchema = z.object({
  limit: z.coerce.number().int().min(1).max(100).optional(),
  cursor: z.string().optional(),
});

export const alertRoutes: FastifyPluginAsync = async (app) => {
  app.get("/alerts", async (request) => {
    const query = listSchema.parse(request.query);
    return paginate(alertStore.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)), query, (alert) => alert.id);
  });

  app.post("/alerts", async (request, reply) => {
    const input = alertSchema.parse(request.body);
    const timestamp = new Date().toISOString();
    const alert = { id: crypto.randomUUID(), ...input, createdAt: timestamp, updatedAt: timestamp };
    alertStore.unshift(alert);
    reply.code(201);
    return { data: alert };
  });

  app.patch("/alerts/:id", async (request, reply) => {
    const params = z.object({ id: z.string() }).parse(request.params);
    const input = alertSchema.partial().parse(request.body);
    const alert = alertStore.find((item) => item.id === params.id);
    if (!alert) {
      reply.code(404);
      return { error: "Alert not found" };
    }
    Object.assign(alert, input, { updatedAt: new Date().toISOString() });
    return { data: alert };
  });
};
