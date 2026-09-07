import type { MetadataRoute } from "next";
import { db } from "@/lib/db";
import { siteUrl } from "@/lib/seo";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [projects, settings] = await Promise.all([
    db.project.findMany({
      where: { status: "PUBLISHED" },
      select: { slug: true, updatedAt: true },
      orderBy: [{ sortOrder: "asc" }, { id: "asc" }],
    }),
    db.siteSettings.findUnique({
      where: { id: "site" },
      select: { updatedAt: true },
    }),
  ]);

  const siteUpdatedAt = settings?.updatedAt;

  return [
    {
      url: siteUrl,
      ...(siteUpdatedAt ? { lastModified: siteUpdatedAt } : {}),
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${siteUrl}/work`,
      ...(siteUpdatedAt ? { lastModified: siteUpdatedAt } : {}),
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${siteUrl}/about`,
      ...(siteUpdatedAt ? { lastModified: siteUpdatedAt } : {}),
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${siteUrl}/contact`,
      ...(siteUpdatedAt ? { lastModified: siteUpdatedAt } : {}),
      changeFrequency: "monthly",
      priority: 0.6,
    },
    ...projects.map((project) => ({
      url: `${siteUrl}/work/${project.slug}`,
      lastModified: project.updatedAt,
      changeFrequency: "monthly" as const,
      priority: 0.8,
    })),
  ];
}
