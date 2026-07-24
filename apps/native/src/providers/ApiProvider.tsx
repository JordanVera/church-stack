import React, { useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { httpBatchLink } from '@trpc/client';
import { trpc } from '../lib/trpc';
import { API_URL } from '../lib/config';
import { tenantStore } from '../lib/tenant-store';
import { sessionStore } from '../lib/session-store';

export function ApiProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());
  const [client] = useState(() =>
    trpc.createClient({
      links: [
        httpBatchLink({
          url: `${API_URL}/api/trpc`,
          headers() {
            const headers: Record<string, string> = {};
            const token = sessionStore.get();
            if (token) headers.Authorization = `Bearer ${token}`;
            const slug = tenantStore.get();
            if (slug) headers['x-church-slug'] = slug;
            return headers;
          },
        }),
      ],
    })
  );

  return (
    <trpc.Provider client={client} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </trpc.Provider>
  );
}
