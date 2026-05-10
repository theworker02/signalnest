#!/usr/bin/env node
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import process from "node:process";
import { Client } from "pg";

const backendEnvPath = resolve("backend", ".env");
if (existsSync(backendEnvPath)) {
  for (const line of readFileSync(backendEnvPath, "utf8").split(/\r?\n/)) {
    if (!line || line.trim().startsWith("#") || !line.includes("=")) {
      continue;
    }
    const [key, ...valueParts] = line.split("=");
    process.env[key.trim()] ??= valueParts.join("=");
  }
}

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  console.error("DATABASE_URL is required in backend/.env.");
  process.exit(1);
}

const seedPath = resolve("database", "seed.sql");
const sql = readFileSync(seedPath, "utf8");
const client = new Client({ connectionString: databaseUrl });

try {
  await client.connect();
  await client.query(sql);
  console.log(`Seeded database using ${seedPath}`);
} finally {
  await client.end();
}
