import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { PaymentStatus } from "@prisma/client";

export const financeRouter = createTRPCRouter({
  // Get all finance records with filters
  getAll: publicProcedure
    .input(
      z.object({
        studentId: z.string().optional(),
        type: z.string().optional(),
        status: z.nativeEnum(PaymentStatus).optional(),
        startDate: z.date().optional(),
        endDate: z.date().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const where: any = {};

      if (input.studentId) {
        where.studentId = input.studentId;
      }

      if (input.type) {
        where.type = input.type;
      }

      if (input.status) {
        where.status = input.status;
      }

      if (input.startDate || input.endDate) {
        where.dueDate = {};
        if (input.startDate) {
          where.dueDate.gte = input.startDate;
        }
        if (input.endDate) {
          where.dueDate.lte = input.endDate;
        }
      }

      const records = await ctx.db.finance.findMany({
        where,
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
          dueDate: "desc",
        },
      });

      return records;
    }),

  // Get finance statistics
  getStats: publicProcedure
    .input(
      z.object({
        startDate: z.date().optional(),
        endDate: z.date().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const where: any = {};

      if (input.startDate || input.endDate) {
        where.dueDate = {};
        if (input.startDate) {
          where.dueDate.gte = input.startDate;
        }
        if (input.endDate) {
          where.dueDate.lte = input.endDate;
        }
      }

      const [totalIncome, totalPending, statusCounts] = await Promise.all([
        ctx.db.finance.aggregate({
          where: { ...where, status: "PAID" },
          _sum: {
            paidAmount: true,
          },
        }),
        ctx.db.finance.aggregate({
          where: {
            ...where,
            status: { in: ["UNPAID", "PARTIAL", "OVERDUE"] },
          },
          _sum: {
            amount: true,
            paidAmount: true,
          },
        }),
        ctx.db.finance.groupBy({
          by: ["status"],
          where,
          _count: true,
          _sum: {
            amount: true,
            paidAmount: true,
          },
        }),
      ]);

      return {
        totalIncome: totalIncome._sum.paidAmount || 0,
        totalPending:
          (totalPending._sum.amount || 0) - (totalPending._sum.paidAmount || 0),
        statusBreakdown: statusCounts,
      };
    }),

  // Get finance by ID
  getById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      return ctx.db.finance.findUnique({
        where: { id: input.id },
        include: {
          student: {
            include: {
              user: true,
            },
          },
        },
      });
    }),

  // Create finance record
  create: publicProcedure
    .input(
      z.object({
        studentId: z.string(),
        type: z.string(),
        description: z.string().optional(),
        amount: z.number().positive(),
        paidAmount: z.number().min(0).default(0),
        status: z.nativeEnum(PaymentStatus).default("UNPAID"),
        dueDate: z.date(),
        paidDate: z.date().optional(),
        notes: z.string().optional(),
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

      const finance = await ctx.db.finance.create({
        data: {
          schoolId: school.id,
          studentId: input.studentId,
          type: input.type,
          description: input.description,
          amount: input.amount,
          paidAmount: input.paidAmount,
          status: input.status,
          dueDate: input.dueDate,
          paidDate: input.paidDate,
          notes: input.notes,
        },
        include: {
          student: {
            include: {
              user: true,
            },
          },
        },
      });

      return finance;
    }),

  // Update finance record
  update: publicProcedure
    .input(
      z.object({
        id: z.string(),
        type: z.string().optional(),
        description: z.string().optional(),
        amount: z.number().positive().optional(),
        paidAmount: z.number().min(0).optional(),
        status: z.nativeEnum(PaymentStatus).optional(),
        dueDate: z.date().optional(),
        paidDate: z.date().optional(),
        notes: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input;

      const finance = await ctx.db.finance.update({
        where: { id },
        data,
        include: {
          student: {
            include: {
              user: true,
            },
          },
        },
      });

      return finance;
    }),

  // Process payment
  processPayment: publicProcedure
    .input(
      z.object({
        id: z.string(),
        amount: z.number().positive(),
        paidDate: z.date(),
        notes: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const record = await ctx.db.finance.findUnique({
        where: { id: input.id },
      });

      if (!record) {
        throw new Error("Finance record not found");
      }

      const newPaidAmount = record.paidAmount + input.amount;
      let status: PaymentStatus = "PARTIAL";

      if (newPaidAmount >= record.amount) {
        status = "PAID";
      }

      const finance = await ctx.db.finance.update({
        where: { id: input.id },
        data: {
          paidAmount: newPaidAmount,
          status,
          paidDate: input.paidDate,
          notes: input.notes,
        },
        include: {
          student: {
            include: {
              user: true,
            },
          },
        },
      });

      return finance;
    }),

  // Delete finance record
  delete: publicProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db.finance.delete({
        where: { id: input.id },
      });

      return { success: true };
    }),

  // Get payment types
  getTypes: publicProcedure.query(async ({ ctx }) => {
    const records = await ctx.db.finance.findMany({
      select: {
        type: true,
      },
      distinct: ["type"],
    });

    return records.map((r) => r.type);
  }),
});
