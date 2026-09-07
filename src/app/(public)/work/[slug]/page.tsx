import { notFound } from "next/navigation";
import {
  getProjectBySlug,
  getNextProject,
  getSiteSettings,
} from "@/features/projects/queries";
import { ProjectPresentation } from "@/components/public/portfolio";
import { pageMetadata, jsonLd, siteUrl } from "@/lib/seo";
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const p = await getProjectBySlug((await params).slug);
  if (!p) notFound();
  return pageMetadata(
    p.seoTitle || p.title,
    p.seoDescription || p.shortDescription,
    `/work/${p.slug}`,
    p.coverImage?.url,
  );
}
export default async function Project({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const p = await getProjectBySlug((await params).slug);
  if (!p) notFound();
  const [next, s] = await Promise.all([
    getNextProject(p.id),
    getSiteSettings(),
  ]);
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: jsonLd({
            "@context": "https://schema.org",
            "@type": "VisualArtwork",
            name: p.title,
            description: p.shortDescription,
            image: p.coverImage?.url,
            url: `${siteUrl}/work/${p.slug}`,
            creator: { "@type": "Person", name: s.designerName },
          }),
        }}
      />
      <ProjectPresentation project={p} next={next} />
    </>
  );
}
