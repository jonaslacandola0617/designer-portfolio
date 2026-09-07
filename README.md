# Jonas Lacandola — design portfolio

A graphic-design portfolio and private CMS for `design.jonasl.online`. Public presentation is deliberately neutral and replaceable. Projects, media, authentication and publishing logic are independent of public components.

## Stack

Next.js App Router, React, strict TypeScript, Tailwind CSS, PostgreSQL, Prisma 6, Auth.js credentials/JWT sessions, Zod, dnd-kit and AWS SDK v3. Vitest covers domain and database behavior; Playwright covers browser workflows. Node.js 22.12+ is recommended; this project is verified with Node.js 24.

## Local setup

```sh
npm install --legacy-peer-deps
cp .env.example .env
```

Configure PostgreSQL and authentication in `.env`. Generate `AUTH_SECRET` using the command in `.env.example`. Set a real `ADMIN_EMAIL` and a password of at least 12 characters and at most 72 UTF-8 bytes.

```sh
npm run db:migrate
npm run db:seed
npm run dev
```

Visit `/admin/login`. Seeding creates the administrator, initial categories and site settings; repeated seeds preserve existing records and do not reset passwords. Seed additional administrators by changing the seed-only email/password variables. Set contact details and bio in Settings before launching.

### Self-contained local testing

For a fresh checkout without PostgreSQL, run `npm run local:services` in a separate terminal. It starts a real local PostgreSQL cluster on `127.0.0.1:55432` and an in-memory S3 test double on `127.0.0.1:55433`. It creates `.env` only if absent, and always writes its generated local credentials to `.local/test.env`. If you already have an environment, use a separate checkout or explicitly load that file for local testing. The generated administrator email is `admin@example.test`; read the password from the ignored environment file. These services never create production infrastructure.

Run migrations and seed as above. The generated local environment enables three clearly fictional samples. PostgreSQL data persists in `.local/postgres`; test storage lasts for the process lifetime. Stop with Ctrl+C. Never use this test storage in production.

## Environment

| Variable                                   | Purpose                                                                                              |
| ------------------------------------------ | ---------------------------------------------------------------------------------------------------- |
| `DATABASE_URL`                             | PostgreSQL runtime connection, preferably pooled with TLS in production                              |
| `DIRECT_URL`                               | Direct PostgreSQL connection for migrations                                                          |
| `AUTH_SECRET`                              | Random session encryption/signing secret; keep stable between deployments                            |
| `AUTH_URL`                                 | Exact application origin, `https://design.jonasl.online` in production                               |
| `NEXT_PUBLIC_SITE_URL`                     | Canonical public origin; same production URL                                                         |
| `ADMIN_EMAIL`, `ADMIN_PASSWORD`            | Seed-only administrator setup; unnecessary in deployed runtime                                       |
| `SEED_SAMPLES`                             | `true` creates fictional development samples; disabled by default and rejected under production mode |
| `S3_ENDPOINT`                              | S3-compatible API endpoint; blank uses AWS S3                                                        |
| `S3_REGION`                                | Provider region (`auto` for providers that require it)                                               |
| `S3_BUCKET`                                | Image bucket                                                                                         |
| `S3_ACCESS_KEY_ID`, `S3_SECRET_ACCESS_KEY` | Server-only scoped storage credentials                                                               |
| `S3_PUBLIC_BASE_URL`                       | Public image origin and optional path prefix; used to constrain Next Image                           |
| `S3_FORCE_PATH_STYLE`                      | Enable only for providers requiring path-style addressing                                            |
| `MAX_UPLOAD_MB`                            | Upload limit; defaults to 20, can be lowered                                                         |
| `TEST_DATABASE_URL`                        | Separate disposable database named `portfolio_test`                                                  |
| `E2E_BASE_URL`                             | Optional browser-test origin; default `http://localhost:3000`                                        |
| `ALLOW_LOCAL_IMAGE_IP`                     | Local testing only; enables optimizing loopback-hosted test images, disabled on Vercel               |

No contact-form provider is required: contact uses editable email and social links.

## Object storage

Use an S3-compatible bucket with public read access **only for `portfolio/`**, or expose that prefix through a CDN. Keep `pending/` private. Grant the application Put/Get/Delete for these two prefixes; never grant arbitrary account-level permissions. Restrict CORS to the application origins:

