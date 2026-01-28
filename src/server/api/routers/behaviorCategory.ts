import { z } from "zod";
import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "~/server/api/trpc";
import { BehaviorType } from "@prisma/client";

export const behaviorCategoryRouter = createTRPCRouter({
  // Create a new behavior category
  create: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1, "Nama kategori tidak boleh kosong"),
        type: z.nativeEnum(BehaviorType),
        points: z.number(),
        description: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const school = await ctx.db.school.findFirst();

      if (!school) {
        throw new Error("Sekolah tidak ditemukan");
      }

      const category = await ctx.db.behaviorCategory.create({
        data: {
          schoolId: school.id,
          name: input.name,
          type: input.type,
          points: input.points,
          description: input.description,
          isActive: true,
        },
      });

      return {
        success: true,
        message: "Kategori sikap berhasil dibuat",
        data: category,
      };
    }),

  // Get all behavior categories
  getAll: publicProcedure
    .input(
      z.object({
        type: z.nativeEnum(BehaviorType).optional(),
        isActive: z.boolean().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const school = await ctx.db.school.findFirst();

      if (!school) {
        return [];
      }

      const categories = await ctx.db.behaviorCategory.findMany({
        where: {
          schoolId: school.id,
          ...(input.type && { type: input.type }),
          ...(input.isActive !== undefined && { isActive: input.isActive }),
        },
        orderBy: [{ type: "asc" }, { name: "asc" }],
      });

      return categories;
    }),

  // Get single category
  getById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const category = await ctx.db.behaviorCategory.findUnique({
        where: { id: input.id },
      });

      if (!category) {
        throw new Error("Kategori sikap tidak ditemukan");
      }

      return category;
    }),

  // Update behavior category
  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string().optional(),
        points: z.number().optional(),
        description: z.string().optional(),
        isActive: z.boolean().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input;

      const category = await ctx.db.behaviorCategory.findUnique({
        where: { id },
      });

      if (!category) {
        throw new Error("Kategori sikap tidak ditemukan");
      }

      const updated = await ctx.db.behaviorCategory.update({
        where: { id },
        data,
      });

      return {
        success: true,
        message: "Kategori sikap berhasil diperbarui",
        data: updated,
      };
    }),

  // Delete behavior category
  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const category = await ctx.db.behaviorCategory.findUnique({
        where: { id: input.id },
        include: {
          behaviors: true,
        },
      });

      if (!category) {
        throw new Error("Kategori sikap tidak ditemukan");
      }

      if (category.behaviors.length > 0) {
        throw new Error("Tidak dapat menghapus kategori yang sudah digunakan. Nonaktifkan saja.");
      }

      await ctx.db.behaviorCategory.delete({
        where: { id: input.id },
      });

      return {
        success: true,
        message: "Kategori sikap berhasil dihapus",
      };
    }),

  // Get statistics
  getStats: publicProcedure.query(async ({ ctx }) => {
    const school = await ctx.db.school.findFirst();

    if (!school) {
      return {
        total: 0,
        positive: 0,
        negative: 0,
        active: 0,
      };
    }

    const [total, positive, negative, active] = await Promise.all([
      ctx.db.behaviorCategory.count({
        where: { schoolId: school.id },
      }),
      ctx.db.behaviorCategory.count({
        where: {
          schoolId: school.id,
          type: BehaviorType.POSITIVE,
        },
      }),
      ctx.db.behaviorCategory.count({
        where: {
          schoolId: school.id,
          type: BehaviorType.NEGATIVE,
        },
      }),
      ctx.db.behaviorCategory.count({
        where: {
          schoolId: school.id,
          isActive: true,
        },
      }),
    ]);

    return {
      total,
      positive,
      negative,
      active,
    };
  }),
});
