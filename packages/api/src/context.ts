import { prisma } from '@repo/database';

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

/**
 * Builds the tRPC context. The tenant is passed in via headers:
 *   - `x-church-id`   (preferred, when the client already knows the id)
 *   - `x-church-slug` (resolved to an id by `tenantProcedure`)
 */
export async function createContext(opts: CreateContextOptions = {}) {
  return {
    prisma,
    session: opts.session ?? null,
    churchId: readHeader(opts.headers, 'x-church-id'),
    churchSlug: readHeader(opts.headers, 'x-church-slug'),
  };
}

export type Context = Awaited<ReturnType<typeof createContext>>;
