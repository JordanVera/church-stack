import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { toTenantBranding } from '@repo/config';
import { router, publicProcedure, devProcedure } from '../trpc';
import { provisionChurchWebsite } from '../provision/vercel';
import { queueWhiteLabelBuild, setMobilePlan } from '../provision/eas';

const slugSchema = z
  .string()
  .min(2)
  .max(48)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug must be lowercase letters, numbers, and hyphens');

const churchCreateInput = z.object({
  slug: slugSchema,
  name: z.string().min(1).max(120),
  tagline: z.string().max(200).optional().nullable(),
  logoUrl: z.string().url().optional().nullable(),
  primaryColor: z.string().min(4).max(9).optional(),
  secondaryColor: z.string().min(4).max(9).optional(),
  contactEmail: z.string().email().optional().nullable(),
  phone: z.string().max(40).optional().nullable(),
  address: z.string().max(300).optional().nullable(),
  timezone: z.string().min(1).optional(),
  givingEnabled: z.boolean().optional(),
  eventsEnabled: z.boolean().optional(),
  sermonsEnabled: z.boolean().optional(),
  isActive: z.boolean().optional(),
  ownerEmail: z.string().email().optional().nullable(),
  planningCenterApiKey: z.string().max(2000).optional().nullable(),
  planningCenterSecretKey: z.string().max(2000).optional().nullable(),
});

const churchUpdateInput = churchCreateInput.partial().extend({
  id: z.string().min(1),
  customDomain: z.string().max(253).optional().nullable(),
});

const timeSchema = z
  .string()
  .regex(/^([01]\d|2[0-3]):[0-5]\d$/, 'Start time must be HH:mm (24h)');

const emailSchema = z.string().email().max(254);

const churchOnboardInput = z.object({
  slug: slugSchema,
  name: z.string().min(1).max(120),
  tagline: z.string().max(200).optional().nullable(),
  /** Church-wide admin contact emails (at least one). */
  adminEmails: z.array(emailSchema).min(1).max(50),
  pastors: z
    .array(
      z.object({
        clientKey: z.string().min(1),
        firstName: z.string().min(1).max(80),
        lastName: z.string().min(1).max(80),
        title: z.string().min(1).max(120),
      })
    )
    .min(1)
    .max(50),
  locations: z
    .array(
      z.object({
        name: z.string().min(1).max(120),
        address: z.string().min(1).max(300),
        pastorClientKey: z.string().min(1).optional().nullable(),
        /** Optional admin emails scoped to this location. */
        adminEmails: z.array(emailSchema).max(50).default([]),
        services: z
          .array(
            z.object({
              name: z.string().min(1).max(120),
              dayOfWeek: z.number().int().min(0).max(6),
              startTime: timeSchema,
            })
          )
          .max(50)
          .default([]),
      })
    )
    .min(1)
    .max(50),
});

