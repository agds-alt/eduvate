import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";

export const examResultRouter = createTRPCRouter({
  // Get all exam results with filters
  getAll: publicProcedure
    .input(
      z.object({
        examId: z.string().optional(),
        studentId: z.string().optional(),
        classId: z.string().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const where: any = {};

      if (input.examId) {
        where.examId = input.examId;
      }

      if (input.studentId) {
        where.studentId = input.studentId;
      }

      if (input.classId) {
        where.exam = {
          classId: input.classId,
        };
      }

      const results = await ctx.db.examResult.findMany({
        where,
        include: {
          exam: {
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
                },
              },
            },
          },
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
        orderBy: {
          createdAt: "desc",
        },
      });

      return results;
    }),

  // Get exam results by exam ID with statistics
  getByExam: publicProcedure
    .input(z.object({ examId: z.string() }))
    .query(async ({ ctx, input }) => {
      const results = await ctx.db.examResult.findMany({
        where: { examId: input.examId },
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
        orderBy: {
          score: "desc",
        },
      });

      // Calculate statistics
      const scores = results.map((r) => r.score);
      const avgScore =
        scores.length > 0
          ? scores.reduce((a, b) => a + b, 0) / scores.length
          : 0;
      const maxScore = scores.length > 0 ? Math.max(...scores) : 0;
      const minScore = scores.length > 0 ? Math.min(...scores) : 0;

      // Count grade distribution
      const gradeDistribution = results.reduce((acc, r) => {
        const grade = r.grade || "N/A";
        acc[grade] = (acc[grade] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      return {
        results,
        stats: {
          totalStudents: results.length,
          avgScore: Math.round(avgScore * 100) / 100,
          maxScore,
          minScore,
          gradeDistribution,
        },
      };
    }),

  // Get exam results by student ID
  getByStudent: publicProcedure
    .input(z.object({ studentId: z.string() }))
    .query(async ({ ctx, input }) => {
      const results = await ctx.db.examResult.findMany({
        where: { studentId: input.studentId },
        include: {
          exam: {
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
                },
              },
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      });

      // Calculate student statistics
      const scores = results.map((r) => r.score);
      const avgScore =
        scores.length > 0
          ? scores.reduce((a, b) => a + b, 0) / scores.length
          : 0;

      return {
        results,
        stats: {
          totalExams: results.length,
          avgScore: Math.round(avgScore * 100) / 100,
        },
      };
    }),

  // Get exam result by ID
  getById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      return ctx.db.examResult.findUnique({
        where: { id: input.id },
        include: {
          exam: {
            include: {
              subject: true,
              class: true,
              teacher: {
                include: {
                  user: true,
                },
              },
            },
          },
          student: {
            include: {
              user: true,
            },
          },
        },
      });
    }),

  // Create exam result
  create: publicProcedure
    .input(
      z.object({
        examId: z.string(),
        studentId: z.string(),
        score: z.number().min(0).max(100),
        grade: z.string().optional(),
        notes: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Check if result already exists
      const existing = await ctx.db.examResult.findUnique({
        where: {
          examId_studentId: {
            examId: input.examId,
            studentId: input.studentId,
          },
        },
      });

      if (existing) {
        throw new Error("Exam result already exists for this student");
      }

      const result = await ctx.db.examResult.create({
        data: {
          examId: input.examId,
          studentId: input.studentId,
          score: input.score,
          grade: input.grade,
          notes: input.notes,
        },
        include: {
          exam: {
            include: {
              subject: true,
            },
          },
          student: {
            include: {
              user: true,
            },
          },
        },
      });

      return result;
    }),

  // Create bulk exam results (for entire class)
  createBulk: publicProcedure
    .input(
      z.object({
        examId: z.string(),
        results: z.array(
          z.object({
            studentId: z.string(),
            score: z.number().min(0).max(100),
            grade: z.string().optional(),
            notes: z.string().optional(),
          })
        ),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Create all results in a transaction
      const results = await ctx.db.$transaction(
        input.results.map((result) =>
          ctx.db.examResult.upsert({
            where: {
              examId_studentId: {
                examId: input.examId,
                studentId: result.studentId,
              },
            },
            create: {
              examId: input.examId,
              studentId: result.studentId,
              score: result.score,
              grade: result.grade,
              notes: result.notes,
            },
            update: {
              score: result.score,
              grade: result.grade,
              notes: result.notes,
            },
          })
        )
      );

      return { count: results.length, results };
    }),

  // Update exam result
  update: publicProcedure
    .input(
      z.object({
        id: z.string(),
        score: z.number().min(0).max(100).optional(),
        grade: z.string().optional(),
        notes: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input;

      const result = await ctx.db.examResult.update({
        where: { id },
        data,
        include: {
          exam: {
            include: {
              subject: true,
            },
          },
          student: {
            include: {
              user: true,
            },
          },
        },
      });

      return result;
    }),

  // Delete exam result
  delete: publicProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db.examResult.delete({
        where: { id: input.id },
      });

      return { success: true };
    }),

  // Get exam result statistics
  getStats: publicProcedure.query(async ({ ctx }) => {
    const [totalResults, avgScore] = await Promise.all([
      ctx.db.examResult.count(),
      ctx.db.examResult.aggregate({
        _avg: {
          score: true,
        },
      }),
    ]);

    return {
      totalResults,
      avgScore: Math.round((avgScore._avg.score || 0) * 100) / 100,
    };
  }),
});
