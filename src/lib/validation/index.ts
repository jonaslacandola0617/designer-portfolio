import { z } from "zod";
const text = (max: number) => z.string().trim().max(max);
export const idSchema = z.string().min(1).max(100);
export const slugSchema = z
  .string()
  .min(1)
  .max(100)
  .regex(
    /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
    "Use lowercase letters, numbers and single hyphens.",
  );
export const statuses = ["DRAFT", "PUBLISHED", "ARCHIVED"] as const;
export const layouts = [
  "LARGE",
  "OFFSET_SMALL",
  "FULL_WIDTH",
  "FULL",
  "WIDE",
  "HALF",
  "PAIR_LEFT",
  "PAIR_RIGHT",
  "DETAIL",
] as const;
const list = z.array(text(100).min(1)).max(30);
export const projectSchema = z.object({
  titleLines: text(200).default(""),
  brief: text(10000).default(""),
  direction: text(10000).default(""),
  result: text(10000).default(""),
  homeLayout: z.enum(["A", "B", "C", "D"]).default("A"),
  artworkAspect: z
    .enum(["PORTRAIT", "LANDSCAPE", "SQUARE", "WIDE"])
    .default("PORTRAIT"),
  title: text(180).min(1),
  slug: slugSchema,
  categoryId: idSchema,
  year: z.number().int().min(1900).max(2200),
  shortDescription: text(500),
  projectContext: text(10000),
  role: text(200),
  disciplines: list,
  tools: list,
  coverImageId: idSchema.nullable(),
  featured: z.boolean(),
  status: z.enum(statuses),
  sortOrder: z.number().int().min(0).max(1000000),
  seoTitle: text(160),
  seoDescription: text(320),
  gallery: z
    .array(
      z.object({
        mediaId: idSchema,
        caption: text(500),
        layout: z.enum(layouts),
      }),
    )
    .max(100)
    .refine(
      (items) => new Set(items.map((i) => i.mediaId)).size === items.length,
      "Each image can appear once in the gallery.",
    ),
});
export const projectPublishSchema = projectSchema.refine(
  (p) =>
    p.status !== "PUBLISHED" ||
    (!!p.coverImageId && p.shortDescription.length > 0),
  "Published projects need cover artwork and a short description.",
);
export type ProjectInput = z.input<typeof projectSchema>;
const social = z.union([
  z.literal(""),
  z
    .url()
    .max(500)
    .refine((s) => new URL(s).protocol === "https:", "Use an HTTPS URL."),
]);
export const settingsSchema = z.object({
  aboutHeadline: text(300).default("Design is how I organize attention."),
  contactHeadline: text(300).default("Have something\nworth making?"),
  statement: text(1000).default(""),
  statementAttribution: text(200).default(""),
  bookingText: text(300).default(""),
  openingEdition: text(100).default(""),
  introDisciplines: list.default([]),
  workflowTools: list.default([]),
  availableFor: list.default([]),
  designerName: text(120).min(1),
  professionalTitle: text(180).min(1),
  email: z.union([z.literal(""), z.email().max(254)]),
  location: text(180),
  availabilityText: text(300),
  shortBio: text(1000),
  longBio: text(10000),
  capabilities: list,
  instagramUrl: social,
  behanceUrl: social,
  linkedinUrl: social,
  githubUrl: social,
  defaultSeoTitle: text(160).min(1),
  defaultSeoDescription: text(320).min(1),
  socialImageId: idSchema.nullable(),
});
export const categorySchema = z.object({
  name: text(100).min(1),
  slug: slugSchema,
  sortOrder: z.number().int().min(0).max(10000),
});
export const loginSchema = z.object({
  email: z
    .email()
    .max(254)
    .transform((s) => s.toLowerCase()),
  password: z.string().min(1).max(72),
});
export const mediaSchema = z.object({
  fileName: text(200).min(1),
  mimeType: z.enum(["image/jpeg", "image/png", "image/webp", "image/avif"]),
  fileSize: z
    .number()
    .int()
    .positive()
    .max(20 * 1024 * 1024),
});
export const altSchema = text(500);
