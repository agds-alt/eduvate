import { z } from "zod";
import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "~/server/api/trpc";

export const religiousProgramRouter = createTRPCRouter({
  // Create a new religious program
  create: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1, "Nama program tidak boleh kosong"),
        description: z.string().optional(),
        type: z.enum(["DAILY", "WEEKLY", "MONTHLY", "EVENT"]),
        instructorId: z.string().optional(),
        schedule: z.string().optional(),
        location: z.string().optional(),
        targetGrades: z.array(z.string()).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const school = await ctx.db.school.findFirst();

      if (!school) {
        throw new Error("Sekolah tidak ditemukan");
      }

      const program = await ctx.db.religiousProgram.create({
        data: {
          schoolId: school.id,
          name: input.name,
          description: input.description,
          type: input.type,
          instructorId: input.instructorId,
          schedule: input.schedule,
          location: input.location,
          targetGrades: input.targetGrades || [],
          isActive: true,
        },
        include: {
          instructor: {
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
        message: "Program keagamaan berhasil dibuat",
        data: program,
      };
    }),

  // Get all religious programs
  getAll: publicProcedure
    .input(
      z.object({
        type: z.enum(["DAILY", "WEEKLY", "MONTHLY", "EVENT"]).optional(),
        isActive: z.boolean().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const school = await ctx.db.school.findFirst();

      if (!school) {
        return [];
      }

      const programs = await ctx.db.religiousProgram.findMany({
        where: {
          schoolId: school.id,
          ...(input.type && { type: input.type }),
          ...(input.isActive !== undefined && { isActive: input.isActive }),
        },
        include: {
          instructor: {
            include: {
              user: {
                select: {
                  name: true,
                },
              },
            },
          },
          participants: {
            where: {
              status: "ACTIVE",
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
            },
          },
        },
        orderBy: { name: "asc" },
      });

      return programs.map((program) => ({
        ...program,
        participantCount: program.participants.length,
      }));
    }),

  // Get single religious program
  getById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const program = await ctx.db.religiousProgram.findUnique({
        where: { id: input.id },
        include: {
          instructor: {
            include: {
              user: {
                select: {
                  name: true,
                  email: true,
                },
              },
            },
          },
          participants: {
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
            },
            orderBy: {
              student: {
                user: {
                  name: "asc",
                },
              },
            },
          },
        },
      });

      if (!program) {
        throw new Error("Program keagamaan tidak ditemukan");
      }

      return program;
    }),

  // Update religious program
  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string().optional(),
        description: z.string().optional(),
        type: z.enum(["DAILY", "WEEKLY", "MONTHLY", "EVENT"]).optional(),
        instructorId: z.string().optional(),
        schedule: z.string().optional(),
        location: z.string().optional(),
        targetGrades: z.array(z.string()).optional(),
        isActive: z.boolean().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input;

      const program = await ctx.db.religiousProgram.findUnique({
        where: { id },
      });

      if (!program) {
        throw new Error("Program keagamaan tidak ditemukan");
      }

      const updated = await ctx.db.religiousProgram.update({
        where: { id },
        data,
      });

      return {
        success: true,
        message: "Program keagamaan berhasil diperbarui",
        data: updated,
      };
    }),

  // Delete religious program
  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const program = await ctx.db.religiousProgram.findUnique({
        where: { id: input.id },
        include: {
          participants: true,
        },
      });

      if (!program) {
        throw new Error("Program keagamaan tidak ditemukan");
      }

      if (program.participants.length > 0) {
        throw new Error(
          "Tidak dapat menghapus program yang memiliki peserta. Nonaktifkan saja."
        );
      }

      await ctx.db.religiousProgram.delete({
        where: { id: input.id },
      });

      return {
        success: true,
        message: "Program keagamaan berhasil dihapus",
      };
    }),

  // Add participant to religious program
  addParticipant: protectedProcedure
    .input(
      z.object({
        programId: z.string(),
        studentId: z.string(),
        progress: z.string().optional(),
        notes: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const school = await ctx.db.school.findFirst();

      if (!school) {
        throw new Error("Sekolah tidak ditemukan");
      }

      // Check if program exists
      const program = await ctx.db.religiousProgram.findUnique({
        where: { id: input.programId },
      });

      if (!program) {
        throw new Error("Program keagamaan tidak ditemukan");
      }

      if (!program.isActive) {
        throw new Error("Program ini sudah tidak aktif");
      }

      // Check if already a participant
      const existingParticipant = await ctx.db.religiousProgramParticipant.findUnique({
        where: {
          programId_studentId: {
            programId: input.programId,
            studentId: input.studentId,
          },
        },
      });

      if (existingParticipant) {
        throw new Error("Siswa sudah terdaftar di program ini");
      }

      const participant = await ctx.db.religiousProgramParticipant.create({
        data: {
          schoolId: school.id,
          programId: input.programId,
          studentId: input.studentId,
          progress: input.progress,
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
        message: `${participant.student.user.name} berhasil ditambahkan ke program`,
        data: participant,
      };
    }),

  // Remove participant from religious program
  removeParticipant: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const participant = await ctx.db.religiousProgramParticipant.findUnique({
        where: { id: input.id },
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

      if (!participant) {
        throw new Error("Peserta tidak ditemukan");
      }

      await ctx.db.religiousProgramParticipant.delete({
        where: { id: input.id },
      });

      return {
        success: true,
        message: `${participant.student.user.name} berhasil dikeluarkan dari program`,
      };
    }),

  // Update participant status and progress
  updateParticipant: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        status: z.enum(["ACTIVE", "INACTIVE", "COMPLETED"]).optional(),
        progress: z.string().optional(),
        notes: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input;

      const participant = await ctx.db.religiousProgramParticipant.findUnique({
        where: { id },
      });

      if (!participant) {
        throw new Error("Peserta tidak ditemukan");
      }

      const updated = await ctx.db.religiousProgramParticipant.update({
        where: { id },
        data,
      });

      return {
        success: true,
        message: "Data peserta berhasil diperbarui",
        data: updated,
      };
    }),

  // Get statistics
  getStats: publicProcedure.query(async ({ ctx }) => {
    const school = await ctx.db.school.findFirst();

    if (!school) {
      return {
        total: 0,
        active: 0,
        totalParticipants: 0,
        daily: 0,
        weekly: 0,
        monthly: 0,
        event: 0,
      };
    }

    const [total, active, totalParticipants, daily, weekly, monthly, event] = await Promise.all([
      ctx.db.religiousProgram.count({
        where: { schoolId: school.id },
      }),
      ctx.db.religiousProgram.count({
        where: {
          schoolId: school.id,
          isActive: true,
        },
      }),
      ctx.db.religiousProgramParticipant.count({
        where: {
          schoolId: school.id,
          status: "ACTIVE",
        },
      }),
      ctx.db.religiousProgram.count({
        where: {
          schoolId: school.id,
          type: "DAILY",
        },
      }),
      ctx.db.religiousProgram.count({
        where: {
          schoolId: school.id,
          type: "WEEKLY",
        },
      }),
      ctx.db.religiousProgram.count({
        where: {
          schoolId: school.id,
          type: "MONTHLY",
        },
      }),
      ctx.db.religiousProgram.count({
        where: {
          schoolId: school.id,
          type: "EVENT",
        },
      }),
    ]);

    return {
      total,
      active,
      totalParticipants,
      daily,
      weekly,
      monthly,
      event,
    };
  }),

  // Get student's religious programs
  getStudentPrograms: publicProcedure
    .input(z.object({ studentId: z.string() }))
    .query(async ({ ctx, input }) => {
      const participants = await ctx.db.religiousProgramParticipant.findMany({
        where: {
          studentId: input.studentId,
        },
        include: {
          program: {
            include: {
              instructor: {
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
        orderBy: { joinDate: "desc" },
      });

      return participants;
    }),
});
