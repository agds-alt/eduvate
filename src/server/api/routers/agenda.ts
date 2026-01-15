import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";

export const agendaRouter = createTRPCRouter({
  // Get all agendas
  getAll: publicProcedure
    .input(
      z.object({
        startDate: z.date().optional(),
        endDate: z.date().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const where: any = {};

      if (input.startDate || input.endDate) {
        where.startDate = {};
        if (input.startDate) {
          where.startDate.gte = input.startDate;
        }
        if (input.endDate) {
          where.startDate.lte = input.endDate;
        }
      }

      const agendas = await ctx.db.agenda.findMany({
        where,
        orderBy: {
          startDate: "asc",
        },
      });

      return agendas;
    }),

  // Get upcoming agendas
  getUpcoming: publicProcedure
    .input(z.object({ limit: z.number().default(10) }))
    .query(async ({ ctx, input }) => {
      const now = new Date();

      const agendas = await ctx.db.agenda.findMany({
        where: {
          startDate: {
            gte: now,
          },
        },
        orderBy: {
          startDate: "asc",
        },
        take: input.limit,
      });

      return agendas;
    }),

  // Get agenda by ID
  getById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      return ctx.db.agenda.findUnique({
        where: { id: input.id },
      });
    }),

  // Create agenda
  create: publicProcedure
    .input(
      z.object({
        title: z.string().min(3),
        description: z.string().optional(),
        startDate: z.date(),
        endDate: z.date().optional(),
        location: z.string().optional(),
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

      const agenda = await ctx.db.agenda.create({
        data: {
          schoolId: school.id,
          title: input.title,
          description: input.description,
          startDate: input.startDate,
          endDate: input.endDate,
          location: input.location,
        },
      });

      return agenda;
    }),

  // Update agenda
  update: publicProcedure
    .input(
      z.object({
        id: z.string(),
        title: z.string().min(3).optional(),
        description: z.string().optional(),
        startDate: z.date().optional(),
        endDate: z.date().optional(),
        location: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input;

      const agenda = await ctx.db.agenda.update({
        where: { id },
        data,
      });

      return agenda;
    }),

  // Delete agenda
  delete: publicProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db.agenda.delete({
        where: { id: input.id },
      });

      return { success: true };
    }),
});
