import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: false,
  workers: 1,
  retries: 0,
  use: { baseURL: "http://127.0.0.1:4311", browserName: "chromium", trace: "retain-on-failure" },
  webServer: {
    command: "node dist/server/main.js",
    url: "http://127.0.0.1:4311/healthz",
    env: { PORT: "4311", HOST: "127.0.0.1" },
    reuseExistingServer: false,
    timeout: 30_000,
  },
});
