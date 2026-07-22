import {
  PrismaClient,
  MembershipRole,
  WebsiteStatus,
  MobilePlan,
  MobileBuildStatus,
  PlanTier,
  ContentSource,
} from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const DEMO_PASSWORD = 'password123';
const JORDAN = {
  name: 'Jordan Vera',
  email: 'jordan.vera96@gmail.com',
  password: 'Jordan96!',
} as const;

type SeedService = {
  name: string;
  dayOfWeek: number;
  startTime: string;
  sortOrder?: number;
  source?: ContentSource;
  externalId?: string | null;
};

type SeedLocation = {
  name: string;
  address: string;
  pastorKey?: string;
  sortOrder?: number;
  source?: ContentSource;
  externalId?: string | null;
  adminEmails?: string[];
  services: SeedService[];
};

type SeedPastor = {
  key: string;
  firstName: string;
  lastName: string;
  title: string;
  sortOrder?: number;
};

type SeedChurch = {
  slug: string;
  name: string;
  tagline: string;
  primaryColor: string;
  secondaryColor: string;
  contactEmail: string;
  phone: string | null;
  address: string | null;
  timezone: string;
  facebookUrl: string | null;
  instagramUrl: string | null;
  youtubeUrl: string | null;
  threadsUrl: string | null;
  planTier: PlanTier;
  givingEnabled: boolean;
  givingUrl: string | null;
  websiteStatus: WebsiteStatus;
  websiteUrl: string | null;
  customDomain: string | null;
  mobilePlan: MobilePlan;
  mobileBuildStatus: MobileBuildStatus;
  planningCenterApiKey: string | null;
  planningCenterSecretKey: string | null;
  owner: { name: string; email: string };
  pastors: SeedPastor[];
  locations: SeedLocation[];
  churchAdminEmails: string[];
  announcements: { title: string; body: string }[];
  events: {
    title: string;
    description: string;
    location: string;
    daysFromNow: number;
    source?: ContentSource;
    externalId?: string | null;
  }[];
  sermonSeries: { title: string; description: string }[];
  lifeGroups: {
    name: string;
    description: string;
    location: string | null;
    meetingDay: number | null;
    meetingTime: string | null;
    source?: ContentSource;
    externalId?: string | null;
  }[];
};

