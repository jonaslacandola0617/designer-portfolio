# Public design integration contract

Replace `src/components/public/*`, public page composition under `src/app/(public)`, and public styling. Preserve route behavior and metadata. Shared global CSS currently contains public and admin classes; avoid changing admin selectors, or split the public styles into their own stylesheet first.

Do not modify Prisma, authentication, storage, validation, server actions, CMS components or project services merely to integrate a visual prototype. Public components accept plain presentation data and perform no database queries.

## Routes

| Route                   | Content                                                   |
| ----------------------- | --------------------------------------------------------- |
| `/`                     | Identity, availability, featured projects                 |
| `/work`                 | Published projects in saved order                         |
| `/work?category=poster` | Published projects in one category                        |
| `/work/[slug]`          | Published project detail and calculated next project      |
| `/about`                | Profile, capabilities and social links                    |
| `/contact`              | Email, availability, location and social links            |
| `/admin/preview/[id]`   | Authenticated preview using the same project presentation |

Draft and archived slugs remain 404 on public routes. Do not route public pages through the preview query. Admin routes remain noindex/nofollow.

## Server queries

Import from `src/features/projects/queries.ts` in server pages:

- `getPublishedProjects(categorySlug?)`
- `getFeaturedProjects()`
- `getProjectBySlug(slug)` → detail or `null`
- `getProjectCategories()` → category data with published counts
- `getNextProject(projectId)` → next published card, wraps at the end, `null` for a single project
- `getSiteSettings()`

`getPreviewProject(id)` is admin-only. Query functions own filtering and ordering; visual/index views should consume the same card contract.

## Data contracts

Admin-independent types live in `src/features/projects/types.ts`.

`PublicProjectCard`: `id`, `title`, `slug`, `year`, `shortDescription`, `sortOrder`, `category: { name, slug }`, `coverImage: PublicImage | null`.

`PublicProjectDetail`: all card fields plus `role`, `disciplines: string[]`, `tools: string[]`, `projectContext`, `seoTitle`, `seoDescription`, `updatedAt` (ISO string), and ordered `gallery: { caption, layout, media: PublicImage }[]`.

`PublicImage`: `id`, `url`, `width: number | null`, `height: number | null`, `altText`. Retain Next Image optimization, responsive sizes, descriptive alt text and lazy loading. Use priority only for the leading artwork.

`PublicCategory`: `id`, `name`, `slug`, `sortOrder`, `count` (published projects only).

`PublicSiteSettings`: `designerName`, `professionalTitle`, `email`, `location`, `availabilityText`, `shortBio`, `longBio`, `capabilities: string[]`, `instagramUrl`, `behanceUrl`, `linkedinUrl`, `githubUrl`, `defaultSeoTitle`, `defaultSeoDescription`, `socialImage: PublicImage | null`. Empty optional text/link fields should be omitted gracefully.

Gallery layout hints are `FULL`, `WIDE`, `HALF`, `PAIR_LEFT`, `PAIR_RIGHT`, `DETAIL`. They express editorial intent; each frontend may map them to its own layout. Preserve gallery ordering and captions.

Text content is plain text, not HTML. Preserve line breaks as appropriate. Keep canonical URLs, Open Graph/Twitter metadata and escaped JSON-LD in server page composition. Identity and portfolio content must continue to come from the query layer.
