import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";

export const holidayRouter = createTRPCRouter({
  // Get all holidays
  getAll: publicProcedure
    .input(
      z.object({
        year: z.number().optional(),
        month: z.number().min(1).max(12).optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const where: any = {};

      if (input.year || input.month) {
        if (input.year && input.month) {
          // Get holidays for specific month
          const startDate = new Date(input.year, input.month - 1, 1);
          const endDate = new Date(input.year, input.month, 0, 23, 59, 59);
          where.date = {
            gte: startDate,
            lte: endDate,
          };
        } else if (input.year) {
          // Get holidays for entire year
          const startDate = new Date(input.year, 0, 1);
          const endDate = new Date(input.year, 11, 31, 23, 59, 59);
          where.date = {
            gte: startDate,
            lte: endDate,
          };
        }
      }

      const holidays = await ctx.db.holiday.findMany({
        where,
        orderBy: {
          date: "asc",
        },
      });

      return holidays;
    }),

  // Get upcoming holidays
  getUpcoming: publicProcedure
    .input(z.object({ limit: z.number().default(5) }))
    .query(async ({ ctx, input }) => {
      const now = new Date();

      const holidays = await ctx.db.holiday.findMany({
        where: {
          date: {
            gte: now,
          },
        },
        orderBy: {
          date: "asc",
        },
        take: input.limit,
      });

      return holidays;
    }),

  // Get holiday by ID
  getById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      return ctx.db.holiday.findUnique({
        where: { id: input.id },
      });
    }),

  // Create holiday
  create: publicProcedure
    .input(
      z.object({
        name: z.string().min(3),
        date: z.date(),
        description: z.string().optional(),
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

      const holiday = await ctx.db.holiday.create({
        data: {
          schoolId: school.id,
          name: input.name,
          date: input.date,
          description: input.description,
        },
      });

      return holiday;
    }),

  // Update holiday
  update: publicProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string().min(3).optional(),
        date: z.date().optional(),
        description: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input;

      const holiday = await ctx.db.holiday.update({
        where: { id },
        data,
      });

      return holiday;
    }),

  // Delete holiday
  delete: publicProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db.holiday.delete({
        where: { id: input.id },
      });

      return { success: true };
    }),
});
