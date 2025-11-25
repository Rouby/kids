import { z } from 'zod';
import { router, publicProcedure } from './trpc';
import { db } from '../db';
import { users, highScores } from '../db/schema';
import { eq, and, desc } from 'drizzle-orm';
import { authRouter } from './authRouter';
import { verifyJwt } from '../utils/jwt';
import { parse } from 'cookie';

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

// Helper to get current user from request
async function getCurrentUser(req: Request) {
  const cookieHeader = req.headers.get('cookie');
  if (!cookieHeader) return null;

  const cookies = parse(cookieHeader);
  const token = cookies['auth_token'];

  if (!token) return null;

  const payload = await verifyJwt(token);
  if (!payload) return null;

  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.id, payload.userId))
    .limit(1);

  return user || null;
}

// Game router for high scores and points
const gameRouter = router({
  // Get high score for a specific game and user
  getHighScore: publicProcedure
    .input(z.object({ game: z.string() }))
    .query(async ({ input, ctx }) => {
      const user = await getCurrentUser(ctx.req);
      if (!user) return null;

      const [result] = await db
        .select()
        .from(highScores)
        .where(and(eq(highScores.userId, user.id), eq(highScores.game, input.game)))
        .limit(1);

      return result || null;
    }),

  // Get top high scores for a game (leaderboard)
  getLeaderboard: publicProcedure
    .input(z.object({ game: z.string(), limit: z.number().min(1).max(100).default(10) }))
    .query(async ({ input }) => {
      const results = await db
        .select({
          id: highScores.id,
          score: highScores.score,
          username: users.username,
          createdAt: highScores.createdAt,
        })
        .from(highScores)
        .innerJoin(users, eq(highScores.userId, users.id))
        .where(eq(highScores.game, input.game))
        .orderBy(desc(highScores.score))
        .limit(input.limit);

      return results;
    }),

  // Submit a high score
  submitScore: publicProcedure
    .input(z.object({ game: z.string(), score: z.number().min(0) }))
    .mutation(async ({ input, ctx }) => {
      const user = await getCurrentUser(ctx.req);
      if (!user) {
        throw new Error('Must be logged in to save high score');
      }

      // Check if user already has a high score for this game
      const [existingScore] = await db
        .select()
        .from(highScores)
        .where(and(eq(highScores.userId, user.id), eq(highScores.game, input.game)))
        .limit(1);

      if (existingScore) {
        // Only update if new score is higher
        if (input.score > existingScore.score) {
          const [updated] = await db
            .update(highScores)
            .set({ score: input.score, updatedAt: new Date() })
            .where(eq(highScores.id, existingScore.id))
            .returning();
          return { highScore: updated, isNewRecord: true };
        }
        return { highScore: existingScore, isNewRecord: false };
      }

      // Create new high score record
      const [newScore] = await db
        .insert(highScores)
        .values({
          userId: user.id,
          game: input.game,
          score: input.score,
        })
        .returning();

      return { highScore: newScore, isNewRecord: true };
    }),

  // Add points to user (for learning games)
  addPoints: publicProcedure
    .input(z.object({ points: z.number().min(1).max(1000) }))
    .mutation(async ({ input, ctx }) => {
      const user = await getCurrentUser(ctx.req);
      if (!user) {
        throw new Error('Must be logged in to earn points');
      }

      const [updated] = await db
        .update(users)
        .set({ 
          points: user.points + input.points, 
          updatedAt: new Date() 
        })
        .where(eq(users.id, user.id))
        .returning();

      return { newTotal: updated.points, added: input.points };
    }),

  // Get user's current points
  getPoints: publicProcedure.query(async ({ ctx }) => {
    const user = await getCurrentUser(ctx.req);
    if (!user) return null;

    return { points: user.points };
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

  // Game endpoints (high scores, points)
  game: gameRouter,
});

export type AppRouter = typeof appRouter;
