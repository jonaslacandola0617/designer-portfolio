"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import type { PublicSiteSettings } from "@/features/projects/types";
import { JLMonogram, RegistrationMark } from "./identity";
const routes = [
  ["/", "Index"],
  ["/work", "Work"],
  ["/about", "About"],
  ["/contact", "Contact"],
];
export function PublicChrome({
  settings: s,
  children,
}: {
  settings: PublicSiteSettings;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [menu, setMenu] = useState(false);
  const menuRef = useRef<HTMLDialogElement>(null);
  const toggle = useRef<HTMLButtonElement>(null);
  const veil = useRef<HTMLDivElement>(null);
  const cursor = useRef<HTMLDivElement>(null);
  const navigating = useRef(false);
  const timeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    if (menu) {
      menuRef.current?.showModal();
      document.body.style.overflow = "hidden";
    } else {
      menuRef.current?.close();
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [menu]);
  useEffect(() => {
    const click = (e: MouseEvent) => {
      const a =
        e.target instanceof Element
          ? e.target.closest<HTMLAnchorElement>("a[href]")
          : null;
      if (
        !a ||
        e.button ||
        e.metaKey ||
        e.ctrlKey ||
        e.shiftKey ||
        e.altKey ||
        a.target ||
        a.download ||
        a.origin !== location.origin ||
        a.pathname.startsWith("/admin") ||
        a.hash ||
        a.pathname === location.pathname ||
        a.pathname + a.search === location.pathname + location.search
      )
        return;
      setMenu(false);
      if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
      e.preventDefault();
      e.stopPropagation();
      if (navigating.current) return;
      navigating.current = true;
      if (veil.current) {
        veil.current.style.transition = "";
        veil.current.className = "transition-veil is-covering";
      }
      timeout.current = setTimeout(
        () => router.push(a.pathname + a.search),
        340,
      );
    };
    const move = (e: MouseEvent) => {
      if (!cursor.current || !matchMedia("(pointer:fine)").matches) return;
      const target =
        e.target instanceof Element
          ? e.target.closest<HTMLElement>(".hover-view")
          : null;
      cursor.current.style.transform = `translate(${e.clientX + 16}px,${e.clientY + 16}px)`;
      cursor.current.classList.toggle("is-visible", !!target);
      cursor.current.textContent = target?.dataset.cursor || "View Project";
    };
    const hide = () => cursor.current?.classList.remove("is-visible");
    document.addEventListener("click", click, true);
    document.addEventListener("mousemove", move);
    document.addEventListener("mouseleave", hide);
    return () => {
      document.removeEventListener("click", click, true);
      document.removeEventListener("mousemove", move);
      document.removeEventListener("mouseleave", hide);
      if (timeout.current) clearTimeout(timeout.current);
    };
  }, [router]);
  useEffect(() => {
    if (!navigating.current) return;
    if (veil.current) veil.current.className = "transition-veil is-leaving";
    cursor.current?.classList.remove("is-visible");
    const timer = setTimeout(() => {
      if (veil.current) {
        veil.current.style.transition = "none";
        veil.current.className = "transition-veil";
      }
      navigating.current = false;
    }, 700);
    return () => clearTimeout(timer);
  }, [pathname]);
  const active = (url: string) =>
    url === "/work" ? pathname.startsWith("/work") : pathname === url;
  const socials = [
    ["Instagram", s.instagramUrl],
    ["Behance", s.behanceUrl],
    ["LinkedIn", s.linkedinUrl],
    ["GitHub", s.githubUrl],
  ].filter(([, url]) => url);
  return (
    <div className="register-public">
      <div ref={veil} className="transition-veil" aria-hidden="true">
        <RegistrationMark veil />
      </div>
      <div ref={cursor} className="view-cursor" aria-hidden="true">
        View Project
      </div>
      <header className="site-header">
        <div className="header-inner">
          <Link href="/" className="brand">
            <JLMonogram />
            <span className="brand-text">
              {s.designerName}
              <em>{s.professionalTitle}</em>
            </span>
          </Link>
          <nav className="primary-nav" aria-label="Primary">
            {routes.map(([url, label]) => (
              <Link
                key={url}
                href={url}
                className={active(url) ? "is-active" : ""}
                aria-current={active(url) ? "page" : undefined}
              >
                {label}
              </Link>
            ))}
          </nav>
          {s.availabilityText && (
            <div className="header-status">
              <span className="status-dot" aria-hidden="true" />
              {s.availabilityText}
            </div>
          )}
          <button
            ref={toggle}
            className="menu-toggle"
            aria-expanded={menu}
            aria-controls="mobileMenu"
            onClick={() => setMenu(true)}
          >
            Menu
          </button>
        </div>
      </header>
      <dialog
        ref={menuRef}
        id="mobileMenu"
        className="mobile-menu"
        hidden={!menu}
        aria-label="Navigation"
        onCancel={() => {
          setMenu(false);
          toggle.current?.focus();
        }}
      >
        <div className="mobile-menu-top">
          <JLMonogram />
          <button
            className="menu-toggle"
            autoFocus
            onClick={() => {
              setMenu(false);
              toggle.current?.focus();
            }}
          >
            Close
          </button>
        </div>
        <nav className="mobile-menu-list" aria-label="Mobile">
          {routes.map(([url, label]) => (
            <Link key={url} href={url} onClick={() => setMenu(false)}>
              {label}
            </Link>
          ))}
        </nav>
        <div className="mobile-menu-foot">
          <p>{s.location}</p>
          <p>{s.email}</p>
        </div>
      </dialog>
      <main id="main">{children}</main>
      <footer className="site-footer">
        <div className="container">
          <div className="footer-top">
            <div className="footer-mark">
              <JLMonogram />
              <span className="brand-text">
                {s.designerName}
                <em>{s.location}</em>
              </span>
            </div>
            <nav className="footer-nav" aria-label="Footer">
              <div>
                <span className="eyebrow">Site</span>
                {routes.map(([url, label]) => (
                  <Link key={url} href={url}>
                    {label}
                  </Link>
                ))}
              </div>
              <div>
                <span className="eyebrow">Elsewhere</span>
                {s.email && <a href={`mailto:${s.email}`}>Email</a>}
                {socials.map(([label, url]) => (
                  <a
                    key={label}
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {label}
                  </a>
                ))}
              </div>
            </nav>
          </div>
          <p className="footer-big">{s.designerName}</p>
          <div className="footer-bottom">
            <span>
              © {new Date().getFullYear()} {s.designerName}. Design &amp;
              direction, self.
            </span>
            <button
              className="back-top"
              onClick={() =>
                window.scrollTo({
                  top: 0,
                  behavior: matchMedia("(prefers-reduced-motion: reduce)")
                    .matches
                    ? "auto"
                    : "smooth",
                })
              }
            >
              Back to Top ↑
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
