import Link from "next/link";
import { getSiteSettings } from "@/features/projects/queries";
import { pageMetadata } from "@/lib/seo";

export async function generateMetadata() {
  const s = await getSiteSettings();
  return pageMetadata(
    `About — ${s.professionalTitle}`,
    s.shortBio || s.defaultSeoDescription,
    "/about",
    s.socialImage,
    `${s.designerName} — ${s.professionalTitle}`,
  );
}

export default async function About() {
  const s = await getSiteSettings();
  return (
    <section className="view" id="view-about">
      <div className="container about-open">
        <span
          className="eyebrow"
          style={{ display: "block", marginBottom: "var(--sp-5)" }}
        >
          About
        </span>
        <h1 className="preserve-lines">{s.aboutHeadline}</h1>
      </div>
      <div className="container about-bio">
        <div>
          <span className="eyebrow">Profile</span>
        </div>
        <div>
          <p>{s.shortBio}</p>
          <p className="preserve-lines" style={{ marginTop: "var(--sp-5)" }}>
            {s.longBio}
          </p>
        </div>
      </div>
      <div className="container capabilities">
        <span
          className="eyebrow"
          style={{ display: "block", marginBottom: "var(--sp-6)" }}
        >
          Capabilities
        </span>
        <div className="cap-list">
          {s.capabilities.map((c, i) => (
            <div className="cap-row" key={c}>
              <span className="cap-num mono">
                {String(i + 1).padStart(2, "0")}
              </span>
              <span className="cap-name">{c}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="container tools-row">
        <div>
          <span className="eyebrow">Tools / Workflow</span>
        </div>
        <div className="tools-list">
          {s.workflowTools.map((t) => (
            <span key={t}>{t}</span>
          ))}
        </div>
      </div>
      <div className="container teaser" style={{ borderTop: "none" }}>
        <Link href="/contact" className="btn">
          Get in Touch <span className="btn-arrow">→</span>
        </Link>
      </div>
    </section>
  );
}
