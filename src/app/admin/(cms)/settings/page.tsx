import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { SettingsEditor, CategoryEditor } from "@/components/admin/settings";
export default async function Settings() {
  await requireAdmin();
  const [settings, categories, media] = await Promise.all([
    db.siteSettings.findUniqueOrThrow({ where: { id: "site" } }),
    db.category.findMany({
      orderBy: { sortOrder: "asc" },
      include: { _count: { select: { projects: true } } },
    }),
    db.mediaAsset.findMany({ orderBy: { createdAt: "desc" } }),
  ]);
  return (
    <div>
      <div className="view-head">
        <h1>Settings</h1>
      </div>
      <SettingsEditor settings={settings} media={media} />
      <details>
        <summary>Manage categories</summary>
        <CategoryEditor categories={categories} />
      </details>
    </div>
  );
}
