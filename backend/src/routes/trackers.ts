import type { FastifyPluginAsync } from "fastify";
import { z } from "zod";
import { paginate, trackerStore } from "../lib/repository.js";

const trackerSchema = z.object({
  title: z.string().min(2).max(120),
  kind: z.enum(["website", "rss", "api", "github", "news", "stock", "weather", "outage", "keyword", "subreddit"]),
  source: z.string().min(2).max(500),
  intervalSeconds: z.number().int().min(30).max(86400).default(300),
  tags: z.array(z.string().min(1).max(40)).default([]),
});

const listSchema = z.object({
  limit: z.coerce.number().int().min(1).max(100).optional(),
  cursor: z.string().optional(),
  includeArchived: z.coerce.boolean().default(false),
});

const patchSchema = trackerSchema.partial().extend({
  enabled: z.boolean().optional(),
  archived: z.boolean().optional(),
});

export const trackerRoutes: FastifyPluginAsync = async (app) => {
  app.get("/trackers", async (request) => {
    const query = listSchema.parse(request.query);
    const rows = trackerStore
      .filter((tracker) => query.includeArchived || !tracker.archived)
      .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
    return paginate(rows, query, (tracker) => tracker.id);
  });

  app.post("/trackers", async (request, reply) => {
    const input = trackerSchema.parse(request.body);
    const timestamp = new Date().toISOString();
    const tracker = {
      id: crypto.randomUUID(),
      ...input,
      health: 100,
      enabled: true,
      archived: false,
      createdAt: timestamp,
      updatedAt: timestamp,
    };
    trackerStore.unshift(tracker);
    reply.code(201);
    return { data: tracker };
  });

  app.post("/trackers/:id/refresh", async (request, reply) => {
    const params = z.object({ id: z.string() }).parse(request.params);
    const tracker = trackerStore.find((item) => item.id === params.id);
    if (!tracker) {
      reply.code(404);
      return { error: "Tracker not found" };
    }
    tracker.health = Math.max(1, Math.min(100, tracker.health + Math.round(Math.random() * 8 - 4)));
    tracker.lastCheckedAt = new Date().toISOString();
    tracker.updatedAt = tracker.lastCheckedAt;
    return { data: tracker };
  });

  app.patch("/trackers/:id", async (request, reply) => {
    const params = z.object({ id: z.string() }).parse(request.params);
    const input = patchSchema.parse(request.body);
    const tracker = trackerStore.find((item) => item.id === params.id);
    if (!tracker) {
      reply.code(404);
      return { error: "Tracker not found" };
    }
    Object.assign(tracker, input, { updatedAt: new Date().toISOString() });
    return { data: tracker };
  });
};
