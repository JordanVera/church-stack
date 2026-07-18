'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { signIn } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const res = await signIn('credentials', { email, password, redirect: false });
    setLoading(false);
    if (res?.error) {
      setError('Invalid email or password.');
      return;
    }
    router.push('/dashboard');
  };

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-md flex-col justify-center px-6">
      <Card className="border-ink-200 shadow-sm dark:border-ink-800">
        <CardHeader className="px-6">
          <CardTitle className="font-display text-3xl font-bold tracking-tight text-ink-900 dark:text-white">
            Welcome back
          </CardTitle>
          <CardDescription className="text-ink-600 dark:text-ink-300">
            Log in to your Church Stack account.
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
      </Card>

      <p className="mt-6 text-center text-sm text-ink-600 dark:text-ink-300">
        Don’t have an account?{' '}
        <Link href="/signup" className="font-semibold text-brand-600 hover:text-brand-500 dark:text-brand-400">
          Sign up
        </Link>
      </p>
    </div>
  );
}
