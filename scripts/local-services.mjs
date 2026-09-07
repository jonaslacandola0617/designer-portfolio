import EmbeddedPostgres from "embedded-postgres";
import { existsSync, mkdirSync, writeFileSync, readFileSync } from "node:fs";
import { randomBytes } from "node:crypto";
import { startTestStorage } from "./test-storage.mjs";
import { parse } from "dotenv";

mkdirSync(".local", { recursive: true });
const secretPath = ".local/service-secrets.json";
const secrets = existsSync(secretPath)
  ? JSON.parse(readFileSync(secretPath, "utf8"))
  : {
      password: randomBytes(24).toString("hex"),
      auth: randomBytes(32).toString("base64"),
      admin: randomBytes(18).toString("base64url"),
    };
if (!existsSync(secretPath))
  writeFileSync(secretPath, JSON.stringify(secrets), { mode: 0o600 });
const pg = new EmbeddedPostgres({
  databaseDir: ".local/postgres",
  port: 55432,
  user: "portfolio",
  password: secrets.password,
  authMethod: "scram-sha-256",
  persistent: true,
  postgresFlags: ["-h", "127.0.0.1"],
  onLog: () => {},
  onError: (message) => {
    if (String(message).includes("FATAL"))
      console.error("Local PostgreSQL reported a fatal error.");
  },
});
if (!existsSync(".local/postgres/PG_VERSION")) await pg.initialise();
await pg.start();
const client = pg.getPgClient("postgres", "127.0.0.1");
await client.connect();
for (const name of ["portfolio", "portfolio_test"]) {
  const result = await client.query(
    "SELECT 1 FROM pg_database WHERE datname = $1",
    [name],
  );
  if (!result.rowCount) await client.query(`CREATE DATABASE ${name}`);
}
await client.end();
const connection = `postgresql://portfolio:${secrets.password}@127.0.0.1:55432/portfolio`;
const values = {
  DATABASE_URL: connection,
  DIRECT_URL: connection,
  TEST_DATABASE_URL: `${connection}_test`,
  AUTH_SECRET: secrets.auth,
  AUTH_URL: "http://localhost:3000",
  NEXT_PUBLIC_SITE_URL: "http://localhost:3000",
  ADMIN_EMAIL: "admin@example.test",
  ADMIN_PASSWORD: secrets.admin,
  SEED_SAMPLES: "true",
  S3_ENDPOINT: "http://127.0.0.1:55433",
  S3_REGION: "us-east-1",
  S3_BUCKET: "portfolio",
  S3_ACCESS_KEY_ID: "local-test",
  S3_SECRET_ACCESS_KEY: "local-test",
  S3_PUBLIC_BASE_URL: "http://127.0.0.1:55433/portfolio",
  S3_FORCE_PATH_STYLE: "true",
  ALLOW_LOCAL_IMAGE_IP: "true",
};
writeFileSync(
  ".local/test.env",
  Object.entries(values)
    .map(([k, v]) => `${k}=${JSON.stringify(v)}`)
    .join("\n"),
  { mode: 0o600 },
);
if (!existsSync(".env"))
  writeFileSync(".env", readFileSync(".local/test.env"), { mode: 0o600 });
else if (parse(readFileSync(".env")).DATABASE_URL !== connection)
  console.log(
    "Existing .env preserved. Local test credentials are in .local/test.env.",
  );

const server = startTestStorage();
console.log(
  "Local PostgreSQL (55432) and test object storage (55433) ready. Credentials are in .local/test.env; existing data is retained.",
);
async function shutdown() {
  server.close();
  await pg.stop();
  process.exit(0);
}
process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
