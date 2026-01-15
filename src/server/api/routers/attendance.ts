import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { AttendanceStatus, AttendanceType } from "@prisma/client";

export const attendanceRouter = createTRPCRouter({
  // Get all attendance records with filters
  getAll: publicProcedure
    .input(
      z.object({
        studentId: z.string().optional(),
        classId: z.string().optional(),
        teacherId: z.string().optional(),
        status: z.nativeEnum(AttendanceStatus).optional(),
        type: z.nativeEnum(AttendanceType).optional(),
        startDate: z.date().optional(),
        endDate: z.date().optional(),
        date: z.date().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const where: any = {};

      if (input.studentId) {
        where.studentId = input.studentId;
      }

      if (input.classId) {
        where.classId = input.classId;
      }

      if (input.teacherId) {
        where.teacherId = input.teacherId;
      }

      if (input.status) {
        where.status = input.status;
      }

      if (input.type) {
        where.type = input.type;
      }

      if (input.date) {
        const startOfDay = new Date(input.date);
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date(input.date);
        endOfDay.setHours(23, 59, 59, 999);

        where.date = {
          gte: startOfDay,
          lte: endOfDay,
        };
      } else {
        if (input.startDate || input.endDate) {
          where.date = {};
          if (input.startDate) {
            where.date.gte = input.startDate;
          }
          if (input.endDate) {
            where.date.lte = input.endDate;
          }
        }
      }

      const attendance = await ctx.db.attendance.findMany({
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
          class: {
            select: {
              name: true,
              grade: true,
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
        },
        orderBy: {
          date: "desc",
        },
      });

      return attendance;
    }),

  // Get attendance statistics
  getStats: publicProcedure
    .input(
      z.object({
        startDate: z.date().optional(),
        endDate: z.date().optional(),
        classId: z.string().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const where: any = {};

      if (input.classId) {
        where.classId = input.classId;
      }

      if (input.startDate || input.endDate) {
        where.date = {};
        if (input.startDate) {
          where.date.gte = input.startDate;
        }
        if (input.endDate) {
          where.date.lte = input.endDate;
        }
      }

      const [totalRecords, statusCounts] = await Promise.all([
        ctx.db.attendance.count({ where }),
        ctx.db.attendance.groupBy({
          by: ["status"],
          where,
          _count: true,
        }),
      ]);

      const stats: Record<string, number> = {
        total: totalRecords,
        PRESENT: 0,
        ABSENT: 0,
        LATE: 0,
        EXCUSED: 0,
        SICK: 0,
      };

      statusCounts.forEach((item) => {
        stats[item.status] = item._count;
      });

      return stats;
    }),

  // Get daily attendance log
  getDailyLog: publicProcedure
    .input(
      z.object({
        date: z.date(),
        classId: z.string().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const startOfDay = new Date(input.date);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(input.date);
      endOfDay.setHours(23, 59, 59, 999);

      const where: any = {
        date: {
          gte: startOfDay,
          lte: endOfDay,
        },
      };

      if (input.classId) {
        where.classId = input.classId;
      }

      const records = await ctx.db.attendance.findMany({
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
          class: {
            select: {
              name: true,
            },
          },
        },
        orderBy: {
          checkInTime: "asc",
        },
      });

      return records;
    }),

  // Get monthly attendance log
  getMonthlyLog: publicProcedure
    .input(
      z.object({
        year: z.number(),
        month: z.number().min(1).max(12),
        classId: z.string().optional(),
        studentId: z.string().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const startDate = new Date(input.year, input.month - 1, 1);
      const endDate = new Date(input.year, input.month, 0, 23, 59, 59, 999);

      const where: any = {
        date: {
          gte: startDate,
          lte: endDate,
        },
      };

      if (input.classId) {
        where.classId = input.classId;
      }

      if (input.studentId) {
        where.studentId = input.studentId;
      }

      const records = await ctx.db.attendance.findMany({
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
          class: {
            select: {
              name: true,
            },
          },
        },
        orderBy: [{ date: "asc" }, { student: { user: { name: "asc" } } }],
      });

      return records;
    }),

  // Get attendance by ID
  getById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      return ctx.db.attendance.findUnique({
        where: { id: input.id },
        include: {
          student: {
            include: {
              user: true,
            },
          },
          class: true,
          teacher: {
            include: {
              user: true,
            },
          },
        },
      });
    }),

  // Create attendance record (manual entry)
  create: publicProcedure
    .input(
      z.object({
        studentId: z.string(),
        classId: z.string().optional(),
        teacherId: z.string().optional(),
        date: z.date(),
        status: z.nativeEnum(AttendanceStatus),
        type: z.nativeEnum(AttendanceType).default("MANUAL"),
        checkInTime: z.date().optional(),
        checkOutTime: z.date().optional(),
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

      const attendance = await ctx.db.attendance.create({
        data: {
          schoolId: school.id,
          studentId: input.studentId,
          classId: input.classId,
          teacherId: input.teacherId,
          date: input.date,
          status: input.status,
          type: input.type,
          checkInTime: input.checkInTime,
          checkOutTime: input.checkOutTime,
          notes: input.notes,
        },
        include: {
          student: {
            include: {
              user: true,
            },
          },
          class: true,
        },
      });

      return attendance;
    }),

  // Create bulk attendance (for entire class)
  createBulk: publicProcedure
    .input(
      z.object({
        classId: z.string(),
        teacherId: z.string(),
        date: z.date(),
        type: z.nativeEnum(AttendanceType).default("MANUAL"),
        records: z.array(
          z.object({
            studentId: z.string(),
            status: z.nativeEnum(AttendanceStatus),
            checkInTime: z.date().optional(),
            checkOutTime: z.date().optional(),
            notes: z.string().optional(),
          })
        ),
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

      // Create all records in a transaction
      const results = await ctx.db.$transaction(
        input.records.map((record) =>
          ctx.db.attendance.create({
            data: {
              schoolId: school.id,
              studentId: record.studentId,
              classId: input.classId,
              teacherId: input.teacherId,
              date: input.date,
              status: record.status,
              type: input.type,
              checkInTime: record.checkInTime,
              checkOutTime: record.checkOutTime,
              notes: record.notes,
            },
          })
        )
      );

      return { count: results.length, records: results };
    }),

  // Update attendance record
  update: publicProcedure
    .input(
      z.object({
        id: z.string(),
        status: z.nativeEnum(AttendanceStatus).optional(),
        checkInTime: z.date().optional(),
        checkOutTime: z.date().optional(),
        notes: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input;

      const attendance = await ctx.db.attendance.update({
        where: { id },
        data,
        include: {
          student: {
            include: {
              user: true,
            },
          },
          class: true,
        },
      });

      return attendance;
    }),

  // Delete attendance record
  delete: publicProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db.attendance.delete({
        where: { id: input.id },
      });

      return { success: true };
    }),

  // Get students for attendance taking (students in class without today's record)
  getStudentsForAttendance: publicProcedure
    .input(
      z.object({
        classId: z.string(),
        date: z.date(),
      })
    )
    .query(async ({ ctx, input }) => {
      // Get all students in class
      const students = await ctx.db.student.findMany({
        where: {
          currentClassId: input.classId,
          isAlumni: false,
        },
        include: {
          user: {
            select: {
              name: true,
            },
          },
        },
      });

      // Get existing attendance for this date
      const startOfDay = new Date(input.date);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(input.date);
      endOfDay.setHours(23, 59, 59, 999);

      const existingAttendance = await ctx.db.attendance.findMany({
        where: {
          classId: input.classId,
          date: {
            gte: startOfDay,
            lte: endOfDay,
          },
        },
        select: {
          studentId: true,
          status: true,
        },
      });

      // Map students with their attendance status
      const attendanceMap = new Map(
        existingAttendance.map((a) => [a.studentId, a.status])
      );

      return students.map((student) => ({
        ...student,
        attendanceStatus: attendanceMap.get(student.id),
        hasAttendance: attendanceMap.has(student.id),
      }));
    }),
});
