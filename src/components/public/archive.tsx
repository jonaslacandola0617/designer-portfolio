"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Artboard, archiveNumber } from "./portfolio";
import type {
  PublicCategory,
  PublicProjectCard,
} from "@/features/projects/types";
export function Archive({
  projects,
  categories,
  category,
  view,
}: {
  projects: PublicProjectCard[];
  categories: PublicCategory[];
  category?: string;
  view?: string;
}) {
  const router = useRouter();
  const [mode, setMode] = useState(view === "index" ? "index" : "visual");
  const spans = [8, 4, 4, 8, 6, 6, 5, 7, 12];
  function filter(slug: string) {
    router.replace(
      `/work${slug ? `?category=${slug}&view=${mode}` : `?view=${mode}`}`,
      { scroll: false },
    );
  }
  return (
    <>
      <div className="container archive-controls">
        <div className="filter-list">
          <button
            className={!category ? "is-active" : ""}
            onClick={() => filter("")}
          >
            All{" "}
            <sup>
              {String(categories.reduce((n, c) => n + c.count, 0)).padStart(
                2,
                "0",
              )}
            </sup>
          </button>
          {categories.map((c) => (
            <button
              key={c.id}
              className={category === c.slug ? "is-active" : ""}
              onClick={() => filter(c.slug)}
            >
              {c.name} <sup>{String(c.count).padStart(2, "0")}</sup>
            </button>
          ))}
        </div>
        <div className="view-toggle" aria-label="Archive view">
          {["visual", "index"].map((v) => (
            <button
              key={v}
              className={mode === v ? "is-active" : ""}
              aria-pressed={mode === v}
              onClick={() => setMode(v)}
            >
              {v === "visual" ? "Visual View" : "Index View"}
            </button>
          ))}
        </div>
      </div>
      <div className="container">
        <div className="archive-visual" hidden={mode !== "visual"}>
          {projects.map((p, i) => (
            <Link
              className="archive-item artboard-frame hover-view"
              style={{ gridColumn: `span ${spans[i % spans.length]}` }}
              key={p.id}
              href={`/work/${p.slug}`}
              data-cursor="View Project"
            >
              <Artboard
                image={p.coverImage}
                aspect={p.artworkAspect}
                altFallback={`${p.title} — ${p.category.name} project cover`}
              />
              <div className="frame-meta">
                <span className="frame-title">{p.title}</span>
                <span>
                  {archiveNumber(p.archiveNumber)} — {p.category.name}
                </span>
              </div>
            </Link>
          ))}
        </div>
        <div className="archive-index" hidden={mode !== "index"}>
          <div className="index-head">
            <span>No.</span>
            <span>Title</span>
            <span>Category</span>
            <span className="ih-year">Year</span>
            <span className="ih-view" />
          </div>
          {projects.map((p) => (
            <Link className="index-row" key={p.id} href={`/work/${p.slug}`}>
              <span>{archiveNumber(p.archiveNumber)}</span>
              <span className="idx-title">{p.title}</span>
              <span className="idx-cat">{p.category.name}</span>
              <span className="idx-year">{p.year}</span>
              <span className="idx-view">View →</span>
            </Link>
          ))}
        </div>
        {!projects.length && (
          <p className="eyebrow" style={{ padding: "var(--sp-6) 0" }}>
            No published work in this category.
          </p>
        )}
      </div>
    </>
  );
}
