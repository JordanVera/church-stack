import {
  PrismaClient,
  MembershipRole,
  WebsiteStatus,
  MobilePlan,
  MobileBuildStatus,
  PlanTier,
} from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const churches = [
    {
      slug: 'grace',
      name: 'Grace Community Church',
      tagline: 'A place to belong',
      primaryColor: '#4f46e5',
      secondaryColor: '#0ea5e9',
      contactEmail: 'hello@gracechurch.example',
      timezone: 'America/Chicago',
      planTier: PlanTier.SITE,
      givingEnabled: false,
      // Typical new church: white-label mobile, site not provisioned yet
      websiteStatus: WebsiteStatus.NONE,
      websiteUrl: null as string | null,
      customDomain: null as string | null,
      mobilePlan: MobilePlan.WHITELABEL,
      mobileBuildStatus: MobileBuildStatus.NONE,
      planningCenterApiKey: null as string | null,
      planningCenterSecretKey: null as string | null,
      owner: { name: 'Grace Admin', email: 'admin@gracechurch.example' },
    },
    {
      slug: 'hillside',
      name: 'Hillside Fellowship',
      tagline: 'Faith, hope, and community',
      primaryColor: '#059669',
      secondaryColor: '#f59e0b',
      contactEmail: 'hello@hillside.example',
      timezone: 'America/Denver',
      planTier: PlanTier.GROWTH,
      givingEnabled: true,
      // Demo of a paid white-label path + local site preview URL
      websiteStatus: WebsiteStatus.LIVE,
      websiteUrl: 'http://localhost:3001?slug=hillside',
      customDomain: null as string | null,
      mobilePlan: MobilePlan.WHITELABEL,
      mobileBuildStatus: MobileBuildStatus.QUEUED,
      // Placeholder PC credentials for local /dev testing (not real)
      planningCenterApiKey: 'pc_demo_application_id',
      planningCenterSecretKey: 'pc_demo_secret',
      owner: { name: 'Hillside Admin', email: 'admin@hillside.example' },
    },
  ];

  const password = await bcrypt.hash('password123', 10);

  // Platform admin — only this user can open /admin on the web app.
  // /dev is gated separately via PLATFORM_DEV_EMAILS (add this email there locally).
  const platformAdmin = await prisma.user.upsert({
    where: { email: 'admin@churchstack.example' },
    update: { name: 'Platform Admin', isAdmin: true, password },
    create: {
      name: 'Platform Admin',
      email: 'admin@churchstack.example',
      password,
      isAdmin: true,
    },
  });
  console.log(`Seeded platform admin ${platformAdmin.email} (password123)`);

  for (const c of churches) {
    const churchData = {
      name: c.name,
      tagline: c.tagline,
      primaryColor: c.primaryColor,
      secondaryColor: c.secondaryColor,
      contactEmail: c.contactEmail,
      timezone: c.timezone,
      isActive: true,
      planTier: c.planTier,
      givingEnabled: c.givingEnabled,
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

    const owner = await prisma.user.upsert({
      where: { email: c.owner.email },
      update: { name: c.owner.name, password },
      create: { name: c.owner.name, email: c.owner.email, password },
    });

    await prisma.membership.upsert({
      where: { userId_churchId: { userId: owner.id, churchId: church.id } },
      update: { role: MembershipRole.OWNER },
      create: { userId: owner.id, churchId: church.id, role: MembershipRole.OWNER },
    });

    const announcementTitle = `Welcome to ${church.name}`;
    const existingAnnouncement = await prisma.announcement.findFirst({
      where: { churchId: church.id, title: announcementTitle },
    });
    if (!existingAnnouncement) {
      await prisma.announcement.create({
        data: {
          churchId: church.id,
          title: announcementTitle,
          body: 'We are so glad you are here. Join us this Sunday!',
          published: true,
        },
      });
    }

    const existingEvent = await prisma.event.findFirst({
      where: { churchId: church.id, title: 'Sunday Gathering' },
    });
    if (!existingEvent) {
      await prisma.event.create({
        data: {
          churchId: church.id,
          title: 'Sunday Gathering',
          description: 'Weekly worship service.',
          location: 'Main Auditorium',
          startsAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
        },
      });
    }

    const existingSeries = await prisma.sermonSeries.findFirst({
      where: { churchId: church.id, title: 'Rooted' },
    });
    if (!existingSeries) {
      await prisma.sermonSeries.create({
        data: {
          churchId: church.id,
          title: 'Rooted',
          description: 'A series on growing deep in faith.',
        },
      });
    }

    if (church.slug === 'grace') {
      const pastorCount = await prisma.pastor.count({ where: { churchId: church.id } });
      if (pastorCount === 0) {
        const senior = await prisma.pastor.create({
          data: {
            churchId: church.id,
            firstName: 'James',
            lastName: 'Whitfield',
            title: 'Senior Pastor',
            sortOrder: 0,
          },
        });
        const campus = await prisma.pastor.create({
          data: {
            churchId: church.id,
            firstName: 'Maria',
            lastName: 'Santos',
            title: 'Campus Pastor',
            sortOrder: 1,
          },
        });

        const north = await prisma.location.create({
          data: {
            churchId: church.id,
            name: 'Grace Church North',
            address: '100 North Ave, Chicago, IL 60601',
            pastorId: senior.id,
            sortOrder: 0,
          },
        });
        const south = await prisma.location.create({
          data: {
            churchId: church.id,
            name: 'Grace Church South',
            address: '200 South Blvd, Chicago, IL 60616',
            pastorId: campus.id,
            sortOrder: 1,
          },
        });

        await prisma.service.createMany({
          data: [
            {
              locationId: north.id,
              name: 'Sunday Worship',
              dayOfWeek: 0,
              startTime: '09:00',
              sortOrder: 0,
            },
            {
              locationId: north.id,
              name: 'Sunday Worship',
              dayOfWeek: 0,
              startTime: '11:00',
              sortOrder: 1,
            },
            {
              locationId: south.id,
              name: 'Sunday Worship',
              dayOfWeek: 0,
              startTime: '10:30',
              sortOrder: 0,
            },
          ],
        });
      }

      const adminEmailCount = await prisma.churchAdminEmail.count({
        where: { churchId: church.id },
      });
      if (adminEmailCount === 0) {
        const locations = await prisma.location.findMany({
          where: { churchId: church.id },
          orderBy: { sortOrder: 'asc' },
          select: { id: true, name: true },
        });
        const north = locations.find((l) => l.name.includes('North'));
        const south = locations.find((l) => l.name.includes('South'));

        await prisma.churchAdminEmail.createMany({
          data: [
            {
              churchId: church.id,
              email: 'admin@gracechurch.example',
              locationId: null,
            },
            {
              churchId: church.id,
              email: 'ops@gracechurch.example',
              locationId: null,
            },
            ...(north
              ? [
                  {
                    churchId: church.id,
                    email: 'north@gracechurch.example',
                    locationId: north.id,
                  },
                ]
              : []),
            ...(south
              ? [
                  {
                    churchId: church.id,
                    email: 'south@gracechurch.example',
                    locationId: south.id,
                  },
                ]
              : []),
          ],
        });
      }
    }

    console.log(
      `Seeded ${church.name} (${church.slug}) — site ${church.websiteStatus}, mobile ${church.mobilePlan}/${church.mobileBuildStatus}, owner ${owner.email}`
    );
  }
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
