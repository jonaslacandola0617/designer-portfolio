import Image from "next/image";
import Link from "next/link";
import type {
  PublicImage,
  PublicProjectCard,
  PublicProjectDetail,
  PublicSiteSettings,
} from "@/features/projects/types";

export const archiveNumber = (number: number) =>
  String(number).padStart(3, "0");

export function Artboard({
  image,
  aspect = "PORTRAIT",
  priority = false,
  altFallback = "",
}: {
  image: PublicImage | null;
  aspect?: string;
  priority?: boolean;
  altFallback?: string;
}) {
  const alt = image?.altText.trim() || altFallback;

  return (
    <div className="artboard" data-aspect={aspect}>
      {image && (
        <Image
          src={image.url}
          alt={alt}
          width={image.width ?? 1200}
          height={image.height ?? 1500}
          sizes="(max-width:700px) 100vw, (max-width:1024px) 80vw, 1100px"
          priority={priority}
        />
      )}
    </div>
  );
}

export function WorkRow({
  project: p,
  paired,
}: {
  project: PublicProjectCard;
  paired?: PublicProjectCard;
}) {
  const v = p.homeLayout.toLowerCase();
  return (
    <article className={`work-row wr-${v}`}>
      <div className="container grid-12">
        {v === "a" && (
          <span className="wr-num mono">{archiveNumber(p.archiveNumber)}</span>
        )}
        {v === "d" ? (
          <div className="wr-art-pair">
            <Link
              className="artboard-frame hover-view"
              href={`/work/${p.slug}`}
              data-cursor="View Project"
            >
              <Artboard
                image={p.coverImage}
                aspect="SQUARE"
                altFallback={`${p.title} — ${p.category.name} project cover`}
              />
            </Link>
            {paired && (
              <Link
                className="artboard-frame hover-view"
                href={`/work/${paired.slug}`}
                data-cursor="View Project"
                style={{ marginTop: "var(--sp-8)" }}
              >
                <Artboard
                  image={paired.coverImage}
                  aspect="SQUARE"
                  altFallback={`${paired.title} — ${paired.category.name} project cover`}
                />
              </Link>
            )}
          </div>
        ) : (
          <Link
            className="wr-art artboard-frame hover-view"
            href={`/work/${p.slug}`}
            data-cursor="View Project"
          >
            <Artboard
              image={p.coverImage}
              aspect={v === "a" ? "PORTRAIT" : "LANDSCAPE"}
              altFallback={`${p.title} — ${p.category.name} project cover`}
            />
          </Link>
        )}
        <div className="wr-text wr-copy">
          {v !== "a" && (
            <span className="wr-num mono">
              {archiveNumber(p.archiveNumber)}
              {paired ? ` / ${archiveNumber(paired.archiveNumber)}` : ""}
            </span>
          )}
          <p className="wr-meta">
            {p.category.name} / {p.year}
          </p>
          <h3
            className="wr-title preserve-lines"
            style={v === "d" ? { fontSize: "var(--fs-section)" } : undefined}
          >
            {p.titleLines || p.title}
            {paired && (
              <>
                <br />
                {paired.titleLines || paired.title}
              </>
            )}
          </h3>
          <p className="wr-desc">{p.shortDescription}</p>
          <Link
            href={v === "d" ? "/work" : `/work/${p.slug}`}
            className={v === "d" ? "link-underline" : "btn"}
          >
            {v === "d" ? (
              "See Full Archive →"
            ) : (
              <>
                View Project <span className="btn-arrow">→</span>
              </>
            )}
          </Link>
        </div>
      </div>
    </article>
  );
}

export function SocialLinks({ settings: s }: { settings: PublicSiteSettings }) {
  return (
    <>
      {[
        ["Instagram", s.instagramUrl],
        ["Behance", s.behanceUrl],
        ["LinkedIn", s.linkedinUrl],
        ["GitHub", s.githubUrl],
      ]
        .filter(([, url]) => url)
        .map(([label, url]) => (
          <a key={label} href={url} target="_blank" rel="noopener noreferrer">
            {label}
          </a>
        ))}
    </>
  );
}

export function ProjectPresentation({
  project: p,
  next,
}: {
  project: PublicProjectDetail;
  next?: PublicProjectCard | null;
}) {
  const slots: Record<string, string> = {
    LARGE: "pg-a",
    OFFSET_SMALL: "pg-b",
    FULL_WIDTH: "pg-c",
    FULL: "pg-c",
    WIDE: "pg-c",
    HALF: "pg-a",
    PAIR_LEFT: "pg-a",
    PAIR_RIGHT: "pg-b",
    DETAIL: "pg-b",
  };
  return (
    <section className="view" id="view-project">
      <div className="container project-head">
        <Link href="/work" className="back-link mono">
          <span>←</span> Back to Work
        </Link>
        <p className="eyebrow project-eyebrow">
          Project {archiveNumber(p.archiveNumber)}
        </p>
        <h1 className="project-title preserve-lines">
          {p.titleLines || p.title}
        </h1>
        <div className="project-meta-row">
          {[
            ["Category / Year", `${p.category.name} / ${p.year}`],
            ["Role", p.role],
            ["Discipline", p.disciplines.join(" / ")],
            [
              "Status",
              p.status === "PUBLISHED"
                ? "Published"
                : p.status === "DRAFT"
                  ? "Draft"
                  : "Archived",
            ],
          ].map(([label, value]) => (
            <div key={label}>
              <p className="pm-label">{label}</p>
              <p className="pm-value">{value || "—"}</p>
            </div>
          ))}
        </div>
      </div>
      <div className="container project-hero">
        <Artboard
          image={p.coverImage}
          aspect="WIDE"
          priority
          altFallback={`${p.title} — ${p.category.name} project cover`}
        />
      </div>
      <div className="container project-narrative">
        {[
          ["The Brief", p.brief || p.projectContext],
          ["The Direction", p.direction],
          ["The Result", p.result],
        ].map(([label, value]) => (
          <div key={label}>
            <p className="pn-label">{label}</p>
            <p className="preserve-lines">{value}</p>
          </div>
        ))}
      </div>
      <div className="container project-gallery">
        {p.gallery.map((g) => (
          <figure
            key={g.media.id}
            className={slots[g.layout]}
            style={{ marginLeft: 0, marginRight: 0, marginBottom: 0 }}
          >
            <Artboard
              image={g.media}
              aspect={g.layout === "WIDE" ? "LANDSCAPE" : "PORTRAIT"}
              altFallback={
                g.caption
                  ? `${p.title} — ${g.caption}`
                  : `${p.title} project artwork`
              }
            />
            {g.caption && (
              <figcaption
                className="eyebrow"
                style={{ marginTop: "var(--sp-3)" }}
              >
                {g.caption}
              </figcaption>
            )}
          </figure>
        ))}
      </div>
      {next && (
        <div className="container next-project">
          <p className="eyebrow np-label">Next Project</p>
          <Link className="next-project-link" href={`/work/${next.slug}`}>
            <div>
              <span className="mono eyebrow">
                Project {archiveNumber(next.archiveNumber)}
              </span>
              <h3 className="np-title">{next.title}</h3>
            </div>
            <Artboard
              image={next.coverImage}
              altFallback={`${next.title} — ${next.category.name} project cover`}
            />
          </Link>
        </div>
      )}
    </section>
  );
}
