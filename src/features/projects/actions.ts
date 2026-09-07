"use server";
import { Prisma } from "@prisma/client";
import { ZodError } from "zod";
import { invalidatePortfolio } from "@/lib/revalidation";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { DomainError, projectService } from "./service";
const service = projectService(db, requireAdmin);
export type ActionResult =
  { ok: true; id?: string } | { ok: false; error: string };
async function execute(
  run: () => Promise<{ id: string } | void>,
): Promise<ActionResult> {
  try {
    const result = await run();
    await invalidatePortfolio();
    return { ok: true, id: result?.id };
  } catch (error) {
    if (error instanceof ZodError)
      return {
        ok: false,
        error: error.issues
          .map((i) => `${i.path.join(".")}: ${i.message}`)
          .join("; "),
      };
    if (error instanceof DomainError)
      return { ok: false, error: error.message };
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2002")
        return {
          ok: false,
          error: "That slug is already in use. Choose another.",
        };
      if (error.code === "P2003")
        return {
          ok: false,
          error:
            "This item is referenced or a selected item no longer exists. Refresh and check its usage.",
        };
    }
    return {
      ok: false,
      error: "Could not save this change. Check your session and try again.",
    };
  }
}
export async function saveProject(id: string | null, data: unknown) {
  return execute(() => service.save(id, data));
}
export async function duplicateProject(id: string) {
  return execute(() => service.duplicate(id));
}
export async function archiveProject(id: string, restore = false) {
  return execute(() => service.archive(id, restore));
}
export async function deleteProject(id: string, confirmation: string) {
  return execute(() => service.remove(id, confirmation));
}
export async function reorderProjects(ids: string[]) {
  return execute(() => service.reorder(ids));
}
export async function saveSettings(data: unknown) {
  return execute(() => service.settings(data));
}
export async function saveCategory(id: string | null, data: unknown) {
  return execute(() => service.category(id, data));
}
export async function deleteCategory(id: string) {
  return execute(() => service.removeCategory(id));
}
