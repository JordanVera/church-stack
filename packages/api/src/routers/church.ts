import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { planAllowsGiving, planTierDefaults, toTenantBranding } from '@repo/config';
import { router, publicProcedure, devProcedure, churchAdminProcedure } from '../trpc';
import {
  assertChurchAdmin,
  assertChurchAdminBySlug,
  isPlanningCenterLinked,
} from '../church-admin';
import { attachCustomDomainToProject, provisionChurchWebsite } from '../provision/vercel';
import { queueWhiteLabelBuild, setMobilePlan } from '../provision/eas';
import { fetchCampusesWithServiceTimes } from '../planning-center/client';
import { syncPlanningCenterForChurch } from '../planning-center/sync';
import {
  getPlaylistVideos,
  invalidatePlaylistCache,
  resolveToPlaylistId,
  type SermonVideo,
} from '../youtube/playlist';

const PUBLIC_SERMONS_PAGE_SIZE = 12;

const planTierSchema = z.enum(['SITE', 'GROWTH', 'CUSTOM']);

const slugSchema = z
  .string()
  .min(2)
  .max(48)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug must be lowercase letters, numbers, and hyphens');

const timeSchema = z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, 'Start time must be HH:mm (24h)');

const emailSchema = z.string().email().max(254);

/** Empty string / null → null; otherwise must be a valid URL. */
const optionalUrlSchema = z
  .union([z.string().url().max(500), z.literal(''), z.null()])
  .optional()
  .transform((v) => {
    if (v === undefined || v === null || v === '') return null;
    return v;
  });

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
  planTier: planTierSchema.optional(),
  givingEnabled: z.boolean().optional(),
  givingUrl: optionalUrlSchema,
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

