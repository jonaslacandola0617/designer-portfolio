import Link from "next/link";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { ProjectList } from "@/components/admin/project-list";
export default async function Projects() {
  await requireAdmin();
  const projects = await db.project.findMany({
    orderBy: [{ sortOrder: "asc" }, { id: "asc" }],
    include: { category: true },
  });
  const rows = projects.map((p) => ({
    id: p.id,
    archiveNumber: p.archiveNumber,
    title: p.title,
    slug: p.slug,
    category: p.category.name,
    year: p.year,
    status: p.status,
    featured: p.featured,
    updatedAt: p.updatedAt.toISOString().slice(0, 10),
  }));
  return (
    <>
      <div className="view-head">
        <h1>Projects</h1>
        <Link className="btn primary" href="/admin/projects/new">
          + New project
        </Link>
      </div>
      <ProjectList projects={rows} />
    </>
  );
}
