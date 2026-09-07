"use client";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { Category, SiteSettings, MediaAsset } from "@prisma/client";
import { Field } from "./field";
import { Toast } from "./toast";
import {
  saveSettings,
  saveCategory,
  deleteCategory,
} from "@/features/projects/actions";

const basic = [
  ["designerName", "Designer name"],
  ["email", "Email"],
  ["availabilityText", "Availability"],
  ["longBio", "About text"],
] as const;
const socials = [
  ["instagramUrl", "Instagram"],
  ["behanceUrl", "Behance"],
  ["linkedinUrl", "LinkedIn"],
  ["githubUrl", "GitHub"],
] as const;
const advanced = [
  ["professionalTitle", "Professional title"],
  ["location", "Location"],
  ["shortBio", "Short bio"],
  ["aboutHeadline", "About headline"],
  ["contactHeadline", "Contact headline"],
  ["statement", "Statement"],
  ["statementAttribution", "Statement attribution"],
  ["bookingText", "Booking text"],
  ["openingEdition", "Opening edition"],
  ["defaultSeoTitle", "Default SEO title"],
  ["defaultSeoDescription", "Default SEO description"],
] as const;
const lists = [
  ["capabilities", "Capabilities"],
  ["introDisciplines", "Intro disciplines"],
  ["workflowTools", "Workflow tools"],
  ["availableFor", "Available for"],
] as const;
export function SettingsEditor({
  settings,
  media,
}: {
  settings: SiteSettings;
  media: MediaAsset[];
}) {
  const [message, setMessage] = useState("");
  const [pending, start] = useTransition();
  const router = useRouter();
  return (
    <form
      className="settings-form"
      onSubmit={(e) => {
        e.preventDefault();
        const data = new FormData(e.currentTarget);
        start(async () => {
          const result = await saveSettings({
            ...Object.fromEntries(
              [...basic, ...socials, ...advanced].map(([key]) => [
                key,
                String(data.get(key) ?? ""),
              ]),
            ),
            ...Object.fromEntries(
              lists.map(([key]) => [
                key,
                String(data.get(key) ?? "")
                  .split(",")
                  .map((s) => s.trim())
                  .filter(Boolean),
              ]),
            ),
            socialImageId: data.get("socialImageId") || null,
          });
          setMessage(result.ok ? "Settings saved." : result.error);
          if (result.ok) router.refresh();
        });
      }}
    >
      <fieldset disabled={pending} className="plain-fieldset">
        <section className="form-section">
          <span className="fs-label eyebrow">Profile</span>
          <div className="form-row">
            {basic.slice(0, 2).map(([key, label]) => (
              <Field key={key} name={key} label={label} value={settings[key]} />
            ))}
          </div>
          {basic.slice(2).map(([key, label]) => (
            <Field
              key={key}
              name={key}
              label={label}
              value={settings[key]}
              multiline={key === "longBio"}
            />
          ))}
        </section>
        <section className="form-section">
          <span className="fs-label eyebrow">Social links</span>
          {socials.map(([key, label]) => (
            <Field key={key} name={key} label={label} value={settings[key]} />
          ))}
        </section>
        <details>
          <summary>Public content / Search metadata</summary>
          {advanced.map(([key, label]) => (
            <Field
              key={key}
              name={key}
              label={label}
              value={settings[key]}
              multiline={[
                "shortBio",
                "aboutHeadline",
                "contactHeadline",
                "statement",
                "defaultSeoDescription",
              ].includes(key)}
            />
          ))}
          {lists.map(([key, label]) => (
            <Field
              key={key}
              name={key}
              label={label + " (comma separated)"}
              value={settings[key].join(", ")}
            />
          ))}
          <div className="field">
            <label htmlFor="social-image">Default social image</label>
            <select
              id="social-image"
              name="socialImageId"
              defaultValue={settings.socialImageId ?? ""}
            >
              <option value="">None</option>
              {media.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.fileName}
                </option>
              ))}
            </select>
          </div>
        </details>
      </fieldset>
      <Toast message={message==="Settings saved."?message:""}/>
      {message && message!=="Settings saved." && (
        <p role="status" className="notice">
          {message}
        </p>
      )}
      <div className="save-bar" style={{ justifyContent: "flex-end" }}>
        <button disabled={pending} className="btn primary">
          Save settings
        </button>
      </div>
    </form>
  );
}
export function CategoryEditor({
  categories,
}: {
  categories: (Category & { _count: { projects: number } })[];
}) {
  return (
    <section className="category-manager">
      <div className="category-manager-head">
        <div>
          <span className="eyebrow">Taxonomy</span>
          <h2>Categories</h2>
        </div>
        <span className="category-total">
          {categories.length} {categories.length === 1 ? "category" : "categories"}
        </span>
      </div>

      <div className="category-list">
        {categories.map((category) => (
          <CategoryForm
            key={`${category.id}-${category.updatedAt.toISOString()}`}
            category={category}
          />
        ))}
      </div>

      <div className="category-add">
        <div className="category-add-head">
          <span className="eyebrow">New category</span>
          <h3>Add category</h3>
        </div>
        <CategoryForm />
      </div>
    </section>
  );
}

function CategoryForm({
  category,
}: {
  category?: Category & { _count: { projects: number } };
}) {
  const [message, setMessage] = useState("");
  const [pending, start] = useTransition();
  const router = useRouter();
  const projectCount = category?._count.projects ?? 0;
  const isInUse = projectCount > 0;

  return (
    <form
      className={`category-form${category ? "" : " is-new"}`}
      onSubmit={(e) => {
        e.preventDefault();
        const element = e.currentTarget;
        const data = new FormData(element);

        start(async () => {
          const result = await saveCategory(category?.id ?? null, {
            name: data.get("name"),
            slug: data.get("slug"),
            sortOrder: Number(data.get("sortOrder")),
          });

          setMessage(result.ok ? "Category saved." : result.error);

          if (result.ok) {
            if (!category) element.reset();
            router.refresh();
          }
        });
      }}
    >
      {category && (
        <div className="category-form-head">
          <span className="category-form-title">{category.name}</span>
          <span className={`category-usage${isInUse ? " is-used" : ""}`}>
            <span className="category-usage-dot" aria-hidden="true" />
            {projectCount} {projectCount === 1 ? "project" : "projects"}
          </span>
        </div>
      )}

      <div className="category-fields">
        <Field
          label="Category name"
          name="name"
          value={category?.name}
          required
        />
        <Field
          label="Category slug"
          name="slug"
          value={category?.slug}
          required
        />
        <Field
          label="Order"
          name="sortOrder"
          value={category?.sortOrder ?? 0}
          type="number"
        />
      </div>

      <div className="category-actions">
        <button disabled={pending} className="category-save">
          {category ? "Save changes" : "Add category"}
        </button>

        {category && (
          <button
            className="category-delete"
            type="button"
            disabled={pending || isInUse}
            title={
              isInUse
                ? "Move or remove projects from this category before deleting it."
                : "Delete this unused category."
            }
            onClick={() => {
              if (
                window.confirm(
                  `Delete the unused category “${category.name}”?`,
                )
              ) {
                start(async () => {
                  const result = await deleteCategory(category.id);
                  setMessage(result.ok ? "Category deleted." : result.error);
                  router.refresh();
                });
              }
            }}
          >
            {isInUse ? "In use" : "Delete category"}
          </button>
        )}
      </div>

      {message && (
        <p
          role="status"
          className={
            message === "Category saved." || message === "Category deleted."
              ? "category-message"
              : "category-message is-error"
          }
        >
          {message}
        </p>
      )}
    </form>
  );
}