const churches: SeedChurch[] = [
  {
    slug: 'grace',
    name: 'Grace Community Church',
    tagline: 'A place to belong',
    primaryColor: '#4f46e5',
    secondaryColor: '#0ea5e9',
    contactEmail: 'hello@gracechurch.example',
    phone: '(312) 555-0140',
    address: '100 North Ave, Chicago, IL 60601',
    timezone: 'America/Chicago',
    facebookUrl: 'https://facebook.com/gracecommunity.example',
    instagramUrl: 'https://instagram.com/gracecommunity.example',
    youtubeUrl: 'https://youtube.com/@gracecommunity.example',
    threadsUrl: null,
    // Fresh Site-tier signup: white-label mobile, site not provisioned yet
    planTier: PlanTier.SITE,
    givingEnabled: false,
    givingUrl: null,
    websiteStatus: WebsiteStatus.NONE,
    websiteUrl: null,
    customDomain: null,
    mobilePlan: MobilePlan.WHITELABEL,
    mobileBuildStatus: MobileBuildStatus.NONE,
    planningCenterApiKey: null,
    planningCenterSecretKey: null,
    owner: { name: 'Grace Admin', email: 'admin@gracechurch.example' },
    churchAdminEmails: ['admin@gracechurch.example', 'ops@gracechurch.example'],
    pastors: [
      {
        key: 'senior',
        firstName: 'James',
        lastName: 'Whitfield',
        title: 'Senior Pastor',
        sortOrder: 0,
      },
      {
        key: 'campus',
        firstName: 'Maria',
        lastName: 'Santos',
        title: 'Campus Pastor',
        sortOrder: 1,
      },
    ],
    locations: [
      {
        name: 'Grace Church North',
        address: '100 North Ave, Chicago, IL 60601',
        pastorKey: 'senior',
        sortOrder: 0,
        adminEmails: ['north@gracechurch.example'],
        services: [
          { name: 'Sunday Worship', dayOfWeek: 0, startTime: '09:00', sortOrder: 0 },
          { name: 'Sunday Worship', dayOfWeek: 0, startTime: '11:00', sortOrder: 1 },
        ],
      },
      {
        name: 'Grace Church South',
        address: '200 South Blvd, Chicago, IL 60616',
        pastorKey: 'campus',
        sortOrder: 1,
        adminEmails: ['south@gracechurch.example'],
        services: [
          { name: 'Sunday Worship', dayOfWeek: 0, startTime: '10:30', sortOrder: 0 },
        ],
      },
    ],
    announcements: [
      {
        title: 'Welcome to Grace Community Church',
        body: 'We are so glad you are here. Join us this Sunday!',
      },
      {
        title: 'Volunteer orientation',
        body: 'New volunteers meet in the lobby after the 11am service.',
      },
    ],
    events: [
      {
        title: 'Sunday Gathering',
        description: 'Weekly worship service.',
        location: 'Main Auditorium',
        daysFromNow: 3,
      },
      {
        title: 'Community Picnic',
        description: 'Food, games, and fellowship for the whole family.',
        location: 'Lincoln Park',
        daysFromNow: 14,
      },
    ],
    sermonSeries: [
      {
        title: 'Rooted',
        description: 'A series on growing deep in faith.',
      },
    ],
    lifeGroups: [
      {
        name: 'Young Adults',
        description: '20s–30s gathering for prayer and discussion.',
        location: 'Grace Church North — Room 210',
        meetingDay: 3,
        meetingTime: '19:00',
      },
      {
        name: 'Marriage Group',
        description: 'Couples growing together in faith.',
        location: 'Grace Church South',
        meetingDay: 2,
        meetingTime: '18:30',
      },
    ],
  },
  {
    slug: 'hillside',
    name: 'Hillside Fellowship',
    tagline: 'Faith, hope, and community',
    primaryColor: '#059669',
    secondaryColor: '#f59e0b',
    contactEmail: 'hello@hillside.example',
    phone: '(303) 555-0199',
    address: '450 Ridge Rd, Denver, CO 80202',
    timezone: 'America/Denver',
    facebookUrl: 'https://facebook.com/hillside.example',
    instagramUrl: 'https://instagram.com/hillside.example',
    youtubeUrl: 'https://youtube.com/@hillside.example',
    threadsUrl: 'https://threads.net/@hillside.example',
    // Growth: live site, giving URL, PCO credentials, mobile build queued
    planTier: PlanTier.GROWTH,
    givingEnabled: true,
    givingUrl: 'https://example.com/give/hillside',
    websiteStatus: WebsiteStatus.LIVE,
    websiteUrl: 'http://localhost:3001?slug=hillside',
    customDomain: 'www.hillside.example',
    mobilePlan: MobilePlan.WHITELABEL,
    mobileBuildStatus: MobileBuildStatus.QUEUED,
    // Placeholder PC credentials for local /dev testing (not real)
    planningCenterApiKey: 'pc_demo_application_id',
    planningCenterSecretKey: 'pc_demo_secret',
    owner: { name: 'Hillside Admin', email: 'admin@hillside.example' },
    churchAdminEmails: ['admin@hillside.example', 'staff@hillside.example'],
    pastors: [
      {
        key: 'lead',
        firstName: 'Daniel',
        lastName: 'Okoye',
        title: 'Lead Pastor',
        sortOrder: 0,
      },
      {
        key: 'associate',
        firstName: 'Rachel',
        lastName: 'Nguyen',
        title: 'Associate Pastor',
        sortOrder: 1,
      },
    ],
    locations: [
      {
        name: 'Hillside Main Campus',
        address: '450 Ridge Rd, Denver, CO 80202',
        pastorKey: 'lead',
        sortOrder: 0,
        source: ContentSource.PLANNING_CENTER,
        externalId: 'pco_campus_main',
        adminEmails: ['campus@hillside.example'],
        services: [
          {
            name: 'Sunday Worship',
            dayOfWeek: 0,
            startTime: '09:00',
            sortOrder: 0,
            source: ContentSource.PLANNING_CENTER,
            externalId: 'pco_svc_main_9',
          },
          {
            name: 'Sunday Worship',
            dayOfWeek: 0,
            startTime: '11:00',
            sortOrder: 1,
            source: ContentSource.PLANNING_CENTER,
            externalId: 'pco_svc_main_11',
          },
          {
            name: 'Wednesday Prayer',
            dayOfWeek: 3,
            startTime: '19:00',
            sortOrder: 2,
            source: ContentSource.MANUAL,
          },
        ],
      },
      {
        name: 'Hillside West',
        address: '88 West Colfax, Lakewood, CO 80215',
        pastorKey: 'associate',
        sortOrder: 1,
        source: ContentSource.PLANNING_CENTER,
        externalId: 'pco_campus_west',
        services: [
          {
            name: 'Sunday Worship',
            dayOfWeek: 0,
            startTime: '10:00',
            sortOrder: 0,
            source: ContentSource.PLANNING_CENTER,
            externalId: 'pco_svc_west_10',
          },
        ],
      },
    ],
    announcements: [
      {
        title: 'Welcome to Hillside Fellowship',
        body: 'We are so glad you are here. Join us this Sunday!',
      },
      {
        title: 'Baptism Sunday',
        body: 'Sign up at the Welcome Desk if you want to be baptized next month.',
      },
    ],
    events: [
      {
        title: 'Sunday Gathering',
        description: 'Weekly worship service.',
        location: 'Main Auditorium',
        daysFromNow: 2,
        source: ContentSource.MANUAL,
      },
      {
        title: 'Men\'s Breakfast',
        description: 'Breakfast, prayer, and conversation.',
        location: 'Fellowship Hall',
        daysFromNow: 5,
        source: ContentSource.PLANNING_CENTER,
        externalId: 'pco_event_mens_breakfast',
      },
      {
        title: 'Serve Day',
        description: 'Local outreach projects around Denver.',
        location: 'Meet at Main Campus',
        daysFromNow: 21,
        source: ContentSource.PLANNING_CENTER,
        externalId: 'pco_event_serve_day',
      },
    ],
    sermonSeries: [
      {
        title: 'Rooted',
        description: 'A series on growing deep in faith.',
      },
      {
        title: 'The Way of Jesus',
        description: 'Practices for everyday discipleship.',
      },
    ],
    lifeGroups: [
      {
        name: 'Downtown Lunch Group',
        description: 'Midweek lunch and Scripture for professionals.',
        location: 'Cafe near Main Campus',
        meetingDay: 4,
        meetingTime: '12:00',
        source: ContentSource.PLANNING_CENTER,
        externalId: 'pco_group_lunch',
      },
      {
        name: 'Westside Families',
        description: 'Parents and kids growing together.',
        location: 'Hillside West',
        meetingDay: 0,
        meetingTime: '17:00',
        source: ContentSource.PLANNING_CENTER,
        externalId: 'pco_group_families',
      },
      {
        name: 'Women\'s Study',
        description: 'Manual CMS group — not synced from Planning Center.',
        location: 'Room 12',
        meetingDay: 2,
        meetingTime: '09:30',
        source: ContentSource.MANUAL,
      },
    ],
  },
  {
    slug: 'harbor',
    name: 'Harbor Church',
    tagline: 'Anchored in hope',
    primaryColor: '#0f766e',
    secondaryColor: '#f97316',
    contactEmail: 'hello@harbor.example',
    phone: '(415) 555-0177',
    address: '12 Embarcadero, San Francisco, CA 94111',
    timezone: 'America/Los_Angeles',
    facebookUrl: 'https://facebook.com/harbor.example',
    instagramUrl: 'https://instagram.com/harbor.example',
    youtubeUrl: null,
    threadsUrl: null,
    // Custom tier: custom domain + mature white-label mobile
    planTier: PlanTier.CUSTOM,
    givingEnabled: true,
    givingUrl: 'https://example.com/give/harbor',
    websiteStatus: WebsiteStatus.LIVE,
    websiteUrl: 'https://www.harbor.example',
    customDomain: 'www.harbor.example',
    mobilePlan: MobilePlan.WHITELABEL,
    mobileBuildStatus: MobileBuildStatus.LIVE,
    planningCenterApiKey: null,
    planningCenterSecretKey: null,
    owner: { name: 'Harbor Admin', email: 'admin@harbor.example' },
    churchAdminEmails: ['admin@harbor.example'],
    pastors: [
      {
        key: 'lead',
        firstName: 'Sofia',
        lastName: 'Reyes',
        title: 'Lead Pastor',
        sortOrder: 0,
      },
    ],
    locations: [
      {
        name: 'Harbor Embarcadero',
        address: '12 Embarcadero, San Francisco, CA 94111',
        pastorKey: 'lead',
        sortOrder: 0,
        services: [
          { name: 'Sunday Gathering', dayOfWeek: 0, startTime: '10:00', sortOrder: 0 },
          { name: 'Sunday Gathering', dayOfWeek: 0, startTime: '17:00', sortOrder: 1 },
        ],
      },
    ],
    announcements: [
      {
        title: 'Welcome to Harbor Church',
        body: 'We are so glad you are here. Join us this Sunday!',
      },
    ],
    events: [
      {
        title: 'Sunday Gathering',
        description: 'Weekly worship service.',
        location: 'Main Hall',
        daysFromNow: 4,
      },
      {
        title: 'Harbor Night of Worship',
        description: 'An evening of music and prayer.',
        location: 'Main Hall',
        daysFromNow: 10,
      },
    ],
    sermonSeries: [
      {
        title: 'Anchored',
        description: 'Hope that holds when life gets stormy.',
      },
    ],
    lifeGroups: [
      {
        name: 'Harbor Young Professionals',
        description: 'Faith and work conversations downtown.',
        location: 'Embarcadero campus',
        meetingDay: 1,
        meetingTime: '18:30',
      },
      {
        name: 'Neighborhood Dinner',
        description: 'Monthly shared meal and prayer.',
        location: 'Rotates homes',
        meetingDay: 5,
        meetingTime: '18:00',
      },
    ],
  },
];

