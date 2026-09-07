import { Prisma, PrismaClient } from "@prisma/client";
import {
  projectPublishSchema,
  idSchema,
  settingsSchema,
  categorySchema,
} from "@/lib/validation";
import { validateOrder } from "./domain";

export class DomainError extends Error {}
export type Actor = { id: string };
export function projectService(
  db: PrismaClient,
  authorize: () => Promise<Actor>,
) {
  async function transaction<T>(
    run: (tx: Prisma.TransactionClient) => Promise<T>,
  ): Promise<T> {
    for (let attempt = 0; ; attempt++) {
      try {
        return await db.$transaction(run, { isolationLevel: "Serializable" });
      } catch (error) {
        if (
          error instanceof Prisma.PrismaClientKnownRequestError &&
          error.code === "P2034" &&
          attempt < 2
        )
          continue;
        throw error;
      }
    }
  }
  return {
    async save(id: string | null, input: unknown) {
      await authorize();
      const { gallery, ...data } = projectPublishSchema.parse(input);
      if (id) idSchema.parse(id);
      return transaction(async (tx) => {
        const previous = id
          ? await tx.project.findUniqueOrThrow({ where: { id } })
          : null;
        const publishedAt =
          data.status === "PUBLISHED"
            ? (previous?.publishedAt ?? new Date())
            : (previous?.publishedAt ?? null);
        const project = id
          ? await tx.project.update({
              where: { id },
              data: { ...data, publishedAt },
            })
          : await tx.project.create({ data: { ...data, publishedAt } });
        await tx.projectMedia.deleteMany({ where: { projectId: project.id } });
        if (gallery.length)
          await tx.projectMedia.createMany({
            data: gallery.map((item, sortOrder) => ({
              ...item,
              projectId: project.id,
              sortOrder,
            })),
          });
        return project;
      });
    },
    async duplicate(id: string) {
      await authorize();
      idSchema.parse(id);
      return transaction(async (tx) => {
        const original = await tx.project.findUniqueOrThrow({
          where: { id },
          include: { gallery: true },
        });
        const {
          id: _id,
          archiveNumber: _archiveNumber,
          createdAt: _created,
          updatedAt: _updated,
          gallery,
          ...content
        } = original;
        void _id;
        void _archiveNumber;
        void _created;
        void _updated;
        const base = `${original.slug.slice(0, 85)}-copy`;
        let slug = base;
        for (let n = 2; await tx.project.findUnique({ where: { slug } }); n++)
          slug = `${base}-${n}`;
        return tx.project.create({
          data: {
            ...content,
            title: `${original.title.slice(0, 170)} (copy)`,
            slug,
            status: "DRAFT",
            publishedAt: null,
            gallery: {
              create: gallery.map((g) => ({
                mediaId: g.mediaId,
                sortOrder: g.sortOrder,
                caption: g.caption,
                layout: g.layout,
              })),
            },
          },
        });
      });
    },
    async archive(id: string, restore = false) {
      await authorize();
      idSchema.parse(id);
      return db.project.update({
        where: { id },
        data: { status: restore ? "DRAFT" : "ARCHIVED" },
      });
    },
    async remove(id: string, confirmation: string) {
      await authorize();
      idSchema.parse(id);
      return transaction(async (tx) => {
        const project = await tx.project.findUniqueOrThrow({ where: { id } });
        if (confirmation !== project.slug)
          throw new DomainError("Type the project slug to confirm deletion.");
        await tx.projectMedia.deleteMany({ where: { projectId: id } });
        await tx.project.delete({ where: { id } });
      });
    },
    async reorder(ids: string[]) {
      await authorize();
      if (ids.length > 10000) throw new DomainError("Too many projects.");
      ids.forEach((id) => idSchema.parse(id));
      return transaction(async (tx) => {
        const rows = await tx.project.findMany({ select: { id: true } });
        const order = validateOrder(
          ids,
          rows.map((p) => p.id),
        );
        await Promise.all(
          order.map(({ id, sortOrder }) =>
            tx.project.update({ where: { id }, data: { sortOrder } }),
          ),
        );
      });
    },
    async reorderCategories(ids: string[]) {
      await authorize();
      if (ids.length > 1000) throw new DomainError("Too many categories.");
      ids.forEach((id) => idSchema.parse(id));
      return transaction(async (tx) => {
        const rows = await tx.category.findMany({ select: { id: true } });
        const order = validateOrder(
          ids,
          rows.map((category) => category.id),
        );
        await Promise.all(
          order.map(({ id, sortOrder }) =>
            tx.category.update({ where: { id }, data: { sortOrder } }),
          ),
        );
      });
    },
    async settings(input: unknown) {
      await authorize();
      const data = settingsSchema.parse(input);
      return db.siteSettings.upsert({
        where: { id: "site" },
        create: { id: "site", ...data },
        update: data,
      });
    },
    async category(id: string | null, input: unknown) {
      await authorize();
      const data = categorySchema.parse(input);

      if (id) {
        const { sortOrder: _sortOrder, ...editable } = data;
        void _sortOrder;
        return db.category.update({
          where: { id: idSchema.parse(id) },
          data: editable,
        });
      }

      return transaction(async (tx) => {
        const latest = await tx.category.aggregate({
          _max: { sortOrder: true },
        });
        return tx.category.create({
          data: {
            ...data,
            sortOrder: (latest._max.sortOrder ?? -1) + 1,
          },
        });
      });
    },
    async removeCategory(id: string) {
      await authorize();
      return db.category.delete({ where: { id: idSchema.parse(id) } });
    },
  };
}
