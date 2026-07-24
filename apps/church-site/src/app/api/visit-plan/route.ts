import { NextResponse } from 'next/server';
import { createTRPCProxyClient, httpBatchLink } from '@trpc/client';
import type { AppRouter } from '@repo/api';

export const runtime = 'nodejs';

function apiBase(): string {
  const raw =
    process.env.PLATFORM_API_URL?.replace(/\/$/, '') ??
    process.env.NEXTAUTH_URL?.replace(/\/$/, '') ??
    'http://localhost:3000';
  // Allow PLATFORM_API_URL to be either origin or full …/api/trpc.
  return raw.endsWith('/api/trpc') ? raw : `${raw}/api/trpc`;
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      slug?: string;
      firstName?: string;
      lastName?: string;
      email?: string;
      phone?: string | null;
      visitDate?: string;
      locationId?: string | null;
      serviceId?: string | null;
      notes?: string | null;
    };

    const slug = body.slug?.trim() || process.env.CHURCH_SLUG?.trim();
    if (!slug) {
      return NextResponse.json({ ok: false, error: 'Missing church slug' }, { status: 400 });
    }

    const client = createTRPCProxyClient<AppRouter>({
      links: [httpBatchLink({ url: apiBase() })],
    });

    const result = await client.visitPlans.submit.mutate({
      slug,
      firstName: body.firstName ?? '',
      lastName: body.lastName ?? '',
      email: body.email ?? '',
      phone: body.phone ?? null,
      visitDate: body.visitDate ?? '',
      locationId: body.locationId ?? null,
      serviceId: body.serviceId ?? null,
      notes: body.notes ?? null,
    });

    return NextResponse.json({ ok: true, id: result.id });
  } catch (err) {
    const message =
      err && typeof err === 'object' && 'message' in err && typeof err.message === 'string'
        ? err.message
        : 'Could not submit visit plan';
    console.error('[visit-plan]', err);
    return NextResponse.json({ ok: false, error: message }, { status: 400 });
  }
}
