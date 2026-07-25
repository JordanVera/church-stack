'use client';

import { useState } from 'react';
import Link from 'next/link';
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

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);
  const requestReset = trpc.auth.requestPasswordReset.useMutation();

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      await requestReset.mutateAsync({ email: email.trim() });
      setSent(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong.');
    }
  };

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-md flex-col justify-center px-6">
      <Card className="border-ink-200 shadow-sm dark:border-ink-800">
        <CardHeader className="px-6">
          <CardTitle className="font-display text-3xl font-bold tracking-tight text-ink-900 dark:text-white">
            Forgot password
          </CardTitle>
          <CardDescription className="text-ink-600 dark:text-ink-300">
            {sent
              ? 'If an account exists for that email, we sent a reset link.'
              : 'Enter your email and we will send a link to reset your password.'}
          </CardDescription>
        </CardHeader>

        <CardContent className="px-6">
          {sent ? (
            <div className="space-y-4">
              <p className="text-sm text-ink-600 dark:text-ink-300">
                Check your inbox (and spam). The link expires in one hour.
              </p>
              <Link
                href="/login"
                className="inline-flex h-10 w-full items-center justify-center rounded-lg bg-primary px-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/80"
              >
                Back to sign in
              </Link>
            </div>
          ) : (
            <form onSubmit={onSubmit} className="space-y-4">
              <div>
                <Label htmlFor="email" className="mb-1 text-ink-700 dark:text-ink-300">
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-10 focus-visible:border-brand-500 focus-visible:ring-brand-200 dark:focus-visible:ring-brand-500/30"
                />
              </div>
              {error ? <p className="text-sm text-red-600 dark:text-red-400">{error}</p> : null}
              <Button
                type="submit"
                disabled={requestReset.isPending || !email.trim()}
                className="h-10 w-full font-semibold"
              >
                {requestReset.isPending ? 'Sending…' : 'Send reset link'}
              </Button>
            </form>
          )}
        </CardContent>
      </Card>

      <p className="mt-6 text-center text-sm text-ink-600 dark:text-ink-300">
        Remembered it?{' '}
        <Link
          href="/login"
          className="font-semibold text-brand-600 hover:text-brand-500 dark:text-brand-400"
        >
          Sign in
        </Link>
      </p>
    </div>
  );
}
