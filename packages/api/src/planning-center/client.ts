import { TRPCError } from '@trpc/server';
import { mapCampusesWithServiceTimes } from './map';
import type { ImportedCampus, PcoJsonApiListResponse } from './types';

const PCO_BASE = 'https://api.planningcenteronline.com';

function basicAuthHeader(applicationId: string, secret: string) {
  const token = Buffer.from(`${applicationId}:${secret}`).toString('base64');
  return `Basic ${token}`;
}

function pcoErrorDetail(body: PcoJsonApiListResponse): string | null {
  const err = body.errors?.[0];
  if (!err) return null;
  return err.detail || err.title || null;
}

async function pcoFetchJson(
  path: string,
  applicationId: string,
  secret: string
): Promise<PcoJsonApiListResponse> {
  let response: Response;
  try {
    response = await fetch(`${PCO_BASE}${path}`, {
      headers: {
        Authorization: basicAuthHeader(applicationId, secret),
        Accept: 'application/json',
      },
    });
  } catch {
    throw new TRPCError({
      code: 'BAD_GATEWAY',
      message:
        'Could not reach Planning Center (network error). Check your connection and try again. If this keeps happening, email us at the support address shown on this form.',
    });
  }

  let body: PcoJsonApiListResponse;
  try {
    body = (await response.json()) as PcoJsonApiListResponse;
  } catch {
    throw new TRPCError({
      code: 'BAD_GATEWAY',
      message: `Planning Center returned a non-JSON response (HTTP ${response.status}). Try again in a moment, or contact support if it continues.`,
    });
  }

  if (!response.ok) {
    const pcoDetail = pcoErrorDetail(body);

    if (response.status === 401) {
      throw new TRPCError({
        code: 'UNAUTHORIZED',
        message:
          'Planning Center rejected these credentials (HTTP 401). Double-check the Personal Access Token Application ID and Secret — they must be a pair from api.planningcenteronline.com/personal_access_tokens, not an OAuth application. Create a new token if the secret was lost (secrets are only shown once).',
      });
    }

    if (response.status === 403) {
      throw new TRPCError({
        code: 'FORBIDDEN',
        message:
          'Planning Center denied access (HTTP 403). The user who created this Personal Access Token may not have permission to view People campuses. Ask an Organization Administrator to create the token, then try again.',
      });
    }

    if (response.status === 404) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message:
          'Planning Center could not find that resource (HTTP 404). Confirm you are using a Personal Access Token for the correct organization account.',
      });
    }

    if (response.status === 429) {
      throw new TRPCError({
        code: 'TOO_MANY_REQUESTS',
        message:
          'Planning Center rate-limited this request (HTTP 429). Wait a minute and try importing again.',
      });
    }

    throw new TRPCError({
      code: 'BAD_GATEWAY',
      message: pcoDetail
        ? `Planning Center error (HTTP ${response.status}): ${pcoDetail}`
        : `Planning Center request failed (HTTP ${response.status}). Try again, or contact support if it continues.`,
    });
  }

  return body;
}

/**
 * Fetch People campuses with nested service times for import/preview.
 * Uses Personal Access Token style Basic auth (application id + secret).
 */
export async function fetchCampusesWithServiceTimes(
  applicationId: string,
  secret: string
): Promise<ImportedCampus[]> {
  const payload = await pcoFetchJson(
    '/people/v2/campuses?include=service_times&per_page=100&order=name',
    applicationId,
    secret
  );

  if (!Array.isArray(payload.data)) {
    throw new TRPCError({
      code: 'BAD_GATEWAY',
      message:
        'Planning Center returned an unexpected campuses payload. Contact support if this keeps happening.',
    });
  }

  let campuses = mapCampusesWithServiceTimes(payload);

  // Fallback: some accounts omit included service_times — fetch per campus.
  const needsFallback = campuses.some((c) => c.services.length === 0);
  if (needsFallback) {
    campuses = await Promise.all(
      campuses.map(async (campus) => {
        if (campus.services.length > 0) return campus;
        const times = await pcoFetchJson(
          `/people/v2/campuses/${campus.pcoCampusId}/service_times?per_page=100&order=time`,
          applicationId,
          secret
        );
        const mapped = mapCampusesWithServiceTimes({
          data: [
            {
              type: 'Campus',
              id: campus.pcoCampusId,
              attributes: {
                name: campus.name,
                contact_email_address: campus.contactEmail,
              },
              relationships: {
                service_times: {
                  data: (times.data ?? []).map((t) => ({
                    type: 'ServiceTime',
                    id: t.id,
                  })),
                },
              },
            },
          ],
          included: times.data ?? [],
        });
        return {
          ...campus,
          services: mapped[0]?.services ?? [],
        };
      })
    );
  }

  return campuses;
}
