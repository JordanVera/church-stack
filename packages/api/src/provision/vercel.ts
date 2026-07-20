import type { Church, PrismaClient } from '@repo/database';

type ProvisionResult = {
  ok: boolean;
  church: Church;
  error?: string;
  projectId?: string | null;
  deploymentId?: string | null;
  url?: string | null;
  domainAttached?: boolean;
  domainVerification?: DomainAttachResult | null;
};

export type DomainAttachResult = {
  ok: boolean;
  domain: string;
  verified?: boolean;
  error?: string;
  /** DNS hints for the church owner. */
  dns?: Array<{ type: string; name: string; value: string }>;
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

function normalizeDomain(raw: string): string {
  return raw
    .trim()
    .toLowerCase()
    .replace(/^https?:\/\//, '')
    .replace(/\/.*$/, '');
}

/**
 * Attach a custom domain to a Vercel project and return verification / DNS hints.
 */
export async function attachCustomDomainToProject(
  projectId: string,
  domainRaw: string,
  options?: { token?: string; teamId?: string }
): Promise<DomainAttachResult> {
  const token = options?.token ?? process.env.VERCEL_TOKEN;
  const teamId = options?.teamId ?? process.env.VERCEL_TEAM_ID;
  const domain = normalizeDomain(domainRaw);

  if (!token) {
    return {
      ok: false,
      domain,
      error: 'Missing VERCEL_TOKEN — cannot attach custom domain automatically.',
    };
  }

  if (!domain || !domain.includes('.')) {
    return { ok: false, domain, error: 'Invalid custom domain' };
  }

  try {
    const addRes = await fetch(
      `https://api.vercel.com/v10/projects/${encodeURIComponent(projectId)}/domains${teamQuery(teamId)}`,
      {
        method: 'POST',
        headers: vercelHeaders(token),
        body: JSON.stringify({ name: domain }),
      }
    );

    if (!addRes.ok) {
      const body = await addRes.text();
      // Already configured is fine.
      if (addRes.status !== 409 && !body.includes('already') && !body.includes('exists')) {
        return {
          ok: false,
          domain,
          error: `Vercel domain attach failed (${addRes.status}): ${body}`,
        };
      }
    }

    const configRes = await fetch(
      `https://api.vercel.com/v6/domains/${encodeURIComponent(domain)}/config${teamQuery(teamId)}`,
      { headers: vercelHeaders(token) }
    );

    let dns: DomainAttachResult['dns'] = [
      { type: 'A', name: '@', value: '76.76.21.21' },
      { type: 'CNAME', name: 'www', value: 'cname.vercel-dns.com' },
    ];
    let verified = false;

    if (configRes.ok) {
      const config = (await configRes.json()) as {
        misconfigured?: boolean;
        configuredBy?: string | null;
        recommendedCNAME?: Array<{ rank: number; value: string }>;
        recommendedIPv4?: Array<{ rank: number; value: string }>;
      };
      verified = config.misconfigured === false;
      const cname = config.recommendedCNAME?.[0]?.value;
      const ipv4 = config.recommendedIPv4?.[0]?.value;
      if (cname || ipv4) {
        dns = [];
        if (ipv4) dns.push({ type: 'A', name: '@', value: ipv4 });
        if (cname) dns.push({ type: 'CNAME', name: 'www', value: cname });
      }
    }

    return { ok: true, domain, verified, dns };
  } catch (err) {
    return {
      ok: false,
      domain,
      error: err instanceof Error ? err.message : 'Unknown domain attach error',
    };
  }
}

/**
 * Create or update a per-church Vercel project for `apps/church-site` and
 * trigger a deployment. Requires `VERCEL_TOKEN` + `VERCEL_GIT_REPO`
 * (`owner/repo`). Optional: `VERCEL_TEAM_ID`, `PLATFORM_API_URL`,
 * `VERCEL_CHURCH_SITE_ROOT` (default `apps/church-site`).
 *
 * When `customDomain` is set, attaches it via the Vercel Domains API.
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

    let domainVerification: DomainAttachResult | null = null;
    let domainAttached = false;

    if (church.customDomain) {
      domainVerification = await attachCustomDomainToProject(projectId, church.customDomain, {
        token,
        teamId,
      });
      domainAttached = domainVerification.ok;
    }

    const url =
      church.customDomain != null
        ? `https://${normalizeDomain(church.customDomain)}`
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
        customDomain: church.customDomain
          ? normalizeDomain(church.customDomain)
          : church.customDomain,
      },
    });

    return {
      ok: true,
      church: updated,
      projectId,
      deploymentId: deployment.id,
      url,
      domainAttached,
      domainVerification,
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
