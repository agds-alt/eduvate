import { z } from "zod";
import { createTRPCRouter, publicProcedure, protectedProcedure } from "~/server/api/trpc";
import { TeacherAttendanceStatus, RequestStatus } from "@prisma/client";
import { startOfDay, endOfDay, differenceInMinutes, format, parse, addDays, subDays } from "date-fns";

export const teacherAttendanceRouter = createTRPCRouter({
  // Check-in guru
  checkIn: protectedProcedure
    .input(
      z.object({
        teacherId: z.string(),
        notes: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const now = new Date();
      const today = startOfDay(now);

      // Get school settings
      const teacher = await ctx.db.teacher.findUnique({
        where: { id: input.teacherId },
        include: { school: true },
      });

      if (!teacher) {
        throw new Error("Guru tidak ditemukan");
      }

      const school = teacher.school;

      // Check if already checked in today
      const existingAttendance = await ctx.db.teacherAttendance.findUnique({
        where: {
          teacherId_date: {
            teacherId: input.teacherId,
            date: today,
          },
        },
      });

      if (existingAttendance?.checkInTime) {
        throw new Error("Anda sudah check-in hari ini");
      }

      // Parse expected check-in time
      const expectedCheckInTime = parse(
        school.teacherCheckInTime,
        "HH:mm",
        today
      );

      // Calculate late status
      const diffMinutes = differenceInMinutes(now, expectedCheckInTime);
      const isLate = diffMinutes > school.gracePeriodMinutes;
      const lateMinutes = Math.max(0, diffMinutes);

      // Determine status
      const status = isLate
        ? TeacherAttendanceStatus.LATE
        : TeacherAttendanceStatus.PRESENT;

      // Create or update attendance
      const attendance = await ctx.db.teacherAttendance.upsert({
        where: {
          teacherId_date: {
            teacherId: input.teacherId,
            date: today,
          },
        },
        create: {
          schoolId: school.id,
          teacherId: input.teacherId,
          date: today,
          checkInTime: now,
          expectedCheckInTime: school.teacherCheckInTime,
          expectedCheckOutTime: school.teacherCheckOutTime,
          status,
          isLate,
          lateMinutes,
          notes: input.notes,
        },
        update: {
          checkInTime: now,
          status,
          isLate,
          lateMinutes,
          notes: input.notes,
        },
      });

      return {
        success: true,
        message: isLate
          ? `Check-in berhasil (Terlambat ${lateMinutes} menit)`
          : "Check-in berhasil",
        attendance,
        isLate,
        lateMinutes,
        expectedCheckOut: school.teacherCheckOutTime,
      };
    }),

  // Check-out guru
  checkOut: protectedProcedure
    .input(
      z.object({
        teacherId: z.string(),
        notes: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const now = new Date();
      const today = startOfDay(now);

      // Get attendance record
      const attendance = await ctx.db.teacherAttendance.findUnique({
        where: {
          teacherId_date: {
            teacherId: input.teacherId,
            date: today,
          },
        },
        include: {
          teacher: {
            include: { school: true },
          },
        },
      });

      if (!attendance) {
        throw new Error("Anda belum check-in hari ini");
      }

      if (attendance.checkOutTime) {
        throw new Error("Anda sudah check-out hari ini");
      }

      const school = attendance.teacher.school;

      // Parse expected check-out time
      const expectedCheckOutTime = parse(
        school.teacherCheckOutTime,
        "HH:mm",
        today
      );

      // Calculate early departure
      const diffMinutes = differenceInMinutes(expectedCheckOutTime, now);
      const isEarlyDeparture = diffMinutes > school.earlyDepartureThreshold;
      const earlyMinutes = Math.max(0, diffMinutes);

      // Update attendance
      const updated = await ctx.db.teacherAttendance.update({
        where: { id: attendance.id },
        data: {
          checkOutTime: now,
          isEarlyDeparture,
          earlyMinutes,
          notes: input.notes || attendance.notes,
        },
      });

      return {
        success: true,
        message: isEarlyDeparture
          ? `Check-out berhasil (Pulang ${earlyMinutes} menit lebih awal)`
          : "Check-out berhasil",
        attendance: updated,
        isEarlyDeparture,
        earlyMinutes,
      };
    }),

  // Get today's attendance for a teacher
  getTodayAttendance: publicProcedure
    .input(z.object({ teacherId: z.string() }))
    .query(async ({ ctx, input }) => {
      const today = startOfDay(new Date());

      const attendance = await ctx.db.teacherAttendance.findUnique({
        where: {
          teacherId_date: {
            teacherId: input.teacherId,
            date: today,
          },
        },
        include: {
          teacher: {
            include: {
              user: {
                select: {
                  name: true,
                  image: true,
                },
              },
              school: true,
            },
          },
          earlyDepartureRequest: true,
        },
      });

      return attendance;
    }),

  // Get all attendance with filters (for admin)
  getAll: publicProcedure
    .input(
      z.object({
        page: z.number().min(1).default(1),
        limit: z.number().min(1).max(100).default(10),
        teacherId: z.string().optional(),
        status: z.nativeEnum(TeacherAttendanceStatus).optional(),
        dateFrom: z.date().optional(),
        dateTo: z.date().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const { page, limit, teacherId, status, dateFrom, dateTo } = input;
      const skip = (page - 1) * limit;

      // Build where clause
      const where: any = {};

      if (teacherId) {
        where.teacherId = teacherId;
      }

      if (status) {
        where.status = status;
      }

      if (dateFrom || dateTo) {
        where.date = {};
        if (dateFrom) {
          where.date.gte = startOfDay(dateFrom);
        }
        if (dateTo) {
          where.date.lte = endOfDay(dateTo);
        }
      }

      // Get total count
      const total = await ctx.db.teacherAttendance.count({ where });

      // Get attendance records
      const attendances = await ctx.db.teacherAttendance.findMany({
        where,
        skip,
        take: limit,
        include: {
          teacher: {
            include: {
              user: {
                select: {
                  name: true,
                  email: true,
                  phone: true,
                  image: true,
                },
              },
            },
          },
          earlyDepartureRequest: true,
        },
        orderBy: { date: "desc" },
      });

      return {
        attendances,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      };
    }),

  // Get attendance stats
  getStats: publicProcedure
    .input(
      z.object({
        teacherId: z.string().optional(),
        dateFrom: z.date().optional(),
        dateTo: z.date().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const { teacherId, dateFrom, dateTo } = input;

      const where: any = {};

      if (teacherId) {
        where.teacherId = teacherId;
      }

      if (dateFrom || dateTo) {
        where.date = {};
        if (dateFrom) {
          where.date.gte = startOfDay(dateFrom);
        }
        if (dateTo) {
          where.date.lte = endOfDay(dateTo);
        }
      }

      const [total, present, late, absent, sick, leave] = await Promise.all([
        ctx.db.teacherAttendance.count({ where }),
        ctx.db.teacherAttendance.count({
          where: { ...where, status: TeacherAttendanceStatus.PRESENT },
        }),
        ctx.db.teacherAttendance.count({
          where: { ...where, status: TeacherAttendanceStatus.LATE },
        }),
        ctx.db.teacherAttendance.count({
          where: { ...where, status: TeacherAttendanceStatus.ABSENT },
        }),
        ctx.db.teacherAttendance.count({
          where: { ...where, status: TeacherAttendanceStatus.SICK },
        }),
        ctx.db.teacherAttendance.count({
          where: { ...where, status: TeacherAttendanceStatus.LEAVE },
        }),
      ]);

      // Calculate attendance rate
      const attendanceRate =
        total > 0 ? Math.round(((present + late) / total) * 100) : 0;

      // Calculate punctuality rate
      const punctualityRate =
        total > 0 ? Math.round((present / (present + late)) * 100) : 0;

      return {
        total,
        present,
        late,
        absent,
        sick,
        leave,
        attendanceRate,
        punctualityRate,
      };
    }),

  // Manual override (for admin)
  manualOverride: protectedProcedure
    .input(
      z.object({
        attendanceId: z.string(),
        status: z.nativeEnum(TeacherAttendanceStatus),
        reason: z.string().min(3, "Alasan minimal 3 karakter"),
        overrideBy: z.string(), // User ID admin
      })
    )
    .mutation(async ({ ctx, input }) => {
      const attendance = await ctx.db.teacherAttendance.update({
        where: { id: input.attendanceId },
        data: {
          status: input.status,
          isManualOverride: true,
          manualReason: input.reason,
          overrideBy: input.overrideBy,
          overrideAt: new Date(),
        },
      });

      return {
        success: true,
        message: "Status berhasil diubah",
        attendance,
      };
    }),

  // Request early departure
  requestEarlyDeparture: protectedProcedure
    .input(
      z.object({
        teacherId: z.string(),
        plannedCheckOutTime: z.date(),
        reason: z.string().min(5, "Alasan minimal 5 karakter"),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const today = startOfDay(new Date());

      // Get attendance record
      const attendance = await ctx.db.teacherAttendance.findUnique({
        where: {
          teacherId_date: {
            teacherId: input.teacherId,
            date: today,
          },
        },
        include: { school: true },
      });

      if (!attendance) {
        throw new Error("Anda belum check-in hari ini");
      }

      if (attendance.checkOutTime) {
        throw new Error("Anda sudah check-out");
      }

      // Check if already has pending request
      const existingRequest = await ctx.db.earlyDepartureRequest.findFirst({
        where: {
          attendanceId: attendance.id,
          status: RequestStatus.PENDING,
        },
      });

      if (existingRequest) {
        throw new Error("Anda sudah mengajukan izin pulang awal");
      }

      // Create request
      const request = await ctx.db.earlyDepartureRequest.create({
        data: {
          schoolId: attendance.schoolId,
          attendanceId: attendance.id,
          plannedCheckOutTime: input.plannedCheckOutTime,
          reason: input.reason,
        },
      });

      return {
        success: true,
        message: "Permintaan izin pulang awal berhasil dikirim",
        request,
      };
    }),

  // Get early departure requests (for admin)
  getEarlyDepartureRequests: publicProcedure
    .input(
      z.object({
        status: z.nativeEnum(RequestStatus).optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const requests = await ctx.db.earlyDepartureRequest.findMany({
        where: input.status ? { status: input.status } : {},
        include: {
          attendance: {
            include: {
              teacher: {
                include: {
                  user: {
                    select: {
                      name: true,
                      email: true,
                      phone: true,
                      image: true,
                    },
                  },
                },
              },
            },
          },
        },
        orderBy: { createdAt: "desc" },
      });

      return requests;
    }),

  // Approve/Reject early departure request
  approveEarlyDeparture: protectedProcedure
    .input(
      z.object({
        requestId: z.string(),
        approved: z.boolean(),
        approvedBy: z.string(), // User ID kepala sekolah
        rejectionReason: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const request = await ctx.db.earlyDepartureRequest.findUnique({
        where: { id: input.requestId },
        include: { attendance: true },
      });

      if (!request) {
        throw new Error("Permintaan tidak ditemukan");
      }

      if (request.status !== RequestStatus.PENDING) {
        throw new Error("Permintaan sudah diproses");
      }

      // Update request status
      const updatedRequest = await ctx.db.earlyDepartureRequest.update({
        where: { id: input.requestId },
        data: {
          status: input.approved ? RequestStatus.APPROVED : RequestStatus.REJECTED,
          approvedBy: input.approvedBy,
          approvedAt: new Date(),
          rejectionReason: input.rejectionReason,
        },
      });

      // If approved, update attendance as excused
      if (input.approved) {
        await ctx.db.teacherAttendance.update({
          where: { id: request.attendanceId },
          data: {
            status: TeacherAttendanceStatus.EXCUSED,
          },
        });
      }

      return {
        success: true,
        message: input.approved
          ? "Permintaan disetujui"
          : "Permintaan ditolak",
        request: updatedRequest,
      };
    }),

  // Get monthly report for a teacher
  getMonthlyReport: publicProcedure
    .input(
      z.object({
        teacherId: z.string(),
        month: z.number().min(1).max(12),
        year: z.number().min(2000).max(2100),
      })
    )
    .query(async ({ ctx, input }) => {
      const { teacherId, month, year } = input;

      // Get all attendance for the month
      const startDate = new Date(year, month - 1, 1);
      const endDate = new Date(year, month, 0);

      const attendances = await ctx.db.teacherAttendance.findMany({
        where: {
          teacherId,
          date: {
            gte: startOfDay(startDate),
            lte: endOfDay(endDate),
          },
        },
        orderBy: { date: "asc" },
      });

      // Calculate statistics
      const total = attendances.length;
      const present = attendances.filter(
        (a) => a.status === TeacherAttendanceStatus.PRESENT
      ).length;
      const late = attendances.filter(
        (a) => a.status === TeacherAttendanceStatus.LATE
      ).length;
      const absent = attendances.filter(
        (a) => a.status === TeacherAttendanceStatus.ABSENT
      ).length;
      const sick = attendances.filter(
        (a) => a.status === TeacherAttendanceStatus.SICK
      ).length;
      const leave = attendances.filter(
        (a) => a.status === TeacherAttendanceStatus.LEAVE
      ).length;
      const excused = attendances.filter(
        (a) => a.status === TeacherAttendanceStatus.EXCUSED
      ).length;

      const totalLateMinutes = attendances.reduce(
        (sum, a) => sum + a.lateMinutes,
        0
      );
      const totalEarlyDepartures = attendances.filter(
        (a) => a.isEarlyDeparture && !a.isManualOverride
      ).length;

      const attendanceRate =
        total > 0 ? Math.round(((present + late) / total) * 100) : 0;
      const punctualityRate =
        present + late > 0 ? Math.round((present / (present + late)) * 100) : 0;

      return {
        teacherId,
        month,
        year,
        summary: {
          total,
          present,
          late,
          absent,
          sick,
          leave,
          excused,
          totalLateMinutes,
          totalEarlyDepartures,
          attendanceRate,
          punctualityRate,
        },
        dailyDetails: attendances.map((a) => ({
          date: a.date,
          status: a.status,
          checkInTime: a.checkInTime,
          checkOutTime: a.checkOutTime,
          isLate: a.isLate,
          lateMinutes: a.lateMinutes,
          isEarlyDeparture: a.isEarlyDeparture,
          earlyMinutes: a.earlyMinutes,
          notes: a.notes,
        })),
      };
    }),
});
