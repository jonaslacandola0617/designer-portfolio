import "dotenv/config";
import { spawnSync } from "node:child_process";
const url = process.env.TEST_DATABASE_URL;
if (!url || !new URL(url).pathname.endsWith("/portfolio_test"))
  throw new Error(
    "TEST_DATABASE_URL must use the disposable portfolio_test database.",
  );
const result = spawnSync(
  process.execPath,
  ["node_modules/prisma/build/index.js", "migrate", "deploy"],
  {
    stdio: "inherit",
    windowsHide: true,
    env: { ...process.env, DATABASE_URL: url, DIRECT_URL: url },
  },
);
process.exitCode = result.status ?? 1;
