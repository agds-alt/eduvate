import { z } from "zod";
import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "~/server/api/trpc";

export const teachingJournalRouter = createTRPCRouter({
  // Create a new teaching journal entry
  create: protectedProcedure
    .input(
      z.object({
        teacherId: z.string(),
        classId: z.string(),
        subjectId: z.string(),
        date: z.date(),
        startTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
        endTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
        topic: z.string().min(1, "Topik tidak boleh kosong"),
        material: z.string().min(1, "Materi tidak boleh kosong"),
        method: z.string().optional(),
        objectives: z.string().min(1, "Tujuan pembelajaran tidak boleh kosong"),
        activities: z.string().min(1, "Kegiatan pembelajaran tidak boleh kosong"),
        assessment: z.string().optional(),
        homework: z.string().optional(),
        notes: z.string().optional(),
        obstacles: z.string().optional(),
        totalStudents: z.number().default(0),
        presentStudents: z.number().default(0),
        absentStudents: z.number().default(0),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const school = await ctx.db.school.findFirst();

      if (!school) {
        throw new Error("Sekolah tidak ditemukan");
      }

      // Validate time
      if (input.endTime <= input.startTime) {
        throw new Error("Waktu selesai harus lebih besar dari waktu mulai");
      }

      // Check if journal already exists for this time slot
      const existing = await ctx.db.teachingJournal.findFirst({
        where: {
          teacherId: input.teacherId,
          classId: input.classId,
          subjectId: input.subjectId,
          date: input.date,
          startTime: input.startTime,
        },
      });

      if (existing) {
        throw new Error("Jurnal mengajar untuk jadwal ini sudah ada");
      }

      const journal = await ctx.db.teachingJournal.create({
        data: {
          schoolId: school.id,
          teacherId: input.teacherId,
          classId: input.classId,
          subjectId: input.subjectId,
          date: input.date,
          startTime: input.startTime,
          endTime: input.endTime,
          topic: input.topic,
          material: input.material,
          method: input.method,
          objectives: input.objectives,
          activities: input.activities,
          assessment: input.assessment,
          homework: input.homework,
          notes: input.notes,
          obstacles: input.obstacles,
          totalStudents: input.totalStudents,
          presentStudents: input.presentStudents,
          absentStudents: input.absentStudents,
        },
        include: {
          teacher: {
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
              section: true,
            },
          },
          subject: {
            select: {
              name: true,
              code: true,
            },
          },
        },
      });

      return {
        success: true,
        message: "Jurnal mengajar berhasil dibuat",
        data: journal,
      };
    }),

  // Get all teaching journals with filters
  getAll: publicProcedure
    .input(
      z.object({
        page: z.number().default(1),
        limit: z.number().default(10),
        teacherId: z.string().optional(),
        classId: z.string().optional(),
        subjectId: z.string().optional(),
        startDate: z.date().optional(),
        endDate: z.date().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const school = await ctx.db.school.findFirst();

      if (!school) {
        return { journals: [], total: 0, page: 1, limit: 10 };
      }

      const where = {
        schoolId: school.id,
        ...(input.teacherId && { teacherId: input.teacherId }),
        ...(input.classId && { classId: input.classId }),
        ...(input.subjectId && { subjectId: input.subjectId }),
        ...(input.startDate &&
          input.endDate && {
            date: {
              gte: input.startDate,
              lte: input.endDate,
            },
          }),
      };

      const [journals, total] = await Promise.all([
        ctx.db.teachingJournal.findMany({
          where,
          include: {
            teacher: {
              include: {
                user: {
                  select: {
                    name: true,
                    email: true,
                  },
                },
              },
            },
            class: {
              select: {
                name: true,
                grade: true,
                section: true,
              },
            },
            subject: {
              select: {
                name: true,
                code: true,
              },
            },
          },
          orderBy: [{ date: "desc" }, { startTime: "desc" }],
          skip: (input.page - 1) * input.limit,
          take: input.limit,
        }),
        ctx.db.teachingJournal.count({ where }),
      ]);

      return {
        journals,
        total,
        page: input.page,
        limit: input.limit,
      };
    }),

  // Get single teaching journal
  getById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const journal = await ctx.db.teachingJournal.findUnique({
        where: { id: input.id },
        include: {
          teacher: {
            include: {
              user: {
                select: {
                  name: true,
                  email: true,
                  phone: true,
                },
              },
            },
          },
          class: {
            select: {
              name: true,
              grade: true,
              section: true,
            },
          },
          subject: {
            select: {
              name: true,
              code: true,
              description: true,
            },
          },
        },
      });

      if (!journal) {
        throw new Error("Jurnal mengajar tidak ditemukan");
      }

      return journal;
    }),

  // Update teaching journal
  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        date: z.date().optional(),
        startTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).optional(),
        endTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).optional(),
        topic: z.string().optional(),
        material: z.string().optional(),
        method: z.string().optional(),
        objectives: z.string().optional(),
        activities: z.string().optional(),
        assessment: z.string().optional(),
        homework: z.string().optional(),
        notes: z.string().optional(),
        obstacles: z.string().optional(),
        totalStudents: z.number().optional(),
        presentStudents: z.number().optional(),
        absentStudents: z.number().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input;

      const journal = await ctx.db.teachingJournal.findUnique({
        where: { id },
      });

      if (!journal) {
        throw new Error("Jurnal mengajar tidak ditemukan");
      }

      // Validate time if provided
      if (data.startTime && data.endTime && data.endTime <= data.startTime) {
        throw new Error("Waktu selesai harus lebih besar dari waktu mulai");
      }

      const updated = await ctx.db.teachingJournal.update({
        where: { id },
        data,
        include: {
          teacher: {
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
          subject: {
            select: {
              name: true,
            },
          },
        },
      });

      return {
        success: true,
        message: "Jurnal mengajar berhasil diperbarui",
        data: updated,
      };
    }),

  // Delete teaching journal
  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const journal = await ctx.db.teachingJournal.findUnique({
        where: { id: input.id },
      });

      if (!journal) {
        throw new Error("Jurnal mengajar tidak ditemukan");
      }

      await ctx.db.teachingJournal.delete({
        where: { id: input.id },
      });

      return {
        success: true,
        message: "Jurnal mengajar berhasil dihapus",
      };
    }),

  // Get statistics
  getStats: publicProcedure
    .input(
      z.object({
        teacherId: z.string().optional(),
        startDate: z.date().optional(),
        endDate: z.date().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const school = await ctx.db.school.findFirst();

      if (!school) {
        return {
          total: 0,
          totalHours: 0,
          classesCount: 0,
          subjectsCount: 0,
        };
      }

      const where = {
        schoolId: school.id,
        ...(input.teacherId && { teacherId: input.teacherId }),
        ...(input.startDate &&
          input.endDate && {
            date: {
              gte: input.startDate,
              lte: input.endDate,
            },
          }),
      };

      const [total, journals] = await Promise.all([
        ctx.db.teachingJournal.count({ where }),
        ctx.db.teachingJournal.findMany({
          where,
          select: {
            startTime: true,
            endTime: true,
            classId: true,
            subjectId: true,
          },
        }),
      ]);

      // Calculate total hours
      const totalHours = journals.reduce((acc, journal) => {
        const [startHour, startMin] = journal.startTime.split(":").map(Number);
        const [endHour, endMin] = journal.endTime.split(":").map(Number);
        const hours = (endHour! * 60 + endMin!) - (startHour! * 60 + startMin!);
        return acc + hours / 60;
      }, 0);

      // Count unique classes and subjects
      const uniqueClasses = new Set(journals.map((j) => j.classId));
      const uniqueSubjects = new Set(journals.map((j) => j.subjectId));

      return {
        total,
        totalHours: Math.round(totalHours * 10) / 10,
        classesCount: uniqueClasses.size,
        subjectsCount: uniqueSubjects.size,
      };
    }),
});
