import { defineConfig, devices } from "@playwright/test";
import "dotenv/config";
export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: false,
  workers: 1,
  retries: process.env.CI ? 1 : 0,
  use: {
    baseURL: process.env.E2E_BASE_URL || "http://localhost:3000",
    trace: "retain-on-failure",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: {
    command: "node node_modules/next/dist/bin/next start",
    url: "http://localhost:3000/admin/login",
    reuseExistingServer: !process.env.CI,
    timeout: 60000,
  },
});
