import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { AttendanceStatus } from "@prisma/client";

export const dashboardRouter = createTRPCRouter({
  // Get dashboard statistics
  getStats: publicProcedure
    .input(z.object({ schoolId: z.string().optional() }).optional())
    .query(async ({ ctx }) => {
      // For now, get first school (in production, use authenticated user's school)
      const school = await ctx.db.school.findFirst();

      if (!school) {
        return {
          school: null,
          stats: {
            teachers: 0,
            students: 0,
            classes: 0,
            attendanceToday: 0,
          },
          recentActivities: [],
          attendanceRate: 0,
          unpaidBills: 0,
          upcomingAgenda: [],
        };
      }

      // Get today's date range
      const today = new Date();
      const startOfDay = new Date(today.setHours(0, 0, 0, 0));
      const endOfDay = new Date(today.setHours(23, 59, 59, 999));

      // Fetch all stats in parallel
      const [
        teachersCount,
        studentsCount,
        classesCount,
        attendanceToday,
        presentToday,
        totalStudents,
        unpaidBills,
        upcomingAgenda,
        recentInformation,
      ] = await Promise.all([
        ctx.db.teacher.count({ where: { schoolId: school.id } }),
        ctx.db.student.count({ where: { schoolId: school.id, isAlumni: false } }),
        ctx.db.class.count({ where: { schoolId: school.id } }),
        ctx.db.attendance.count({
          where: {
            schoolId: school.id,
            date: {
              gte: startOfDay,
              lt: endOfDay,
            },
          },
        }),
        ctx.db.attendance.count({
          where: {
            schoolId: school.id,
            date: {
              gte: startOfDay,
              lt: endOfDay,
            },
            status: AttendanceStatus.PRESENT,
          },
        }),
        ctx.db.student.count({ where: { schoolId: school.id } }),
        ctx.db.finance.count({
          where: {
            schoolId: school.id,
            status: "UNPAID",
          },
        }),
        ctx.db.agenda.findMany({
          where: {
            schoolId: school.id,
            startDate: {
              gte: new Date(),
            },
          },
          orderBy: { startDate: "asc" },
          take: 5,
        }),
        ctx.db.information.findMany({
          where: { schoolId: school.id },
          orderBy: { publishedAt: "desc" },
          take: 5,
        }),
      ]);

      // Calculate attendance rate
      const attendanceRate = totalStudents > 0
        ? Math.round((presentToday / totalStudents) * 100)
        : 0;

      return {
        school,
        stats: {
          teachers: teachersCount,
          students: studentsCount,
          classes: classesCount,
          attendanceToday,
        },
        attendanceRate,
        unpaidBills,
        upcomingAgenda,
        recentActivities: recentInformation.map((info) => ({
          id: info.id,
          title: info.title,
          content: info.content.substring(0, 100) + "...",
          date: info.publishedAt,
        })),
      };
    }),

  // Get recent students
  getRecentStudents: publicProcedure
    .input(z.object({ schoolId: z.string().optional(), limit: z.number().default(10) }))
    .query(async ({ ctx, input }) => {
      const school = await ctx.db.school.findFirst();

      if (!school) return [];

      const students = await ctx.db.student.findMany({
        where: { schoolId: school.id },
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
        orderBy: { createdAt: "desc" },
        take: input.limit,
      });

      return students;
    }),

  // Get attendance summary for today
  getAttendanceSummary: publicProcedure.query(async ({ ctx }) => {
    const school = await ctx.db.school.findFirst();

    if (!school) return [];

    const today = new Date();
    const startOfDay = new Date(today.setHours(0, 0, 0, 0));
    const endOfDay = new Date(today.setHours(23, 59, 59, 999));

    const attendanceByStatus = await ctx.db.attendance.groupBy({
      by: ["status"],
      where: {
        schoolId: school.id,
        date: {
          gte: startOfDay,
          lt: endOfDay,
        },
      },
      _count: {
        status: true,
      },
    });

    return attendanceByStatus.map((item) => ({
      status: item.status,
      count: item._count.status,
    }));
  }),

  // Get comprehensive dashboard data
  getComprehensiveStats: publicProcedure.query(async ({ ctx }) => {
    const school = await ctx.db.school.findFirst();

    if (!school) return null;

    const today = new Date();
    const startOfDay = new Date(today.setHours(0, 0, 0, 0));
    const endOfDay = new Date(today.setHours(23, 59, 59, 999));
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    const [
      alumniCount,
      parentsCount,
      subjectsCount,
      upcomingExams,
      recentInformation,
      upcomingHolidays,
      financeStats,
      examResults,
    ] = await Promise.all([
      ctx.db.student.count({ where: { schoolId: school.id, isAlumni: true } }),
      ctx.db.parent.count({ where: { schoolId: school.id } }),
      ctx.db.subject.count({ where: { schoolId: school.id } }),
      ctx.db.exam.findMany({
        where: {
          schoolId: school.id,
          startDate: { gte: today },
        },
        include: {
          subject: { select: { name: true } },
          class: { select: { name: true, section: true } },
        },
        orderBy: { startDate: "asc" },
        take: 5,
      }),
      ctx.db.information.findMany({
        where: { schoolId: school.id },
        orderBy: { publishedAt: "desc" },
        take: 5,
      }),
      ctx.db.holiday.findMany({
        where: {
          schoolId: school.id,
          date: { gte: today },
        },
        orderBy: { date: "asc" },
        take: 5,
      }),
      ctx.db.finance.groupBy({
        by: ["status"],
        where: { schoolId: school.id },
        _sum: { amount: true },
        _count: { id: true },
      }),
      ctx.db.examResult.aggregate({
        where: {
          exam: { schoolId: school.id },
          createdAt: { gte: startOfMonth },
        },
        _avg: { score: true },
        _count: { id: true },
      }),
    ]);

    // Calculate finance summary
    const totalAmount = financeStats.reduce((sum, stat) => sum + (stat._sum.amount || 0), 0);
    const paidAmount = financeStats
      .filter((s) => s.status === "PAID")
      .reduce((sum, stat) => sum + (stat._sum.amount || 0), 0);
    const unpaidAmount = financeStats
      .filter((s) => s.status === "UNPAID")
      .reduce((sum, stat) => sum + (stat._sum.amount || 0), 0);

    return {
      alumni: alumniCount,
      parents: parentsCount,
      subjects: subjectsCount,
      upcomingExams,
      recentInformation,
      upcomingHolidays,
      financeStats: {
        totalAmount,
        paidAmount,
        unpaidAmount,
        totalBills: financeStats.reduce((sum, stat) => sum + stat._count.id, 0),
      },
      examResults: {
        avgScore: examResults._avg.score ? Math.round(examResults._avg.score * 10) / 10 : 0,
        totalResults: examResults._count.id,
      },
    };
  }),
});
