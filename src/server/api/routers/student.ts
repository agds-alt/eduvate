import { z } from "zod";
import bcrypt from "bcryptjs";
import { createTRPCRouter, publicProcedure, protectedProcedure } from "~/server/api/trpc";

export const studentRouter = createTRPCRouter({
  // Get all students with pagination and filters
  getAll: publicProcedure
    .input(
      z.object({
        page: z.number().min(1).default(1),
        limit: z.number().min(1).max(100).default(10),
        search: z.string().optional(),
        classId: z.string().optional(),
        isAlumni: z.boolean().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const { page, limit, search, classId, isAlumni } = input;
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

      if (classId) {
        where.currentClassId = classId;
      }

      if (isAlumni !== undefined) {
        where.isAlumni = isAlumni;
      }

      // Get total count
      const total = await ctx.db.student.count({ where });

      // Get students
      const students = await ctx.db.student.findMany({
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
          currentClass: {
            select: {
              id: true,
              name: true,
              grade: true,
              section: true,
              academicYear: true,
            },
          },
          parents: {
            include: {
              parent: {
                include: {
                  user: {
                    select: {
                      name: true,
                      phone: true,
                      email: true,
                    },
                  },
                },
              },
            },
          },
        },
        orderBy: { createdAt: "desc" },
      });

      return {
        students,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      };
    }),

  // Get student by ID
  getById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const student = await ctx.db.student.findUnique({
        where: { id: input.id },
        include: {
          user: true,
          currentClass: {
            include: {
              school: {
                select: {
                  name: true,
                },
              },
            },
          },
          parents: {
            include: {
              parent: {
                include: {
                  user: true,
                },
              },
            },
          },
          attendance: {
            take: 10,
            orderBy: { date: "desc" },
            include: {
              class: {
                select: {
                  name: true,
                },
              },
            },
          },
          grades: {
            take: 10,
            orderBy: { createdAt: "desc" },
            include: {
              subject: {
                select: {
                  name: true,
                },
              },
            },
          },
        },
      });

      return student;
    }),

  // Create new student
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

        // Student details
        nis: z.string().optional(),
        nisn: z.string().optional(),
        enrollmentYear: z.number().int().min(2000).max(2100).optional(),
        graduationYear: z.number().int().min(2000).max(2100).optional(),
        currentClassId: z.string().optional(),
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

      // Hash password
      const hashedPassword = await bcrypt.hash(input.password, 10);

      // Create user first
      const user = await ctx.db.user.create({
        data: {
          name: input.name,
          email: input.email,
          phone: input.phone,
          address: input.address,
          password: hashedPassword,
          nik: input.nik,
          role: "STUDENT",
          schoolId: school.id,
        },
      });

      // Create student
      const student = await ctx.db.student.create({
        data: {
          userId: user.id,
          schoolId: school.id,
          nis: input.nis,
          nisn: input.nisn,
          enrollmentYear: input.enrollmentYear,
          graduationYear: input.graduationYear,
          currentClassId: input.currentClassId,
        },
        include: {
          user: true,
          currentClass: true,
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

      return student;
    }),

  // Update student
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

        // Student details
        nis: z.string().optional(),
        nisn: z.string().optional(),
        enrollmentYear: z.number().int().min(2000).max(2100).optional(),
        graduationYear: z.number().int().min(2000).max(2100).optional(),
        currentClassId: z.string().optional().nullable(),
        isAlumni: z.boolean().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id, name, email, phone, address, nik, ...studentData } = input;

      // Get student with user
      const student = await ctx.db.student.findUnique({
        where: { id },
        include: { user: true },
      });

      if (!student) {
        throw new Error("Student not found");
      }

      // Update user if user fields provided
      if (name || email || phone || address || nik) {
        await ctx.db.user.update({
          where: { id: student.userId },
          data: {
            ...(name && { name }),
            ...(email && { email }),
            ...(phone && { phone }),
            ...(address && { address }),
            ...(nik && { nik }),
          },
        });
      }

      // Update student
      const updatedStudent = await ctx.db.student.update({
        where: { id },
        data: studentData,
        include: {
          user: true,
          currentClass: true,
        },
      });

      return updatedStudent;
    }),

  // Delete student
  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const student = await ctx.db.student.findUnique({
        where: { id: input.id },
        include: { user: true },
      });

      if (!student) {
        throw new Error("Student not found");
      }

      // Delete student (will cascade delete user due to onDelete: Cascade)
      await ctx.db.user.delete({
        where: { id: student.userId },
      });

      // Update school active users count
      await ctx.db.school.update({
        where: { id: student.schoolId },
        data: {
          activeUsers: {
            decrement: 1,
          },
        },
      });

      return { success: true };
    }),

  // Get student statistics
  getStats: publicProcedure
    .input(z.object({ studentId: z.string() }))
    .query(async ({ ctx, input }) => {
      const [attendanceCount, gradesCount, examsCount, pendingPayments] = await Promise.all([
        ctx.db.attendance.count({ where: { studentId: input.studentId } }),
        ctx.db.grade.count({ where: { studentId: input.studentId } }),
        ctx.db.examResult.count({ where: { studentId: input.studentId } }),
        ctx.db.finance.count({
          where: {
            studentId: input.studentId,
            status: { in: ["UNPAID", "PARTIAL", "OVERDUE"] },
          },
        }),
      ]);

      // Get attendance rate
      const attendanceStats = await ctx.db.attendance.groupBy({
        by: ["status"],
        where: { studentId: input.studentId },
        _count: true,
      });

      const presentCount = attendanceStats.find((s) => s.status === "PRESENT")?._count ?? 0;
      const attendanceRate = attendanceCount > 0 ? Math.round((presentCount / attendanceCount) * 100) : 0;

      // Get average grade
      const gradeAvg = await ctx.db.grade.aggregate({
        where: { studentId: input.studentId },
        _avg: {
          score: true,
        },
      });

      return {
        attendanceCount,
        attendanceRate,
        gradesCount,
        averageGrade: gradeAvg._avg.score ?? 0,
        examsCount,
        pendingPayments,
      };
    }),

  // Bulk import students from CSV/Excel
  bulkImport: publicProcedure
    .input(
      z.object({
        students: z.array(
          z.object({
            name: z.string().min(1, "Nama harus diisi"),
            email: z.string().email("Email tidak valid").optional(),
            phone: z.string().optional(),
            address: z.string().optional(),
            nik: z.string().optional(),
            nis: z.string().min(1, "NIS harus diisi"),
            nisn: z.string().optional(),
            birthDate: z.string().optional(),
            gender: z.enum(["MALE", "FEMALE"]).optional(),
            religion: z.string().optional(),
            classId: z.string().optional(),
            parentName: z.string().optional(),
            parentPhone: z.string().optional(),
            parentEmail: z.string().optional(),
          })
        ),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const school = await ctx.db.school.findFirst({
        orderBy: { createdAt: "desc" },
      });

      if (!school) {
        throw new Error("School not found");
      }

      const results = {
        success: [] as string[],
        failed: [] as { row: number; name: string; error: string }[],
      };

      // Process each student
      for (let i = 0; i < input.students.length; i++) {
        const studentData = input.students[i]!;

        try {
          // Check if NIS already exists
          const existingStudent = await ctx.db.student.findFirst({
            where: { nis: studentData.nis, schoolId: school.id },
          });

          if (existingStudent) {
            results.failed.push({
              row: i + 2, // +2 because row 1 is header, and we start from 0
              name: studentData.name,
              error: `NIS ${studentData.nis} sudah ada`,
            });
            continue;
          }

          // Check if email already exists (if provided)
          if (studentData.email) {
            const existingEmail = await ctx.db.user.findUnique({
              where: { email: studentData.email },
            });

            if (existingEmail) {
              results.failed.push({
                row: i + 2,
                name: studentData.name,
                error: `Email ${studentData.email} sudah digunakan`,
              });
              continue;
            }
          }

          // Create user
          const hashedPassword = await bcrypt.hash("password123", 10); // Default password
          const user = await ctx.db.user.create({
            data: {
              name: studentData.name,
              email: studentData.email || `${studentData.nis}@student.temp`,
              password: hashedPassword,
              role: "STUDENT",
              phone: studentData.phone,
              address: studentData.address,
              nik: studentData.nik,
            },
          });

          // Create student
          await ctx.db.student.create({
            data: {
              userId: user.id,
              schoolId: school.id,
              nis: studentData.nis,
              nisn: studentData.nisn,
              birthDate: studentData.birthDate ? new Date(studentData.birthDate) : null,
              gender: studentData.gender,
              religion: studentData.religion,
              currentClassId: studentData.classId,
              isAlumni: false,
            },
          });

          // Create parent if provided
          if (studentData.parentName) {
            const parentEmail = studentData.parentEmail || `parent_${studentData.nis}@temp.com`;

            // Check if parent user exists
            let parentUser = await ctx.db.user.findUnique({
              where: { email: parentEmail },
            });

            if (!parentUser) {
              parentUser = await ctx.db.user.create({
                data: {
                  name: studentData.parentName,
                  email: parentEmail,
                  password: hashedPassword,
                  role: "PARENT",
                  phone: studentData.parentPhone,
                },
              });

              // Create parent record
              await ctx.db.parent.create({
                data: {
                  userId: parentUser.id,
                  schoolId: school.id,
                },
              });
            }
          }

          // Update school active users
          await ctx.db.school.update({
            where: { id: school.id },
            data: { activeUsers: { increment: 1 } },
          });

          results.success.push(studentData.name);
        } catch (error) {
          results.failed.push({
            row: i + 2,
            name: studentData.name,
            error: error instanceof Error ? error.message : "Unknown error",
          });
        }
      }

      return results;
    }),
});