async function upsertUser(opts: {
  email: string;
  name: string;
  passwordHash: string;
  isAdmin?: boolean;
}) {
  return prisma.user.upsert({
    where: { email: opts.email },
    update: {
      name: opts.name,
      password: opts.passwordHash,
      ...(opts.isAdmin !== undefined ? { isAdmin: opts.isAdmin } : {}),
    },
    create: {
      email: opts.email,
      name: opts.name,
      password: opts.passwordHash,
      isAdmin: opts.isAdmin ?? false,
    },
  });
}

async function upsertMembership(
  userId: string,
  churchId: string,
  role: MembershipRole
) {
  return prisma.membership.upsert({
    where: { userId_churchId: { userId, churchId } },
    update: { role },
    create: { userId, churchId, role },
  });
}

async function ensurePastorsAndLocations(
  churchId: string,
  pastors: SeedPastor[],
  locations: SeedLocation[],
  churchAdminEmails: string[]
) {
  const pastorIds = new Map<string, string>();

  for (const p of pastors) {
    const existing = await prisma.pastor.findFirst({
      where: {
        churchId,
        firstName: p.firstName,
        lastName: p.lastName,
        title: p.title,
      },
    });
    const pastor =
      existing ??
      (await prisma.pastor.create({
        data: {
          churchId,
          firstName: p.firstName,
          lastName: p.lastName,
          title: p.title,
          sortOrder: p.sortOrder ?? 0,
        },
      }));
    pastorIds.set(p.key, pastor.id);
  }

  for (const loc of locations) {
    const existing = loc.externalId
      ? await prisma.location.findFirst({
          where: { churchId, externalId: loc.externalId },
        })
      : await prisma.location.findFirst({
          where: { churchId, name: loc.name },
        });

    const location =
      existing ??
      (await prisma.location.create({
        data: {
          churchId,
          name: loc.name,
          address: loc.address,
          pastorId: loc.pastorKey ? (pastorIds.get(loc.pastorKey) ?? null) : null,
          sortOrder: loc.sortOrder ?? 0,
          source: loc.source ?? ContentSource.MANUAL,
          externalId: loc.externalId ?? null,
        },
      }));

    if (existing) {
      await prisma.location.update({
        where: { id: location.id },
        data: {
          name: loc.name,
          address: loc.address,
          pastorId: loc.pastorKey ? (pastorIds.get(loc.pastorKey) ?? null) : null,
          sortOrder: loc.sortOrder ?? 0,
          source: loc.source ?? ContentSource.MANUAL,
          externalId: loc.externalId ?? null,
        },
      });
    }

    for (const svc of loc.services) {
      const existingService = svc.externalId
        ? await prisma.service.findFirst({
            where: { locationId: location.id, externalId: svc.externalId },
          })
        : await prisma.service.findFirst({
            where: {
              locationId: location.id,
              name: svc.name,
              dayOfWeek: svc.dayOfWeek,
              startTime: svc.startTime,
            },
          });

      if (!existingService) {
        await prisma.service.create({
          data: {
            locationId: location.id,
            name: svc.name,
            dayOfWeek: svc.dayOfWeek,
            startTime: svc.startTime,
            sortOrder: svc.sortOrder ?? 0,
            source: svc.source ?? ContentSource.MANUAL,
            externalId: svc.externalId ?? null,
          },
        });
      }
    }

    for (const email of loc.adminEmails ?? []) {
      const existingEmail = await prisma.churchAdminEmail.findFirst({
        where: { churchId, email, locationId: location.id },
      });
      if (!existingEmail) {
        await prisma.churchAdminEmail.create({
          data: { churchId, email, locationId: location.id },
        });
      }
    }
  }

  for (const email of churchAdminEmails) {
    const existingEmail = await prisma.churchAdminEmail.findFirst({
      where: { churchId, email, locationId: null },
    });
    if (!existingEmail) {
      await prisma.churchAdminEmail.create({
        data: { churchId, email, locationId: null },
      });
    }
  }
}

