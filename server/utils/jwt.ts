import { SignJWT, jwtVerify } from 'jose';

const SECRET_KEY = new TextEncoder().encode(process.env.JWT_SECRET || 'super-secret-dev-key-change-me');
const ALG = 'HS256';

export interface UserPayload {
  userId: number;
  username: string;
}

export async function signJwt(payload: UserPayload): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: ALG })
    .setIssuedAt()
    .setExpirationTime('7d') // 7 days expiration
    .sign(SECRET_KEY);
}

export async function verifyJwt(token: string): Promise<UserPayload | null> {
  try {
    const { payload } = await jwtVerify(token, SECRET_KEY);
    return {
      userId: payload.userId as number,
      username: payload.username as string,
    };
  } catch (error) {
    return null;
  }
}
