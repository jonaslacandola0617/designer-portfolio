"use client";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { Category, SiteSettings, MediaAsset } from "@prisma/client";
import { Field } from "./field";
import { Toast } from "./toast";
import { SortableList } from "./sortable";
import { ConfirmDialog } from "./confirm-dialog";
import {
  saveSettings,
  saveCategory,
  deleteCategory,
  reorderCategories,
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
type CategoryWithCount = Category & { _count: { projects: number } };

type CategoryFeedback =
  | { kind: "success"; message: string }
  | { kind: "error"; message: string }
  | null;

export function CategoryEditor({
  categories,
}: {
  categories: CategoryWithCount[];
}) {
  const [items, setItems] = useState(categories);
  const [snapshot, setSnapshot] = useState(categories);
  const [feedback, setFeedback] = useState<CategoryFeedback>(null);
  const [orderPending, startOrder] = useTransition();
  const router = useRouter();

  if (snapshot !== categories) {
    setSnapshot(categories);
    setItems(categories);
  }

  function reorder(next: CategoryWithCount[]) {
    if (orderPending) return;
    const previous = items;
    setItems(next);
    setFeedback(null);

    startOrder(async () => {
      const result = await reorderCategories(next.map((category) => category.id));

      if (!result.ok) {
        setItems(previous);
        setFeedback({ kind: "error", message: result.error });
        return;
      }

      setFeedback({ kind: "success", message: "Category order saved." });
      router.refresh();
    });
  }

  return (
    <section className="category-manager" aria-busy={orderPending}>
      <div className="category-manager-meta">
        <span>
          {items.length} {items.length === 1 ? "category" : "categories"}
        </span>
        <span>Drag to reorder / saves automatically</span>
      </div>

      <div className="category-table-head" aria-hidden="true">
        <span>Move</span>
        <span>Category</span>
        <span>Slug</span>
        <span>Usage</span>
        <span>Actions</span>
      </div>

      <fieldset disabled={orderPending} className="plain-fieldset category-sortable">
        <SortableList items={items} onChange={reorder}>
          {(category, handle) => (
            <CategoryForm
              category={category}
              handle={handle}
              onFeedback={setFeedback}
            />
          )}
        </SortableList>
      </fieldset>

      <div className="category-new-label">
        <span className="eyebrow">Add category</span>
      </div>
      <CategoryForm
        createSortOrder={items.length}
        onFeedback={setFeedback}
      />

      <Toast
        message={feedback?.kind === "success" ? feedback.message : ""}
      />
      {feedback?.kind === "error" && (
        <p role="status" className="notice category-error">
          {feedback.message}
        </p>
      )}
    </section>
  );
}

function CategoryForm({
  category,
  handle,
  createSortOrder = 0,
  onFeedback,
}: {
  category?: CategoryWithCount;
  handle?: React.ReactNode;
  createSortOrder?: number;
  onFeedback: (feedback: CategoryFeedback) => void;
}) {
  const [pending, start] = useTransition();
  const [confirmDelete, setConfirmDelete] = useState(false);
  const router = useRouter();
  const projectCount = category?._count.projects ?? 0;
  const isInUse = projectCount > 0;
  const idBase = category?.id ?? "new-category";

  return (
    <form
      className={`category-row${category ? "" : " is-new"}`}
      onSubmit={(event) => {
        event.preventDefault();
        const element = event.currentTarget;
        const data = new FormData(element);

        start(async () => {
          const result = await saveCategory(category?.id ?? null, {
            name: data.get("name"),
            slug: data.get("slug"),
            sortOrder: category?.sortOrder ?? createSortOrder,
          });

          if (!result.ok) {
            onFeedback({ kind: "error", message: result.error });
            return;
          }

          onFeedback({
            kind: "success",
            message: category ? "Category saved." : "Category added.",
          });

          if (!category) element.reset();
          router.refresh();
        });
      }}
    >
      <div className="category-handle-cell">
        {category ? (
          handle
        ) : (
          <span className="category-new-mark" aria-hidden="true">
            +
          </span>
        )}
      </div>

      <div className="category-inline-field">
        <label htmlFor={`${idBase}-name`}>Category name</label>
        <input
          id={`${idBase}-name`}
          name="name"
          defaultValue={category?.name}
          placeholder={category ? undefined : "Category name"}
          required
          maxLength={100}
        />
      </div>

      <div className="category-inline-field">
        <label htmlFor={`${idBase}-slug`}>Category slug</label>
        <input
          id={`${idBase}-slug`}
          className="category-slug-input"
          name="slug"
          defaultValue={category?.slug}
          placeholder={category ? undefined : "category-slug"}
          required
          maxLength={100}
          pattern="[a-z0-9]+(?:-[a-z0-9]+)*"
          title="Use lowercase letters, numbers and single hyphens."
        />
      </div>

      <div className="category-usage">
        {category ? (
          <>
            <span className="category-usage-dot" aria-hidden="true" />
            {projectCount} {projectCount === 1 ? "project" : "projects"}
          </>
        ) : (
          "New"
        )}
      </div>

      <div className="category-row-actions">
        <button type="submit" disabled={pending} className="category-save">
          {pending ? "Saving…" : category ? "Save" : "Add"}
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
            onClick={() => setConfirmDelete(true)}
          >
            Delete
          </button>
        )}
      </div>

      {category && confirmDelete && (
        <ConfirmDialog
          title="Delete category?"
          description={
            <>
              <p>
                “{category.name}” will be permanently removed from the category
                list.
              </p>
              <p className="field-note">
                Only unused categories can be deleted. This action cannot be
                undone.
              </p>
            </>
          }
          confirmLabel="Delete category"
          pending={pending}
          onClose={() => setConfirmDelete(false)}
          onConfirm={() =>
            start(async () => {
              const result = await deleteCategory(category.id);

              if (!result.ok) {
                onFeedback({ kind: "error", message: result.error });
                return;
              }

              setConfirmDelete(false);
              onFeedback({
                kind: "success",
                message: "Category deleted.",
              });
              router.refresh();
            })
          }
        />
      )}
    </form>
  );
}
