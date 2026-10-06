export const DEFAULT_POST_LOGIN_PATH = '/dashboard';

export function safeCallbackUrl(value: string | null) {
  if (!value || !value.startsWith('/') || value.startsWith('//')) {
    return DEFAULT_POST_LOGIN_PATH;
  }
  return value;
}

/** Platform admins land on /admin unless a specific callback was requested. */
export function resolvePostLoginRedirect(
  callbackUrl: string,
  user: { isAdmin?: boolean | null }
) {
  if (user.isAdmin && callbackUrl === DEFAULT_POST_LOGIN_PATH) {
    return '/admin';
  }
  return callbackUrl;
}
