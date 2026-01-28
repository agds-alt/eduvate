import { z } from "zod";
import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "~/server/api/trpc";

export const extracurricularRouter = createTRPCRouter({
  // Create a new extracurricular
  create: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1, "Nama ekstrakurikuler tidak boleh kosong"),
        description: z.string().optional(),
        category: z.string().min(1, "Kategori tidak boleh kosong"),
        coachId: z.string().optional(),
        schedule: z.string().optional(),
        location: z.string().optional(),
        maxCapacity: z.number().int().positive().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const school = await ctx.db.school.findFirst();

      if (!school) {
        throw new Error("Sekolah tidak ditemukan");
      }

      const extracurricular = await ctx.db.extracurricular.create({
        data: {
          schoolId: school.id,
          name: input.name,
          description: input.description,
          category: input.category,
          coachId: input.coachId,
          schedule: input.schedule,
          location: input.location,
          maxCapacity: input.maxCapacity,
          isActive: true,
        },
        include: {
          coach: {
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
        message: "Ekstrakurikuler berhasil dibuat",
        data: extracurricular,
      };
    }),

  // Get all extracurriculars
  getAll: publicProcedure
    .input(
      z.object({
        category: z.string().optional(),
        isActive: z.boolean().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const school = await ctx.db.school.findFirst();

      if (!school) {
        return [];
      }

      const extracurriculars = await ctx.db.extracurricular.findMany({
        where: {
          schoolId: school.id,
          ...(input.category && { category: input.category }),
          ...(input.isActive !== undefined && { isActive: input.isActive }),
        },
        include: {
          coach: {
            include: {
              user: {
                select: {
                  name: true,
                },
              },
            },
          },
          members: {
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

      return extracurriculars.map((ekskul) => ({
        ...ekskul,
        memberCount: ekskul.members.length,
      }));
    }),

  // Get single extracurricular
  getById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const extracurricular = await ctx.db.extracurricular.findUnique({
        where: { id: input.id },
        include: {
          coach: {
            include: {
              user: {
                select: {
                  name: true,
                  email: true,
                },
              },
            },
          },
          members: {
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

      if (!extracurricular) {
        throw new Error("Ekstrakurikuler tidak ditemukan");
      }

      return extracurricular;
    }),

  // Update extracurricular
  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string().optional(),
        description: z.string().optional(),
        category: z.string().optional(),
        coachId: z.string().optional(),
        schedule: z.string().optional(),
        location: z.string().optional(),
        maxCapacity: z.number().optional(),
        isActive: z.boolean().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input;

      const extracurricular = await ctx.db.extracurricular.findUnique({
        where: { id },
      });

      if (!extracurricular) {
        throw new Error("Ekstrakurikuler tidak ditemukan");
      }

      const updated = await ctx.db.extracurricular.update({
        where: { id },
        data,
      });

      return {
        success: true,
        message: "Ekstrakurikuler berhasil diperbarui",
        data: updated,
      };
    }),

  // Delete extracurricular
  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const extracurricular = await ctx.db.extracurricular.findUnique({
        where: { id: input.id },
        include: {
          members: true,
        },
      });

      if (!extracurricular) {
        throw new Error("Ekstrakurikuler tidak ditemukan");
      }

      if (extracurricular.members.length > 0) {
        throw new Error(
          "Tidak dapat menghapus ekstrakurikuler yang memiliki anggota. Nonaktifkan saja."
        );
      }

      await ctx.db.extracurricular.delete({
        where: { id: input.id },
      });

      return {
        success: true,
        message: "Ekstrakurikuler berhasil dihapus",
      };
    }),

  // Add member to extracurricular
  addMember: protectedProcedure
    .input(
      z.object({
        extracurricularId: z.string(),
        studentId: z.string(),
        notes: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const school = await ctx.db.school.findFirst();

      if (!school) {
        throw new Error("Sekolah tidak ditemukan");
      }

      // Check if extracurricular exists
      const extracurricular = await ctx.db.extracurricular.findUnique({
        where: { id: input.extracurricularId },
        include: {
          members: {
            where: {
              status: "ACTIVE",
            },
          },
        },
      });

      if (!extracurricular) {
        throw new Error("Ekstrakurikuler tidak ditemukan");
      }

      if (!extracurricular.isActive) {
        throw new Error("Ekstrakurikuler ini sudah tidak aktif");
      }

      // Check capacity
      if (
        extracurricular.maxCapacity &&
        extracurricular.members.length >= extracurricular.maxCapacity
      ) {
        throw new Error(
          `Kuota ekstrakurikuler sudah penuh (${extracurricular.maxCapacity} peserta)`
        );
      }

      // Check if already a member
      const existingMember = await ctx.db.extracurricularMember.findUnique({
        where: {
          extracurricularId_studentId: {
            extracurricularId: input.extracurricularId,
            studentId: input.studentId,
          },
        },
      });

      if (existingMember) {
        throw new Error("Siswa sudah terdaftar di ekstrakurikuler ini");
      }

      const member = await ctx.db.extracurricularMember.create({
        data: {
          schoolId: school.id,
          extracurricularId: input.extracurricularId,
          studentId: input.studentId,
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
        message: `${member.student.user.name} berhasil ditambahkan ke ekstrakurikuler`,
        data: member,
      };
    }),

  // Remove member from extracurricular
  removeMember: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const member = await ctx.db.extracurricularMember.findUnique({
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

      if (!member) {
        throw new Error("Anggota tidak ditemukan");
      }

      await ctx.db.extracurricularMember.delete({
        where: { id: input.id },
      });

      return {
        success: true,
        message: `${member.student.user.name} berhasil dikeluarkan dari ekstrakurikuler`,
      };
    }),

  // Update member status
  updateMemberStatus: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        status: z.enum(["ACTIVE", "INACTIVE", "GRADUATED"]),
        notes: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const member = await ctx.db.extracurricularMember.findUnique({
        where: { id: input.id },
      });

      if (!member) {
        throw new Error("Anggota tidak ditemukan");
      }

      const updated = await ctx.db.extracurricularMember.update({
        where: { id: input.id },
        data: {
          status: input.status,
          notes: input.notes,
        },
      });

      return {
        success: true,
        message: "Status anggota berhasil diperbarui",
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
        totalMembers: 0,
        categories: [],
      };
    }

    const [total, active, totalMembers, extracurriculars] = await Promise.all([
      ctx.db.extracurricular.count({
        where: { schoolId: school.id },
      }),
      ctx.db.extracurricular.count({
        where: {
          schoolId: school.id,
          isActive: true,
        },
      }),
      ctx.db.extracurricularMember.count({
        where: {
          schoolId: school.id,
          status: "ACTIVE",
        },
      }),
      ctx.db.extracurricular.findMany({
        where: { schoolId: school.id },
        select: {
          category: true,
        },
      }),
    ]);

    // Count unique categories
    const categories = Array.from(
      new Set(extracurriculars.map((e) => e.category))
    );

    return {
      total,
      active,
      totalMembers,
      categories: categories.length,
    };
  }),

  // Get student's extracurriculars
  getStudentExtracurriculars: publicProcedure
    .input(z.object({ studentId: z.string() }))
    .query(async ({ ctx, input }) => {
      const members = await ctx.db.extracurricularMember.findMany({
        where: {
          studentId: input.studentId,
        },
        include: {
          extracurricular: {
            include: {
              coach: {
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

      return members;
    }),
});
