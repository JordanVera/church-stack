export type OnboardPastor = {
  clientKey: string;
  firstName: string;
  lastName: string;
  title: string;
};

export type OnboardService = {
  key: string;
  name: string;
  dayOfWeek: number;
  startTime: string;
};

export type OnboardLocation = {
  key: string;
  name: string;
  address: string;
  pastorClientKey: string | null;
  adminEmails: string[];
  services: OnboardService[];
};

export type OnboardDraft = {
  name: string;
  slug: string;
  tagline: string;
  slugTouched: boolean;
  adminEmails: string[];
  facebookUrl: string;
  instagramUrl: string;
  youtubeUrl: string;
  threadsUrl: string;
  /** Set when Planning Center import succeeds; persisted on church.create via onboard. */
  planningCenterApiKey: string | null;
  planningCenterSecretKey: string | null;
  pastors: OnboardPastor[];
  locations: OnboardLocation[];
};

export const DAY_OPTIONS = [
  { value: 0, label: 'Sunday' },
  { value: 1, label: 'Monday' },
  { value: 2, label: 'Tuesday' },
  { value: 3, label: 'Wednesday' },
  { value: 4, label: 'Thursday' },
  { value: 5, label: 'Friday' },
  { value: 6, label: 'Saturday' },
] as const;

export const STEPS = [
  { id: 'church', label: 'Church', blurb: 'Basics & admins' },
  { id: 'pastors', label: 'Pastors', blurb: 'Leadership' },
  { id: 'locations', label: 'Locations', blurb: 'Campuses & times' },
  { id: 'review', label: 'Review', blurb: 'Confirm & submit' },
] as const;

export function newClientKey(prefix: string) {
  return `${prefix}-${Math.random().toString(36).slice(2, 10)}`;
}

export function slugifyName(name: string) {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 48);
}

export function createInitialDraft(): OnboardDraft {
  return {
    name: '',
    slug: '',
    tagline: '',
    slugTouched: false,
    adminEmails: [''],
    facebookUrl: '',
    instagramUrl: '',
    youtubeUrl: '',
    threadsUrl: '',
    planningCenterApiKey: null,
    planningCenterSecretKey: null,
    pastors: [
      {
        clientKey: newClientKey('pastor'),
        firstName: '',
        lastName: '',
        title: '',
      },
    ],
    locations: [
      {
        key: newClientKey('loc'),
        name: '',
        address: '',
        pastorClientKey: null,
        adminEmails: [],
        services: [
          {
            key: newClientKey('svc'),
            name: 'Sunday Worship',
            dayOfWeek: 0,
            startTime: '10:00',
          },
        ],
      },
    ],
  };
}

export function dayLabel(dayOfWeek: number) {
  return DAY_OPTIONS.find((d) => d.value === dayOfWeek)?.label ?? `Day ${dayOfWeek}`;
}

export function formatTime(hhmm: string) {
  const [hStr, mStr] = hhmm.split(':');
  const h = Number(hStr);
  const m = Number(mStr);
  if (Number.isNaN(h) || Number.isNaN(m)) return hhmm;
  const period = h >= 12 ? 'PM' : 'AM';
  const hour12 = h % 12 === 0 ? 12 : h % 12;
  return `${hour12}:${mStr} ${period}`;
}

export function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

export function isValidOptionalUrl(value: string) {
  const v = value.trim();
  if (!v) return true;
  try {
    const u = new URL(v);
    return u.protocol === 'http:' || u.protocol === 'https:';
  } catch {
    return false;
  }
}
