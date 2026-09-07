import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
const state = vi.hoisted(() => ({
  admin: "media-test-admin",
  authorized: true,
  failDelete: false,
  deleted: [] as string[],
}));
vi.mock("@/lib/auth", () => ({
  requireAdmin: async () => {
    if (!state.authorized) throw new Error("Unauthorized");
    return { id: state.admin };
  },
}));
vi.mock("@/lib/revalidation", () => ({ invalidatePortfolio: () => {} }));
vi.mock("@/lib/db", async () => {
  const { PrismaClient } = await import("@prisma/client");
  const url = process.env.TEST_DATABASE_URL;
  if (!url || !new URL(url).pathname.endsWith("/portfolio_test"))
    throw new Error("Use the disposable portfolio_test database.");
  return { db: new PrismaClient({ datasources: { db: { url } } }) };
});
vi.mock("@/lib/storage", () => ({
  storageKey: () => `portfolio/test-${crypto.randomUUID()}.png`,
  createStorage: () => ({
    presign: async (key: string) =>
      `https://storage.example/${key}?signed=true`,
    verifyAndPromote: async () => ({ width: 320, height: 240 }),
    publicUrl: (key: string) => `https://storage.example/${key}`,
    remove: async (key: string) => {
      if (state.failDelete) throw new Error("Storage unavailable");
      state.deleted.push(key);
    },
  }),
}));
import { db } from "@/lib/db";
import {
  requestUpload,
  completeUpload,
  updateAlt,
  removeMedia,
  retryStorageDeletions,
  replaceMedia,
} from "@/features/media/actions";
const metadata = { fileName: "test.png", mimeType: "image/png", fileSize: 100 };
let assetId: string;
let categoryId: string;
let projectId: string;
beforeAll(async () => {
  categoryId = (
    await db.category.create({
      data: { name: "Media integration", slug: `media-${Date.now()}` },
    })
  ).id;
});
afterAll(async () => {
  state.authorized = true;
  state.failDelete = false;
  if (projectId) await db.project.deleteMany({ where: { id: projectId } });
  if (assetId) await db.mediaAsset.deleteMany({ where: { id: assetId } });
  await db.uploadIntent.deleteMany({ where: { adminId: "media-test-admin" } });
  await db.category.delete({ where: { id: categoryId } });
  await db.$disconnect();
});
describe.sequential("media ownership and deletion", () => {
  it("rejects all unauthenticated media operations", async () => {
    state.authorized = false;
    for (const action of [
      () => requestUpload(metadata),
      () => completeUpload("id", ""),
      () => updateAlt("id", "alt"),
      () => removeMedia("id", "name"),
      () => retryStorageDeletions(),
      () => replaceMedia("id","replacement"),
    ])
      await expect(action()).rejects.toThrow("Unauthorized");
    state.authorized = true;
  });
  it("rejects a different admin and expired upload intent", async () => {
    const intent = await requestUpload(metadata);
    state.admin = "other-admin";
    await expect(completeUpload(intent.id, "")).rejects.toThrow("expired");
    state.admin = "media-test-admin";
    await db.uploadIntent.update({
      where: { id: intent.id },
      data: { expiresAt: new Date(0) },
    });
    await expect(completeUpload(intent.id, "")).rejects.toThrow("expired");
  });
  it("finalizes an upload only once and persists dimensions and alt text", async () => {
    const intent = await requestUpload(metadata);
    const asset = await completeUpload(intent.id, "Artwork");
    assetId = asset.id;
    expect(asset.width).toBe(320);
    expect(asset.altText).toBe("Artwork");
    expect(asset.storageKey).not.toContain("pending");
    await expect(completeUpload(intent.id, "Again")).rejects.toThrow();
    await updateAlt(asset.id, "Updated description");
    expect(
      (await db.mediaAsset.findUniqueOrThrow({ where: { id: asset.id } }))
        .altText,
    ).toBe("Updated description");
  });
  it("cannot delete shared artwork even with confirmation", async () => {
    projectId = (
      await db.project.create({
        data: {
          title: "Media test",
          slug: `media-project-${Date.now()}`,
          year: 2026,
          categoryId,
          coverImageId: assetId,
          disciplines: [],
          tools: [],
        },
      })
    ).id;
    await expect(removeMedia(assetId, "test.png")).rejects.toThrow();
    expect(await db.mediaAsset.count({ where: { id: assetId } })).toBe(1);
    await db.project.update({
      where: { id: projectId },
      data: { coverImageId: null },
    });
  });
  it("keeps a retryable deletion job across storage failures", async () => {
    const key = (
      await db.mediaAsset.findUniqueOrThrow({ where: { id: assetId } })
    ).storageKey;
    await expect(removeMedia(assetId, "wrong")).rejects.toThrow("confirm");
    state.failDelete = true;
    await removeMedia(assetId, "test.png");
    expect(await db.mediaAsset.count({ where: { id: assetId } })).toBe(0);
    expect(await db.storageDeletion.count({ where: { storageKey: key } })).toBe(
      1,
    );
    state.failDelete = false;
    await retryStorageDeletions();
    expect(await db.storageDeletion.count({ where: { storageKey: key } })).toBe(
      0,
    );
    expect(state.deleted).toContain(key);
  });
});
