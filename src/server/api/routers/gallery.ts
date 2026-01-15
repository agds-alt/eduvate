import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";

export const galleryRouter = createTRPCRouter({
  // Get all gallery items
  getAll: publicProcedure
    .input(
      z.object({
        category: z.string().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const where: any = {};

      if (input.category) {
        where.category = input.category;
      }

      const items = await ctx.db.gallery.findMany({
        where,
        orderBy: {
          createdAt: "desc",
        },
      });

      return items;
    }),

  // Get recent gallery items
  getRecent: publicProcedure
    .input(z.object({ limit: z.number().default(12) }))
    .query(async ({ ctx, input }) => {
      const items = await ctx.db.gallery.findMany({
        orderBy: {
          createdAt: "desc",
        },
        take: input.limit,
      });

      return items;
    }),

  // Get gallery by ID
  getById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      return ctx.db.gallery.findUnique({
        where: { id: input.id },
      });
    }),

  // Create gallery item
  create: publicProcedure
    .input(
      z.object({
        title: z.string().min(3),
        description: z.string().optional(),
        imageUrl: z.string().url(),
        category: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Get school ID
      const school = await ctx.db.school.findFirst({
        orderBy: { createdAt: "desc" },
      });

      if (!school) {
        throw new Error("School not found");
      }

      const item = await ctx.db.gallery.create({
        data: {
          schoolId: school.id,
          title: input.title,
          description: input.description,
          imageUrl: input.imageUrl,
          category: input.category,
        },
      });

      return item;
    }),

  // Update gallery item
  update: publicProcedure
    .input(
      z.object({
        id: z.string(),
        title: z.string().min(3).optional(),
        description: z.string().optional(),
        imageUrl: z.string().url().optional(),
        category: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input;

      const item = await ctx.db.gallery.update({
        where: { id },
        data,
      });

      return item;
    }),

  // Delete gallery item
  delete: publicProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db.gallery.delete({
        where: { id: input.id },
      });

      return { success: true };
    }),

  // Get categories
  getCategories: publicProcedure.query(async ({ ctx }) => {
      const items = await ctx.db.gallery.findMany({
        select: {
          category: true,
        },
        distinct: ["category"],
        where: {
          category: {
            not: null,
          },
        },
      });

      return items.map((i) => i.category).filter((c): c is string => c !== null);
    }),
});
