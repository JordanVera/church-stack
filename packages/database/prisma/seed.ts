import { PrismaClient, MembershipRole } from '@prisma/client';
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
      owner: { name: 'Hillside Admin', email: 'admin@hillside.example' },
    },
  ];

  const password = await bcrypt.hash('password123', 10);

  for (const c of churches) {
    const church = await prisma.church.upsert({
      where: { slug: c.slug },
      update: {
        name: c.name,
        tagline: c.tagline,
        primaryColor: c.primaryColor,
        secondaryColor: c.secondaryColor,
        contactEmail: c.contactEmail,
        timezone: c.timezone,
      },
      create: {
        slug: c.slug,
        name: c.name,
        tagline: c.tagline,
        primaryColor: c.primaryColor,
        secondaryColor: c.secondaryColor,
        contactEmail: c.contactEmail,
        timezone: c.timezone,
      },
    });

    const owner = await prisma.user.upsert({
      where: { email: c.owner.email },
      update: { name: c.owner.name },
      create: { name: c.owner.name, email: c.owner.email, password },
    });

    await prisma.membership.upsert({
      where: { userId_churchId: { userId: owner.id, churchId: church.id } },
      update: { role: MembershipRole.OWNER },
      create: { userId: owner.id, churchId: church.id, role: MembershipRole.OWNER },
    });

    await prisma.announcement.create({
      data: {
        churchId: church.id,
        title: `Welcome to ${church.name}`,
        body: 'We are so glad you are here. Join us this Sunday!',
        published: true,
      },
    });

    await prisma.event.create({
      data: {
        churchId: church.id,
        title: 'Sunday Gathering',
        description: 'Weekly worship service.',
        location: 'Main Auditorium',
        startsAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
      },
    });

    await prisma.sermonSeries.create({
      data: {
        churchId: church.id,
        title: 'Rooted',
        description: 'A series on growing deep in faith.',
      },
    });

    console.log(`Seeded ${church.name} (${church.slug}) with owner ${owner.email}`);
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
