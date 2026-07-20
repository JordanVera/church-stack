import {
  PrismaClient,
  MembershipRole,
  WebsiteStatus,
  MobilePlan,
  MobileBuildStatus,
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
      // Typical new church: shared app, site not provisioned yet
      websiteStatus: WebsiteStatus.NONE,
      websiteUrl: null as string | null,
      customDomain: null as string | null,
      mobilePlan: MobilePlan.SHARED,
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
      givingEnabled: true,
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
