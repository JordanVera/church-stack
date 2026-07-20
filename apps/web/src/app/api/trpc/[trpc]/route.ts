import { fetchRequestHandler } from '@trpc/server/adapters/fetch';
import { appRouter, createContext } from '@repo/api';
import { auth } from '@/auth';

const handler = async (req: Request) => {
  const session = await auth();

  return fetchRequestHandler({
    endpoint: '/api/trpc',
    req,
    router: appRouter,
    createContext: () =>
      createContext({
        headers: req.headers,
        session: session?.user
          ? {
              user: {
                id: session.user.id,
                email: session.user.email,
                name: session.user.name,
                isAdmin: session.user.isAdmin,
              },
            }
          : null,
      }),
  });
};

export { handler as GET, handler as POST };
