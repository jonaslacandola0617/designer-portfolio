"use client";
import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { SortableList } from "./sortable";
import { Toast } from "./toast";
import {
  archiveProject,
  deleteProject,
  duplicateProject,
  reorderProjects,
  type ActionResult,
} from "@/features/projects/actions";
type Row = {
  id: string;
  archiveNumber: number;
  title: string;
  slug: string;
  category: string;
  year: number;
  status: string;
  featured: boolean;
  updatedAt: string;
};
export function ProjectList({ projects }: { projects: Row[] }) {
  const [items, setItems] = useState(projects);
  const [snapshot, setSnapshot] = useState(projects);
  if (snapshot !== projects) {
    setSnapshot(projects);
    setItems(projects);
  }
  const [message, setMessage] = useState("");
  const [arranging, setArranging] = useState(false);
  const [pending, start] = useTransition();
  const router = useRouter();
  const run = (fn: () => Promise<ActionResult>) =>
    start(async () => {
      const result = await fn();
      setMessage(result.ok ? "Change saved." : result.error);
      if (result.ok) router.refresh();
    });
  function move(i: number, d: number) {
    const copy = [...items];
    [copy[i], copy[i + d]] = [copy[i + d], copy[i]];
    setItems(copy);
  }
  return (
    <>
      <div className="stat-row">
        {[
          [projects.length, "Total projects"],
          [
            projects.filter((p) => p.status === "PUBLISHED").length,
            "Published",
          ],
          [projects.filter((p) => p.status === "DRAFT").length, "Draft"],
        ].map(([n, label]) => (
          <div className="stat" key={label}>
            <div className="stat-num">{n}</div>
            <div className="stat-label eyebrow">{label}</div>
          </div>
        ))}
      </div>
      <div className="table-head">
        <span>No.</span>
        <span>Project</span>
        <span>Category</span>
        <span>Year</span>
        <span>Status</span>
        <span>Actions</span>
      </div>
      <fieldset disabled={pending} className="plain-fieldset">
        <SortableList items={items} onChange={setItems}>
          {(p, handle) => {
            const i = items.findIndex((x) => x.id === p.id);
            return (
              <div className="table-row">
                <span className="mono">
                  {arranging && handle}
                  {String(p.archiveNumber).padStart(3, "0")}
                </span>
                <Link className="t-title" href={`/admin/projects/${p.id}`}>
                  {p.title}
                </Link>
                <span className="t-cat">{p.category}</span>
                <span className="mono">{p.year}</span>
                <span className={`status-pill ${p.status.toLowerCase()}`}>
                  <span className="dot" />
                  {p.status}
                </span>
                <div className="row-actions">
                  <Link href={`/admin/projects/${p.id}`}>Edit</Link>
                  <button
                    type="button"
                    onClick={() => run(() => duplicateProject(p.id))}
                  >
                    Duplicate
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      run(() => archiveProject(p.id, p.status === "ARCHIVED"))
                    }
                  >
                    {p.status === "ARCHIVED" ? "Restore" : "Archive"}
                  </button>
                  {arranging && (
                    <>
                      <button
                        type="button"
                        disabled={!i}
                        onClick={() => move(i, -1)}
                      >
                        Move up
                      </button>
                      <button
                        type="button"
                        disabled={i === items.length - 1}
                        onClick={() => move(i, 1)}
                      >
                        Move down
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          const confirmation = window.prompt(
                            `Delete “${p.title}”? Type ${p.slug} to confirm.`,
                          );
                          if (confirmation !== null)
                            run(() => deleteProject(p.id, confirmation));
                        }}
                      >
                        Delete
                      </button>
                    </>
                  )}
                </div>
              </div>
            );
          }}
        </SortableList>
        {!items.length && (
          <p className="empty">No projects yet. Create your first project.</p>
        )}
        <div className="admin-order-actions">
          <button
            type="button"
            className="btn ghost"
            onClick={() => setArranging(!arranging)}
          >
            {arranging ? "Done" : "Manage order"}
          </button>
          {arranging && (
            <button
              type="button"
              className="btn"
              onClick={() => run(() => reorderProjects(items.map((p) => p.id)))}
            >
              Save project order
            </button>
          )}
        </div>
      </fieldset>
      <Toast message={message==="Change saved."?message:""}/>
      {message && message!=="Change saved." && (
        <p role="status" className="notice">
          {message}
        </p>
      )}
    </>
  );
}
