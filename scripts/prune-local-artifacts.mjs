#!/usr/bin/env node
import { rmSync, existsSync } from "node:fs";
import { join } from "node:path";

const targets = [
  join("frontend", "dist"),
  join("backend", "dist"),
  join("frontend", "tsconfig.tsbuildinfo"),
];

for (const target of targets) {
  if (existsSync(target)) {
    rmSync(target, { recursive: true, force: true });
    console.log(`Removed ${target}`);
  }
}
