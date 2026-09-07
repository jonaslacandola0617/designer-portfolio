import {
  getPublishedProjects,
  getProjectCategories,
} from "@/features/projects/queries";
import { Archive } from "@/components/public/archive";
import { pageMetadata } from "@/lib/seo";
export const metadata = pageMetadata(
  "Work",
  "Browse published graphic-design projects.",
  "/work",
);
export default async function Work({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; view?: string }>;
}) {
  const { category, view } = await searchParams;
  const [projects, categories] = await Promise.all([
    getPublishedProjects(category),
    getProjectCategories(),
  ]);
  return (
    <section className="view" id="view-work">
      <div className="container page-head">
        <span className="eyebrow page-eyebrow">Work / Archive</span>
        <h1>Selected &amp; Ongoing Work</h1>
      </div>
      <Archive
        projects={projects}
        categories={categories}
        category={category}
        view={view}
      />
      <div style={{ height: "var(--sp-10)" }} />
    </section>
  );
}
