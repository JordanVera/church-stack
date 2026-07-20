import type { Church, MobilePlan, PrismaClient } from '@repo/database';

export type MobilePlanResult = {
  church: Church;
};

export type WhiteLabelBuildResult = {
  ok: boolean;
  church: Church;
  error?: string;
  manualCommand?: string;
  expoDashboardUrl?: string;
};

export async function setMobilePlan(
  prisma: PrismaClient,
  churchId: string,
  plan: MobilePlan
): Promise<MobilePlanResult> {
  const church = await prisma.church.update({
    where: { id: churchId },
    data: {
      mobilePlan: plan,
      mobileBuildStatus: plan === 'SHARED' ? 'NONE' : undefined,
    },
  });
  return { church };
}

function buildManualEasCommand(church: Church): string {
  const slug = church.slug;
  const safeName = church.name.replace(/"/g, '\\"');
  return [
    `EXPO_PUBLIC_TENANT=${slug}`,
    `EXPO_PUBLIC_APP_NAME="${safeName}"`,
    `EXPO_PUBLIC_APP_SLUG=cs-${slug}`,
    `EXPO_PUBLIC_APP_SCHEME=cs${slug.replace(/-/g, '')}`,
    `EXPO_PUBLIC_IOS_BUNDLE_ID=com.churchstack.${slug.replace(/-/g, '')}`,
    `EXPO_PUBLIC_ANDROID_PACKAGE=com.churchstack.${slug.replace(/-/g, '')}`,
    'eas build --profile whitelabel --platform all',
  ].join(' \\\n  ');
}

/**
 * Mark a church for white-label and queue a build.
 *
 * Full Expo GraphQL automation needs an EAS project + token wiring that varies
 * by org; v1 updates status and returns the exact local command / dashboard
 * link. When `EXPO_TOKEN` is set we attempt a best-effort build create via the
 * Expo REST-ish GraphQL endpoint.
 */
export async function queueWhiteLabelBuild(
  prisma: PrismaClient,
  church: Church
): Promise<WhiteLabelBuildResult> {
  const manualCommand = buildManualEasCommand(church);
  const expoDashboardUrl = process.env.EAS_PROJECT_ID
    ? `https://expo.dev/accounts/_/projects/${process.env.EAS_PROJECT_ID}/builds`
    : 'https://expo.dev';

  await prisma.church.update({
    where: { id: church.id },
    data: {
      mobilePlan: 'WHITELABEL',
      mobileBuildStatus: 'QUEUED',
    },
  });

  const token = process.env.EXPO_TOKEN;
  const projectId = process.env.EAS_PROJECT_ID;

  if (!token || !projectId) {
    const updated = await prisma.church.findUniqueOrThrow({ where: { id: church.id } });
    return {
      ok: true,
      church: updated,
      manualCommand,
      expoDashboardUrl,
      error:
        'Build queued in DB. Set EXPO_TOKEN + EAS_PROJECT_ID to trigger EAS from /dev, or run the manual command.',
    };
  }

  try {
    const res = await fetch('https://api.expo.dev/graphql', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: `
          mutation CreateBuild($input: BuildInput!) {
            build {
              createBuild(buildInput: $input) {
                id
                status
              }
            }
          }
        `,
        variables: {
          input: {
            projectId,
            platform: 'ALL',
            buildProfile: 'whitelabel',
            environmentVariables: [
              { name: 'EXPO_PUBLIC_TENANT', value: church.slug },
              { name: 'EXPO_PUBLIC_APP_NAME', value: church.name },
              { name: 'EXPO_PUBLIC_APP_SLUG', value: `cs-${church.slug}` },
              {
                name: 'EXPO_PUBLIC_IOS_BUNDLE_ID',
                value: `com.churchstack.${church.slug.replace(/-/g, '')}`,
              },
              {
                name: 'EXPO_PUBLIC_ANDROID_PACKAGE',
                value: `com.churchstack.${church.slug.replace(/-/g, '')}`,
              },
            ],
          },
        },
      }),
    });

    if (!res.ok) {
      throw new Error(`Expo API HTTP ${res.status}: ${await res.text()}`);
    }

    const json = (await res.json()) as {
      errors?: Array<{ message: string }>;
      data?: { build?: { createBuild?: { id: string } } };
    };

    if (json.errors?.length) {
      throw new Error(json.errors.map((e) => e.message).join('; '));
    }

    const updated = await prisma.church.update({
      where: { id: church.id },
      data: { mobileBuildStatus: 'BUILDING' },
    });

    return {
      ok: true,
      church: updated,
      manualCommand,
      expoDashboardUrl,
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown Expo error';
    const updated = await prisma.church.update({
      where: { id: church.id },
      data: { mobileBuildStatus: 'QUEUED' },
    });
    return {
      ok: false,
      church: updated,
      error: `${message}. Use the manual command instead.`,
      manualCommand,
      expoDashboardUrl,
    };
  }
}
