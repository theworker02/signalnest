import assert from "node:assert/strict";
import { describe, it, beforeEach } from "node:test";
import { buildApp } from "../backend/src/app.ts";
import { resetMetrics } from "../backend/src/lib/metrics.ts";

describe("SignalNest API", () => {
  beforeEach(() => {
    resetMetrics();
  });

  it("serves health and prometheus metrics", async () => {
    const app = await buildApp({ logger: false });
    const health = await app.inject({ method: "GET", url: "/api/health" });
    const metrics = await app.inject({ method: "GET", url: "/api/metrics" });
    await app.close();

    assert.equal(health.statusCode, 200);
    assert.equal(metrics.statusCode, 200);
    assert.match(metrics.body, /signalnest_http_requests_total/);
    assert.match(metrics.headers["content-type"] as string, /text\/plain/);
  });

  it("creates, refreshes, and archives a tracker", async () => {
    const app = await buildApp({ logger: false });
    const create = await app.inject({
      method: "POST",
      url: "/api/trackers",
      payload: {
        title: "API test monitor",
        kind: "website",
        source: "https://example.com",
        intervalSeconds: 300,
        tags: ["test"],
      },
    });

    assert.equal(create.statusCode, 201);
    const created = create.json().data as { id: string; title: string };
    assert.equal(created.title, "API test monitor");

    const refresh = await app.inject({ method: "POST", url: `/api/trackers/${created.id}/refresh` });
    assert.equal(refresh.statusCode, 200);
    assert.ok(refresh.json().data.lastCheckedAt);

    const archive = await app.inject({
      method: "PATCH",
      url: `/api/trackers/${created.id}`,
      payload: { archived: true },
    });
    await app.close();

    assert.equal(archive.statusCode, 200);
    assert.equal(archive.json().data.archived, true);
  });

  it("opens and refreshes an auth session", async () => {
    const app = await buildApp({ logger: false });
    const login = await app.inject({
      method: "POST",
      url: "/api/auth/login",
      payload: {
        email: "api-test@signalnest.local",
        password: "signalnest-test-password",
      },
    });

    assert.equal(login.statusCode, 200);
    const session = login.json().data as { accessToken: string; refreshToken: string; user: { email: string } };
    assert.equal(session.user.email, "api-test@signalnest.local");
    assert.equal(session.accessToken.split(".").length, 3);

    const refresh = await app.inject({
      method: "POST",
      url: "/api/auth/refresh",
      payload: { refreshToken: session.refreshToken },
    });
    await app.close();

    assert.equal(refresh.statusCode, 200);
    assert.equal(refresh.json().data.accessToken.split(".").length, 3);
  });

  it("stages local marketplace checkout when live billing handoff is disabled", async () => {
    const app = await buildApp({ logger: false });
    const checkout = await app.inject({
      method: "POST",
      url: "/api/checkout/skill",
      payload: {
        skillId: "cve-radar",
        skillName: "CVE Radar",
        amountCents: 1200,
        currency: "USD",
      },
    });
    await app.close();

    assert.equal(checkout.statusCode, 200);
    const payload = checkout.json() as { data: { checkoutUrl: string; live: boolean; paymentLinkId: string } };
    assert.equal(payload.data.live, false);
    assert.equal(payload.data.paymentLinkId, "local-cve-radar");
    assert.match(payload.data.checkoutUrl, /checkout=simulated/);
  });

  it("stages local developer subscription checkout for the API key paywall", async () => {
    const app = await buildApp({ logger: false });
    const checkout = await app.inject({
      method: "POST",
      url: "/api/checkout/developer-subscription",
      payload: {
        returnUrl: "http://127.0.0.1:5173/app/developers?developer_subscription=returned",
      },
    });
    await app.close();

    assert.equal(checkout.statusCode, 200);
    const payload = checkout.json() as { data: { checkoutUrl: string; live: boolean; paymentLinkId: string; amountCents: number; cadence: string } };
    assert.equal(payload.data.live, false);
    assert.equal(payload.data.paymentLinkId, "local-developer-pro-monthly");
    assert.equal(payload.data.amountCents, 1000);
    assert.equal(payload.data.cadence, "monthly");
    assert.match(payload.data.checkoutUrl, /developer_subscription=returned/);
    assert.match(payload.data.checkoutUrl, /checkout=simulated/);
  });
});
