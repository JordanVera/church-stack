/**
 * Platform engineer gate for /dev (and tRPC `devProcedure`).
 *
 * No DB column — allowlist via `PLATFORM_DEV_EMAILS` (comma-separated).
 * If the allowlist is empty, access requires `ALLOW_DEV_CONSOLE=true`
 * (intended for local development).
 */
export function isPlatformDev(email: string | null | undefined): boolean {
  if (!email) return false;

  const allowlist = (process.env.PLATFORM_DEV_EMAILS ?? '')
    .split(',')
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);

  if (allowlist.length > 0) {
    return allowlist.includes(email.toLowerCase());
  }

  return process.env.ALLOW_DEV_CONSOLE === 'true';
}
