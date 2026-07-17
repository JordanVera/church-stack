import { createTRPCReact } from '@trpc/react-query';
// Type-only import: the server runtime (Prisma, etc.) is never bundled into the app.
import type { AppRouter } from '@repo/api';

export const trpc = createTRPCReact<AppRouter>();
