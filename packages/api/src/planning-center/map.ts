import type {
  ImportedCampus,
  ImportedServiceTime,
  PcoJsonApiListResponse,
  PcoJsonApiResource,
} from './types';

const DAY_TO_NUMBER: Record<string, number> = {
  sunday: 0,
  monday: 1,
  tuesday: 2,
  wednesday: 3,
  thursday: 4,
  friday: 5,
  saturday: 6,
};

/** PCO `start_time` is usually minutes past midnight; some payloads use seconds. */
export function pcoStartTimeToHhmm(startTime: number): string {
  const minutes =
    startTime > 24 * 60 ? Math.floor(startTime / 60) : Math.floor(startTime);
  const clamped = Math.max(0, Math.min(minutes, 24 * 60 - 1));
  const h = Math.floor(clamped / 60);
  const m = clamped % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

export function formatCampusAddress(attrs: Record<string, unknown>): string {
  const street = typeof attrs.street === 'string' ? attrs.street.trim() : '';
  const city = typeof attrs.city === 'string' ? attrs.city.trim() : '';
  const state = typeof attrs.state === 'string' ? attrs.state.trim() : '';
  const zip = typeof attrs.zip === 'string' ? attrs.zip.trim() : '';

  const cityStateZip = [city, [state, zip].filter(Boolean).join(' ')].filter(Boolean).join(', ');
  return [street, cityStateZip].filter(Boolean).join(', ');
}

function relationshipIds(
  resource: PcoJsonApiResource,
  key: string
): string[] {
  const rel = resource.relationships?.[key]?.data;
  if (!rel) return [];
  if (Array.isArray(rel)) return rel.map((r) => r.id);
  return [rel.id];
}

function mapServiceTime(resource: PcoJsonApiResource): ImportedServiceTime | null {
  const dayRaw = String(resource.attributes.day ?? '').toLowerCase();
  const dayOfWeek = DAY_TO_NUMBER[dayRaw];
  if (dayOfWeek === undefined) return null;

  const startRaw = resource.attributes.start_time;
  const startNum = typeof startRaw === 'number' ? startRaw : Number(startRaw);
  if (!Number.isFinite(startNum)) return null;

  const description =
    typeof resource.attributes.description === 'string'
      ? resource.attributes.description.trim()
      : '';

  return {
    pcoServiceTimeId: resource.id,
    name: description || 'Service',
    dayOfWeek,
    startTime: pcoStartTimeToHhmm(startNum),
  };
}

export function mapCampusesWithServiceTimes(
  payload: PcoJsonApiListResponse
): ImportedCampus[] {
  const includedByKey = new Map<string, PcoJsonApiResource>();
  for (const item of payload.included ?? []) {
    includedByKey.set(`${item.type}:${item.id}`, item);
  }

  return payload.data
    .filter((campus) => campus.type === 'Campus')
    .map((campus) => {
      const attrs = campus.attributes;
      const name =
        typeof attrs.name === 'string' && attrs.name.trim()
          ? attrs.name.trim()
          : 'Campus';
      const contactEmail =
        typeof attrs.contact_email_address === 'string' &&
        attrs.contact_email_address.trim()
          ? attrs.contact_email_address.trim().toLowerCase()
          : null;

      const services = relationshipIds(campus, 'service_times')
        .map((id) => includedByKey.get(`ServiceTime:${id}`))
        .filter((r): r is PcoJsonApiResource => Boolean(r))
        .map(mapServiceTime)
        .filter((s): s is ImportedServiceTime => Boolean(s));

      return {
        pcoCampusId: campus.id,
        name,
        address: formatCampusAddress(attrs),
        contactEmail,
        services,
      };
    });
}
