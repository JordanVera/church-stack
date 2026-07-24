import { prisma } from '@repo/database';
import { readBearerToken, verifyMobileToken } from './mobile-jwt';

/** Minimal session shape shared across web (next-auth) and native. */
export interface SessionUser {
  id: string;
  email?: string | null;
  name?: string | null;
  /** Platform admin (Church Stack /admin). */
  isAdmin?: boolean;
}

export interface Session {
  user?: SessionUser | null;
}

type HeaderBag = Headers | Record<string, string | string[] | undefined> | undefined;

export interface CreateContextOptions {
  headers?: HeaderBag;
  /** When set (including `null`), skips Bearer JWT resolution. */
  session?: Session | null;
}

function readHeader(headers: HeaderBag, key: string): string | null {
  if (!headers) return null;
  if (headers instanceof Headers) {
    return headers.get(key);
  }
  const value = headers[key] ?? headers[key.toLowerCase()];
  if (Array.isArray(value)) return value[0] ?? null;
  return value ?? null;
}

async function sessionFromHeaders(headers: HeaderBag): Promise<Session | null> {
  const token = readBearerToken(readHeader(headers, 'authorization'));
  if (!token) return null;
  return verifyMobileToken(token);
}

/**
 * Builds the tRPC context. The tenant is passed in via headers:
 *   - `x-church-id`   (preferred, when the client already knows the id)
 *   - `x-church-slug` (resolved to an id by `tenantProcedure`)
 *
 * Session comes from `opts.session` (web NextAuth cookie) when provided;
 * otherwise from `Authorization: Bearer <mobile JWT>`.
 */
export async function createContext(opts: CreateContextOptions = {}) {
  const session =
    opts.session !== undefined ? opts.session : await sessionFromHeaders(opts.headers);

  return {
    prisma,
    session,
    churchId: readHeader(opts.headers, 'x-church-id'),
    churchSlug: readHeader(opts.headers, 'x-church-slug'),
  };
}

export type Context = Awaited<ReturnType<typeof createContext>>;
