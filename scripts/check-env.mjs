#!/usr/bin/env node
import { existsSync, readFileSync } from "node:fs";
import process from "node:process";

const envPairs = [
  ["frontend/.env.example", "frontend/.env"],
  ["backend/.env.example", "backend/.env"],
];

const parseEnv = (path) =>
  Object.fromEntries(
    readFileSync(path, "utf8")
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter((line) => line && !line.startsWith("#") && line.includes("="))
      .map((line) => {
        const [key, ...valueParts] = line.split("=");
        return [key.trim(), valueParts.join("=")];
      }),
  );

const failures = [];

for (const [examplePath, actualPath] of envPairs) {
  if (!existsSync(actualPath)) {
    failures.push(`${actualPath} is missing`);
    continue;
  }

  const example = parseEnv(examplePath);
  const actual = parseEnv(actualPath);
  const required = Object.entries(example)
    .filter(([, value]) => value.length > 0)
    .map(([key]) => key);
  const missing = required.filter((key) => !actual[key]);

  if (missing.length) {
    failures.push(`${actualPath} missing ${missing.join(", ")}`);
  }
}

if (failures.length) {
  console.error(`Environment check failed:\n- ${failures.join("\n- ")}`);
  process.exit(1);
}

console.log("Environment check passed for frontend/.env and backend/.env.");