```json
[
  {
    "AllowedOrigins": ["https://design.jonasl.online"],
    "AllowedMethods": ["PUT", "GET", "HEAD"],
    "AllowedHeaders": ["*"],
    "ExposeHeaders": ["ETag"],
    "MaxAgeSeconds": 3600
  }
]
```

Add `http://localhost:3000` only for a development bucket. Signed PUT URLs expire after five minutes. Upload completion checks ownership, expiration, size, MIME and decoded image format/dimensions, then writes verified bytes to a new immutable key. Browser uploads never pass through application request bodies. Only still JPEG, PNG, WebP and AVIF uploads are accepted; local sample SVGs are trusted repository assets, not an allowed upload type.

Configure a lifecycle rule deleting `pending/` objects after one day. Expired upload-intent records can be removed periodically with `DELETE FROM "UploadIntent" WHERE "expiresAt" < NOW();`. Set request/function timeouts appropriate for reading and validating up to 20 MB; the Vercel configuration allows 60 seconds. Large decoded images over 80 million pixels are rejected.

Deleting a project retains media. Referenced assets cannot be deleted because of restrictive foreign keys. The media library lists all project/settings references: detach in those editors and save before confirming deletion. Object deletions are queued transactionally, attempted immediately, and can be retried from Media if the provider was unavailable.

## Commands and checks

```sh
npm run db:generate
npm run lint
npm run typecheck
npm test
npm run db:test:migrate
npm run test:integration
npm run build
npx playwright install chromium
npm run test:e2e
```

Integration tests refuse to run unless `TEST_DATABASE_URL` names `portfolio_test`. Browser tests require a local seeded database, sample artwork, and seed administrator credentials. They edit local content and must not target production. Run local services for upload tests. Playwright starts the production build automatically. `npm run db:dev` creates development migrations; `npm run db:studio` opens Prisma Studio; `npm run format` formats source.

The lockfile includes security-patched Auth.js and sharp versions and a `deepmerge-ts` override for the Prisma CLI dependency. Keep the lockfile and run `npm audit` on dependency updates. Auth.js v5 is currently distributed under a beta tag; the exact tested version is pinned.

## Deploy to Vercel

1. Create a managed PostgreSQL database and S3-compatible bucket. Configure storage CORS, public image hosting and the pending-object lifecycle rule.
2. Import this repository as its own Vercel Next.js project. Use Node.js 24. Install with `npm ci --legacy-peer-deps`; build with `npm run build`. Prisma generation runs at install and build time.
3. Set production environment variables. Use TLS database connections, a unique `AUTH_SECRET`, and the exact production `AUTH_URL` / `NEXT_PUBLIC_SITE_URL`. Do not enable local testing variables or sample seeding. Use separate databases, storage and secrets for preview deployments.
4. From a trusted environment with the production direct database URL, run `npm run db:migrate` once as a release step. Do not migrate from every serverless invocation. Take a backup before subsequent schema changes.
5. Seed the initial administrator and settings using the production database, `SEED_SAMPLES=false`, and seed-only admin credentials. Remove seed credentials from the runtime configuration afterward.
6. Deploy and verify login/logout, a real storage upload, publishing, private drafts, metadata and image optimization. Content changes do not require redeployment.
7. In this project's Domains settings, add **design.jonasl.online**. Set the `design` DNS record to the exact target Vercel displays and wait for ownership/TLS verification. Keep `jonasl.online` and its primary technical portfolio deployment independent; do not change apex DNS for this application.

Sessions use Auth.js encrypted HttpOnly cookies, secure cookies on HTTPS, SameSite protection and an eight-hour lifetime. Every CMS mutation checks the current administrator against PostgreSQL; deleted administrators lose access. Login attempts are counted atomically in PostgreSQL per normalized email (10 per 15 minutes), so limits survive serverless restarts. Admin routes and previews are noindex/nofollow.

Public reads use server services with per-request query deduplication. Routes are rendered from live PostgreSQL, and mutations also invalidate the public route tree and sitemap. This small portfolio has no vendor-specific database extension or mandatory public REST API.

See [the design integration contract](docs/DESIGN-INTEGRATION.md) for the final prototype handoff.
