import { NextResponse } from 'next/server';
import { del } from '@vercel/blob';
import { TRPCError } from '@trpc/server';
import { assertChurchAdmin } from '@repo/api';
import { prisma } from '@repo/database';
import { auth } from '@/auth';

export const runtime = 'nodejs';

const IMAGE_TYPES = new Set(['image/png', 'image/jpeg', 'image/webp']);
const VIDEO_TYPES = new Set(['video/mp4', 'video/webm']);

type HeroMediaKind = 'IMAGE' | 'VIDEO';

function mediaTypeForMime(mime: string): HeroMediaKind | null {
  if (IMAGE_TYPES.has(mime)) return 'IMAGE';
  if (VIDEO_TYPES.has(mime)) return 'VIDEO';
  return null;
}

function isVercelBlobUrl(url: string | null | undefined): boolean {
  if (!url) return false;
  try {
    const host = new URL(url).hostname;
    return (
      host.endsWith('.public.blob.vercel-storage.com') || host.endsWith('.blob.vercel-storage.com')
    );
  } catch {
    return false;
  }
}

async function safeDeleteBlob(url: string | null | undefined) {
  if (!isVercelBlobUrl(url) || !url) return;
  try {
    await del(url);
  } catch (err) {
    console.error('[church/hero] failed to delete previous blob', err);
  }
}

function errorResponse(err: unknown) {
  if (err instanceof TRPCError) {
    const status =
      err.code === 'UNAUTHORIZED'
        ? 401
        : err.code === 'FORBIDDEN'
          ? 403
          : err.code === 'NOT_FOUND'
            ? 404
            : 400;
    return NextResponse.json({ ok: false, error: err.message }, { status });
  }
  console.error('[church/hero]', err);
  return NextResponse.json({ ok: false, error: 'Request failed' }, { status: 500 });
}

/** Attach a client-uploaded blob URL as the church hero media. */
export async function PUT(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
    }

    const body = (await req.json().catch(() => null)) as {
      churchId?: string;
      url?: string;
      contentType?: string;
    } | null;

    const churchId = body?.churchId?.trim();
    const url = body?.url?.trim();
    const contentType = body?.contentType?.trim() ?? '';

    if (!churchId) {
      return NextResponse.json({ ok: false, error: 'churchId is required' }, { status: 400 });
    }
    if (!url || !isVercelBlobUrl(url)) {
      return NextResponse.json(
        { ok: false, error: 'A valid blob url is required' },
        { status: 400 }
      );
    }

    const heroMediaType = mediaTypeForMime(contentType);
    if (!heroMediaType) {
      return NextResponse.json(
        { ok: false, error: 'Use PNG, JPEG, WebP, MP4, or WebM.' },
        { status: 400 }
      );
    }

    const church = await assertChurchAdmin({ prisma, session }, churchId);
    if (!url.includes(`/churches/${church.slug}/hero-`)) {
      return NextResponse.json({ ok: false, error: 'Invalid hero media url' }, { status: 400 });
    }

    const previousUrl = church.heroMediaUrl;

    const updated = await prisma.church.update({
      where: { id: church.id },
      data: { heroMediaUrl: url, heroMediaType },
      select: { id: true, slug: true, heroMediaUrl: true, heroMediaType: true },
    });

    if (previousUrl && previousUrl !== url) {
      await safeDeleteBlob(previousUrl);
    }

    return NextResponse.json({
      ok: true,
      heroMediaUrl: updated.heroMediaUrl,
      heroMediaType: updated.heroMediaType,
    });
  } catch (err) {
    return errorResponse(err);
  }
}

export async function DELETE(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
    }

    const body = (await req.json().catch(() => null)) as { churchId?: string } | null;
    const churchId = body?.churchId?.trim();
    if (!churchId) {
      return NextResponse.json({ ok: false, error: 'churchId is required' }, { status: 400 });
    }

    const church = await assertChurchAdmin({ prisma, session }, churchId);
    const previousUrl = church.heroMediaUrl;

    await prisma.church.update({
      where: { id: church.id },
      data: { heroMediaUrl: null, heroMediaType: null },
    });

    await safeDeleteBlob(previousUrl);

    return NextResponse.json({ ok: true, heroMediaUrl: null, heroMediaType: null });
  } catch (err) {
    return errorResponse(err);
  }
}
