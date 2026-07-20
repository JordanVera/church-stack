import type { Church, PrismaClient } from '@repo/database';

type ProvisionResult = {
  ok: boolean;
  church: Church;
  error?: string;
  projectId?: string | null;
  deploymentId?: string | null;
  url?: string | null;
};

function vercelHeaders(token: string): HeadersInit {
  return {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
  };
}

function teamQuery(teamId: string | undefined): string {
  return teamId ? `?teamId=${encodeURIComponent(teamId)}` : '';
}

/**
 * Create or update a per-church Vercel project for `apps/church-site` and
 * trigger a deployment. Requires `VERCEL_TOKEN` + `VERCEL_GIT_REPO`
 * (`owner/repo`). Optional: `VERCEL_TEAM_ID`, `PLATFORM_API_URL`,
 * `VERCEL_CHURCH_SITE_ROOT` (default `apps/church-site`).
 *
 * Without credentials, marks the church FAILED with a clear error so /dev
 * can surface the gap (local stub path).
 */
export async function provisionChurchWebsite(
  prisma: PrismaClient,
  church: Church
): Promise<ProvisionResult> {
  await prisma.church.update({
    where: { id: church.id },
    data: { websiteStatus: 'PENDING' },
  });

  const token = process.env.VERCEL_TOKEN;
  const gitRepo = process.env.VERCEL_GIT_REPO;
  const teamId = process.env.VERCEL_TEAM_ID;
  const rootDirectory = process.env.VERCEL_CHURCH_SITE_ROOT ?? 'apps/church-site';
  const platformApiUrl =
    process.env.PLATFORM_API_URL ?? process.env.NEXTAUTH_URL ?? 'http://localhost:3000';

  if (!token || !gitRepo) {
    const updated = await prisma.church.update({
      where: { id: church.id },
      data: {
        websiteStatus: 'FAILED',
        websiteUrl: null,
      },
    });
    return {
      ok: false,
      church: updated,
      error:
        'Missing VERCEL_TOKEN or VERCEL_GIT_REPO. Set them to automate deploys, or create the Vercel project manually and set websiteUrl.',
    };
  }

  await prisma.church.update({
    where: { id: church.id },
    data: { websiteStatus: 'DEPLOYING' },
  });

  const projectName = `cs-${church.slug}`.slice(0, 52);
  const [repoOwner, repoName] = gitRepo.split('/');
  if (!repoOwner || !repoName) {
    const updated = await prisma.church.update({
      where: { id: church.id },
      data: { websiteStatus: 'FAILED' },
    });
    return {
      ok: false,
      church: updated,
      error: 'VERCEL_GIT_REPO must be in owner/repo form',
    };
  }

  try {
    let projectId = church.vercelProjectId;

    if (!projectId) {
      const createRes = await fetch(`https://api.vercel.com/v11/projects${teamQuery(teamId)}`, {
        method: 'POST',
        headers: vercelHeaders(token),
        body: JSON.stringify({
          name: projectName,
          framework: 'nextjs',
          rootDirectory,
          gitRepository: {
            type: 'github',
            repo: gitRepo,
          },
        }),
      });

      if (!createRes.ok) {
        // Project may already exist — try to look it up by name.
        const listRes = await fetch(
          `https://api.vercel.com/v9/projects/${encodeURIComponent(projectName)}${teamQuery(teamId)}`,
          { headers: vercelHeaders(token) }
        );
        if (!listRes.ok) {
          const body = await createRes.text();
          throw new Error(`Vercel create project failed (${createRes.status}): ${body}`);
        }
        const existing = (await listRes.json()) as { id: string };
        projectId = existing.id;
      } else {
        const created = (await createRes.json()) as { id: string };
        projectId = created.id;
      }
    }

    // Upsert env vars for this project.
    const envVars = [
      { key: 'CHURCH_SLUG', value: church.slug },
      { key: 'PLATFORM_API_URL', value: platformApiUrl },
    ];

    for (const env of envVars) {
      await fetch(
        `https://api.vercel.com/v10/projects/${projectId}/env${teamQuery(teamId)}`,
        {
          method: 'POST',
          headers: vercelHeaders(token),
          body: JSON.stringify({
            key: env.key,
            value: env.value,
            type: 'plain',
            target: ['production', 'preview', 'development'],
          }),
        }
      );
      // Ignore duplicate-env errors; Vercel returns 400 if key exists.
    }

    const deployRes = await fetch(`https://api.vercel.com/v13/deployments${teamQuery(teamId)}`, {
      method: 'POST',
      headers: vercelHeaders(token),
      body: JSON.stringify({
        name: projectName,
        project: projectId,
        gitSource: {
          type: 'github',
          repo: repoName,
          org: repoOwner,
          ref: process.env.VERCEL_GIT_REF ?? 'main',
        },
        projectSettings: {
          framework: 'nextjs',
          rootDirectory,
        },
      }),
    });

    if (!deployRes.ok) {
      const body = await deployRes.text();
      throw new Error(`Vercel deploy failed (${deployRes.status}): ${body}`);
    }

    const deployment = (await deployRes.json()) as {
      id: string;
      url?: string;
    };

    const url =
      church.customDomain != null
        ? `https://${church.customDomain}`
        : deployment.url
          ? `https://${deployment.url}`
          : `https://${projectName}.vercel.app`;

    const updated = await prisma.church.update({
      where: { id: church.id },
      data: {
        websiteStatus: 'LIVE',
        websiteUrl: url,
        vercelProjectId: projectId,
        vercelDeploymentId: deployment.id,
      },
    });

    return {
      ok: true,
      church: updated,
      projectId,
      deploymentId: deployment.id,
      url,
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown Vercel error';
    const updated = await prisma.church.update({
      where: { id: church.id },
      data: { websiteStatus: 'FAILED' },
    });
    return { ok: false, church: updated, error: message };
  }
}
