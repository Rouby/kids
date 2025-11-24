import { z } from 'zod';
import { router, publicProcedure } from './trpc';
import { db } from '../db';
import { users, authenticators } from '../db/schema';
import { eq } from 'drizzle-orm';
import {
  generateRegistrationOptions,
  verifyRegistrationResponse,
  generateAuthenticationOptions,
  verifyAuthenticationResponse,
} from '@simplewebauthn/server';
import type {
  RegistrationResponseJSON,
  AuthenticationResponseJSON,
} from '@simplewebauthn/types';
import { isoBase64URL, isoUint8Array } from '@simplewebauthn/server/helpers';

const rpName = 'Kids App';
const rpID = process.env.RP_ID || 'localhost';
const origin = process.env.ORIGIN || `http://localhost:3000`;

export const authRouter = router({
  // Generate registration options for new user signup
  generateRegistrationOptions: publicProcedure
    .input(
      z.object({
        username: z.string().min(3).max(50),
        email: z.string().email().optional(),
      })
    )
    .mutation(async ({ input }) => {
      // Check if username already exists
      const existingUser = await db
        .select()
        .from(users)
        .where(eq(users.username, input.username))
        .limit(1);

      if (existingUser.length > 0) {
        throw new Error('Username already exists');
      }

      // Create user record
      const [user] = await db
        .insert(users)
        .values({
          username: input.username,
          email: input.email || null,
        })
        .returning();

      const options = await generateRegistrationOptions({
        rpName,
        rpID,
        userID: isoUint8Array.fromUTF8String(user.id.toString()),
        userName: user.username,
        userDisplayName: user.username,
        attestationType: 'none',
        authenticatorSelection: {
          residentKey: 'preferred',
          userVerification: 'preferred',
        },
      });

      // Store challenge for verification
      await db
        .update(users)
        .set({ currentChallenge: options.challenge })
        .where(eq(users.id, user.id));

      return { options, userId: user.id };
    }),

  // Verify registration response
  verifyRegistration: publicProcedure
    .input(
      z.object({
        userId: z.number(),
        response: z.any() as z.ZodType<RegistrationResponseJSON>,
      })
    )
    .mutation(async ({ input }) => {
      const [user] = await db
        .select()
        .from(users)
        .where(eq(users.id, input.userId))
        .limit(1);

      if (!user || !user.currentChallenge) {
        throw new Error('User not found or no challenge');
      }

      const verification = await verifyRegistrationResponse({
        response: input.response,
        expectedChallenge: user.currentChallenge,
        expectedOrigin: origin,
        expectedRPID: rpID,
      });

      if (!verification.verified || !verification.registrationInfo) {
        throw new Error('Verification failed');
      }

      const { credentialPublicKey, credentialID, counter, credentialDeviceType, credentialBackedUp } =
        verification.registrationInfo;

      // Store the authenticator - credentialID is already a Uint8Array, convert to base64url string
      await db.insert(authenticators).values({
        userId: user.id,
        credentialID: isoBase64URL.fromBuffer(credentialID),
        credentialPublicKey: isoBase64URL.fromBuffer(credentialPublicKey),
        counter,
        credentialDeviceType,
        credentialBackedUp,
        transports: input.response.response.transports?.join(',') || null,
      });

      // Clear challenge
      await db
        .update(users)
        .set({ currentChallenge: null })
        .where(eq(users.id, user.id));

      return { verified: true, user };
    }),

  // Generate authentication options for signin
  generateAuthenticationOptions: publicProcedure
    .input(
      z.object({
        username: z.string().min(3).max(50),
      })
    )
    .mutation(async ({ input }) => {
      const [user] = await db
        .select()
        .from(users)
        .where(eq(users.username, input.username))
        .limit(1);

      if (!user) {
        throw new Error('User not found');
      }

      // Get user's authenticators
      const userAuthenticators = await db
        .select()
        .from(authenticators)
        .where(eq(authenticators.userId, user.id));

      const options = await generateAuthenticationOptions({
        rpID,
        allowCredentials: userAuthenticators.map((auth) => ({
          id: isoBase64URL.toBuffer(auth.credentialID),
          type: 'public-key',
          transports: auth.transports?.split(',') as AuthenticatorTransport[] | undefined,
        })),
        userVerification: 'preferred',
      });

      // Store challenge
      await db
        .update(users)
        .set({ currentChallenge: options.challenge })
        .where(eq(users.id, user.id));

      return { options, userId: user.id };
    }),

  // Verify authentication response
  verifyAuthentication: publicProcedure
    .input(
      z.object({
        userId: z.number(),
        response: z.any() as z.ZodType<AuthenticationResponseJSON>,
      })
    )
    .mutation(async ({ input }) => {
      const [user] = await db
        .select()
        .from(users)
        .where(eq(users.id, input.userId))
        .limit(1);

      if (!user || !user.currentChallenge) {
        throw new Error('User not found or no challenge');
      }

      // Get the authenticator - response.id is base64url string from the client
      const [authenticator] = await db
        .select()
        .from(authenticators)
        .where(eq(authenticators.credentialID, input.response.id))
        .limit(1);

      if (!authenticator) {
        throw new Error('Authenticator not found');
      }

      const verification = await verifyAuthenticationResponse({
        response: input.response,
        expectedChallenge: user.currentChallenge,
        expectedOrigin: origin,
        expectedRPID: rpID,
        authenticator: {
          credentialID: isoBase64URL.toBuffer(authenticator.credentialID),
          credentialPublicKey: isoBase64URL.toBuffer(authenticator.credentialPublicKey),
          counter: authenticator.counter,
        },
      });

      if (!verification.verified) {
        throw new Error('Verification failed');
      }

      // Update counter
      await db
        .update(authenticators)
        .set({ counter: verification.authenticationInfo.newCounter })
        .where(eq(authenticators.id, authenticator.id));

      // Clear challenge
      await db
        .update(users)
        .set({ currentChallenge: null })
        .where(eq(users.id, user.id));

      return { verified: true, user };
    }),
});