export const churchRouter = router({
  // List active churches (used by the native church picker).
  list: publicProcedure.query(async ({ ctx }) => {
    return ctx.prisma.church.findMany({
      where: { isActive: true },
      orderBy: { name: 'asc' },
      select: { id: true, slug: true, name: true, tagline: true, logoUrl: true },
    });
  }),

  // Resolve whitelabel branding for a single tenant by slug.
  getBranding: publicProcedure
    .input(z.object({ slug: z.string().min(1) }))
    .query(async ({ ctx, input }) => {
      const church = await ctx.prisma.church.findUnique({
        where: { slug: input.slug },
      });
      if (!church) return null;
      return toTenantBranding(church);
    }),

  getById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      return ctx.prisma.church.findUnique({ where: { id: input.id } });
    }),

  /** Public site payload for `apps/church-site` (branding + content). */
  getPublicSite: publicProcedure
    .input(z.object({ slug: z.string().min(1) }))
    .query(async ({ ctx, input }) => {
      const church = await ctx.prisma.church.findFirst({
        where: { slug: input.slug, isActive: true },
      });
      if (!church) return null;

      const [events, announcements, sermonSeries] = await Promise.all([
        church.eventsEnabled
          ? ctx.prisma.event.findMany({
              where: { churchId: church.id, startsAt: { gte: new Date() } },
              orderBy: { startsAt: 'asc' },
              take: 12,
            })
          : Promise.resolve([]),
        ctx.prisma.announcement.findMany({
          where: { churchId: church.id, published: true },
          orderBy: { createdAt: 'desc' },
          take: 8,
        }),
        church.sermonsEnabled
          ? ctx.prisma.sermonSeries.findMany({
              where: { churchId: church.id },
              orderBy: { createdAt: 'desc' },
              take: 8,
            })
          : Promise.resolve([]),
      ]);

      return {
        branding: toTenantBranding(church),
        contact: {
          email: church.contactEmail,
          phone: church.phone,
          address: church.address,
          timezone: church.timezone,
        },
        events,
        announcements,
        sermonSeries,
      };
    }),

  /** Full church list for /dev (includes inactive + provisioning state). */
  adminList: devProcedure.query(async ({ ctx }) => {
    return ctx.prisma.church.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        _count: { select: { memberships: true } },
      },
    });
  }),

  adminGetBySlug: devProcedure
    .input(z.object({ slug: z.string().min(1) }))
    .query(async ({ ctx, input }) => {
      const church = await ctx.prisma.church.findUnique({
        where: { slug: input.slug },
        include: {
          _count: { select: { memberships: true, announcements: true, events: true } },
        },
      });
      if (!church) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Church not found' });
      }
      return church;
    }),

  /**
   * Public church signup: create church + pastors + locations/services + admin emails.
   * Does not create Users — platform staff are provisioned manually in the User table.
   */
  onboard: publicProcedure.input(churchOnboardInput).mutation(async ({ ctx, input }) => {
    const existingSlug = await ctx.prisma.church.findUnique({ where: { slug: input.slug } });
    if (existingSlug) {
      throw new TRPCError({ code: 'CONFLICT', message: 'Slug already in use' });
    }

    const churchAdminEmails = Array.from(
      new Set(input.adminEmails.map((e) => e.trim().toLowerCase()))
    );
    if (churchAdminEmails.length < 1) {
      throw new TRPCError({ code: 'BAD_REQUEST', message: 'Add at least one admin email' });
    }

    const pastorKeys = new Set(input.pastors.map((p) => p.clientKey));
    if (pastorKeys.size !== input.pastors.length) {
      throw new TRPCError({ code: 'BAD_REQUEST', message: 'Duplicate pastor keys' });
    }
    for (const loc of input.locations) {
      if (loc.pastorClientKey && !pastorKeys.has(loc.pastorClientKey)) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: `Unknown pastor for location "${loc.name}"`,
        });
      }
    }

    return ctx.prisma.$transaction(async (tx) => {
      const church = await tx.church.create({
        data: {
          slug: input.slug,
          name: input.name,
          tagline: input.tagline ?? null,
          contactEmail: churchAdminEmails[0] ?? null,
        },
      });

      await tx.churchAdminEmail.createMany({
        data: churchAdminEmails.map((email) => ({
          churchId: church.id,
          email,
          locationId: null,
        })),
      });

      const pastorIdByKey = new Map<string, string>();
      for (let index = 0; index < input.pastors.length; index++) {
        const pastor = input.pastors[index]!;
        const created = await tx.pastor.create({
          data: {
            churchId: church.id,
            firstName: pastor.firstName,
            lastName: pastor.lastName,
            title: pastor.title,
            sortOrder: index,
          },
        });
        pastorIdByKey.set(pastor.clientKey, created.id);
      }

      for (let locIndex = 0; locIndex < input.locations.length; locIndex++) {
        const loc = input.locations[locIndex]!;
        const location = await tx.location.create({
          data: {
            churchId: church.id,
            name: loc.name,
            address: loc.address,
            pastorId: loc.pastorClientKey
              ? (pastorIdByKey.get(loc.pastorClientKey) ?? null)
              : null,
            sortOrder: locIndex,
          },
        });

        if (loc.services.length > 0) {
          await tx.service.createMany({
            data: loc.services.map((svc, svcIndex) => ({
              locationId: location.id,
              name: svc.name,
              dayOfWeek: svc.dayOfWeek,
              startTime: svc.startTime,
              sortOrder: svcIndex,
            })),
          });
        }

        const locationAdmins = Array.from(
          new Set(loc.adminEmails.map((e) => e.trim().toLowerCase()).filter(Boolean))
        );
        if (locationAdmins.length > 0) {
          await tx.churchAdminEmail.createMany({
            data: locationAdmins.map((email) => ({
              churchId: church.id,
              email,
              locationId: location.id,
            })),
          });
        }
      }

      return {
        id: church.id,
        slug: church.slug,
        name: church.name,
      };
    });
  }),

  create: devProcedure.input(churchCreateInput).mutation(async ({ ctx, input }) => {
    const existing = await ctx.prisma.church.findUnique({ where: { slug: input.slug } });
    if (existing) {
      throw new TRPCError({ code: 'CONFLICT', message: 'Slug already in use' });
    }

    const { ownerEmail, ...data } = input;

    const church = await ctx.prisma.church.create({
      data: {
        slug: data.slug,
        name: data.name,
        tagline: data.tagline ?? null,
        logoUrl: data.logoUrl ?? null,
        primaryColor: data.primaryColor,
        secondaryColor: data.secondaryColor,
        contactEmail: data.contactEmail ?? null,
        phone: data.phone ?? null,
        address: data.address ?? null,
        timezone: data.timezone,
        givingEnabled: data.givingEnabled,
        eventsEnabled: data.eventsEnabled,
        sermonsEnabled: data.sermonsEnabled,
        isActive: data.isActive ?? true,
        planningCenterApiKey: data.planningCenterApiKey ?? null,
        planningCenterSecretKey: data.planningCenterSecretKey ?? null,
      },
    });

    if (ownerEmail) {
      const owner = await ctx.prisma.user.findUnique({ where: { email: ownerEmail } });
      if (owner) {
        await ctx.prisma.membership.upsert({
          where: {
            userId_churchId: { userId: owner.id, churchId: church.id },
          },
          update: { role: 'OWNER' },
          create: { userId: owner.id, churchId: church.id, role: 'OWNER' },
        });
      }
    }

    return church;
  }),

  update: devProcedure.input(churchUpdateInput).mutation(async ({ ctx, input }) => {
    const { id, ownerEmail: _ownerEmail, ...data } = input;
    void _ownerEmail;

    const existing = await ctx.prisma.church.findUnique({ where: { id } });
    if (!existing) {
      throw new TRPCError({ code: 'NOT_FOUND', message: 'Church not found' });
    }

    if (data.slug && data.slug !== existing.slug) {
      const conflict = await ctx.prisma.church.findUnique({ where: { slug: data.slug } });
      if (conflict) {
        throw new TRPCError({ code: 'CONFLICT', message: 'Slug already in use' });
      }
    }

    return ctx.prisma.church.update({
      where: { id },
      data: {
        ...data,
        tagline: data.tagline === undefined ? undefined : data.tagline,
        logoUrl: data.logoUrl === undefined ? undefined : data.logoUrl,
        contactEmail: data.contactEmail === undefined ? undefined : data.contactEmail,
        phone: data.phone === undefined ? undefined : data.phone,
        address: data.address === undefined ? undefined : data.address,
        customDomain: data.customDomain === undefined ? undefined : data.customDomain,
        planningCenterApiKey:
          data.planningCenterApiKey === undefined ? undefined : data.planningCenterApiKey,
        planningCenterSecretKey:
          data.planningCenterSecretKey === undefined ? undefined : data.planningCenterSecretKey,
      },
    });
  }),

  provisionWebsite: devProcedure
    .input(z.object({ churchId: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      const church = await ctx.prisma.church.findUnique({ where: { id: input.churchId } });
      if (!church) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Church not found' });
      }
      return provisionChurchWebsite(ctx.prisma, church);
    }),

  setMobilePlan: devProcedure
    .input(
      z.object({
        churchId: z.string().min(1),
        plan: z.enum(['SHARED', 'WHITELABEL']),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return setMobilePlan(ctx.prisma, input.churchId, input.plan);
    }),

  queueWhiteLabelBuild: devProcedure
    .input(z.object({ churchId: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      const church = await ctx.prisma.church.findUnique({ where: { id: input.churchId } });
      if (!church) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Church not found' });
      }
      return queueWhiteLabelBuild(ctx.prisma, church);
    }),
});
