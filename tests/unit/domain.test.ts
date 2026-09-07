import { describe, expect, it } from "vitest";
import {
  slugify,
  isPublic,
  nextProject,
  validateOrder,
} from "@/features/projects/domain";
import {
  projectPublishSchema,
  mediaSchema,
  settingsSchema,
} from "@/lib/validation";
const project = {
  title: "Poster",
  slug: "poster",
  categoryId: "category",
  year: 2026,
  shortDescription: "Study",
  projectContext: "",
  role: "",
  disciplines: [],
  tools: [],
  coverImageId: null,
  featured: false,
  status: "DRAFT",
  sortOrder: 0,
  seoTitle: "",
  seoDescription: "",
  gallery: [],
};
describe("portfolio domain", () => {
  it("normalizes accented titles and punctuation into stable slugs", () => {
    expect(slugify("  Café / Night Shift! ")).toBe("cafe-night-shift");
    expect(slugify("x".repeat(200))).toHaveLength(100);
  });
  it("only exposes published projects", () => {
    expect(isPublic({ status: "PUBLISHED" })).toBe(true);
    expect(isPublic({ status: "DRAFT" })).toBe(false);
    expect(isPublic({ status: "ARCHIVED" })).toBe(false);
  });
  it("wraps navigation but never links a project to itself", () => {
    const projects = [{ id: "a" }, { id: "b" }];
    expect(nextProject(projects, "b")?.id).toBe("a");
    expect(nextProject([{ id: "a" }], "a")).toBeNull();
    expect(nextProject(projects, "missing")).toBeNull();
  });
  it("rejects stale, duplicate, and foreign reorder lists", () => {
    expect(validateOrder(["b", "a"], ["a", "b"])).toEqual([
      { id: "b", sortOrder: 0 },
      { id: "a", sortOrder: 1 },
    ]);
    for (const ids of [["a"], ["a", "a"], ["a", "c"]])
      expect(() => validateOrder(ids, ["a", "b"])).toThrow();
  });
  it("allows incomplete drafts but requires a publishable cover and description", () => {
    expect(projectPublishSchema.safeParse(project).success).toBe(true);
    expect(
      projectPublishSchema.safeParse({ ...project, status: "PUBLISHED" })
        .success,
    ).toBe(false);
    expect(
      projectPublishSchema.safeParse({
        ...project,
        coverImageId: "image",
        status: "PUBLISHED",
      }).success,
    ).toBe(true);
  });
  it("rejects unsafe slugs and duplicate gallery images", () => {
    expect(
      projectPublishSchema.safeParse({ ...project, slug: "../draft" }).success,
    ).toBe(false);
    expect(
      projectPublishSchema.safeParse({
        ...project,
        gallery: [
          { mediaId: "a", caption: "", layout: "FULL" },
          { mediaId: "a", caption: "", layout: "HALF" },
        ],
      }).success,
    ).toBe(false);
  });
  it("rejects executable formats and oversized uploads", () => {
    expect(
      mediaSchema.safeParse({
        fileName: "x.svg",
        mimeType: "image/svg+xml",
        fileSize: 100,
      }).success,
    ).toBe(false);
    expect(
      mediaSchema.safeParse({
        fileName: "x.png",
        mimeType: "image/png",
        fileSize: 21 * 1024 * 1024,
      }).success,
    ).toBe(false);
  });
  it("rejects script social URLs", () => {
    expect(
      settingsSchema.shape.instagramUrl.safeParse("javascript:alert(1)")
        .success,
    ).toBe(false);
  });
});
