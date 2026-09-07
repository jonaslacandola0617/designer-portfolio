import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { hash } from "bcryptjs";
import { statSync } from "node:fs";
import { z } from "zod";
const db = new PrismaClient();
async function main() {
  const email = z.email().parse(process.env.ADMIN_EMAIL).toLowerCase();
  const password = z
    .string()
    .min(12)
    .refine(
      (p) => Buffer.byteLength(p, "utf8") <= 72,
      "Password must fit within 72 UTF-8 bytes.",
    )
    .parse(process.env.ADMIN_PASSWORD);
  await db.adminUser.upsert({
    where: { email },
    update: {},
    create: {
      email,
      name: "Jonas Lacandola",
      passwordHash: await hash(password, 12),
    },
  });
  for (const [sortOrder, name] of [
    "Poster",
    "Social",
    "Merch",
    "Brand",
    "Campaign",
    "Experimental",
  ].entries())
    await db.category.upsert({
      where: { slug: name.toLowerCase() },
      create: { name, slug: name.toLowerCase(), sortOrder },
      update: {},
    });
  await db.siteSettings.upsert({
    where: { id: "site" },
    update: {},
    create: {
      id: "site",
      designerName: "Jonas Lacandola",
      professionalTitle: "Graphic designer",
      defaultSeoTitle: "Jonas Lacandola — Graphic Design",
      defaultSeoDescription: "Graphic design portfolio of Jonas Lacandola.",
      capabilities: [
        "Posters",
        "Social media graphics",
        "Merchandise",
        "Brand visuals",
      ],
    },
  });
  if (process.env.SEED_SAMPLES === "true") {
    if (process.env.NODE_ENV === "production")
      throw new Error("Sample seeding is disabled in production.");
    for (const [sortOrder, [title, slug, category]] of [
      ["Nightshift", "sample-nightshift", "poster"],
      ["Motion Energy", "sample-motion-energy", "social"],
      ["Local Culture", "sample-local-culture", "merch"],
    ].entries()) {
      const media = await db.mediaAsset.upsert({
        where: { storageKey: `samples/${slug}.svg` },
        update: {},
        create: {
          storageKey: `samples/${slug}.svg`,
          url: `/samples/${slug}.svg`,
          fileName: `${slug}.svg`,
          mimeType: "image/svg+xml",
          fileSize: statSync(
            new URL(`../public/samples/${slug}.svg`, import.meta.url),
          ).size,
          width: 1200,
          height: 900,
          altText: `Fictional sample artwork: ${title}`,
        },
      });
      const cat = await db.category.findUniqueOrThrow({
        where: { slug: category },
      });
      await db.project.upsert({
        where: { slug },
        update: {},
        create: {
          title: `${title} (sample)`,
          slug,
          categoryId: cat.id,
          year: 2026,
          shortDescription:
            "Fictional development sample. Not a client project.",
          projectContext:
            "This sample demonstrates the portfolio content model and can be deleted safely.",
          role: "Sample art direction",
          disciplines: ["Graphic design"],
          tools: [],
          coverImageId: media.id,
          status: "PUBLISHED",
          featured: true,
          sortOrder,
          publishedAt: new Date(),
          gallery: {
            create: {
              mediaId: media.id,
              caption: "Fictional placeholder artwork",
              layout: "FULL",
            },
          },
        },
      });
    }
  }
  console.log(
    "Administrator, categories and site settings are ready. Existing records were preserved.",
  );
}
main()
  .catch(() => {
    console.error(
      "Seed failed. Check database access and ADMIN_EMAIL / ADMIN_PASSWORD (12–72 bytes).",
    );
    process.exitCode = 1;
  })
  .finally(() => db.$disconnect());
