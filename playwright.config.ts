import { createLovableConfig } from "lovable-agent-playwright-config/config";

const isCI = !!process.env.CI;
const baseURL = process.env.PLAYWRIGHT_BASE_URL ?? "http://localhost:8080";

export default createLovableConfig({
  // Total time a single test may run.
  timeout: 60_000,
  // Time allotted to each `expect` poll/assertion.
  expect: { timeout: 10_000 },

  // CI hardening
  forbidOnly: isCI,
  retries: isCI ? 2 : 0,
  workers: isCI ? 1 : undefined,
  fullyParallel: !isCI,

  reporter: isCI
    ? [
        ["github"],
        ["html", { open: "never", outputFolder: "playwright-report" }],
        ["junit", { outputFile: "playwright-report/results.xml" }],
        ["list"],
      ]
    : [["list"], ["html", { open: "never", outputFolder: "playwright-report" }]],

  use: {
    baseURL,
    actionTimeout: 15_000,
    navigationTimeout: 30_000,
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
  },

  // Spin up the dev server locally; on CI assume the URL is already reachable.
  webServer: isCI
    ? undefined
    : {
        command: "bun run dev",
        url: baseURL,
        reuseExistingServer: true,
        timeout: 120_000,
      },
});
