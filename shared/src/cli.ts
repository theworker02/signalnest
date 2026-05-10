#!/usr/bin/env node
import { SignalNestClient, SIGNALNEST_TRACKER_KINDS, type SignalSeverity, type SignalTrackerKind } from "./index.js";

type ParsedArgs = {
  command: string[];
  flags: Record<string, string | boolean>;
};

const parsed = parseArgs(process.argv.slice(2));
const client = new SignalNestClient({
  apiKey: stringFlag("api-key") ?? process.env.SIGNALNEST_API_KEY,
  baseUrl: stringFlag("api-url") ?? process.env.SIGNALNEST_API_URL ?? "http://127.0.0.1:4040/api",
});

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});

async function main() {
  const [scope, action] = parsed.command;
  if (!scope || scope === "help" || hasFlag("help")) return printHelp();

  if (scope === "health") {
    return print(await client.health());
  }

  if (scope === "trackers" && action === "list") {
    return print(await client.listTrackers({ limit: numberFlag("limit"), includeArchived: hasFlag("include-archived") }));
  }

  if (scope === "trackers" && action === "create") {
    const title = requiredFlag("title");
    const source = requiredFlag("source");
    const kind = (stringFlag("kind") ?? "website") as SignalTrackerKind;
    if (!SIGNALNEST_TRACKER_KINDS.includes(kind)) throw new Error(`Invalid tracker kind: ${kind}`);
    return print(
      await client.createTracker({
        title,
        source,
        kind,
        intervalSeconds: numberFlag("interval") ?? 300,
        tags: csvFlag("tags"),
      }),
    );
  }

  if (scope === "trackers" && action === "refresh") {
    return print(await client.refreshTracker(requiredFlag("id")));
  }

  if (scope === "trackers" && action === "archive") {
    return print(await client.archiveTracker(requiredFlag("id")));
  }

  if (scope === "alerts" && action === "list") {
    return print(await client.listAlerts({ limit: numberFlag("limit") }));
  }

  if (scope === "alerts" && action === "create") {
    return print(
      await client.createAlert({
        name: requiredFlag("name"),
        condition: requiredFlag("condition"),
        priority: (stringFlag("priority") ?? "medium") as SignalSeverity,
        enabled: !hasFlag("disabled"),
      }),
    );
  }

  if (scope === "init-env") {
    return console.log(`SIGNALNEST_API_URL=${client.baseUrl}\nSIGNALNEST_API_KEY=sn_live_key_replace_me`);
  }

  if (scope === "docs") {
    return console.log("Developer docs: http://127.0.0.1:5173/app/developers/docs");
  }

  throw new Error(`Unknown command: ${parsed.command.join(" ")}`);
}

function parseArgs(args: string[]): ParsedArgs {
  const command: string[] = [];
  const flags: Record<string, string | boolean> = {};

  for (let index = 0; index < args.length; index += 1) {
    const value = args[index];
    if (!value.startsWith("--")) {
      command.push(value);
      continue;
    }
    const key = value.slice(2);
    const next = args[index + 1];
    if (!next || next.startsWith("--")) {
      flags[key] = true;
    } else {
      flags[key] = next;
      index += 1;
    }
  }

  return { command, flags };
}

function hasFlag(name: string) {
  return Boolean(parsed.flags[name]);
}

function stringFlag(name: string) {
  const value = parsed.flags[name];
  return typeof value === "string" ? value : undefined;
}

function requiredFlag(name: string) {
  const value = stringFlag(name);
  if (!value) throw new Error(`Missing required flag --${name}`);
  return value;
}

function numberFlag(name: string) {
  const value = stringFlag(name);
  return value ? Number(value) : undefined;
}

function csvFlag(name: string) {
  return (stringFlag(name) ?? "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function print(value: unknown) {
  console.log(JSON.stringify(value, null, 2));
}

function printHelp() {
  console.log(`SignalNest CLI

Usage:
  signalnest health [--api-url URL] [--api-key KEY]
  signalnest trackers list [--limit 20] [--include-archived]
  signalnest trackers create --title NAME --kind website --source URL [--interval 300] [--tags pricing,competitor]
  signalnest trackers refresh --id TRACKER_ID
  signalnest trackers archive --id TRACKER_ID
  signalnest alerts list [--limit 20]
  signalnest alerts create --name NAME --condition EXPR --priority high
  signalnest init-env
  signalnest docs

Environment:
  SIGNALNEST_API_URL   Defaults to http://127.0.0.1:4040/api
  SIGNALNEST_API_KEY   Optional bearer token sent as Authorization
`);
}
