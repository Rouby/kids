import { z } from 'zod';
import { router, publicProcedure } from './trpc';
import { db } from '../db';
import { users } from '../db/schema';
import { eq } from 'drizzle-orm';
import { authRouter } from './authRouter';

// User management router
const userRouter = router({
  list: publicProcedure.query(async () => {
    return await db.select().from(users);
  }),

  getById: publicProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const result = await db.select().from(users).where(eq(users.id, input.id));
      return result[0] || null;
    }),

  create: publicProcedure
    .input(
      z.object({
        username: z.string().min(3).max(50),
        email: z.string().email().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const result = await db.insert(users).values(input).returning();
      return result[0];
    }),

  update: publicProcedure
    .input(
      z.object({
        id: z.number(),
        username: z.string().min(3).max(50).optional(),
        email: z.string().email().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const { id, ...data } = input;
      const result = await db
        .update(users)
        .set({ ...data, updatedAt: new Date() })
        .where(eq(users.id, id))
        .returning();
      return result[0];
    }),

  delete: publicProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      await db.delete(users).where(eq(users.id, input.id));
      return { success: true };
    }),
});

export const appRouter = router({
  // Health check endpoint
  health: publicProcedure.query(() => {
    return { status: 'ok', timestamp: new Date().toISOString() };
  }),

  // Authentication endpoints
  auth: authRouter,

  // User management endpoints
  user: userRouter,
});

export type AppRouter = typeof appRouter;
