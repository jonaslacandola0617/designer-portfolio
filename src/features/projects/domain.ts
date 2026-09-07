export function slugify(value: string) {
  return value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 100)
    .replace(/-$/, "");
}
export function isPublic(project: { status: string }) {
  return project.status === "PUBLISHED";
}
export function nextProject<T extends { id: string }>(
  projects: T[],
  currentId: string,
): T | null {
  const index = projects.findIndex((p) => p.id === currentId);
  return index < 0 || projects.length < 2
    ? null
    : projects[(index + 1) % projects.length];
}
export function validateOrder(ids: string[], existing: string[]) {
  if (
    new Set(ids).size !== ids.length ||
    ids.length !== existing.length ||
    existing.some((id) => !ids.includes(id))
  )
    throw new Error("The project list changed. Refresh before reordering.");
  return ids.map((id, sortOrder) => ({ id, sortOrder }));
}
