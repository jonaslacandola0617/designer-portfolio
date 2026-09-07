import Link from "next/link";
import {
  getFeaturedProjects,
  getSiteSettings,
  getProjectCategories,
  getPublishedProjects,
} from "@/features/projects/queries";
import { Artboard, WorkRow } from "@/components/public/portfolio";
import { SectionHead } from "@/components/public/identity";
import { jsonLd, pageMetadata, siteUrl } from "@/lib/seo";
export async function generateMetadata() {
  const s = await getSiteSettings();
  return {
    ...pageMetadata(
      s.defaultSeoTitle,
      s.defaultSeoDescription,
      "/",
      s.socialImage?.url,
    ),
    title: { absolute: s.defaultSeoTitle },
  };
}
export default async function Home() {
  const [s, featured, categories, projects] = await Promise.all([
    getSiteSettings(),
    getFeaturedProjects(),
    getProjectCategories(),
    getPublishedProjects(),
  ]);
  const first = featured.filter((p) => p.homeLayout !== "D");
  const more = featured.filter((p) => p.homeLayout === "D");
  const words = s.designerName.split(" ");
  return (
    <section className="view" id="view-home">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: jsonLd({
            "@context": "https://schema.org",
            "@type": "Person",
            name: s.designerName,
            jobTitle: s.professionalTitle,
            url: siteUrl,
          }),
        }}
      />
      <div className="container opening">
        <div className="opening-meta">
          <span>{s.location}</span>
          <span>{s.professionalTitle}</span>
          <span>{s.openingEdition}</span>
        </div>
        <h1 className="opening-headline">
          <span className="line">
            <span>{words[0]}</span>
          </span>
          <span className="line">
            <span>{words.slice(1).join(" ")}</span>
          </span>
        </h1>
        {featured[0]?.coverImage && (
          <div className="opening-figure">
            <Artboard image={featured[0].coverImage} aspect="SQUARE" priority />
          </div>
        )}
        <div className="opening-foot">
          <p className="opening-disciplines">
            {s.introDisciplines.map((d, i) => (
              <span key={d} style={{ color: "inherit" }}>
                {i > 0 && <span> / </span>}
                {d}
              </span>
            ))}
          </p>
        </div>
      </div>
      <div className="container" style={{ paddingTop: "var(--sp-9)" }}>
        <SectionHead number="02" title="Selected Work">
          <Link href="/work" className="link-underline">
            Full Archive →
          </Link>
        </SectionHead>
      </div>
      {first.map((p) => (
        <WorkRow key={p.id} project={p} />
      ))}
      <div className="container section">
        <SectionHead number="03" title="Working Across" />
        <div className="disciplines">
          {categories.map((c, i) => (
            <Link
              className="disc-row"
              href={`/work?category=${c.slug}`}
              key={c.id}
            >
              <span className="disc-num mono">
                {String(i + 1).padStart(2, "0")}
              </span>
              <span className="disc-name">{c.name}</span>
              <span className="disc-count mono">
                {String(c.count).padStart(2, "0")}
              </span>
              {projects.find((p) => p.category.slug === c.slug)?.coverImage && (
                <div className="disc-thumb">
                  <Artboard
                    image={
                      projects.find((p) => p.category.slug === c.slug)!
                        .coverImage
                    }
                  />
                </div>
              )}
            </Link>
          ))}
        </div>
      </div>
      {s.statement && (
        <div className="container statement">
          <blockquote>{s.statement}</blockquote>
          <cite>{s.statementAttribution}</cite>
        </div>
      )}
      {more.length > 0 && (
        <>
          <div className="container">
            <SectionHead number="05" title="More Selected Work" />
          </div>
          {more
            .filter((_, i) => i % 2 === 0)
            .map((p, i) => (
              <WorkRow key={p.id} project={p} paired={more[i * 2 + 1]} />
            ))}
        </>
      )}
      <div className="container teaser">
        <div className="teaser-grid">
          <div>
            <span
              className="eyebrow"
              style={{ display: "block", marginBottom: "var(--sp-4)" }}
            >
              06 — About
            </span>
            <h3 className="preserve-lines">{s.aboutHeadline}</h3>
          </div>
          <div>
            <p>{s.shortBio}</p>
            <Link href="/about" className="btn">
              Read More <span className="btn-arrow">→</span>
            </Link>
          </div>
        </div>
      </div>
      <div className="container teaser">
        <div className="teaser-grid">
          <div>
            <span
              className="eyebrow"
              style={{ display: "block", marginBottom: "var(--sp-4)" }}
            >
              07 — Contact
            </span>
            <h3 className="preserve-lines">{s.contactHeadline}</h3>
          </div>
          <div>
            <p>{s.availableFor.join(" / ")}</p>
            <Link href="/contact" className="btn">
              Start a Conversation <span className="btn-arrow">→</span>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
