import { z } from "zod";
import { createTRPCRouter, publicProcedure, protectedProcedure } from "~/server/api/trpc";

export const teacherRouter = createTRPCRouter({
  // Get all teachers with pagination and filters
  getAll: publicProcedure
    .input(
      z.object({
        page: z.number().min(1).default(1),
        limit: z.number().min(1).max(100).default(10),
        search: z.string().optional(),
        position: z.string().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const { page, limit, search, position } = input;
      const skip = (page - 1) * limit;

      // Build where clause
      const where: any = {};

      if (search) {
        where.user = {
          name: {
            contains: search,
            mode: "insensitive",
          },
        };
      }

      if (position) {
        where.position = position;
      }

      // Get total count
      const total = await ctx.db.teacher.count({ where });

      // Get teachers
      const teachers = await ctx.db.teacher.findMany({
        where,
        skip,
        take: limit,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              phone: true,
              address: true,
              image: true,
            },
          },
          classes: {
            include: {
              class: {
                select: {
                  id: true,
                  name: true,
                  grade: true,
                  section: true,
                },
              },
            },
          },
          _count: {
            select: {
              classes: true,
              exams: true,
              attendance: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
      });

      return {
        teachers,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      };
    }),

  // Get teacher by ID
  getById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const teacher = await ctx.db.teacher.findUnique({
        where: { id: input.id },
        include: {
          user: true,
          school: {
            select: {
              name: true,
            },
          },
          classes: {
            include: {
              class: {
                include: {
                  _count: {
                    select: {
                      students: true,
                    },
                  },
                },
              },
            },
          },
          exams: {
            take: 10,
            orderBy: { startDate: "desc" },
            include: {
              subject: {
                select: {
                  name: true,
                },
              },
              class: {
                select: {
                  name: true,
                },
              },
            },
          },
          _count: {
            select: {
              classes: true,
              exams: true,
              attendance: true,
              grades: true,
            },
          },
        },
      });

      return teacher;
    }),

  // Create new teacher
  create: protectedProcedure
    .input(
      z.object({
        // User details
        name: z.string().min(3, "Name must be at least 3 characters"),
        email: z.string().email().optional(),
        phone: z.string().optional(),
        address: z.string().optional(),
        password: z.string().min(6, "Password must be at least 6 characters"),
        nik: z.string().optional(),

        // Teacher details
        employeeId: z.string().optional(),
        nip: z.string().optional(),
        position: z.string().optional(),
        subjects: z.array(z.string()).default([]),
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

      // Create user first
      const user = await ctx.db.user.create({
        data: {
          name: input.name,
          email: input.email,
          phone: input.phone,
          address: input.address,
          password: input.password, // TODO: Hash password
          nik: input.nik,
          role: "TEACHER",
          schoolId: school.id,
        },
      });

      // Create teacher
      const teacher = await ctx.db.teacher.create({
        data: {
          userId: user.id,
          schoolId: school.id,
          employeeId: input.employeeId,
          nip: input.nip,
          position: input.position,
          subjects: input.subjects,
        },
        include: {
          user: true,
        },
      });

      // Update school active users count
      await ctx.db.school.update({
        where: { id: school.id },
        data: {
          activeUsers: {
            increment: 1,
          },
        },
      });

      return teacher;
    }),

  // Update teacher
  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        // User details
        name: z.string().min(3).optional(),
        email: z.string().email().optional(),
        phone: z.string().optional(),
        address: z.string().optional(),
        nik: z.string().optional(),

        // Teacher details
        employeeId: z.string().optional(),
        nip: z.string().optional(),
        position: z.string().optional(),
        subjects: z.array(z.string()).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id, name, email, phone, address, nik, ...teacherData } = input;

      // Get teacher with user
      const teacher = await ctx.db.teacher.findUnique({
        where: { id },
        include: { user: true },
      });

      if (!teacher) {
        throw new Error("Teacher not found");
      }

      // Update user if user fields provided
      if (name || email || phone || address || nik) {
        await ctx.db.user.update({
          where: { id: teacher.userId },
          data: {
            ...(name && { name }),
            ...(email && { email }),
            ...(phone && { phone }),
            ...(address && { address }),
            ...(nik && { nik }),
          },
        });
      }

      // Update teacher
      const updatedTeacher = await ctx.db.teacher.update({
        where: { id },
        data: teacherData,
        include: {
          user: true,
        },
      });

      return updatedTeacher;
    }),

  // Delete teacher
  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const teacher = await ctx.db.teacher.findUnique({
        where: { id: input.id },
        include: { user: true },
      });

      if (!teacher) {
        throw new Error("Teacher not found");
      }

      // Delete teacher (will cascade delete user due to onDelete: Cascade)
      await ctx.db.user.delete({
        where: { id: teacher.userId },
      });

      // Update school active users count
      await ctx.db.school.update({
        where: { id: teacher.schoolId },
        data: {
          activeUsers: {
            decrement: 1,
          },
        },
      });

      return { success: true };
    }),

  // Get teacher statistics
  getStats: publicProcedure
    .input(z.object({ teacherId: z.string() }))
    .query(async ({ ctx, input }) => {
      const [classesCount, examsCount, attendanceCount, gradesCount] = await Promise.all([
        ctx.db.classTeacher.count({ where: { teacherId: input.teacherId } }),
        ctx.db.exam.count({ where: { teacherId: input.teacherId } }),
        ctx.db.attendance.count({ where: { teacherId: input.teacherId } }),
        ctx.db.grade.count({ where: { teacherId: input.teacherId } }),
      ]);

      return {
        classes: classesCount,
        exams: examsCount,
        attendance: attendanceCount,
        grades: gradesCount,
      };
    }),
});
