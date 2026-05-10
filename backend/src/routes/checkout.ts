import type { FastifyPluginAsync } from "fastify";
import { z } from "zod";
import { env } from "../lib/env.js";

const checkoutSchema = z.object({
  skillId: z.string().min(2).max(80),
  skillName: z.string().min(2).max(120),
  amountCents: z.number().int().min(100).max(50000),
  currency: z.string().length(3).default("USD"),
  returnUrl: z.string().url().optional(),
});

const developerSubscriptionSchema = z.object({
  returnUrl: z.string().url().optional(),
});

const withQuery = (baseUrl: string, params: Record<string, string | number | undefined>) => {
  const url = new URL(baseUrl);
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined) url.searchParams.set(key, String(value));
  });
  return url.toString();
};

const simulatedCheckoutUrl = (returnUrl: string, params: Record<string, string | number | undefined>) =>
  withQuery(returnUrl, { checkout: "simulated", ...params });

export const checkoutRoutes: FastifyPluginAsync = async (app) => {
  app.post("/checkout/skill", async (request, reply) => {
    const input = checkoutSchema.parse(request.body);
    const provider = env.BILLING_PROVIDER_NAME;
    const returnUrl = input.returnUrl ?? `${env.WEB_ORIGIN}/app/skills?checkout=returned&skill=${encodeURIComponent(input.skillId)}`;

    if (!env.BILLING_ENABLE_LIVE_CHECKOUT) {
      return {
        data: {
          provider,
          checkoutUrl: simulatedCheckoutUrl(returnUrl, { skill: input.skillId }),
          paymentLinkId: `local-${input.skillId}`,
          orderId: `local-${crypto.randomUUID()}`,
          live: false,
        },
      };
    }

    if (!env.BILLING_SKILL_CHECKOUT_URL) {
      reply.code(503);
      return {
        error: "Hosted skill checkout is not configured",
        details: "Set BILLING_SKILL_CHECKOUT_URL to create paid skill checkout links.",
      };
    }

    return {
      data: {
        provider,
        checkoutUrl: withQuery(env.BILLING_SKILL_CHECKOUT_URL, {
          skill_id: input.skillId,
          skill_name: input.skillName,
          amount_cents: input.amountCents,
          currency: input.currency,
          return_url: returnUrl,
        }),
        paymentLinkId: `billing-${input.skillId}`,
        orderId: `billing-${crypto.randomUUID()}`,
        live: true,
      },
    };
  });

  app.post("/checkout/developer-subscription", async (request, reply) => {
    const input = developerSubscriptionSchema.parse(request.body);
    const provider = env.BILLING_PROVIDER_NAME;
    const returnUrl = input.returnUrl ?? `${env.WEB_ORIGIN}/app/developers?developer_subscription=returned`;

    if (!env.BILLING_ENABLE_LIVE_CHECKOUT) {
      return {
        data: {
          provider,
          checkoutUrl: simulatedCheckoutUrl(returnUrl, { plan: "developer-pro", cadence: "monthly" }),
          paymentLinkId: "local-developer-pro-monthly",
          orderId: `local-${crypto.randomUUID()}`,
          amountCents: 1000,
          cadence: "monthly",
          live: false,
        },
      };
    }

    if (!env.BILLING_DEVELOPER_SUBSCRIPTION_URL) {
      reply.code(503);
      return {
        error: "Hosted developer subscription checkout is not configured",
        details: "Set BILLING_DEVELOPER_SUBSCRIPTION_URL for the $10/month developer plan.",
      };
    }

    return {
      data: {
        provider,
        checkoutUrl: withQuery(env.BILLING_DEVELOPER_SUBSCRIPTION_URL, {
          plan: "developer-pro",
          amount_cents: 1000,
          currency: "USD",
          cadence: "monthly",
          return_url: returnUrl,
        }),
        paymentLinkId: "billing-developer-pro-monthly",
        orderId: `billing-${crypto.randomUUID()}`,
        amountCents: 1000,
        cadence: "monthly",
        live: true,
      },
    };
  });
};
