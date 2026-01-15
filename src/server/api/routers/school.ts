import { z } from "zod";
import { createTRPCRouter, publicProcedure, protectedProcedure } from "~/server/api/trpc";

export const schoolRouter = createTRPCRouter({
  // Get school profile (first school)
  getProfile: publicProcedure.query(async ({ ctx }) => {
    const school = await ctx.db.school.findFirst({
      orderBy: { createdAt: "desc" },
    });

    if (!school) {
      throw new Error("School not found");
    }

    return school;
  }),

  // Get school by ID
  getById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const school = await ctx.db.school.findUnique({
        where: { id: input.id },
        include: {
          _count: {
            select: {
              teachers: true,
              students: true,
              classes: true,
            },
          },
        },
      });

      return school;
    }),

  // Get all schools (protected - admin only)
  getAll: protectedProcedure.query(async ({ ctx }) => {
    const schools = await ctx.db.school.findMany({
      include: {
        _count: {
          select: {
            teachers: true,
            students: true,
            classes: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return schools;
  }),

  // Create new school (protected)
  create: protectedProcedure
    .input(
      z.object({
        name: z.string().min(3, "Name must be at least 3 characters"),
        npsn: z.string().optional(),
        email: z.string().email().optional(),
        phone: z.string().optional(),
        address: z.string().optional(),
        quota: z.number().int().positive().default(50),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const school = await ctx.db.school.create({
        data: {
          ...input,
        },
      });

      return school;
    }),

  // Update school
  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string().min(3).optional(),
        npsn: z.string().optional(),
        email: z.string().email().optional(),
        phone: z.string().optional(),
        address: z.string().optional(),
        logo: z.string().optional(),
        website: z.string().url().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input;

      const school = await ctx.db.school.update({
        where: { id },
        data,
      });

      return school;
    }),

  // Delete school
  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db.school.delete({
        where: { id: input.id },
      });

      return { success: true };
    }),

  // Get school statistics
  getStats: protectedProcedure
    .input(z.object({ schoolId: z.string() }))
    .query(async ({ ctx, input }) => {
      const [
        teachersCount,
        studentsCount,
        classesCount,
        attendanceToday,
      ] = await Promise.all([
        ctx.db.teacher.count({ where: { schoolId: input.schoolId } }),
        ctx.db.student.count({ where: { schoolId: input.schoolId } }),
        ctx.db.class.count({ where: { schoolId: input.schoolId } }),
        ctx.db.attendance.count({
          where: {
            schoolId: input.schoolId,
            date: {
              gte: new Date(new Date().setHours(0, 0, 0, 0)),
              lt: new Date(new Date().setHours(23, 59, 59, 999)),
            },
          },
        }),
      ]);

      return {
        teachers: teachersCount,
        students: studentsCount,
        classes: classesCount,
        attendanceToday,
      };
    }),
});
