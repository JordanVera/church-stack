import { NextResponse } from 'next/server';
import { del, put } from '@vercel/blob';
import { TRPCError } from '@trpc/server';
import { assertChurchAdmin } from '@repo/api';
import { prisma } from '@repo/database';
import { auth } from '@/auth';

export const runtime = 'nodejs';

const MAX_BYTES = 2 * 1024 * 1024;
const ALLOWED_TYPES = new Set([
  'image/png',
  'image/jpeg',
  'image/webp',
  'image/svg+xml',
]);

function extForMime(mime: string): string {
  switch (mime) {
    case 'image/png':
      return 'png';
    case 'image/jpeg':
      return 'jpg';
    case 'image/webp':
      return 'webp';
    case 'image/svg+xml':
      return 'svg';
    default:
      return 'bin';
  }
}

function isVercelBlobUrl(url: string | null | undefined): boolean {
  if (!url) return false;
  try {
    const host = new URL(url).hostname;
    return host.endsWith('.public.blob.vercel-storage.com') || host.endsWith('.blob.vercel-storage.com');
  } catch {
    return false;
  }
}

async function safeDeleteBlob(url: string | null | undefined) {
  if (!isVercelBlobUrl(url) || !url) return;
  try {
    await del(url);
  } catch (err) {
    console.error('[church/logo] failed to delete previous blob', err);
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
  console.error('[church/logo]', err);
  return NextResponse.json({ ok: false, error: 'Upload failed' }, { status: 500 });
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
    }

    const form = await req.formData();
    const churchId = String(form.get('churchId') ?? '').trim();
    const file = form.get('file');

    if (!churchId) {
      return NextResponse.json({ ok: false, error: 'churchId is required' }, { status: 400 });
    }
    if (!(file instanceof File)) {
      return NextResponse.json({ ok: false, error: 'file is required' }, { status: 400 });
    }
    if (!ALLOWED_TYPES.has(file.type)) {
      return NextResponse.json(
        { ok: false, error: 'Use PNG, JPEG, WebP, or SVG.' },
        { status: 400 }
      );
    }
    if (file.size <= 0 || file.size > MAX_BYTES) {
      return NextResponse.json(
        { ok: false, error: 'Logo must be under 2MB.' },
        { status: 400 }
      );
    }
    if (!process.env.BLOB_READ_WRITE_TOKEN) {
      return NextResponse.json(
        { ok: false, error: 'Blob storage is not configured (BLOB_READ_WRITE_TOKEN).' },
        { status: 503 }
      );
    }

    const church = await assertChurchAdmin({ prisma, session }, churchId);
    const previousUrl = church.logoUrl;
    const pathname = `churches/${church.slug}/logo-${crypto.randomUUID()}.${extForMime(file.type)}`;

    const blob = await put(pathname, file, {
      access: 'public',
      addRandomSuffix: false,
      contentType: file.type,
    });

    const updated = await prisma.church.update({
      where: { id: church.id },
      data: { logoUrl: blob.url },
      select: { id: true, slug: true, logoUrl: true },
    });

    await safeDeleteBlob(previousUrl);

    return NextResponse.json({ ok: true, logoUrl: updated.logoUrl });
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
    const previousUrl = church.logoUrl;

    await prisma.church.update({
      where: { id: church.id },
      data: { logoUrl: null },
    });

    await safeDeleteBlob(previousUrl);

    return NextResponse.json({ ok: true, logoUrl: null });
  } catch (err) {
    return errorResponse(err);
  }
}
