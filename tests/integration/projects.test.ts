import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { PrismaClient } from "@prisma/client";
import { projectService } from "@/features/projects/service";
import type { ProjectInput } from "@/lib/validation";
const url = process.env.TEST_DATABASE_URL;
if (!url || !new URL(url).pathname.endsWith("portfolio_test"))
  throw new Error(
    "Set TEST_DATABASE_URL to a disposable database named portfolio_test.",
  );
const db = new PrismaClient({ datasources: { db: { url } } });
const service = projectService(db, async () => ({ id: "test-admin" }));
const denied = projectService(db, async () => {
  throw new Error("Unauthorized");
});
let categoryId: string;
let mediaId: string;
let secondMediaId: string;
const projectIds: string[] = [];
const suffix = Date.now().toString();
const input = (): ProjectInput => ({
  title: "Integration project",
  slug: `integration-${suffix}`,
  categoryId,
  year: 2026,
  shortDescription: "A test project",
  projectContext: "Context",
  role: "Designer",
  disciplines: ["Poster"],
  tools: [],
  coverImageId: mediaId,
  featured: true,
  status: "DRAFT",
  sortOrder: 0,
  seoTitle: "",
  seoDescription: "",
  gallery: [{ mediaId, caption: "First caption", layout: "WIDE" }],
});
beforeAll(async () => {
  categoryId = (
    await db.category.create({
      data: { name: "Integration", slug: `integration-${suffix}` },
    })
  ).id;
  mediaId = (
    await db.mediaAsset.create({
      data: {
        storageKey: `integration/${suffix}`,
        url: "/samples/sample-nightshift.svg",
        fileName: "test.png",
        mimeType: "image/png",
        fileSize: 100,
      },
    })
  ).id;
  secondMediaId = (
    await db.mediaAsset.create({
      data: {
        storageKey: `integration/${suffix}-second`,
        url: "/samples/sample-motion-energy.svg",
        fileName: "second.png",
        mimeType: "image/png",
        fileSize: 100,
      },
    })
  ).id;
});
afterAll(async () => {
  await db.project.deleteMany({ where: { id: { in: projectIds } } });
  await db.mediaAsset.delete({ where: { id: mediaId } });
  await db.mediaAsset.delete({ where: { id: secondMediaId } });
  await db.category.delete({ where: { id: categoryId } });
  await db.$disconnect();
});
describe.sequential("project persistence and authorization", () => {
  it("rejects every mutation before accessing persistence", async () => {
    const operations = [
      () => denied.save(null, input()),
      () => denied.duplicate("anything"),
      () => denied.archive("anything"),
      () => denied.remove("anything", "anything"),
      () => denied.reorder([]),
      () => denied.reorderCategories([]),
      () => denied.settings({}),
      () => denied.category(null, {}),
      () => denied.removeCategory("anything"),
    ];
    for (const operation of operations)
      await expect(operation()).rejects.toThrow("Unauthorized");
  });
  it("creates, edits and publishes a project with gallery metadata", async () => {
    const p = await service.save(null, input());
    projectIds.push(p.id);
    expect(
      await db.project.count({ where: { id: p.id, status: "PUBLISHED" } }),
    ).toBe(0);
    const updated = await service.save(p.id, {
      ...input(),
      title: "Updated",
      status: "PUBLISHED",
    });
    expect(updated.publishedAt).toBeInstanceOf(Date);
    expect(
      await db.project.count({ where: { id: p.id, status: "PUBLISHED" } }),
    ).toBe(1);
    expect(
      (await db.projectMedia.findFirstOrThrow({ where: { projectId: p.id } }))
        .caption,
    ).toBe("First caption");
  });
  it("persists gallery ordering and per-image layout hints", async () => {
    const first = { mediaId, caption: "First", layout: "PAIR_LEFT" };
    const second = {
      mediaId: secondMediaId,
      caption: "Second",
      layout: "PAIR_RIGHT",
    };
    await service.save(projectIds[0], {
      ...input(),
      title: "Updated",
      gallery: [first, second],
    });
    await service.save(projectIds[0], {
      ...input(),
      title: "Updated",
      gallery: [second, first],
    });
    const gallery = await db.projectMedia.findMany({
      where: { projectId: projectIds[0] },
      orderBy: { sortOrder: "asc" },
    });
    expect(gallery.map((g) => g.mediaId)).toEqual([secondMediaId, mediaId]);
    expect(gallery[0].layout).toBe("PAIR_RIGHT");
  });
  it("rolls back updates when a gallery reference is invalid", async () => {
    await expect(
      service.save(projectIds[0], {
        ...input(),
        title: "Should roll back",
        gallery: [{ mediaId: "missing", caption: "", layout: "FULL" }],
      }),
    ).rejects.toThrow();
    expect(
      (await db.project.findUniqueOrThrow({ where: { id: projectIds[0] } }))
        .title,
    ).toBe("Updated");
  });
  it("duplicates as a unique draft while sharing physical media", async () => {
    const copy = await service.duplicate(projectIds[0]);
    projectIds.push(copy.id);
    const another = await service.duplicate(projectIds[0]);
    projectIds.push(another.id);
    expect(copy.status).toBe("DRAFT");
    expect(copy.publishedAt).toBeNull();
    expect(copy.slug).not.toBe(another.slug);
    const original=await db.project.findUniqueOrThrow({where:{id:projectIds[0]}});
    expect(new Set([copy.archiveNumber,another.archiveNumber,original.archiveNumber]).size).toBe(3);
    expect(copy.coverImageId).toBe(mediaId);
    expect(
      await db.projectMedia.count({ where: { projectId: copy.id, mediaId } }),
    ).toBe(1);
  });
  it("persists complete ordering and rejects stale lists", async () => {
    const before=await db.project.findMany({select:{id:true,archiveNumber:true},orderBy:{id:"asc"}});
    const existing = await db.project.findMany({
      orderBy: [{ sortOrder: "asc" }, { id: "asc" }],
      select: { id: true },
    });
    const ids = existing.map((p) => p.id).reverse();
    await service.reorder(ids);
    expect(await db.project.findMany({select:{id:true,archiveNumber:true},orderBy:{id:"asc"}})).toEqual(before);
    expect(
      (await db.project.findMany({ orderBy: { sortOrder: "asc" } })).map(
        (p) => p.id,
      ),
    ).toEqual(ids);
    await expect(service.reorder([projectIds[0]])).rejects.toThrow("Refresh");
  });
  it("persists complete category ordering and rejects stale lists", async () => {
    const existing = await db.category.findMany({
      orderBy: [{ sortOrder: "asc" }, { id: "asc" }],
      select: { id: true },
    });
    const ids = existing.map((category) => category.id).reverse();

    await service.reorderCategories(ids);

    expect(
      (
        await db.category.findMany({
          orderBy: [{ sortOrder: "asc" }, { id: "asc" }],
          select: { id: true },
        })
      ).map((category) => category.id),
    ).toEqual(ids);

    await expect(service.reorderCategories([categoryId])).rejects.toThrow(
      "Refresh",
    );
  });

  it("archives and restores to draft without deleting artwork", async () => {
    await service.archive(projectIds[0]);
    expect(
      (await db.project.findUniqueOrThrow({ where: { id: projectIds[0] } }))
        .status,
    ).toBe("ARCHIVED");
    await service.archive(projectIds[0], true);
    expect(
      (await db.project.findUniqueOrThrow({ where: { id: projectIds[0] } }))
        .status,
    ).toBe("DRAFT");
    expect(await db.mediaAsset.count({ where: { id: mediaId } })).toBe(1);
  });
  it("updates validated settings", async () => {
    const original = await db.siteSettings.findUnique({
      where: { id: "site" },
    });
    const data = {
      designerName: "Integration",
      professionalTitle: "Designer",
      email: "test@example.com",
      location: "",
      availabilityText: "Available",
      shortBio: "Test",
      longBio: "",
      capabilities: [],
      instagramUrl: "",
      behanceUrl: "",
      linkedinUrl: "",
      githubUrl: "",
      defaultSeoTitle: "Test",
      defaultSeoDescription: "Test description",
      socialImageId: null,
    };
    try {
      await service.settings(data);
      expect(
        (await db.siteSettings.findUniqueOrThrow({ where: { id: "site" } }))
          .availabilityText,
      ).toBe("Available");
    } finally {
      if (original)
        await db.siteSettings.update({ where: { id: "site" }, data: original });
      else await db.siteSettings.delete({ where: { id: "site" } });
    }
  });
  it("requires confirmation for project deletion and retains media", async () => {
    const id = projectIds[0];
    await expect(service.remove(id, "wrong")).rejects.toThrow("confirm");
    const project = await db.project.findUniqueOrThrow({ where: { id } });
    await service.remove(id, project.slug);
    expect(await db.projectMedia.count({ where: { projectId: id } })).toBe(0);
    expect(await db.mediaAsset.count({ where: { id: mediaId } })).toBe(1);
  });
});
