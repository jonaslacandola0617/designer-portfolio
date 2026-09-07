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
    p.seoTitle || `${p.title} — ${p.category.name}`,
    p.seoDescription || p.shortDescription,
    `/work/${p.slug}`,
    p.coverImage,
    `${p.title} — ${p.category.name} project cover`,
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

  const projectUrl = `${siteUrl}/work/${p.slug}`;

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: jsonLd({
            "@context": "https://schema.org",
            "@type": "VisualArtwork",
            "@id": `${projectUrl}#artwork`,
            name: p.title,
            description: p.shortDescription,
            url: projectUrl,
            mainEntityOfPage: projectUrl,
            artform: p.category.name,
            ...(p.disciplines.length
              ? { keywords: p.disciplines.join(", ") }
              : {}),
            dateModified: p.updatedAt,
            ...(p.coverImage
              ? {
                  image: {
                    "@type": "ImageObject",
                    url: p.coverImage.url,
                    ...(p.coverImage.width
                      ? { width: p.coverImage.width }
                      : {}),
                    ...(p.coverImage.height
                      ? { height: p.coverImage.height }
                      : {}),
                    caption:
                      p.coverImage.altText.trim() ||
                      `${p.title} project cover`,
                  },
                  thumbnailUrl: p.coverImage.url,
                }
              : {}),
            creator: {
              "@type": "Person",
              "@id": `${siteUrl}/#person`,
              name: s.designerName,
              url: siteUrl,
            },
            copyrightHolder: {
              "@id": `${siteUrl}/#person`,
            },
            isPartOf: {
              "@id": `${siteUrl}/#website`,
            },
          }),
        }}
      />
      <ProjectPresentation project={p} next={next} />
    </>
  );
}
