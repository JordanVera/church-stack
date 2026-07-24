import { SignJWT, jwtVerify } from 'jose';
import type { Session, SessionUser } from './context';

const TOKEN_TTL = '30d';
const AUDIENCE = 'church-stack-mobile';

function getSecret(): Uint8Array | null {
  const secret = process.env.NEXTAUTH_SECRET;
  if (!secret) return null;
  return new TextEncoder().encode(secret);
}

export async function signMobileToken(user: SessionUser): Promise<string> {
  const secret = getSecret();
  if (!secret) {
    throw new Error('NEXTAUTH_SECRET is not configured');
  }

  return new SignJWT({
    email: user.email ?? null,
    name: user.name ?? null,
    isAdmin: Boolean(user.isAdmin),
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setSubject(user.id)
    .setAudience(AUDIENCE)
    .setIssuedAt()
    .setExpirationTime(TOKEN_TTL)
    .sign(secret);
}

export async function verifyMobileToken(token: string): Promise<Session | null> {
  const secret = getSecret();
  if (!secret) return null;

  try {
    const { payload } = await jwtVerify(token, secret, { audience: AUDIENCE });
    if (!payload.sub) return null;
    return {
      user: {
        id: payload.sub,
        email: typeof payload.email === 'string' ? payload.email : null,
        name: typeof payload.name === 'string' ? payload.name : null,
        isAdmin: Boolean(payload.isAdmin),
      },
    };
  } catch {
    return null;
  }
}

export function readBearerToken(authorization: string | null): string | null {
  if (!authorization) return null;
  const match = /^Bearer\s+(.+)$/i.exec(authorization.trim());
  return match?.[1]?.trim() || null;
}
