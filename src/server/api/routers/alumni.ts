import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import * as bcrypt from "bcryptjs";

export const alumniRouter = createTRPCRouter({
  // Get all alumni
  getAll: publicProcedure.query(async ({ ctx }) => {
    const alumni = await ctx.db.student.findMany({
      where: {
        isAlumni: true,
      },
      include: {
        user: {
          select: {
            name: true,
            email: true,
            phone: true,
            address: true,
          },
        },
      },
      orderBy: {
        graduationYear: "desc",
      },
    });

    return alumni;
  }),

  // Get alumni statistics
  getStats: publicProcedure.query(async ({ ctx }) => {
    const currentYear = new Date().getFullYear();

    const [
      totalAlumni,
      thisYearAlumni,
      // Get count of alumni by their current status (assumed to be tracked elsewhere)
    ] = await Promise.all([
      ctx.db.student.count({
        where: { isAlumni: true },
      }),
      ctx.db.student.count({
        where: {
          isAlumni: true,
          graduationYear: currentYear,
        },
      }),
    ]);

    // Mock data for continuing education and working (can be enhanced later)
    const continuingEducation = Math.floor(totalAlumni * 0.6); // 60% assumption
    const working = Math.floor(totalAlumni * 0.35); // 35% assumption

    return {
      totalAlumni,
      thisYearAlumni,
      continuingEducation,
      working,
    };
  }),

  // Get alumni by graduation year
  getByYear: publicProcedure
    .input(z.object({ year: z.number() }))
    .query(async ({ ctx, input }) => {
      return ctx.db.student.findMany({
        where: {
          isAlumni: true,
          graduationYear: input.year,
        },
        include: {
          user: {
            select: {
              name: true,
              email: true,
              phone: true,
            },
          },
        },
      });
    }),

  // Get alumni details
  getById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      return ctx.db.student.findUnique({
        where: {
          id: input.id,
          isAlumni: true,
        },
        include: {
          user: true,
          grades: {
            include: {
              subject: true,
            },
          },
        },
      });
    }),

  // Create new alumni (graduate a student)
  create: publicProcedure
    .input(
      z.object({
        studentId: z.string(),
        graduationYear: z.number(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.db.student.update({
        where: { id: input.studentId },
        data: {
          isAlumni: true,
          graduationYear: input.graduationYear,
          currentClassId: null, // Remove from current class
        },
      });
    }),

  // Create new alumni directly (not from existing student)
  createDirect: publicProcedure
    .input(
      z.object({
        name: z.string().min(3, "Name must be at least 3 characters"),
        email: z.string().email().optional(),
        phone: z.string().optional(),
        address: z.string().optional(),
        nis: z.string(),
        nisn: z.string(),
        graduationYear: z.number().int().min(2000).max(2100),
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

      // Hash default password
      const hashedPassword = await bcrypt.hash("password123", 10);

      // Generate unique NIK (National Identity Number)
      const nikSuffix = Date.now().toString().slice(-10);
      const nik = `3571${nikSuffix}`;

      // Create user first
      const user = await ctx.db.user.create({
        data: {
          name: input.name,
          email: input.email,
          phone: input.phone,
          address: input.address,
          password: hashedPassword,
          nik: nik,
          role: "STUDENT",
          schoolId: school.id,
        },
      });

      // Generate student ID with A prefix for alumni
      const alumniCount = await ctx.db.student.count({
        where: { isAlumni: true },
      });
      const studentId = `A${String(alumniCount + 1).padStart(5, "0")}`;

      // Create student as alumni
      const alumni = await ctx.db.student.create({
        data: {
          userId: user.id,
          schoolId: school.id,
          studentId: studentId,
          nis: input.nis,
          nisn: input.nisn,
          enrollmentYear: input.graduationYear - 3, // Assuming 3 years of school
          graduationYear: input.graduationYear,
          isAlumni: true,
          currentClassId: null, // Alumni don't have current class
        },
        include: {
          user: {
            select: {
              name: true,
              email: true,
              phone: true,
              address: true,
            },
          },
        },
      });

      return alumni;
    }),

  // Update alumni info
  update: publicProcedure
    .input(
      z.object({
        id: z.string(),
        data: z.object({
          name: z.string().optional(),
          email: z.string().email().optional(),
          phone: z.string().optional(),
          address: z.string().optional(),
          graduationYear: z.number().optional(),
        }),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id, data } = input;

      // Update user info
      const student = await ctx.db.student.findUnique({
        where: { id },
        select: { userId: true },
      });

      if (!student) {
        throw new Error("Alumni not found");
      }

      await ctx.db.user.update({
        where: { id: student.userId },
        data: {
          name: data.name,
          email: data.email,
          phone: data.phone,
          address: data.address,
        },
      });

      // Update student record
      return ctx.db.student.update({
        where: { id },
        data: {
          graduationYear: data.graduationYear,
        },
        include: {
          user: true,
        },
      });
    }),

  // Delete alumni
  delete: publicProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      // This will cascade delete the student and user
      const student = await ctx.db.student.findUnique({
        where: { id: input.id },
        select: { userId: true },
      });

      if (!student) {
        throw new Error("Alumni not found");
      }

      // Delete user (will cascade to student)
      return ctx.db.user.delete({
        where: { id: student.userId },
      });
    }),

  // Get graduation years for filter
  getGraduationYears: publicProcedure.query(async ({ ctx }) => {
    const years = await ctx.db.student.findMany({
      where: {
        isAlumni: true,
        graduationYear: { not: null },
      },
      select: {
        graduationYear: true,
      },
      distinct: ["graduationYear"],
      orderBy: {
        graduationYear: "desc",
      },
    });

    return years
      .map((y) => y.graduationYear)
      .filter((year): year is number => year !== null);
  }),
});