async function ensureContent(churchId: string, church: SeedChurch) {
  for (const a of church.announcements) {
    const existing = await prisma.announcement.findFirst({
      where: { churchId, title: a.title },
    });
    if (!existing) {
      await prisma.announcement.create({
        data: {
          churchId,
          title: a.title,
          body: a.body,
          published: true,
        },
      });
    }
  }

  for (const e of church.events) {
    const existing = e.externalId
      ? await prisma.event.findFirst({
          where: { churchId, externalId: e.externalId },
        })
      : await prisma.event.findFirst({
          where: { churchId, title: e.title },
        });
    if (!existing) {
      await prisma.event.create({
        data: {
          churchId,
          title: e.title,
          description: e.description,
          location: e.location,
          startsAt: new Date(Date.now() + e.daysFromNow * 24 * 60 * 60 * 1000),
          source: e.source ?? ContentSource.MANUAL,
          externalId: e.externalId ?? null,
        },
      });
    }
  }

  for (const s of church.sermonSeries) {
    const existing = await prisma.sermonSeries.findFirst({
      where: { churchId, title: s.title },
    });
    if (!existing) {
      await prisma.sermonSeries.create({
        data: {
          churchId,
          title: s.title,
          description: s.description,
        },
      });
    }
  }

  for (const g of church.lifeGroups) {
    const existing = g.externalId
      ? await prisma.lifeGroup.findFirst({
          where: { churchId, externalId: g.externalId },
        })
      : await prisma.lifeGroup.findFirst({
          where: { churchId, name: g.name },
        });
    if (!existing) {
      await prisma.lifeGroup.create({
        data: {
          churchId,
          name: g.name,
          description: g.description,
          location: g.location,
          meetingDay: g.meetingDay,
          meetingTime: g.meetingTime,
          source: g.source ?? ContentSource.MANUAL,
          externalId: g.externalId ?? null,
        },
      });
    }
  }
}

