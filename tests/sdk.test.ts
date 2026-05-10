import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { SignalNestClient } from "../shared/src/index.ts";

describe("SignalNest SDK", () => {
  it("sends bearer auth and creates trackers through the configured API URL", async () => {
    const calls: Array<{ url: string; init: RequestInit }> = [];
    const client = new SignalNestClient({
      apiKey: "sn_live_key_test",
      baseUrl: "https://api.signalnest.test/api/",
      fetchImpl: async (url, init = {}) => {
        calls.push({ url: String(url), init });
        return new Response(
          JSON.stringify({
            data: {
              id: "trk-test",
              title: "SDK tracker",
              kind: "website",
              source: "https://example.com",
              intervalSeconds: 300,
              tags: ["sdk"],
              health: 100,
              enabled: true,
              archived: false,
              createdAt: "2026-05-08T00:00:00.000Z",
              updatedAt: "2026-05-08T00:00:00.000Z",
            },
          }),
          { status: 201, headers: { "content-type": "application/json" } },
        );
      },
    });

    const response = await client.createTracker({
      title: "SDK tracker",
      kind: "website",
      source: "https://example.com",
      tags: ["sdk"],
    });

    assert.equal(response.data.id, "trk-test");
    assert.equal(calls[0].url, "https://api.signalnest.test/api/trackers");
    const headers = new Headers(calls[0].init.headers);
    assert.equal(headers.get("authorization"), "Bearer sn_live_key_test");
    assert.equal(headers.get("content-type"), "application/json");
  });
});
