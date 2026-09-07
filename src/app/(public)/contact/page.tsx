import { getSiteSettings } from "@/features/projects/queries";
import { SocialLinks } from "@/components/public/portfolio";
import { pageMetadata } from "@/lib/seo";
export const metadata = pageMetadata(
  "Contact",
  "Contact for graphic-design enquiries.",
  "/contact",
);
export default async function Contact() {
  const s = await getSiteSettings();
  return (
    <section className="view" id="view-contact">
      <div className="container contact-open">
        <span
          className="eyebrow"
          style={{ display: "block", marginBottom: "var(--sp-5)" }}
        >
          Contact
        </span>
        <h1 className="preserve-lines">{s.contactHeadline}</h1>
        {s.email && (
          <a className="contact-email" href={`mailto:${s.email}`}>
            {s.email}
          </a>
        )}
      </div>
      <div className="container contact-grid">
        <div className="contact-block">
          <span className="eyebrow">Available For</span>
          <ul>
            {s.availableFor.map((a) => (
              <li key={a}>{a}</li>
            ))}
          </ul>
        </div>
        <div className="contact-block contact-socials">
          <span className="eyebrow">Elsewhere</span>
          <SocialLinks settings={s} />
        </div>
      </div>
    </section>
  );
}
