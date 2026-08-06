'use client';

import { Suspense, use, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { toast } from 'sonner';
import { ChurchDashboardProvider } from '@/components/dashboard/ChurchDashboardProvider';
import { trpc } from '@/lib/trpc-client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const CATEGORIES = [
  { value: 'GENERAL', label: 'General question' },
  { value: 'WEBSITE', label: 'Website / domain' },
  { value: 'MOBILE', label: 'Mobile apps' },
  { value: 'PLANNING_CENTER', label: 'Planning Center' },
  { value: 'BILLING', label: 'Billing' },
  { value: 'OTHER', label: 'Other' },
] as const;

type Category = (typeof CATEGORIES)[number]['value'];

function parseCategory(value: string | null): Category {
  if (CATEGORIES.some((c) => c.value === value)) return value as Category;
  return 'GENERAL';
}

function categoryLabel(value: string) {
  return CATEGORIES.find((c) => c.value === value)?.label ?? value;
}

function SupportPanel({ churchId }: { churchId: string }) {
  const searchParams = useSearchParams();
  const utils = trpc.useUtils();
  const list = trpc.support.listForChurch.useQuery({ churchId });

  const [category, setCategory] = useState<Category>(parseCategory(searchParams.get('category')));
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');

  const submit = trpc.support.submit.useMutation({
    onSuccess: async (data) => {
      if (data.emailSent) {
        toast.success('Message sent', {
          description: 'Our team will reply to your account email.',
        });
      } else {
        toast.success('Message saved', {
          description:
            data.emailSkippedReason === 'missing_api_key'
              ? 'Email delivery is not configured yet — our team will still see your message in admin.'
              : 'We saved your message but could not send the email notification. Our team will still see it in admin.',
        });
      }
      setSubject('');
      setMessage('');
      await utils.support.listForChurch.invalidate({ churchId });
    },
    onError: (err) => toast.error(err.message),
  });

  return (
    <div className="space-y-8">
      <div>
        <h2 className="font-display text-2xl font-bold text-ink-900 dark:text-white">Support</h2>
        <p className="mt-1 text-sm text-ink-600 dark:text-ink-300">
          Questions about your site, apps, Planning Center, or billing? Send us a message — we
          typically reply within one business day.
        </p>
      </div>

      <Card className="border-ink-200 dark:border-ink-800 dark:bg-ink-900">
        <CardHeader>
          <CardTitle className="text-base">Contact Gatherly Stack</CardTitle>
          <CardDescription>
            Your message is saved in our system and emailed to our support team.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="support-category">Topic</Label>
            <select
              id="support-category"
              className="mt-1 h-10 w-full rounded-lg border border-ink-200 bg-white px-3 text-sm dark:border-ink-700 dark:bg-ink-950"
              value={category}
              onChange={(e) => setCategory(e.target.value as Category)}
            >
              {CATEGORIES.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <Label htmlFor="support-subject">Subject</Label>
            <Input
              id="support-subject"
              className="mt-1 h-10"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Brief summary of your question"
              maxLength={200}
            />
          </div>
          <div>
            <Label htmlFor="support-message">Message</Label>
            <textarea
              id="support-message"
              className="mt-1 min-h-36 w-full rounded-lg border border-ink-200 bg-white px-3 py-2 text-sm dark:border-ink-700 dark:bg-ink-950"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Tell us what you need help with…"
              maxLength={8000}
            />
          </div>
          <Button
            disabled={submit.isPending || !subject.trim() || !message.trim()}
            onClick={() =>
              submit.mutate({
                churchId,
                category,
                subject: subject.trim(),
                message: message.trim(),
              })
            }
          >
            {submit.isPending ? 'Sending…' : 'Send message'}
          </Button>
        </CardContent>
      </Card>

      <Card className="border-ink-200 dark:border-ink-800 dark:bg-ink-900">
        <CardHeader>
          <CardTitle className="text-base">Your requests</CardTitle>
          <CardDescription>Previous messages sent from this church.</CardDescription>
        </CardHeader>
        <CardContent className="px-5 py-5">
          {list.isLoading ? (
            <p className="text-sm text-ink-500">Loading…</p>
          ) : !list.data?.length ? (
            <p className="text-sm text-ink-500">No support messages yet.</p>
          ) : (
            <ul className="divide-y divide-ink-200 dark:divide-ink-800">
              {list.data.map((item: (typeof list.data)[number]) => (
                <li key={item.id} className="py-4 first:pt-0 last:pb-0">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="font-semibold text-ink-900 dark:text-white">{item.subject}</p>
                      <p className="mt-0.5 text-xs text-ink-500">
                        {categoryLabel(item.category)} ·{' '}
                        {new Date(item.createdAt).toLocaleString()}
                      </p>
                    </div>
                    <Badge
                      variant="outline"
                      className={
                        item.status === 'OPEN'
                          ? 'border-amber-300 text-amber-800 dark:border-amber-700 dark:text-amber-300'
                          : 'border-ink-300 text-ink-600 dark:border-ink-600 dark:text-ink-300'
                      }
                    >
                      {item.status === 'OPEN' ? 'Open' : 'Resolved'}
                    </Badge>
                  </div>
                  <p className="mt-3 whitespace-pre-wrap text-sm text-ink-600 dark:text-ink-300">
                    {item.message}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function SupportPageInner({ slug }: { slug: string }) {
  return (
    <ChurchDashboardProvider slug={slug}>
      {({ churchId }) => <SupportPanel churchId={churchId} />}
    </ChurchDashboardProvider>
  );
}

export default function SupportPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  return (
    <Suspense
      fallback={
        <div className="px-6 py-10 text-sm text-ink-500 dark:text-ink-400">Loading support…</div>
      }
    >
      <SupportPageInner slug={slug} />
    </Suspense>
  );
}
