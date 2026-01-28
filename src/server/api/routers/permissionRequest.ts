import { z } from "zod";
import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "~/server/api/trpc";
import { PermissionType, RequestStatus } from "@prisma/client";

export const permissionRequestRouter = createTRPCRouter({
  // Create a new permission request
  create: protectedProcedure
    .input(
      z.object({
        studentId: z.string(),
        type: z.nativeEnum(PermissionType),
        startDate: z.date(),
        endDate: z.date(),
        reason: z.string().min(1, "Alasan tidak boleh kosong"),
        attachmentUrl: z.string().optional(),
        notes: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Get school from authenticated user
      const school = await ctx.db.school.findFirst();

      if (!school) {
        throw new Error("Sekolah tidak ditemukan");
      }

      // Validate dates
      if (input.endDate < input.startDate) {
        throw new Error("Tanggal selesai tidak boleh lebih awal dari tanggal mulai");
      }

      // Create permission request
      const permissionRequest = await ctx.db.permissionRequest.create({
        data: {
          schoolId: school.id,
          studentId: input.studentId,
          type: input.type,
          startDate: input.startDate,
          endDate: input.endDate,
          reason: input.reason,
          attachmentUrl: input.attachmentUrl,
          notes: input.notes,
          submittedBy: ctx.session.user.id,
          status: RequestStatus.PENDING,
        },
        include: {
          student: {
            include: {
              user: {
                select: {
                  name: true,
                  email: true,
                },
              },
              currentClass: {
                select: {
                  name: true,
                },
              },
            },
          },
        },
      });

      return {
        success: true,
        message: "Pengajuan izin berhasil dibuat",
        data: permissionRequest,
      };
    }),

  // Get all permission requests with filters
  getAll: publicProcedure
    .input(
      z.object({
        page: z.number().default(1),
        limit: z.number().default(10),
        status: z.nativeEnum(RequestStatus).optional(),
        studentId: z.string().optional(),
        startDate: z.date().optional(),
        endDate: z.date().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const school = await ctx.db.school.findFirst();

      if (!school) {
        return { requests: [], total: 0, page: 1, limit: 10 };
      }

      const where = {
        schoolId: school.id,
        ...(input.status && { status: input.status }),
        ...(input.studentId && { studentId: input.studentId }),
        ...(input.startDate &&
          input.endDate && {
            startDate: {
              gte: input.startDate,
              lte: input.endDate,
            },
          }),
      };

      const [requests, total] = await Promise.all([
        ctx.db.permissionRequest.findMany({
          where,
          include: {
            student: {
              include: {
                user: {
                  select: {
                    name: true,
                    email: true,
                    phone: true,
                  },
                },
                currentClass: {
                  select: {
                    name: true,
                    grade: true,
                    section: true,
                  },
                },
              },
            },
          },
          orderBy: { createdAt: "desc" },
          skip: (input.page - 1) * input.limit,
          take: input.limit,
        }),
        ctx.db.permissionRequest.count({ where }),
      ]);

      return {
        requests,
        total,
        page: input.page,
        limit: input.limit,
      };
    }),

  // Get single permission request
  getById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const request = await ctx.db.permissionRequest.findUnique({
        where: { id: input.id },
        include: {
          student: {
            include: {
              user: {
                select: {
                  name: true,
                  email: true,
                  phone: true,
                  image: true,
                },
              },
              currentClass: {
                select: {
                  name: true,
                  grade: true,
                  section: true,
                },
              },
            },
          },
        },
      });

      if (!request) {
        throw new Error("Pengajuan izin tidak ditemukan");
      }

      return request;
    }),

  // Approve permission request
  approve: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        notes: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const request = await ctx.db.permissionRequest.findUnique({
        where: { id: input.id },
      });

      if (!request) {
        throw new Error("Pengajuan izin tidak ditemukan");
      }

      if (request.status !== RequestStatus.PENDING) {
        throw new Error("Pengajuan izin sudah diproses");
      }

      const updatedRequest = await ctx.db.permissionRequest.update({
        where: { id: input.id },
        data: {
          status: RequestStatus.APPROVED,
          approvedBy: ctx.session.user.id,
          approvedAt: new Date(),
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
            },
          },
        },
      });

      return {
        success: true,
        message: `Pengajuan izin dari ${updatedRequest.student.user.name} berhasil disetujui`,
        data: updatedRequest,
      };
    }),

  // Reject permission request
  reject: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        rejectionReason: z.string().min(1, "Alasan penolakan tidak boleh kosong"),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const request = await ctx.db.permissionRequest.findUnique({
        where: { id: input.id },
      });

      if (!request) {
        throw new Error("Pengajuan izin tidak ditemukan");
      }

      if (request.status !== RequestStatus.PENDING) {
        throw new Error("Pengajuan izin sudah diproses");
      }

      const updatedRequest = await ctx.db.permissionRequest.update({
        where: { id: input.id },
        data: {
          status: RequestStatus.REJECTED,
          approvedBy: ctx.session.user.id,
          approvedAt: new Date(),
          rejectionReason: input.rejectionReason,
        },
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
      });

      return {
        success: true,
        message: `Pengajuan izin dari ${updatedRequest.student.user.name} berhasil ditolak`,
        data: updatedRequest,
      };
    }),

  // Delete permission request (only if pending)
  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const request = await ctx.db.permissionRequest.findUnique({
        where: { id: input.id },
      });

      if (!request) {
        throw new Error("Pengajuan izin tidak ditemukan");
      }

      if (request.status !== RequestStatus.PENDING) {
        throw new Error("Hanya pengajuan izin dengan status pending yang dapat dihapus");
      }

      await ctx.db.permissionRequest.delete({
        where: { id: input.id },
      });

      return {
        success: true,
        message: "Pengajuan izin berhasil dihapus",
      };
    }),

  // Get statistics
  getStats: publicProcedure.query(async ({ ctx }) => {
    const school = await ctx.db.school.findFirst();

    if (!school) {
      return {
        total: 0,
        pending: 0,
        approved: 0,
        rejected: 0,
      };
    }

    const [total, pending, approved, rejected] = await Promise.all([
      ctx.db.permissionRequest.count({
        where: { schoolId: school.id },
      }),
      ctx.db.permissionRequest.count({
        where: {
          schoolId: school.id,
          status: RequestStatus.PENDING,
        },
      }),
      ctx.db.permissionRequest.count({
        where: {
          schoolId: school.id,
          status: RequestStatus.APPROVED,
        },
      }),
      ctx.db.permissionRequest.count({
        where: {
          schoolId: school.id,
          status: RequestStatus.REJECTED,
        },
      }),
    ]);

    return {
      total,
      pending,
      approved,
      rejected,
    };
  }),
});
