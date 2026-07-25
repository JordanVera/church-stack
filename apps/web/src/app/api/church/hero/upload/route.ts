import { NextResponse } from 'next/server';
import { handleUpload, type HandleUploadBody } from '@vercel/blob/client';
import { assertChurchAdmin } from '@repo/api';
import { prisma } from '@repo/database';
import { auth } from '@/auth';

export const runtime = 'nodejs';

const ALLOWED_CONTENT_TYPES = [
  'image/png',
  'image/jpeg',
  'image/webp',
  'video/mp4',
  'video/webm',
] as const;

const MAX_SIZE = 40 * 1024 * 1024;

export async function POST(request: Request) {
  const body = (await request.json()) as HandleUploadBody;

  try {
    const jsonResponse = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async (_pathname, clientPayload) => {
        const session = await auth();
        if (!session?.user?.id) {
          throw new Error('Unauthorized');
        }

        let churchId = '';
        try {
          const parsed = clientPayload ? (JSON.parse(clientPayload) as { churchId?: string }) : null;
          churchId = parsed?.churchId?.trim() ?? '';
        } catch {
          throw new Error('Invalid upload payload');
        }
        if (!churchId) {
          throw new Error('churchId is required');
        }

        const church = await assertChurchAdmin({ prisma, session }, churchId);

        return {
          allowedContentTypes: [...ALLOWED_CONTENT_TYPES],
          maximumSizeInBytes: MAX_SIZE,
          addRandomSuffix: false,
          tokenPayload: JSON.stringify({ churchId: church.id }),
        };
      },
    });

    return NextResponse.json(jsonResponse);
  } catch (err) {
    console.error('[church/hero/upload]', err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Upload failed' },
      { status: 400 }
    );
  }
}
