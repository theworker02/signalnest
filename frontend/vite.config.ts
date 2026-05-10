import react from "@vitejs/plugin-react";
import { resolve } from "node:path";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
  },
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, "index.html"),
        pricing: resolve(__dirname, "pricing.html"),
        login: resolve(__dirname, "login/index.html"),
        signup: resolve(__dirname, "signup/index.html"),
        apiPricing: resolve(__dirname, "api-pricing/index.html"),
        app: resolve(__dirname, "app/index.html"),
        monitoring: resolve(__dirname, "app/monitoring/index.html"),
        changes: resolve(__dirname, "app/changes/index.html"),
        weatherChanges: resolve(__dirname, "app/weather-changes/index.html"),
        map: resolve(__dirname, "app/map/index.html"),
        vault: resolve(__dirname, "app/vault/index.html"),
        alerts: resolve(__dirname, "app/alerts/index.html"),
        workspace: resolve(__dirname, "app/workspace/index.html"),
        analytics: resolve(__dirname, "app/analytics/index.html"),
        security: resolve(__dirname, "app/security/index.html"),
        skills: resolve(__dirname, "app/skills/index.html"),
        developers: resolve(__dirname, "app/developers/index.html"),
        appPricingApi: resolve(__dirname, "app/pricing-api/index.html"),
        settings: resolve(__dirname, "app/settings/index.html"),
        developerDocs: resolve(__dirname, "app/developers/docs/index.html"),
        docsQuickstart: resolve(__dirname, "app/developers/docs/quickstart/index.html"),
        docsApiKeys: resolve(__dirname, "app/developers/docs/api-keys/index.html"),
        docsWebhooks: resolve(__dirname, "app/developers/docs/webhooks/index.html"),
        docsTrackers: resolve(__dirname, "app/developers/docs/trackers/index.html"),
        docsChangeDetection: resolve(__dirname, "app/developers/docs/change-detection/index.html"),
        docsAlerts: resolve(__dirname, "app/developers/docs/alerts/index.html"),
        docsResearchVault: resolve(__dirname, "app/developers/docs/research-vault/index.html"),
        docsSkills: resolve(__dirname, "app/developers/docs/skills/index.html"),
        docsWorkspaces: resolve(__dirname, "app/developers/docs/workspaces/index.html"),
        docsAuthentication: resolve(__dirname, "app/developers/docs/authentication/index.html"),
        docsRateLimits: resolve(__dirname, "app/developers/docs/rate-limits/index.html"),
        docsPagination: resolve(__dirname, "app/developers/docs/pagination/index.html"),
        docsErrors: resolve(__dirname, "app/developers/docs/errors/index.html"),
        docsApiReference: resolve(__dirname, "app/developers/docs/api-reference/index.html"),
        docsCli: resolve(__dirname, "app/developers/docs/cli/index.html"),
        docsSdk: resolve(__dirname, "app/developers/docs/sdk/index.html"),
        docsChangelog: resolve(__dirname, "app/developers/docs/changelog/index.html"),
      },
    },
  },
});
