import type { FastifyPluginAsync } from "fastify";
import { z } from "zod";
import { sessionStore, userStore } from "../lib/repository.js";
import { hashPassword, issueAccessToken, issueRefreshToken, verifyPassword } from "../lib/security.js";

const credentialsSchema = z.object({
  email: z.string().email().transform((email) => email.toLowerCase()),
  password: z.string().min(8).max(256),
});

const refreshSchema = z.object({
  refreshToken: z.string().min(20),
});

export const authRoutes: FastifyPluginAsync = async (app) => {
  app.post("/auth/register", async (request, reply) => {
    const input = credentialsSchema.parse(request.body);
    if (userStore.some((user) => user.email === input.email)) {
      reply.code(409);
      return { error: "Email already registered" };
    }

    const timestamp = new Date().toISOString();
    const user = {
      id: crypto.randomUUID(),
      email: input.email,
      passwordHash: await hashPassword(input.password),
      mfaEnabled: false,
      createdAt: timestamp,
      updatedAt: timestamp,
    };
    userStore.push(user);

    const session = createSession(user.id, request.headers["user-agent"], request.ip);
    return {
      data: {
        user: publicUser(user),
        accessToken: issueAccessToken(user.id, session.id),
        refreshToken: session.refreshToken,
      },
    };
  });

  app.post("/auth/login", async (request, reply) => {
    const input = credentialsSchema.parse(request.body);
    let user = userStore.find((item) => item.email === input.email);

    if (!user) {
      const timestamp = new Date().toISOString();
      user = {
        id: crypto.randomUUID(),
        email: input.email,
        passwordHash: await hashPassword(input.password),
        mfaEnabled: true,
        createdAt: timestamp,
        updatedAt: timestamp,
      };
      userStore.push(user);
    } else if (!(await verifyPassword(user.passwordHash, input.password))) {
      reply.code(401);
      return { error: "Invalid credentials" };
    }

    const session = createSession(user.id, request.headers["user-agent"], request.ip);
    return {
      data: {
        user: publicUser(user),
        accessToken: issueAccessToken(user.id, session.id),
        refreshToken: session.refreshToken,
      },
    };
  });

  app.post("/auth/refresh", async (request, reply) => {
    const input = refreshSchema.parse(request.body);
    const session = sessionStore.find((item) => item.refreshToken === input.refreshToken && !item.revokedAt);
    if (!session) {
      reply.code(401);
      return { error: "Invalid refresh token" };
    }

    session.revokedAt = new Date().toISOString();
    const next = createSession(session.userId, session.userAgent, session.ipAddress, session.tokenFamilyId);
    return {
      data: {
        accessToken: issueAccessToken(next.userId, next.id),
        refreshToken: next.refreshToken,
      },
    };
  });
};

function createSession(userId: string, userAgent?: string, ipAddress?: string, familyId: string = crypto.randomUUID()) {
  const sessionId = crypto.randomUUID();
  const refreshToken = issueRefreshToken(userId, sessionId, familyId);
  const session = {
    id: sessionId,
    userId,
    refreshToken,
    tokenFamilyId: familyId,
    userAgent,
    ipAddress,
    expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30).toISOString(),
    createdAt: new Date().toISOString(),
  };
  sessionStore.push(session);
  return session;
}

function publicUser(user: { id: string; email: string; mfaEnabled: boolean }) {
  return {
    id: user.id,
    email: user.email,
    mfaEnabled: user.mfaEnabled,
  };
}
