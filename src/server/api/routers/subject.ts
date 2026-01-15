import { z } from "zod";
import { createTRPCRouter, publicProcedure, protectedProcedure } from "~/server/api/trpc";

export const subjectRouter = createTRPCRouter({
  // Get all subjects with pagination and filters
  getAll: publicProcedure
    .input(
      z.object({
        page: z.number().min(1).default(1),
        limit: z.number().min(1).max(100).default(20),
        search: z.string().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const { page, limit, search } = input;
      const skip = (page - 1) * limit;

      // Build where clause
      const where: any = {};

      if (search) {
        where.OR = [
          {
            name: {
              contains: search,
              mode: "insensitive",
            },
          },
          {
            code: {
              contains: search,
              mode: "insensitive",
            },
          },
        ];
      }

      // Get total count
      const total = await ctx.db.subject.count({ where });

      // Get subjects
      const subjects = await ctx.db.subject.findMany({
        where,
        skip,
        take: limit,
        include: {
          school: {
            select: {
              name: true,
            },
          },
          _count: {
            select: {
              classes: true,
              exams: true,
              grades: true,
            },
          },
        },
        orderBy: { name: "asc" },
      });

      return {
        subjects,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      };
    }),

  // Get subject by ID
  getById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const subject = await ctx.db.subject.findUnique({
        where: { id: input.id },
        include: {
          school: {
            select: {
              name: true,
            },
          },
          classes: {
            include: {
              class: {
                select: {
                  name: true,
                  grade: true,
                  _count: {
                    select: {
                      students: true,
                    },
                  },
                },
              },
            },
          },
          exams: {
            take: 10,
            orderBy: { startDate: "desc" },
            include: {
              class: {
                select: {
                  name: true,
                },
              },
            },
          },
          _count: {
            select: {
              classes: true,
              exams: true,
              grades: true,
            },
          },
        },
      });

      return subject;
    }),

  // Create new subject
  create: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1, "Name is required"),
        code: z.string().optional(),
        description: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Get school ID (assuming first school for now)
      const school = await ctx.db.school.findFirst({
        orderBy: { createdAt: "desc" },
      });

      if (!school) {
        throw new Error("School not found");
      }

      // Create subject
      const subject = await ctx.db.subject.create({
        data: {
          schoolId: school.id,
          name: input.name,
          code: input.code,
          description: input.description,
        },
        include: {
          school: {
            select: {
              name: true,
            },
          },
          _count: {
            select: {
              classes: true,
            },
          },
        },
      });

      return subject;
    }),

  // Update subject
  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string().min(1).optional(),
        code: z.string().optional().nullable(),
        description: z.string().optional().nullable(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input;

      const subject = await ctx.db.subject.update({
        where: { id },
        data,
        include: {
          school: {
            select: {
              name: true,
            },
          },
          _count: {
            select: {
              classes: true,
            },
          },
        },
      });

      return subject;
    }),

  // Delete subject
  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      // Check if subject is assigned to any classes
      const classesCount = await ctx.db.classSubject.count({
        where: { subjectId: input.id },
      });

      if (classesCount > 0) {
        throw new Error(
          `Cannot delete subject assigned to ${classesCount} classes. Please remove the subject from classes first.`
        );
      }

      await ctx.db.subject.delete({
        where: { id: input.id },
      });

      return { success: true };
    }),

  // Get subject statistics
  getStats: publicProcedure
    .input(z.object({ subjectId: z.string() }))
    .query(async ({ ctx, input }) => {
      const [classesCount, examsCount, gradesCount] = await Promise.all([
        ctx.db.classSubject.count({ where: { subjectId: input.subjectId } }),
        ctx.db.exam.count({ where: { subjectId: input.subjectId } }),
        ctx.db.grade.count({ where: { subjectId: input.subjectId } }),
      ]);

      // Get average grade
      const avgGrade = await ctx.db.grade.aggregate({
        where: { subjectId: input.subjectId },
        _avg: {
          score: true,
        },
      });

      return {
        classes: classesCount,
        exams: examsCount,
        grades: gradesCount,
        averageGrade: avgGrade._avg.score ?? 0,
      };
    }),
});
