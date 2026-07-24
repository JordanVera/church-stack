/**
 * Module-level Bearer token so the tRPC client's `headers` function can
 * attach Authorization without React context.
 */
let currentToken: string | null = null;

export const sessionStore = {
  get: () => currentToken,
  set: (token: string | null) => {
    currentToken = token;
  },
};
