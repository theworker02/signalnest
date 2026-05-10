import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { config } from "dotenv";
import { z } from "zod";

const envFileName = process.env.NODE_ENV === "test" ? ".env.test" : ".env";
const envFile = resolve(dirname(fileURLToPath(import.meta.url)), "../../", envFileName);
config({ path: envFile, quiet: true });

const optionalUrl = z.preprocess((value) => (value === "" ? undefined : value), z.string().url().optional());

const schema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  HOST: z.string().min(1).default("127.0.0.1"),
  PORT: z.coerce.number().default(4040),
  DATABASE_URL: z.string().min(1).default("postgresql://signalnest:signalnest@localhost:5432/signalnest"),
  REDIS_URL: z.string().min(1).default("redis://localhost:6379"),
  JWT_ACCESS_SECRET: z.string().min(32).default("dev-access-secret-change-before-production-000"),
  JWT_REFRESH_SECRET: z.string().min(32).default("dev-refresh-secret-change-before-production-000"),
  WEB_ORIGIN: z.string().url().default("http://127.0.0.1:5173"),
  BILLING_ENABLE_LIVE_CHECKOUT: z.coerce.boolean().default(false),
  BILLING_PROVIDER_NAME: z.string().min(2).default("Hosted billing"),
  BILLING_SKILL_CHECKOUT_URL: optionalUrl,
  BILLING_DEVELOPER_SUBSCRIPTION_URL: optionalUrl,
});

export const env = schema.parse(process.env);
