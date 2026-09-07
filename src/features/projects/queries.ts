import "server-only";
import { cache } from "react";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { nextProject } from "./domain";
import type {
  PublicProjectCard,
  PublicProjectDetail,
  PublicSiteSettings,
  PublicCategory,
} from "./types";
const image = {
  id: true,
  url: true,
  width: true,
  height: true,
  altText: true,
} as const;
const card = {
  archiveNumber: true,
  titleLines: true,
  homeLayout: true,
  artworkAspect: true,
  id: true,
  title: true,
  slug: true,
  year: true,
  shortDescription: true,
  sortOrder: true,
  category: { select: { name: true, slug: true } },
  coverImage: { select: image },
} as const;
const detail = {
  brief: true,
  direction: true,
  result: true,
  status: true,
  ...card,
  role: true,
  disciplines: true,
  tools: true,
  projectContext: true,
  seoTitle: true,
  seoDescription: true,
  updatedAt: true,
  gallery: {
    orderBy: { sortOrder: "asc" },
    select: { caption: true, layout: true, media: { select: image } },
  },
} as const;
const order = [{ sortOrder: "asc" }, { id: "asc" }] as const;
export const getPublishedProjects = cache(
  async (category?: string): Promise<PublicProjectCard[]> =>
    db.project.findMany({
      where: {
        status: "PUBLISHED",
        ...(category ? { category: { slug: category } } : {}),
      },
      select: card,
      orderBy: [...order],
    }),
);
export const getFeaturedProjects = cache(
  async (): Promise<PublicProjectCard[]> =>
    db.project.findMany({
      where: { status: "PUBLISHED", featured: true },
      select: card,
      orderBy: [...order],
    }),
);
export const getProjectBySlug = cache(
  async (slug: string): Promise<PublicProjectDetail | null> => {
    const project = await db.project.findFirst({
      where: { slug, status: "PUBLISHED" },
      select: detail,
    });
    return project
      ? { ...project, updatedAt: project.updatedAt.toISOString() }
      : null;
  },
);
export async function getPreviewProject(
  id: string,
): Promise<PublicProjectDetail | null> {
  await requireAdmin();
  const project = await db.project.findUnique({
    where: { id },
    select: detail,
  });
  return project
    ? { ...project, updatedAt: project.updatedAt.toISOString() }
    : null;
}
export const getProjectCategories = cache(
  async (): Promise<PublicCategory[]> => {
    const categories = await db.category.findMany({
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
      include: {
        _count: { select: { projects: { where: { status: "PUBLISHED" } } } },
      },
    });
    return categories.map((c) => ({
      id: c.id,
      name: c.name,
      slug: c.slug,
      sortOrder: c.sortOrder,
      count: c._count.projects,
    }));
  },
);
export async function getNextProject(id: string) {
  return nextProject(await getPublishedProjects(), id);
}
export const getSiteSettings = cache(async (): Promise<PublicSiteSettings> => {
  const settings = await db.siteSettings.findUniqueOrThrow({
    where: { id: "site" },
    select: {
      aboutHeadline: true,
      contactHeadline: true,
      statement: true,
      statementAttribution: true,
      bookingText: true,
      openingEdition: true,
      introDisciplines: true,
      workflowTools: true,
      availableFor: true,
      designerName: true,
      professionalTitle: true,
      email: true,
      location: true,
      availabilityText: true,
      shortBio: true,
      longBio: true,
      capabilities: true,
      instagramUrl: true,
      behanceUrl: true,
      linkedinUrl: true,
      githubUrl: true,
      defaultSeoTitle: true,
      defaultSeoDescription: true,
      socialImage: { select: image },
    },
  });
  return settings;
});
