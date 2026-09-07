import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { MediaLibrary } from "@/components/admin/media-library";
import { StorageCleanup } from "@/components/admin/storage-cleanup";
export default async function Media() {
  await requireAdmin();
  const assets = await db.mediaAsset.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      covers: { select: { id: true, title: true } },
      projects: { select: { project: { select: { id: true, title: true } } } },
      settings: { select: { id: true } },
    },
  });
  return (
    <>
      <div className="view-head">
        <h1>Media library</h1>
      </div>
      <StorageCleanup count={await db.storageDeletion.count()} />
      <MediaLibrary
        assets={assets.map(({ covers, projects, settings, ...asset }) => ({
          ...asset,
          usage: [
            ...new Map(
              [...covers, ...projects.map((p) => p.project)].map((p) => [
                p.id,
                p,
              ]),
            ).values(),
          ],
          usedBySettings: !!settings.length,
        }))}
      />
    </>
  );
}
