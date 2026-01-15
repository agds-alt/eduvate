import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";

export const examRouter = createTRPCRouter({
  // Get all exams with filters
  getAll: publicProcedure
    .input(
      z.object({
        classId: z.string().optional(),
        subjectId: z.string().optional(),
        type: z.string().optional(),
        status: z.enum(["upcoming", "ongoing", "completed", "all"]).optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const now = new Date();

      // Build where clause
      const where: any = {};

      if (input.classId) {
        where.classId = input.classId;
      }

      if (input.subjectId) {
        where.subjectId = input.subjectId;
      }

      if (input.type) {
        where.type = input.type;
      }

      // Filter by status
      if (input.status === "upcoming") {
        where.startDate = { gt: now };
      } else if (input.status === "ongoing") {
        where.AND = [
          { startDate: { lte: now } },
          { endDate: { gte: now } }
        ];
      } else if (input.status === "completed") {
        where.endDate = { lt: now };
      }

      const exams = await ctx.db.exam.findMany({
        where,
        include: {
          subject: {
            select: {
              name: true,
              code: true,
            },
          },
          class: {
            select: {
              name: true,
              grade: true,
              section: true,
            },
          },
          teacher: {
            include: {
              user: {
                select: {
                  name: true,
                },
              },
            },
          },
          results: {
            select: {
              id: true,
              score: true,
            },
          },
        },
        orderBy: {
          startDate: "desc",
        },
      });

      return exams;
    }),

  // Get exam statistics
  getStats: publicProcedure.query(async ({ ctx }) => {
    const now = new Date();

    const [totalExams, ongoingExams, completedExams, upcomingExams] =
      await Promise.all([
        ctx.db.exam.count(),
        ctx.db.exam.count({
          where: {
            AND: [{ startDate: { lte: now } }, { endDate: { gte: now } }],
          },
        }),
        ctx.db.exam.count({
          where: {
            endDate: { lt: now },
          },
        }),
        ctx.db.exam.count({
          where: {
            startDate: { gt: now },
          },
        }),
      ]);

    return {
      totalExams,
      ongoingExams,
      completedExams,
      upcomingExams,
    };
  }),

  // Get exam by ID
  getById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      return ctx.db.exam.findUnique({
        where: { id: input.id },
        include: {
          subject: true,
          class: true,
          teacher: {
            include: {
              user: true,
            },
          },
          results: {
            include: {
              student: {
                include: {
                  user: {
                    select: {
                      name: true,
                    },
                  },
                },
              },
            },
          },
        },
      });
    }),

  // Create new exam
  create: publicProcedure
    .input(
      z.object({
        title: z.string().min(3, "Title must be at least 3 characters"),
        description: z.string().optional(),
        type: z.string(),
        subjectId: z.string(),
        classId: z.string(),
        teacherId: z.string(),
        startDate: z.date(),
        endDate: z.date(),
        duration: z.number().int().positive().optional(),
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

      // Validate dates
      if (input.endDate <= input.startDate) {
        throw new Error("End date must be after start date");
      }

      const exam = await ctx.db.exam.create({
        data: {
          schoolId: school.id,
          title: input.title,
          description: input.description,
          type: input.type,
          subjectId: input.subjectId,
          classId: input.classId,
          teacherId: input.teacherId,
          startDate: input.startDate,
          endDate: input.endDate,
          duration: input.duration,
        },
        include: {
          subject: true,
          class: true,
          teacher: {
            include: {
              user: true,
            },
          },
        },
      });

      return exam;
    }),

  // Update exam
  update: publicProcedure
    .input(
      z.object({
        id: z.string(),
        title: z.string().min(3).optional(),
        description: z.string().optional(),
        type: z.string().optional(),
        subjectId: z.string().optional(),
        classId: z.string().optional(),
        teacherId: z.string().optional(),
        startDate: z.date().optional(),
        endDate: z.date().optional(),
        duration: z.number().int().positive().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input;

      // Validate dates if both provided
      if (data.startDate && data.endDate && data.endDate <= data.startDate) {
        throw new Error("End date must be after start date");
      }

      const exam = await ctx.db.exam.update({
        where: { id },
        data,
        include: {
          subject: true,
          class: true,
          teacher: {
            include: {
              user: true,
            },
          },
        },
      });

      return exam;
    }),

  // Delete exam
  delete: publicProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db.exam.delete({
        where: { id: input.id },
      });

      return { success: true };
    }),

  // Get exam types
  getTypes: publicProcedure.query(async ({ ctx }) => {
    const exams = await ctx.db.exam.findMany({
      select: {
        type: true,
      },
      distinct: ["type"],
    });

    return exams.map((e) => e.type);
  }),
});