const churchOnboardInput = z.object({
  slug: slugSchema,
  name: z.string().min(1).max(120),
  tagline: z.string().max(200).optional().nullable(),
  /** Church-wide admin contact emails (at least one). */
  adminEmails: z.array(emailSchema).min(1).max(50),
  facebookUrl: optionalUrlSchema,
  instagramUrl: optionalUrlSchema,
  youtubeUrl: optionalUrlSchema,
  threadsUrl: optionalUrlSchema,
  planningCenterApiKey: z.string().max(2000).optional().nullable(),
  planningCenterSecretKey: z.string().max(2000).optional().nullable(),
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

  getById: publicProcedure.input(z.object({ id: z.string() })).query(async ({ ctx, input }) => {
    return ctx.prisma.church.findUnique({ where: { id: input.id } });
  }),

  /**
   * Preview-import campuses + weekly service times from Planning Center People API.
   * Does not write to the DB — used to prefill the onboard Locations step.
   */
  previewPlanningCenterCampuses: publicProcedure
    .input(
      z.object({
        applicationId: z.string().min(1).max(2000),
        secret: z.string().min(1).max(2000),
      })
    )
    .mutation(async ({ input }) => {
      const locations = await fetchCampusesWithServiceTimes(
        input.applicationId.trim(),
        input.secret.trim()
      );
      if (locations.length === 0) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message:
            'Connected to Planning Center successfully, but no campuses were found. In Planning Center People, add at least one Campus (with optional service times), then try importing again. You can also enter locations manually below.',
        });
      }
      return { locations };
    }),

  /** Public site payload for `apps/church-site` (branding + content). */
  getPublicSite: publicProcedure
    .input(z.object({ slug: z.string().min(1) }))
    .query(async ({ ctx, input }) => {
      const church = await ctx.prisma.church.findFirst({
        where: { slug: input.slug, isActive: true },
      });
      if (!church) return null;

      const [events, announcements, sermonSeries, lifeGroups, locations] = await Promise.all([
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
        church.sermonsEnabled && !church.sermonsYoutubePlaylistId
          ? ctx.prisma.sermonSeries.findMany({
              where: { churchId: church.id },
              orderBy: { createdAt: 'desc' },
              take: 8,
            })
          : Promise.resolve([]),
        ctx.prisma.lifeGroup.findMany({
          where: { churchId: church.id },
          orderBy: { name: 'asc' },
          take: 24,
        }),
        ctx.prisma.location.findMany({
          where: { churchId: church.id },
          orderBy: { sortOrder: 'asc' },
          include: { services: { orderBy: { sortOrder: 'asc' } } },
          take: 20,
        }),
      ]);

      let sermons: SermonVideo[] = [];
      let sermonsNextPageToken: string | null = null;
      if (church.sermonsEnabled && church.sermonsYoutubePlaylistId) {
        try {
          const page = await getPlaylistVideos(church.sermonsYoutubePlaylistId, {
            maxResults: PUBLIC_SERMONS_PAGE_SIZE,
          });
          sermons = page.videos;
          sermonsNextPageToken = page.nextPageToken ?? null;
        } catch (err) {
          console.error(
            `[getPublicSite] YouTube sermons failed for ${church.slug}:`,
            err instanceof Error ? err.message : err
          );
          sermons = [];
          sermonsNextPageToken = null;
        }
      }

      return {
        branding: toTenantBranding(church),
        planTier: church.planTier,
        contact: {
          email: church.contactEmail,
          phone: church.phone,
          address: church.address,
          timezone: church.timezone,
        },
        social: {
          facebookUrl: church.facebookUrl,
          instagramUrl: church.instagramUrl,
          youtubeUrl: church.youtubeUrl,
          threadsUrl: church.threadsUrl,
        },
        events,
        announcements,
        sermonSeries,
        sermons,
        sermonsNextPageToken,
        sermonsYoutubePlaylistId: church.sermonsYoutubePlaylistId,
        lifeGroups,
        locations,
      };
    }),

  /**
   * Paginated public sermons for church-site "Load more".
   * Uses the church's saved YouTube playlist; never exposes API keys.
   */
  getPublicSermons: publicProcedure
    .input(
      z.object({
        slug: z.string().min(1),
        pageToken: z.string().min(1).max(500).optional(),
        pageSize: z.number().int().min(1).max(24).optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const church = await ctx.prisma.church.findFirst({
        where: { slug: input.slug, isActive: true },
        select: {
          sermonsEnabled: true,
          sermonsYoutubePlaylistId: true,
        },
      });
      if (!church || !church.sermonsEnabled || !church.sermonsYoutubePlaylistId) {
        return { videos: [] as SermonVideo[], nextPageToken: null as string | null };
      }

      try {
        const page = await getPlaylistVideos(church.sermonsYoutubePlaylistId, {
          maxResults: input.pageSize ?? PUBLIC_SERMONS_PAGE_SIZE,
          pageToken: input.pageToken,
        });
        return {
          videos: page.videos,
          nextPageToken: page.nextPageToken ?? null,
        };
      } catch (err) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: err instanceof Error ? err.message : 'Failed to load sermons',
        });
      }
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
      const siteDefaults = planTierDefaults('SITE');
      const pcoKey = input.planningCenterApiKey?.trim() || null;
      const pcoSecret = input.planningCenterSecretKey?.trim() || null;

      const church = await tx.church.create({
        data: {
          slug: input.slug,
          name: input.name,
          tagline: input.tagline ?? null,
          contactEmail: churchAdminEmails[0] ?? null,
          facebookUrl: input.facebookUrl ?? null,
          instagramUrl: input.instagramUrl ?? null,
          youtubeUrl: input.youtubeUrl ?? null,
          threadsUrl: input.threadsUrl ?? null,
          planningCenterApiKey: pcoKey,
          planningCenterSecretKey: pcoSecret,
          ...siteDefaults,
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
            pastorId: loc.pastorClientKey ? (pastorIdByKey.get(loc.pastorClientKey) ?? null) : null,
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
    const tierDefaults = planTierDefaults(data.planTier ?? 'SITE');

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
        ...tierDefaults,
        givingEnabled: data.givingEnabled ?? tierDefaults.givingEnabled,
        givingUrl: data.givingUrl ?? null,
        eventsEnabled: data.eventsEnabled ?? tierDefaults.eventsEnabled,
        sermonsEnabled: data.sermonsEnabled ?? tierDefaults.sermonsEnabled,
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

    const tierPatch = data.planTier !== undefined ? planTierDefaults(data.planTier) : null;

    return ctx.prisma.church.update({
      where: { id },
      data: {
        ...data,
        ...(tierPatch ?? {}),
        // Explicit flag overrides win over tier defaults when both are sent.
        givingEnabled:
          data.givingEnabled !== undefined
            ? data.givingEnabled
            : (tierPatch?.givingEnabled ?? undefined),
        givingUrl: data.givingUrl === undefined ? undefined : data.givingUrl,
        eventsEnabled:
          data.eventsEnabled !== undefined
            ? data.eventsEnabled
            : (tierPatch?.eventsEnabled ?? undefined),
        sermonsEnabled:
          data.sermonsEnabled !== undefined
            ? data.sermonsEnabled
            : (tierPatch?.sermonsEnabled ?? undefined),
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

  ownerUpdateGivingUrl: churchAdminProcedure
    .input(
      z.object({
        churchId: z.string().min(1),
        givingUrl: optionalUrlSchema,
      })
    )
    .mutation(async ({ ctx, input }) => {
      const church = await assertChurchAdmin(ctx, input.churchId);

      if (!planAllowsGiving(church.planTier)) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Giving URL is available on Growth and Custom plans.',
        });
      }

      return ctx.prisma.church.update({
        where: { id: church.id },
        data: { givingUrl: input.givingUrl ?? null },
        select: {
          id: true,
          slug: true,
          givingUrl: true,
        },
      });
    }),

  /** Update primary/secondary brand colors used on the white-label site and app. */
  ownerUpdateBrandingColors: churchAdminProcedure
    .input(
      z.object({
        churchId: z.string().min(1),
        primaryColor: z
          .string()
          .regex(/^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/, 'Use a hex color like #1a8bbd'),
        secondaryColor: z
          .string()
          .regex(/^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/, 'Use a hex color like #84dccf'),
      })
    )
    .mutation(async ({ ctx, input }) => {
      await assertChurchAdmin(ctx, input.churchId);

      return ctx.prisma.church.update({
        where: { id: input.churchId },
        data: {
          primaryColor: input.primaryColor.toLowerCase(),
          secondaryColor: input.secondaryColor.toLowerCase(),
        },
        select: {
          id: true,
          slug: true,
          primaryColor: true,
          secondaryColor: true,
        },
      });
    }),

  /** Default light/dark mode for the white-label website. */
  ownerUpdateSiteThemeDefault: churchAdminProcedure
    .input(
      z.object({
        churchId: z.string().min(1),
        siteThemeDefault: z.enum(['LIGHT', 'DARK']),
      })
    )
    .mutation(async ({ ctx, input }) => {
      await assertChurchAdmin(ctx, input.churchId);

      return ctx.prisma.church.update({
        where: { id: input.churchId },
        data: { siteThemeDefault: input.siteThemeDefault },
        select: {
          id: true,
          slug: true,
          siteThemeDefault: true,
        },
      });
    }),

  /** Set or clear the church logo URL (Blob upload route persists after upload). */
  ownerUpdateLogoUrl: churchAdminProcedure
    .input(
      z.object({
        churchId: z.string().min(1),
        logoUrl: optionalUrlSchema,
      })
    )
    .mutation(async ({ ctx, input }) => {
      await assertChurchAdmin(ctx, input.churchId);

      return ctx.prisma.church.update({
        where: { id: input.churchId },
        data: { logoUrl: input.logoUrl ?? null },
        select: {
          id: true,
          slug: true,
          logoUrl: true,
        },
      });
    }),

  /** Update public contact details shown on the white-label site. */
  ownerUpdateContact: churchAdminProcedure
    .input(
      z.object({
        churchId: z.string().min(1),
        contactEmail: z
          .union([z.string().email().max(254), z.literal(''), z.null()])
          .optional()
          .transform((v) => {
            if (v === undefined || v === null || v === '') return null;
            return v;
          }),
        phone: z
          .union([z.string().max(40), z.literal(''), z.null()])
          .optional()
          .transform((v) => {
            if (v === undefined || v === null || v === '') return null;
            return v.trim();
          }),
        address: z
          .union([z.string().max(300), z.literal(''), z.null()])
          .optional()
          .transform((v) => {
            if (v === undefined || v === null || v === '') return null;
            return v.trim();
          }),
      })
    )
    .mutation(async ({ ctx, input }) => {
      await assertChurchAdmin(ctx, input.churchId);

      return ctx.prisma.church.update({
        where: { id: input.churchId },
        data: {
          contactEmail: input.contactEmail ?? null,
          phone: input.phone ?? null,
          address: input.address ?? null,
        },
        select: {
          id: true,
          slug: true,
          contactEmail: true,
          phone: true,
          address: true,
        },
      });
    }),

  /** Update public social profile URLs shown on the white-label site. */
  ownerUpdateSocial: churchAdminProcedure
    .input(
      z.object({
        churchId: z.string().min(1),
        facebookUrl: optionalUrlSchema,
        instagramUrl: optionalUrlSchema,
        youtubeUrl: optionalUrlSchema,
        threadsUrl: optionalUrlSchema,
      })
    )
    .mutation(async ({ ctx, input }) => {
      await assertChurchAdmin(ctx, input.churchId);

      return ctx.prisma.church.update({
        where: { id: input.churchId },
        data: {
          facebookUrl: input.facebookUrl ?? null,
          instagramUrl: input.instagramUrl ?? null,
          youtubeUrl: input.youtubeUrl ?? null,
          threadsUrl: input.threadsUrl ?? null,
        },
        select: {
          id: true,
          slug: true,
          facebookUrl: true,
          instagramUrl: true,
          youtubeUrl: true,
          threadsUrl: true,
        },
      });
    }),

  /**
   * Save or clear a YouTube playlist/channel URL for the public sermons grid.
   * Empty sourceUrl clears the link.
   */
  ownerUpdateSermonsPlaylist: churchAdminProcedure
    .input(
      z.object({
        churchId: z.string().min(1),
        sourceUrl: z.string().max(2000).optional().nullable(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const church = await assertChurchAdmin(ctx, input.churchId);

      if (!church.sermonsEnabled) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Sermons are disabled for this church.',
        });
      }

      const trimmed = input.sourceUrl?.trim() || '';
      if (!trimmed) {
        invalidatePlaylistCache(church.sermonsYoutubePlaylistId);
        return ctx.prisma.church.update({
          where: { id: church.id },
          data: {
            sermonsYoutubePlaylistId: null,
            sermonsYoutubeSourceUrl: null,
          },
          select: {
            id: true,
            slug: true,
            sermonsYoutubePlaylistId: true,
            sermonsYoutubeSourceUrl: true,
          },
        });
      }

      try {
        const { playlistId, sourceUrl } = await resolveToPlaylistId(trimmed);
        // Validate the playlist is readable before saving.
        await getPlaylistVideos(playlistId, { maxResults: 5 });
        invalidatePlaylistCache(church.sermonsYoutubePlaylistId);
        invalidatePlaylistCache(playlistId);

        return ctx.prisma.church.update({
          where: { id: church.id },
          data: {
            sermonsYoutubePlaylistId: playlistId,
            sermonsYoutubeSourceUrl: sourceUrl,
          },
          select: {
            id: true,
            slug: true,
            sermonsYoutubePlaylistId: true,
            sermonsYoutubeSourceUrl: true,
          },
        });
      } catch (err) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: err instanceof Error ? err.message : 'Failed to connect YouTube playlist',
        });
      }
    }),

  /** Preview sermons for the owner dashboard (first page). */
  ownerPreviewSermons: churchAdminProcedure
    .input(z.object({ churchId: z.string().min(1) }))
    .query(async ({ ctx, input }) => {
      const church = await assertChurchAdmin(ctx, input.churchId);
      if (!church.sermonsYoutubePlaylistId) {
        return { videos: [] as SermonVideo[], playlistId: null as string | null };
      }
      try {
        const { videos } = await getPlaylistVideos(church.sermonsYoutubePlaylistId, {
          maxResults: 6,
        });
        return { videos, playlistId: church.sermonsYoutubePlaylistId };
      } catch (err) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: err instanceof Error ? err.message : 'Failed to load sermon preview',
        });
      }
    }),

  /**
   * Owner dashboard summary for a church (by slug). Never returns raw PCO secrets.
   */
  getOwnerDashboard: churchAdminProcedure
    .input(z.object({ slug: z.string().min(1) }))
    .query(async ({ ctx, input }) => {
      const church = await assertChurchAdminBySlug(ctx, input.slug);
      const planningCenterLinked = isPlanningCenterLinked(church);

      const [pastorCount, locationCount, eventCount, announcementCount, lifeGroupCount] =
        await Promise.all([
          ctx.prisma.pastor.count({ where: { churchId: church.id } }),
          ctx.prisma.location.count({ where: { churchId: church.id } }),
          ctx.prisma.event.count({ where: { churchId: church.id } }),
          ctx.prisma.announcement.count({ where: { churchId: church.id } }),
          ctx.prisma.lifeGroup.count({ where: { churchId: church.id } }),
        ]);

      return {
        id: church.id,
        slug: church.slug,
        name: church.name,
        planTier: church.planTier,
        logoUrl: church.logoUrl,
        primaryColor: church.primaryColor,
        secondaryColor: church.secondaryColor,
        siteThemeDefault: church.siteThemeDefault,
        contactEmail: church.contactEmail,
        phone: church.phone,
        address: church.address,
        facebookUrl: church.facebookUrl,
        instagramUrl: church.instagramUrl,
        youtubeUrl: church.youtubeUrl,
        threadsUrl: church.threadsUrl,
        websiteStatus: church.websiteStatus,
        websiteUrl: church.websiteUrl,
        customDomain: church.customDomain,
        mobilePlan: church.mobilePlan,
        mobileBuildStatus: church.mobileBuildStatus,
        givingUrl: church.givingUrl,
        givingEnabled: church.givingEnabled,
        canEditGiving: planAllowsGiving(church.planTier),
        sermonsEnabled: church.sermonsEnabled,
        sermonsYoutubePlaylistId: church.sermonsYoutubePlaylistId,
        sermonsYoutubeSourceUrl: church.sermonsYoutubeSourceUrl,
        planningCenterLinked,
        counts: {
          pastors: pastorCount,
          locations: locationCount,
          events: eventCount,
          announcements: announcementCount,
          lifeGroups: lifeGroupCount,
        },
      };
    }),

  connectPlanningCenter: churchAdminProcedure
    .input(
      z.object({
        churchId: z.string().min(1),
        applicationId: z.string().min(1).max(2000),
        secret: z.string().min(1).max(2000),
        /** When true, run a full sync after saving credentials. */
        syncAfterConnect: z.boolean().optional().default(true),
      })
    )
    .mutation(async ({ ctx, input }) => {
      await assertChurchAdmin(ctx, input.churchId);

      const applicationId = input.applicationId.trim();
      const secret = input.secret.trim();

      // Validate credentials before persisting.
      const campuses = await fetchCampusesWithServiceTimes(applicationId, secret);
      if (campuses.length === 0) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message:
            'Connected successfully, but no campuses were found in Planning Center. Add a Campus in People, then try again.',
        });
      }

      await ctx.prisma.church.update({
        where: { id: input.churchId },
        data: {
          planningCenterApiKey: applicationId,
          planningCenterSecretKey: secret,
        },
      });

      let sync = null;
      if (input.syncAfterConnect) {
        sync = await syncPlanningCenterForChurch(ctx.prisma, input.churchId);
      }

      return {
        planningCenterLinked: true,
        campusCount: campuses.length,
        sync,
      };
    }),

  disconnectPlanningCenter: churchAdminProcedure
    .input(z.object({ churchId: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      await assertChurchAdmin(ctx, input.churchId);

      await ctx.prisma.church.update({
        where: { id: input.churchId },
        data: {
          planningCenterApiKey: null,
          planningCenterSecretKey: null,
        },
      });

      return { planningCenterLinked: false };
    }),

  setPlanTier: devProcedure
    .input(
      z.object({
        churchId: z.string().min(1),
        planTier: planTierSchema,
      })
    )
    .mutation(async ({ ctx, input }) => {
      const existing = await ctx.prisma.church.findUnique({ where: { id: input.churchId } });
      if (!existing) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Church not found' });
      }
      return ctx.prisma.church.update({
        where: { id: input.churchId },
        data: planTierDefaults(input.planTier),
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

  attachCustomDomain: devProcedure
    .input(z.object({ churchId: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      const church = await ctx.prisma.church.findUnique({ where: { id: input.churchId } });
      if (!church) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Church not found' });
      }
      if (!church.customDomain) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Set customDomain on the church before attaching.',
        });
      }
      if (!church.vercelProjectId) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Provision the website first so a Vercel project exists.',
        });
      }

      const result = await attachCustomDomainToProject(church.vercelProjectId, church.customDomain);

      if (result.ok) {
        await ctx.prisma.church.update({
          where: { id: church.id },
          data: {
            customDomain: result.domain,
            websiteUrl: `https://${result.domain}`,
          },
        });
      }

      return result;
    }),

  syncPlanningCenter: churchAdminProcedure
    .input(z.object({ churchId: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      await assertChurchAdmin(ctx, input.churchId);
      return syncPlanningCenterForChurch(ctx.prisma, input.churchId);
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
