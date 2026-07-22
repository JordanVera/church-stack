'use client';

import { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { signIn, signOut } from 'next-auth/react';
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
  CardFooter,
} from '@/components/ui/card';

function safeCallbackUrl(value: string | null) {
  if (!value || !value.startsWith('/') || value.startsWith('//')) return '/dashboard';
  return value;
}

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = safeCallbackUrl(searchParams.get('callbackUrl'));
  const utils = trpc.useUtils();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const res = await signIn('credentials', { email, password, redirect: false });
    if (res?.error) {
      setLoading(false);
      setError('Invalid email or password.');
      return;
    }

    try {
      const billingReturn = callbackUrl.startsWith('/billing/');
      if (!billingReturn) {
        const me = await utils.auth.me.fetch();
        const allowed = Boolean(
          me?.isAdmin || me?.isDev || (me?.memberships && me.memberships.length > 0)
        );
        if (!allowed) {
          await signOut({ redirect: false });
          setError(
            'No church access on this account. Register your church from pricing, or use a staff account.'
          );
          setLoading(false);
          return;
        }
      }
      router.push(callbackUrl);
    } catch {
      await signOut({ redirect: false });
      setError('Unable to verify access.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-md flex-col justify-center px-6">
      <Card className="border-ink-200 shadow-sm dark:border-ink-800">
        <CardHeader className="px-6">
          <CardTitle className="font-display text-3xl font-bold tracking-tight text-ink-900 dark:text-white">
            Sign in
          </CardTitle>
          <CardDescription className="text-ink-600 dark:text-ink-300">
            Church owners and Church Stack staff. New churches start from pricing.
          </CardDescription>
        </CardHeader>

        <CardContent className="px-6">
          <form onSubmit={onSubmit} className="space-y-4">
            <div>
              <Label htmlFor="email" className="mb-1 text-ink-700 dark:text-ink-300">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-10 focus-visible:border-brand-500 focus-visible:ring-brand-200 dark:focus-visible:ring-brand-500/30"
              />
            </div>
            <div>
              <Label htmlFor="password" className="mb-1 text-ink-700 dark:text-ink-300">
                Password
              </Label>
              <Input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="h-10 focus-visible:border-brand-500 focus-visible:ring-brand-200 dark:focus-visible:ring-brand-500/30"
              />
            </div>
            {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}
            <Button type="submit" disabled={loading} className="h-10 w-full font-semibold">
              {loading ? 'Logging in…' : 'Log in'}
            </Button>
          </form>
        </CardContent>

        <CardFooter className="flex flex-col items-center justify-center gap-3 text-sm text-yellow-300">
          <div className="flex flex-col items-center gap-0.5">
            <p className="font-medium text-yellow-200">Platform</p>
            <p>admin@churchstack.example</p>
            <p>password123</p>
          </div>
          <div className="flex flex-col items-center gap-0.5">
            <p className="font-medium text-yellow-200">Grace Community Church</p>
            <p>admin@gracechurch.example</p>
            <p>password123</p>
          </div>
          <div className="flex flex-col items-center gap-0.5">
            <p className="font-medium text-yellow-200">Hillside Fellowship</p>
            <p>admin@hillside.example</p>
            <p>password123</p>
          </div>
          <div className="flex flex-col items-center gap-0.5">
            <p className="font-medium text-yellow-200">Harbor Church</p>
            <p>admin@harbor.example</p>
            <p>password123</p>
          </div>
        </CardFooter>
      </Card>

      <p className="mt-6 text-center text-sm text-ink-600 dark:text-ink-300">
        Registering a church?{' '}
        <Link
          href="/pricing"
          className="font-semibold text-brand-600 hover:text-brand-500 dark:text-brand-400"
        >
          Start church signup
        </Link>
      </p>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-md px-6 py-20 text-ink-600 dark:text-ink-300">Loading…</div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
