"use server";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { altSchema, idSchema, mediaSchema } from "@/lib/validation";
import { createStorage, storageKey } from "@/lib/storage";
import { invalidatePortfolio } from "@/lib/revalidation";
export async function requestUpload(input: unknown) {
  const admin = await requireAdmin();
  const data = mediaSchema.parse(input);
  const configured = Number(process.env.MAX_UPLOAD_MB || 20);
  if (data.fileSize > Math.min(configured, 20) * 1024 * 1024)
    throw new Error("Image exceeds the configured upload limit.");
  const storage = createStorage();
  const key = `pending/${storageKey(data.fileName, data.mimeType)}`;
  const intent = await db.uploadIntent.create({
    data: {
      ...data,
      storageKey: key,
      adminId: admin.id,
      expiresAt: new Date(Date.now() + 10 * 60 * 1000),
    },
  });
  return {
    id: intent.id,
    url: await storage.presign(key, data.mimeType, data.fileSize),
  };
}
export async function completeUpload(id: string, alt: string) {
  const admin = await requireAdmin();
  idSchema.parse(id);
  const altText = altSchema.parse(alt);
  const intent = await db.uploadIntent.findUniqueOrThrow({ where: { id } });
  if (intent.adminId !== admin.id || intent.expiresAt < new Date())
    throw new Error("Upload expired. Upload the image again.");
  const storage = createStorage();
  const key = storageKey(intent.fileName, intent.mimeType);
  let asset;
  try {
    const dimensions = await storage.verifyAndPromote(
      intent.storageKey,
      key,
      intent.mimeType,
      intent.fileSize,
    );
    asset = await db.$transaction(async (tx) => {
      await tx.uploadIntent.delete({ where: { id } });
      return tx.mediaAsset.create({
        data: {
          storageKey: key,
          url: storage.publicUrl(key),
          fileName: intent.fileName,
          mimeType: intent.mimeType,
          fileSize: intent.fileSize,
          ...dimensions,
          altText,
        },
      });
    });
  } catch (error) {
    await storage.remove(key).catch(() => undefined);
    throw error;
  }
  await storage.remove(intent.storageKey).catch(() => undefined);
  await invalidatePortfolio();
  return asset;
}
export async function updateAlt(id: string, alt: string) {
  await requireAdmin();
  await db.mediaAsset.update({
    where: { id: idSchema.parse(id) },
    data: { altText: altSchema.parse(alt) },
  });
  await invalidatePortfolio();
}
export async function replaceMedia(id: string, replacementId: string) {
  await requireAdmin();
  idSchema.parse(id);
  idSchema.parse(replacementId);
  if (id === replacementId) throw new Error("Choose a new upload.");
  await db.$transaction(
    async (tx) => {
      const original = await tx.mediaAsset.findUniqueOrThrow({ where: { id } });
      const replacement = await tx.mediaAsset.findUniqueOrThrow({
        where: { id: replacementId },
      });
      // Restrictive foreign keys reject a replacement already attached elsewhere.
      await tx.mediaAsset.delete({ where: { id: replacementId } });
      await tx.mediaAsset.update({
        where: { id },
        data: {
          storageKey: replacement.storageKey,
          url: replacement.url,
          fileName: replacement.fileName,
          mimeType: replacement.mimeType,
          fileSize: replacement.fileSize,
          width: replacement.width,
          height: replacement.height,
        },
      });
      if (!original.storageKey.startsWith("samples/"))
        await tx.storageDeletion.create({
          data: { storageKey: original.storageKey },
        });
    },
    { isolationLevel: "Serializable" },
  );
  await retryStorageDeletions();
  await invalidatePortfolio();
}
export async function removeMedia(id: string) {
  return removeMediaBulk([id]);
}
export async function removeMediaBulk(ids: string[]) {
  await requireAdmin();
  const uniqueIds = [...new Set(ids.map((id) => idSchema.parse(id)))];
  if (!uniqueIds.length) return;
  if (uniqueIds.length > 500) throw new Error("Too many images selected.");

  // Restrictive foreign keys remain the final safety check: if any selected
  // asset is referenced by a project or Settings, the whole transaction fails.
  await db.$transaction(async (tx) => {
    const assets = await tx.mediaAsset.findMany({
      where: { id: { in: uniqueIds } },
      select: { id: true, storageKey: true },
    });
    if (assets.length !== uniqueIds.length)
      throw new Error("One or more selected images no longer exist.");

    await tx.mediaAsset.deleteMany({ where: { id: { in: uniqueIds } } });

    for (const asset of assets) {
      if (!asset.storageKey.startsWith("samples/"))
        await tx.storageDeletion.create({
          data: { storageKey: asset.storageKey },
        });
    }
  });
  await retryStorageDeletions();
  await invalidatePortfolio();
}
export async function retryStorageDeletions() {
  await requireAdmin();
  const pending = await db.storageDeletion.findMany({ take: 100 });
  for (const item of pending) {
    try {
      await createStorage().remove(item.storageKey);
      await db.storageDeletion.delete({ where: { id: item.id } });
    } catch {
      /* Keep the durable job for the next retry. */
    }
  }
  await invalidatePortfolio();
}
