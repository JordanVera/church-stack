'use client';

import { Suspense, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { trpc } from '@/lib/trpc-client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tokenFromUrl = searchParams.get('token')?.trim() ?? '';
  const [token, setToken] = useState(tokenFromUrl);
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const resetPassword = trpc.auth.resetPassword.useMutation();

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }
    if (password !== confirm) {
      setError('Passwords do not match.');
      return;
    }
    try {
      await resetPassword.mutateAsync({ token: token.trim(), password });
      setDone(true);
      window.setTimeout(() => router.push('/login'), 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong.');
    }
  };

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-md flex-col justify-center px-6">
      <Card className="border-ink-200 shadow-sm dark:border-ink-800">
        <CardHeader className="px-6">
          <CardTitle className="font-display text-3xl font-bold tracking-tight text-ink-900 dark:text-white">
            Reset password
          </CardTitle>
          <CardDescription className="text-ink-600 dark:text-ink-300">
            {done ? 'Your password was updated. Redirecting to sign in…' : 'Choose a new password.'}
          </CardDescription>
        </CardHeader>

        <CardContent className="px-6">
          {done ? (
            <Link
              href="/login"
              className="inline-flex h-10 w-full items-center justify-center rounded-lg bg-primary px-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/80"
            >
              Continue to sign in
            </Link>
          ) : (
            <form onSubmit={onSubmit} className="space-y-4">
              {!tokenFromUrl ? (
                <div>
                  <Label htmlFor="token" className="mb-1 text-ink-700 dark:text-ink-300">
                    Reset code
                  </Label>
                  <Input
                    id="token"
                    required
                    value={token}
                    onChange={(e) => setToken(e.target.value)}
                    className="h-10 focus-visible:border-brand-500 focus-visible:ring-brand-200 dark:focus-visible:ring-brand-500/30"
                  />
                </div>
              ) : null}
              <div>
                <Label htmlFor="password" className="mb-1 text-ink-700 dark:text-ink-300">
                  New password
                </Label>
                <Input
                  id="password"
                  type="password"
                  required
                  minLength={8}
                  autoComplete="new-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-10 focus-visible:border-brand-500 focus-visible:ring-brand-200 dark:focus-visible:ring-brand-500/30"
                />
              </div>
              <div>
                <Label htmlFor="confirm" className="mb-1 text-ink-700 dark:text-ink-300">
                  Confirm password
                </Label>
                <Input
                  id="confirm"
                  type="password"
                  required
                  minLength={8}
                  autoComplete="new-password"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  className="h-10 focus-visible:border-brand-500 focus-visible:ring-brand-200 dark:focus-visible:ring-brand-500/30"
                />
              </div>
              {error ? <p className="text-sm text-red-600 dark:text-red-400">{error}</p> : null}
              <Button
                type="submit"
                disabled={resetPassword.isPending || !token.trim() || !password}
                className="h-10 w-full font-semibold"
              >
                {resetPassword.isPending ? 'Saving…' : 'Update password'}
              </Button>
            </form>
          )}
        </CardContent>
      </Card>

      <p className="mt-6 text-center text-sm text-ink-600 dark:text-ink-300">
        <Link
          href="/login"
          className="font-semibold text-brand-600 hover:text-brand-500 dark:text-brand-400"
        >
          Back to sign in
        </Link>
      </p>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-md px-6 py-20 text-ink-600 dark:text-ink-300">Loading…</div>
      }
    >
      <ResetPasswordForm />
    </Suspense>
  );
}
