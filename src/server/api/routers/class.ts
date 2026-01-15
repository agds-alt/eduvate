import { z } from "zod";
import { createTRPCRouter, publicProcedure, protectedProcedure } from "~/server/api/trpc";

export const classRouter = createTRPCRouter({
  // Get all classes with pagination and filters
  getAll: publicProcedure
    .input(
      z.object({
        page: z.number().min(1).default(1),
        limit: z.number().min(1).max(100).default(10),
        search: z.string().optional(),
        grade: z.number().optional(),
        academicYear: z.string().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const { page, limit, search, grade, academicYear } = input;
      const skip = (page - 1) * limit;

      // Build where clause
      const where: any = {};

      if (search) {
        where.name = {
          contains: search,
          mode: "insensitive",
        };
      }

      if (grade) {
        where.grade = grade;
      }

      if (academicYear) {
        where.academicYear = academicYear;
      }

      // Get total count
      const total = await ctx.db.class.count({ where });

      // Get classes
      const classes = await ctx.db.class.findMany({
        where,
        skip,
        take: limit,
        include: {
          school: {
            select: {
              name: true,
            },
          },
          _count: {
            select: {
              students: true,
              teachers: true,
              subjects: true,
            },
          },
          teachers: {
            where: {
              isHomeroom: true,
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
            },
            take: 1,
          },
        },
        orderBy: [{ grade: "asc" }, { section: "asc" }],
      });

      return {
        classes,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      };
    }),

  // Get class by ID
  getById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const classData = await ctx.db.class.findUnique({
        where: { id: input.id },
        include: {
          school: {
            select: {
              name: true,
            },
          },
          students: {
            include: {
              user: {
                select: {
                  name: true,
                  email: true,
                  phone: true,
                },
              },
            },
            orderBy: {
              user: {
                name: "asc",
              },
            },
          },
          teachers: {
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
            },
          },
          subjects: {
            include: {
              subject: {
                select: {
                  name: true,
                  code: true,
                },
              },
            },
          },
          _count: {
            select: {
              students: true,
              teachers: true,
              subjects: true,
              exams: true,
              attendance: true,
            },
          },
        },
      });

      return classData;
    }),

  // Create new class
  create: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1, "Name is required"),
        grade: z.number().int().min(1).max(12),
        section: z.string().optional(),
        academicYear: z.string(),
        capacity: z.number().int().positive().default(30),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Get school ID (assuming first school for now)
      const school = await ctx.db.school.findFirst({
        orderBy: { createdAt: "desc" },
      });

      if (!school) {
        throw new Error("School not found");
      }

      // Create class
      const classData = await ctx.db.class.create({
        data: {
          schoolId: school.id,
          name: input.name,
          grade: input.grade,
          section: input.section,
          academicYear: input.academicYear,
          capacity: input.capacity,
        },
        include: {
          school: {
            select: {
              name: true,
            },
          },
          _count: {
            select: {
              students: true,
              teachers: true,
            },
          },
        },
      });

      return classData;
    }),

  // Update class
  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string().min(1).optional(),
        grade: z.number().int().min(1).max(12).optional(),
        section: z.string().optional().nullable(),
        academicYear: z.string().optional(),
        capacity: z.number().int().positive().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input;

      const classData = await ctx.db.class.update({
        where: { id },
        data,
        include: {
          school: {
            select: {
              name: true,
            },
          },
          _count: {
            select: {
              students: true,
              teachers: true,
            },
          },
        },
      });

      return classData;
    }),

  // Delete class
  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      // Check if class has students
      const studentsCount = await ctx.db.student.count({
        where: { currentClassId: input.id },
      });

      if (studentsCount > 0) {
        throw new Error(
          `Cannot delete class with ${studentsCount} students. Please move students to another class first.`
        );
      }

      await ctx.db.class.delete({
        where: { id: input.id },
      });

      return { success: true };
    }),

  // Assign teacher to class
  assignTeacher: protectedProcedure
    .input(
      z.object({
        classId: z.string(),
        teacherId: z.string(),
        isHomeroom: z.boolean().default(false),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // If setting as homeroom, remove existing homeroom teacher
      if (input.isHomeroom) {
        await ctx.db.classTeacher.updateMany({
          where: {
            classId: input.classId,
            isHomeroom: true,
          },
          data: {
            isHomeroom: false,
          },
        });
      }

      const assignment = await ctx.db.classTeacher.create({
        data: {
          classId: input.classId,
          teacherId: input.teacherId,
          isHomeroom: input.isHomeroom,
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
        },
      });

      return assignment;
    }),

  // Remove teacher from class
  removeTeacher: protectedProcedure
    .input(
      z.object({
        classId: z.string(),
        teacherId: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      await ctx.db.classTeacher.deleteMany({
        where: {
          classId: input.classId,
          teacherId: input.teacherId,
        },
      });

      return { success: true };
    }),

  // Get class statistics
  getStats: publicProcedure
    .input(z.object({ classId: z.string() }))
    .query(async ({ ctx, input }) => {
      const [studentsCount, teachersCount, subjectsCount, attendanceRate] =
        await Promise.all([
          ctx.db.student.count({ where: { currentClassId: input.classId } }),
          ctx.db.classTeacher.count({ where: { classId: input.classId } }),
          ctx.db.classSubject.count({ where: { classId: input.classId } }),
          ctx.db.attendance
            .groupBy({
              by: ["status"],
              where: { classId: input.classId },
              _count: true,
            })
            .then((stats) => {
              const total = stats.reduce((sum, s) => sum + s._count, 0);
              const present = stats.find((s) => s.status === "PRESENT")?._count ?? 0;
              return total > 0 ? Math.round((present / total) * 100) : 0;
            }),
        ]);

      return {
        students: studentsCount,
        teachers: teachersCount,
        subjects: subjectsCount,
        attendanceRate,
      };
    }),
});
