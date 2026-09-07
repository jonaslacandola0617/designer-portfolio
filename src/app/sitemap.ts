import { db } from "@/lib/db";
import { siteUrl } from "@/lib/seo";
export const dynamic = "force-dynamic";
export default async function sitemap() {
  const projects = await db.project.findMany({
    where: { status: "PUBLISHED" },
    select: { slug: true, updatedAt: true },
  });
  return [
    ...["", "/work", "/about", "/contact"].map((path) => ({
      url: `${siteUrl}${path}`,
    })),
    ...projects.map((p) => ({
      url: `${siteUrl}/work/${p.slug}`,
      lastModified: p.updatedAt,
    })),
  ];
}
