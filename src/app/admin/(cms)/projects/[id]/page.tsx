import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { ProjectEditor } from "@/components/admin/project-editor";
import { projectSchema } from "@/lib/validation";
export default async function EditProject({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdmin();
  const { id } = await params;
  const [project, categories, media] = await Promise.all([
    db.project.findUnique({
      where: { id },
      include: { gallery: { orderBy: { sortOrder: "asc" } } },
    }),
    db.category.findMany({ orderBy: { sortOrder: "asc" } }),
    db.mediaAsset.findMany({ orderBy: { createdAt: "desc" } }),
  ]);
  if (!project) notFound();
  return (
    <>
      <ProjectEditor
        key={project.id}
        id={id}
        initial={projectSchema.parse(project)}
        categories={categories}
        media={media}
      />
    </>
  );
}
