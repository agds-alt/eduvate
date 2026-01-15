import { z } from "zod";
import { createTRPCRouter, publicProcedure, protectedProcedure } from "~/server/api/trpc";

export const parentRouter = createTRPCRouter({
  // Get all parents with pagination and filters
  getAll: publicProcedure
    .input(
      z.object({
        page: z.number().min(1).default(1),
        limit: z.number().min(1).max(100).default(10),
        search: z.string().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const { page, limit, search } = input;
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

      // Get total count
      const total = await ctx.db.parent.count({ where });

      // Get parents
      const parents = await ctx.db.parent.findMany({
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
              nik: true,
            },
          },
          students: {
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
                      grade: true,
                    },
                  },
                },
              },
            },
          },
          _count: {
            select: {
              students: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
      });

      return {
        parents,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      };
    }),

  // Get parent by ID
  getById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const parent = await ctx.db.parent.findUnique({
        where: { id: input.id },
        include: {
          user: true,
          school: {
            select: {
              name: true,
            },
          },
          students: {
            include: {
              student: {
                include: {
                  user: {
                    select: {
                      name: true,
                      email: true,
                      phone: true,
                    },
                  },
                  currentClass: {
                    select: {
                      name: true,
                      grade: true,
                    },
                  },
                },
              },
            },
          },
          _count: {
            select: {
              students: true,
            },
          },
        },
      });

      return parent;
    }),

  // Create new parent
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

        // Parent details
        occupation: z.string().optional(),
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
          role: "PARENT",
          schoolId: school.id,
        },
      });

      // Create parent
      const parent = await ctx.db.parent.create({
        data: {
          userId: user.id,
          schoolId: school.id,
          occupation: input.occupation,
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

      return parent;
    }),

  // Update parent
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

        // Parent details
        occupation: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id, name, email, phone, address, nik, ...parentData } = input;

      // Get parent with user
      const parent = await ctx.db.parent.findUnique({
        where: { id },
        include: { user: true },
      });

      if (!parent) {
        throw new Error("Parent not found");
      }

      // Update user if user fields provided
      if (name || email || phone || address || nik) {
        await ctx.db.user.update({
          where: { id: parent.userId },
          data: {
            ...(name && { name }),
            ...(email && { email }),
            ...(phone && { phone }),
            ...(address && { address }),
            ...(nik && { nik }),
          },
        });
      }

      // Update parent
      const updatedParent = await ctx.db.parent.update({
        where: { id },
        data: parentData,
        include: {
          user: true,
        },
      });

      return updatedParent;
    }),

  // Delete parent
  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const parent = await ctx.db.parent.findUnique({
        where: { id: input.id },
        include: { user: true },
      });

      if (!parent) {
        throw new Error("Parent not found");
      }

      // Delete parent (will cascade delete user due to onDelete: Cascade)
      await ctx.db.user.delete({
        where: { id: parent.userId },
      });

      // Update school active users count
      await ctx.db.school.update({
        where: { id: parent.schoolId },
        data: {
          activeUsers: {
            decrement: 1,
          },
        },
      });

      return { success: true };
    }),
});
