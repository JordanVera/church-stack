/**
 * Tiny module-level holder for the active tenant slug. The tRPC client reads
 * this in its `headers` function so every request carries `x-church-slug`
 * for the currently selected church.
 */
let currentSlug: string | null = null;

export const tenantStore = {
  get: () => currentSlug,
  set: (slug: string | null) => {
    currentSlug = slug;
  },
};
