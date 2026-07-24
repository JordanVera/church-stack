import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import * as SecureStore from 'expo-secure-store';
import type { inferRouterOutputs } from '@trpc/server';
import type { AppRouter } from '@repo/api';
import { trpc } from '../lib/trpc';
import { sessionStore } from '../lib/session-store';
import { tenantStore } from '../lib/tenant-store';

const TOKEN_KEY = 'churchstack.auth.token';

type Me = NonNullable<inferRouterOutputs<AppRouter>['auth']['me']>;

type AuthUser = {
  id: string;
  email: string | null;
  name: string | null;
};

interface AuthContextValue {
  token: string | null;
  user: AuthUser | null;
  /** SecureStore hydrate finished. */
  isReady: boolean;
  /** Signed in and auth.me settled successfully. */
  isAuthenticated: boolean;
  meLoading: boolean;
  memberships: Me['memberships'] | undefined;
  me: Me | null | undefined;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (name: string, email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  refreshMe: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isReady, setIsReady] = useState(false);
  const utils = trpc.useUtils();

  const loginMutation = trpc.auth.login.useMutation();
  const registerMutation = trpc.auth.register.useMutation();

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const stored = await SecureStore.getItemAsync(TOKEN_KEY);
        if (cancelled) return;
        if (stored) {
          sessionStore.set(stored);
          setToken(stored);
        }
      } finally {
        if (!cancelled) setIsReady(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const meQuery = trpc.auth.me.useQuery(undefined, {
    enabled: isReady && !!token,
    retry: false,
  });

  useEffect(() => {
    if (!token || !meQuery.isFetched) return;
    if (meQuery.isError || meQuery.data === null) {
      void (async () => {
        sessionStore.set(null);
        await SecureStore.deleteItemAsync(TOKEN_KEY);
        setToken(null);
        setUser(null);
      })();
      return;
    }
    if (meQuery.data) {
      setUser({
        id: meQuery.data.id,
        email: meQuery.data.email,
        name: meQuery.data.name,
      });
    }
  }, [token, meQuery.isFetched, meQuery.isError, meQuery.data]);

  const persistToken = useCallback(async (next: string, nextUser: AuthUser) => {
    sessionStore.set(next);
    await SecureStore.setItemAsync(TOKEN_KEY, next);
    setToken(next);
    setUser(nextUser);
  }, []);

  const signIn = useCallback(
    async (email: string, password: string) => {
      const result = await loginMutation.mutateAsync({ email, password });
      await persistToken(result.token, {
        id: result.user.id,
        email: result.user.email,
        name: result.user.name,
      });
      await utils.auth.me.invalidate();
    },
    [loginMutation, persistToken, utils.auth.me]
  );

  const signUp = useCallback(
    async (name: string, email: string, password: string) => {
      await registerMutation.mutateAsync({ name, email, password });
      await signIn(email, password);
    },
    [registerMutation, signIn]
  );

  const signOut = useCallback(async () => {
    sessionStore.set(null);
    tenantStore.set(null);
    await SecureStore.deleteItemAsync(TOKEN_KEY);
    setToken(null);
    setUser(null);
    utils.auth.me.setData(undefined, undefined);
  }, [utils.auth.me]);

  const refreshMe = useCallback(async () => {
    await utils.auth.me.invalidate();
    await utils.auth.me.fetch();
  }, [utils.auth.me]);

  const value = useMemo<AuthContextValue>(
    () => ({
      token,
      user,
      isReady,
      isAuthenticated: !!token && !!meQuery.data,
      meLoading: !!token && (meQuery.isLoading || (!meQuery.isFetched && !meQuery.isError)),
      memberships: meQuery.data?.memberships,
      me: meQuery.data,
      signIn,
      signUp,
      signOut,
      refreshMe,
    }),
    [
      token,
      user,
      isReady,
      meQuery.data,
      meQuery.isLoading,
      meQuery.isFetched,
      meQuery.isError,
      signIn,
      signUp,
      signOut,
      refreshMe,
    ]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}
