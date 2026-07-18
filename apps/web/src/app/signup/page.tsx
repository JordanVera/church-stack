'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { signIn } from 'next-auth/react';
import { trpc } from '@/lib/trpc-client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

export default function SignupPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  const register = trpc.auth.register.useMutation();

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      await register.mutateAsync({ name, email, password });
      const res = await signIn('credentials', { email, password, redirect: false });
      if (res?.error) {
        router.push('/login');
        return;
      }
      router.push('/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong.');
    }
  };

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-md flex-col justify-center px-6">
      <Card className="border-ink-200 shadow-sm dark:border-ink-800">
        <CardHeader className="px-6">
          <CardTitle className="font-display text-3xl font-bold tracking-tight text-ink-900 dark:text-white">
            Create your account
          </CardTitle>
          <CardDescription className="text-ink-600 dark:text-ink-300">
            Start building church apps today.
          </CardDescription>
        </CardHeader>

        <CardContent className="px-6">
          <form onSubmit={onSubmit} className="space-y-4">
            <div>
              <Label htmlFor="name" className="mb-1 text-ink-700 dark:text-ink-300">
                Name
              </Label>
              <Input
                id="name"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="h-10 focus-visible:border-brand-500 focus-visible:ring-brand-200 dark:focus-visible:ring-brand-500/30"
              />
            </div>
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
                minLength={8}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="h-10 focus-visible:border-brand-500 focus-visible:ring-brand-200 dark:focus-visible:ring-brand-500/30"
              />
              <p className="mt-1 text-xs text-ink-500 dark:text-ink-400">At least 8 characters.</p>
            </div>
            {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}
            <Button type="submit" disabled={register.isPending} className="h-10 w-full font-semibold">
              {register.isPending ? 'Creating account…' : 'Create account'}
            </Button>
          </form>
        </CardContent>
      </Card>

      <p className="mt-6 text-center text-sm text-ink-600 dark:text-ink-300">
        Already have an account?{' '}
        <Link href="/login" className="font-semibold text-brand-600 hover:text-brand-500 dark:text-brand-400">
          Log in
        </Link>
      </p>
    </div>
  );
}
