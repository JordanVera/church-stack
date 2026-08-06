/** Inbound address for platform support notifications (owner contact form, etc.). */
export const DEFAULT_PLATFORM_SUPPORT_EMAIL = 'gatherlystack@proton.me';

export function getPlatformSupportEmail(): string {
  return (
    process.env.PLATFORM_SUPPORT_EMAIL?.trim() ||
    process.env.NEXT_PUBLIC_SUPPORT_EMAIL?.trim() ||
    DEFAULT_PLATFORM_SUPPORT_EMAIL
  );
}
