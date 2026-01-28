import { z } from "zod";
import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "~/server/api/trpc";
import { BehaviorType } from "@prisma/client";

export const behaviorRecordRouter = createTRPCRouter({
  // Create a new behavior record
  create: protectedProcedure
    .input(
      z.object({
        studentId: z.string(),
        categoryId: z.string(),
        date: z.date(),
        description: z.string().min(1, "Keterangan tidak boleh kosong"),
        notes: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const school = await ctx.db.school.findFirst();

      if (!school) {
        throw new Error("Sekolah tidak ditemukan");
      }

      // Get category to copy points
      const category = await ctx.db.behaviorCategory.findUnique({
        where: { id: input.categoryId },
      });

      if (!category) {
        throw new Error("Kategori tidak ditemukan");
      }

      if (!category.isActive) {
        throw new Error("Kategori ini sudah tidak aktif");
      }

      const record = await ctx.db.behaviorRecord.create({
        data: {
          schoolId: school.id,
          studentId: input.studentId,
          categoryId: input.categoryId,
          date: input.date,
          description: input.description,
          points: category.points, // Copy points from category
          recordedBy: ctx.session.user.id,
          notes: input.notes,
        },
        include: {
          student: {
            include: {
              user: {
                select: {
                  name: true,
                },
              },
              currentClass: {
                select: {
                  name: true,
                },
              },
            },
          },
          category: {
            select: {
              name: true,
              type: true,
              points: true,
            },
          },
        },
      });

      return {
        success: true,
        message: `Catatan sikap untuk ${record.student.user.name} berhasil dibuat`,
        data: record,
      };
    }),

  // Get all behavior records with filters
  getAll: publicProcedure
    .input(
      z.object({
        page: z.number().default(1),
        limit: z.number().default(10),
        studentId: z.string().optional(),
        type: z.nativeEnum(BehaviorType).optional(),
        startDate: z.date().optional(),
        endDate: z.date().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const school = await ctx.db.school.findFirst();

      if (!school) {
        return { records: [], total: 0, page: 1, limit: 10 };
      }

      const where = {
        schoolId: school.id,
        ...(input.studentId && { studentId: input.studentId }),
        ...(input.type && {
          category: {
            type: input.type,
          },
        }),
        ...(input.startDate &&
          input.endDate && {
            date: {
              gte: input.startDate,
              lte: input.endDate,
            },
          }),
      };

      const [records, total] = await Promise.all([
        ctx.db.behaviorRecord.findMany({
          where,
          include: {
            student: {
              include: {
                user: {
                  select: {
                    name: true,
                    image: true,
                  },
                },
                currentClass: {
                  select: {
                    name: true,
                  },
                },
              },
            },
            category: {
              select: {
                name: true,
                type: true,
                points: true,
              },
            },
          },
          orderBy: { date: "desc" },
          skip: (input.page - 1) * input.limit,
          take: input.limit,
        }),
        ctx.db.behaviorRecord.count({ where }),
      ]);

      return {
        records,
        total,
        page: input.page,
        limit: input.limit,
      };
    }),

  // Get single behavior record
  getById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const record = await ctx.db.behaviorRecord.findUnique({
        where: { id: input.id },
        include: {
          student: {
            include: {
              user: {
                select: {
                  name: true,
                  email: true,
                  image: true,
                },
              },
              currentClass: {
                select: {
                  name: true,
                  grade: true,
                },
              },
            },
          },
          category: {
            select: {
              name: true,
              type: true,
              points: true,
              description: true,
            },
          },
        },
      });

      if (!record) {
        throw new Error("Catatan sikap tidak ditemukan");
      }

      return record;
    }),

  // Get student behavior summary
  getStudentSummary: publicProcedure
    .input(
      z.object({
        studentId: z.string(),
        startDate: z.date().optional(),
        endDate: z.date().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const where = {
        studentId: input.studentId,
        ...(input.startDate &&
          input.endDate && {
            date: {
              gte: input.startDate,
              lte: input.endDate,
            },
          }),
      };

      const [records, totalPoints, positiveCount, negativeCount] = await Promise.all([
        ctx.db.behaviorRecord.findMany({
          where,
          include: {
            category: {
              select: {
                name: true,
                type: true,
                points: true,
              },
            },
          },
          orderBy: { date: "desc" },
        }),
        ctx.db.behaviorRecord.aggregate({
          where,
          _sum: {
            points: true,
          },
        }),
        ctx.db.behaviorRecord.count({
          where: {
            ...where,
            category: {
              type: BehaviorType.POSITIVE,
            },
          },
        }),
        ctx.db.behaviorRecord.count({
          where: {
            ...where,
            category: {
              type: BehaviorType.NEGATIVE,
            },
          },
        }),
      ]);

      return {
        records,
        totalPoints: totalPoints._sum.points || 0,
        positiveCount,
        negativeCount,
        totalRecords: records.length,
      };
    }),

  // Update behavior record
  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        date: z.date().optional(),
        description: z.string().optional(),
        notes: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input;

      const record = await ctx.db.behaviorRecord.findUnique({
        where: { id },
      });

      if (!record) {
        throw new Error("Catatan sikap tidak ditemukan");
      }

      const updated = await ctx.db.behaviorRecord.update({
        where: { id },
        data,
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
          category: {
            select: {
              name: true,
            },
          },
        },
      });

      return {
        success: true,
        message: "Catatan sikap berhasil diperbarui",
        data: updated,
      };
    }),

  // Delete behavior record
  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const record = await ctx.db.behaviorRecord.findUnique({
        where: { id: input.id },
      });

      if (!record) {
        throw new Error("Catatan sikap tidak ditemukan");
      }

      await ctx.db.behaviorRecord.delete({
        where: { id: input.id },
      });

      return {
        success: true,
        message: "Catatan sikap berhasil dihapus",
      };
    }),

  // Get statistics
  getStats: publicProcedure
    .input(
      z.object({
        startDate: z.date().optional(),
        endDate: z.date().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const school = await ctx.db.school.findFirst();

      if (!school) {
        return {
          total: 0,
          positive: 0,
          negative: 0,
          totalPoints: 0,
        };
      }

      const where = {
        schoolId: school.id,
        ...(input.startDate &&
          input.endDate && {
            date: {
              gte: input.startDate,
              lte: input.endDate,
            },
          }),
      };

      const [total, positive, negative, pointsSum] = await Promise.all([
        ctx.db.behaviorRecord.count({ where }),
        ctx.db.behaviorRecord.count({
          where: {
            ...where,
            category: {
              type: BehaviorType.POSITIVE,
            },
          },
        }),
        ctx.db.behaviorRecord.count({
          where: {
            ...where,
            category: {
              type: BehaviorType.NEGATIVE,
            },
          },
        }),
        ctx.db.behaviorRecord.aggregate({
          where,
          _sum: {
            points: true,
          },
        }),
      ]);

      return {
        total,
        positive,
        negative,
        totalPoints: pointsSum._sum.points || 0,
      };
    }),
});