async function main() {
  const demoPassword = await bcrypt.hash(DEMO_PASSWORD, 10);
  const jordanPassword = await bcrypt.hash(JORDAN.password, 10);

  // Platform admin — /admin on the web app.
  // /dev is gated separately via PLATFORM_DEV_EMAILS (add emails there locally).
  const platformAdmin = await upsertUser({
    email: 'admin@churchstack.example',
    name: 'Platform Admin',
    passwordHash: demoPassword,
    isAdmin: true,
  });
  console.log(`Seeded platform admin ${platformAdmin.email} (${DEMO_PASSWORD})`);

  const jordan = await upsertUser({
    email: JORDAN.email,
    name: JORDAN.name,
    passwordHash: jordanPassword,
    isAdmin: true,
  });
  console.log(
    `Seeded ${jordan.name} ${jordan.email} (${JORDAN.password}) — platform admin; add to PLATFORM_DEV_EMAILS for /dev`
  );

  const seededChurchIds: Record<string, string> = {};

  for (const c of churches) {
    const churchData = {
      name: c.name,
      tagline: c.tagline,
      primaryColor: c.primaryColor,
      secondaryColor: c.secondaryColor,
      contactEmail: c.contactEmail,
      phone: c.phone,
      address: c.address,
      timezone: c.timezone,
      facebookUrl: c.facebookUrl,
      instagramUrl: c.instagramUrl,
      youtubeUrl: c.youtubeUrl,
      threadsUrl: c.threadsUrl,
      isActive: true,
      planTier: c.planTier,
      givingEnabled: c.givingEnabled,
      givingUrl: c.givingUrl,
      eventsEnabled: true,
      sermonsEnabled: true,
      websiteStatus: c.websiteStatus,
      websiteUrl: c.websiteUrl,
      customDomain: c.customDomain,
      vercelProjectId: null as string | null,
      vercelDeploymentId: null as string | null,
      mobilePlan: c.mobilePlan,
      mobileBuildStatus: c.mobileBuildStatus,
      planningCenterApiKey: c.planningCenterApiKey,
      planningCenterSecretKey: c.planningCenterSecretKey,
    };

    const church = await prisma.church.upsert({
      where: { slug: c.slug },
      update: churchData,
      create: {
        slug: c.slug,
        ...churchData,
      },
    });
    seededChurchIds[c.slug] = church.id;

    const owner = await upsertUser({
      email: c.owner.email,
      name: c.owner.name,
      passwordHash: demoPassword,
    });
    await upsertMembership(owner.id, church.id, MembershipRole.OWNER);

    await ensurePastorsAndLocations(
      church.id,
      c.pastors,
      c.locations,
      c.churchAdminEmails
    );
    await ensureContent(church.id, c);

    console.log(
      `Seeded ${church.name} (${church.slug}) — ${church.planTier}, site ${church.websiteStatus}, mobile ${church.mobilePlan}/${church.mobileBuildStatus}, owner ${owner.email}`
    );
  }

  // Jordan can dogfood owner dashboard + multi-church membership roles.
  await upsertMembership(jordan.id, seededChurchIds.grace, MembershipRole.OWNER);
  await upsertMembership(jordan.id, seededChurchIds.hillside, MembershipRole.ADMIN);
  await upsertMembership(jordan.id, seededChurchIds.harbor, MembershipRole.OWNER);

  // Extra hillside staff so MembershipRole variants are easy to test.
  const hillsideLeader = await upsertUser({
    email: 'leader@hillside.example',
    name: 'Hillside Leader',
    passwordHash: demoPassword,
  });
  const hillsideMember = await upsertUser({
    email: 'member@hillside.example',
    name: 'Hillside Member',
    passwordHash: demoPassword,
  });
  await upsertMembership(
    hillsideLeader.id,
    seededChurchIds.hillside,
    MembershipRole.LEADER
  );
  await upsertMembership(
    hillsideMember.id,
    seededChurchIds.hillside,
    MembershipRole.MEMBER
  );

  console.log('');
  console.log('Demo logins (password unless noted):');
  console.log(`  ${DEMO_PASSWORD}`);
  console.log('  - admin@churchstack.example (platform /admin)');
  console.log(`  - ${JORDAN.email} / ${JORDAN.password} (platform admin + grace/harbor OWNER, hillside ADMIN)`);
  console.log('  - admin@gracechurch.example (grace OWNER)');
  console.log('  - admin@hillside.example (hillside OWNER)');
  console.log('  - admin@harbor.example (harbor OWNER — Custom tier)');
  console.log('  - leader@hillside.example (hillside LEADER)');
  console.log('  - member@hillside.example (hillside MEMBER)');
  console.log('Church site previews: ?slug=grace | hillside | harbor');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
