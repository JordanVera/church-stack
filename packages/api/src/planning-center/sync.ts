import type { PrismaClient } from '@repo/database';
import { TRPCError } from '@trpc/server';
import { fetchCampusesWithServiceTimes } from './client';
import { fetchCalendarEvents, fetchGroups } from './client';

export type PlanningCenterSyncResult = {
  locationsUpserted: number;
  servicesUpserted: number;
  eventsUpserted: number;
  lifeGroupsUpserted: number;
};

/**
 * Pull campuses, calendar events, and groups from Planning Center into the
 * shared tenant tables (keyed by churchId + externalId).
 */
export async function syncPlanningCenterForChurch(
  prisma: PrismaClient,
  churchId: string
): Promise<PlanningCenterSyncResult> {
  const church = await prisma.church.findUnique({ where: { id: churchId } });
  if (!church) {
    throw new TRPCError({ code: 'NOT_FOUND', message: 'Church not found' });
  }
  if (!church.planningCenterApiKey || !church.planningCenterSecretKey) {
    throw new TRPCError({
      code: 'BAD_REQUEST',
      message: 'Planning Center credentials are not configured for this church.',
    });
  }

  const applicationId = church.planningCenterApiKey.trim();
  const secret = church.planningCenterSecretKey.trim();

  const [campuses, calendarEvents, groups] = await Promise.all([
    fetchCampusesWithServiceTimes(applicationId, secret),
    fetchCalendarEvents(applicationId, secret),
    fetchGroups(applicationId, secret),
  ]);

  let locationsUpserted = 0;
  let servicesUpserted = 0;
  let eventsUpserted = 0;
  let lifeGroupsUpserted = 0;

  for (let i = 0; i < campuses.length; i++) {
    const campus = campuses[i]!;
    const existing = await prisma.location.findFirst({
      where: {
        churchId,
        externalId: campus.pcoCampusId,
        source: 'PLANNING_CENTER',
      },
    });

    const location = existing
      ? await prisma.location.update({
          where: { id: existing.id },
          data: {
            name: campus.name,
            address: campus.address || existing.address,
            sortOrder: i,
            source: 'PLANNING_CENTER',
            externalId: campus.pcoCampusId,
          },
        })
      : await prisma.location.create({
          data: {
            churchId,
            name: campus.name,
            address: campus.address || 'Address not provided',
            sortOrder: i,
            source: 'PLANNING_CENTER',
            externalId: campus.pcoCampusId,
          },
        });
    locationsUpserted += 1;

    // Replace PCO-sourced services for this campus to match remote state.
    await prisma.service.deleteMany({
      where: { locationId: location.id, source: 'PLANNING_CENTER' },
    });

    if (campus.services.length > 0) {
      await prisma.service.createMany({
        data: campus.services.map((svc, svcIndex) => ({
          locationId: location.id,
          name: svc.name,
          dayOfWeek: svc.dayOfWeek,
          startTime: svc.startTime,
          sortOrder: svcIndex,
          source: 'PLANNING_CENTER' as const,
          externalId: svc.pcoServiceTimeId,
        })),
      });
      servicesUpserted += campus.services.length;
    }
  }

  for (const event of calendarEvents) {
    const existing = await prisma.event.findFirst({
      where: {
        churchId,
        externalId: event.pcoEventId,
        source: 'PLANNING_CENTER',
      },
    });

    const data = {
      title: event.title,
      description: event.description,
      location: event.location,
      startsAt: event.startsAt,
      endsAt: event.endsAt,
      source: 'PLANNING_CENTER' as const,
      externalId: event.pcoEventId,
    };

    if (existing) {
      await prisma.event.update({ where: { id: existing.id }, data });
    } else {
      await prisma.event.create({
        data: { churchId, ...data },
      });
    }
    eventsUpserted += 1;
  }

  for (const group of groups) {
    const existing = await prisma.lifeGroup.findFirst({
      where: {
        churchId,
        externalId: group.pcoGroupId,
        source: 'PLANNING_CENTER',
      },
    });

    const data = {
      name: group.name,
      description: group.description,
      location: group.location,
      meetingDay: group.meetingDay,
      meetingTime: group.meetingTime,
      source: 'PLANNING_CENTER' as const,
      externalId: group.pcoGroupId,
    };

    if (existing) {
      await prisma.lifeGroup.update({ where: { id: existing.id }, data });
    } else {
      await prisma.lifeGroup.create({
        data: { churchId, ...data },
      });
    }
    lifeGroupsUpserted += 1;
  }

  return {
    locationsUpserted,
    servicesUpserted,
    eventsUpserted,
    lifeGroupsUpserted,
  };
}
