import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readdirSync, readFileSync, rmSync, statSync, writeFileSync, cpSync } from "node:fs";
import { basename, dirname, join, relative, resolve } from "node:path";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const root = resolve(fileURLToPath(new URL("..", import.meta.url)));
const pkg = JSON.parse(readFileSync(join(root, "package.json"), "utf8"));
const releaseRoot = join(root, "release");
const stagingRoot = join(releaseRoot, "staging");
const version = pkg.version ?? "0.0.0";
const stamp = new Date().toISOString().replace(/[:.]/g, "-");
const releaseName = `signalnest-${version}-${stamp}`;

const requiredBuilds = [
  "frontend/dist/index.html",
  "backend/dist/server.js",
  "shared/dist/cli.js",
  "shared/dist/index.js",
];

for (const file of requiredBuilds) {
  if (!existsSync(join(root, file))) {
    throw new Error(`Missing build output: ${file}. Run npm run build before generating release artifacts.`);
  }
}

rmSync(releaseRoot, { recursive: true, force: true });
mkdirSync(stagingRoot, { recursive: true });

const artifacts = [
  {
    id: "site",
    title: "SignalNest Web Site",
    description: "Static Vite build, nginx config, Docker Compose reference, and frontend environment template.",
    entries: [
      ["frontend/dist", "public"],
      ["frontend/package.json", "package.json"],
      ["frontend/.env.example", ".env.example"],
      ["nginx", "nginx"],
      ["docker-compose.yml", "docker-compose.yml"],
      ["docs/DEPLOYMENT.md", "docs/DEPLOYMENT.md"],
      ["docs/PRODUCTION_CHECKLIST.md", "docs/PRODUCTION_CHECKLIST.md"],
      ["LICENSE", "LICENSE"],
      ["README.md", "README.md"],
    ],
  },
  {
    id: "api",
    title: "SignalNest API",
    description: "Compiled Fastify API, backend environment template, database SQL, API docs, and runtime package metadata.",
    entries: [
      ["backend/dist", "backend/dist"],
      ["backend/package.json", "backend/package.json"],
      ["backend/.env.example", "backend/.env.example"],
      ["database", "database"],
      ["docs/API.md", "docs/API.md"],
      ["docs/ARCHITECTURE.md", "docs/ARCHITECTURE.md"],
      ["docker/backend.Dockerfile", "docker/backend.Dockerfile"],
      ["LICENSE", "LICENSE"],
      ["README.md", "README.md"],
    ],
  },
  {
    id: "sdk-cli",
    title: "SignalNest SDK and CLI",
    description: "Compiled @signalnest/sdk package with terminal CLI for health, tracker, alert, and environment workflows.",
    entries: [
      ["shared/dist", "dist"],
      ["shared/package.json", "package.json"],
      ["shared/README.md", "README.md"],
      ["LICENSE", "LICENSE"],
    ],
  },
];

const checksumRows = [];

for (const artifact of artifacts) {
  const stageDir = join(stagingRoot, artifact.id);
  mkdirSync(stageDir, { recursive: true });

  for (const [from, to] of artifact.entries) {
    copyRequired(join(root, from), join(stageDir, to));
  }

  const files = listFiles(stageDir).map((file) => relative(stageDir, file).replace(/\\/g, "/"));
  const manifest = {
    artifact: artifact.id,
    name: artifact.title,
    description: artifact.description,
    version,
    generatedAt: new Date().toISOString(),
    sourcePackage: pkg.name,
    files,
  };
  writeFileSync(join(stageDir, "release-manifest.json"), `${JSON.stringify(manifest, null, 2)}\n`);

  const archivePath = join(releaseRoot, `${releaseName}-${artifact.id}.zip`);
  createZip(stageDir, archivePath);
  checksumRows.push(`${sha256(archivePath)}  ${basename(archivePath)}`);
}

writeFileSync(join(releaseRoot, "SHA256SUMS.txt"), `${checksumRows.join("\n")}\n`);
writeFileSync(
  join(releaseRoot, "release-manifest.json"),
  `${JSON.stringify(
    {
      name: releaseName,
      version,
      generatedAt: new Date().toISOString(),
      artifacts: artifacts.map((artifact) => ({
        id: artifact.id,
        archive: `${releaseName}-${artifact.id}.zip`,
        title: artifact.title,
        description: artifact.description,
      })),
    },
    null,
    2,
  )}\n`,
);

rmSync(stagingRoot, { recursive: true, force: true });

console.log(`Generated release artifacts in ${releaseRoot}`);
for (const row of checksumRows) console.log(row);

function copyRequired(from, to) {
  if (!existsSync(from)) throw new Error(`Cannot package missing path: ${relative(root, from)}`);
  mkdirSync(dirname(to), { recursive: true });
  cpSync(from, to, {
    recursive: true,
    filter(source) {
      const name = basename(source);
      return !["node_modules", ".env", ".env.local", ".env.production", ".env.development", ".DS_Store"].includes(name);
    },
  });
}

function listFiles(dir) {
  const output = [];
  for (const entry of readdirSync(dir)) {
    const file = join(dir, entry);
    if (statSync(file).isDirectory()) output.push(...listFiles(file));
    else output.push(file);
  }
  return output;
}

function createZip(sourceDir, archivePath) {
  if (process.platform === "win32") {
    const source = `${sourceDir}\\*`.replaceAll("'", "''");
    const destination = archivePath.replaceAll("'", "''");
    execFileSync("powershell", [
      "-NoProfile",
      "-Command",
      `$ErrorActionPreference='Stop'; Compress-Archive -Path '${source}' -DestinationPath '${destination}' -Force`,
    ]);
    return;
  }

  execFileSync("zip", ["-qr", archivePath, "."], { cwd: sourceDir });
}

function sha256(file) {
  return createHash("sha256").update(readFileSync(file)).digest("hex");
}
