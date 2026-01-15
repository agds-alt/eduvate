import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";

export const informationRouter = createTRPCRouter({
  // Get all information posts
  getAll: publicProcedure
    .input(
      z.object({
        category: z.string().optional(),
        isPinned: z.boolean().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const where: any = {};

      if (input.category) {
        where.category = input.category;
      }

      if (input.isPinned !== undefined) {
        where.isPinned = input.isPinned;
      }

      const posts = await ctx.db.information.findMany({
        where,
        orderBy: [{ isPinned: "desc" }, { publishedAt: "desc" }],
      });

      return posts;
    }),

  // Get recent information posts
  getRecent: publicProcedure
    .input(z.object({ limit: z.number().default(5) }))
    .query(async ({ ctx, input }) => {
      const posts = await ctx.db.information.findMany({
        orderBy: {
          publishedAt: "desc",
        },
        take: input.limit,
      });

      return posts;
    }),

  // Get information by ID
  getById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      return ctx.db.information.findUnique({
        where: { id: input.id },
      });
    }),

  // Create information post
  create: publicProcedure
    .input(
      z.object({
        title: z.string().min(3),
        content: z.string(),
        category: z.string().optional(),
        isPinned: z.boolean().default(false),
        publishedAt: z.date().default(() => new Date()),
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

      const info = await ctx.db.information.create({
        data: {
          schoolId: school.id,
          title: input.title,
          content: input.content,
          category: input.category,
          isPinned: input.isPinned,
          publishedAt: input.publishedAt,
        },
      });

      return info;
    }),

  // Update information post
  update: publicProcedure
    .input(
      z.object({
        id: z.string(),
        title: z.string().min(3).optional(),
        content: z.string().optional(),
        category: z.string().optional(),
        isPinned: z.boolean().optional(),
        publishedAt: z.date().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input;

      const info = await ctx.db.information.update({
        where: { id },
        data,
      });

      return info;
    }),

  // Delete information post
  delete: publicProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db.information.delete({
        where: { id: input.id },
      });

      return { success: true };
    }),

  // Get categories
  getCategories: publicProcedure.query(async ({ ctx }) => {
    const posts = await ctx.db.information.findMany({
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

    return posts.map((p) => p.category).filter((c): c is string => c !== null);
  }),
});
