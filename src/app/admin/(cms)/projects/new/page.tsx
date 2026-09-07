import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { ProjectEditor } from "@/components/admin/project-editor";
export default async function NewProject() {
  await requireAdmin();
  const [categories, media, last] = await Promise.all([
    db.category.findMany({ orderBy: { sortOrder: "asc" } }),
    db.mediaAsset.findMany({ orderBy: { createdAt: "desc" } }),
    db.project.aggregate({ _max: { sortOrder: true } }),
  ]);
  return (
    <>
      <ProjectEditor
        id={null}
        categories={categories}
        media={media}
        initial={{
          title: "",
          slug: "",
          categoryId: categories[0]?.id ?? "",
          year: new Date().getFullYear(),
          shortDescription: "",
          projectContext: "",
          role: "",
          disciplines: [],
          tools: [],
          coverImageId: null,
          featured: false,
          status: "DRAFT",
          sortOrder: (last._max.sortOrder ?? -1) + 1,
          seoTitle: "",
          seoDescription: "",
          gallery: [],
        }}
      />
    </>
  );
}
