import {
  getPublishedProjects,
  getProjectCategories,
  getSiteSettings,
} from "@/features/projects/queries";
import { Archive } from "@/components/public/archive";
import { pageMetadata } from "@/lib/seo";

export async function generateMetadata() {
  const s = await getSiteSettings();
  return pageMetadata(
    "Selected Work — Graphic Design Portfolio",
    `Selected visual and graphic design projects by ${s.designerName}, ${s.professionalTitle} based in ${s.location}.`,
    "/work",
    s.socialImage,
    `${s.designerName} — selected graphic design work`,
  );
}

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
