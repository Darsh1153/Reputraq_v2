'use client';

import { queryClient } from '@/lib/queryClient';

interface QueryProviderProps {
  children: React.ReactNode;
}

// Fallback QueryProvider that works without React Query installed
export function QueryProvider({ children }: QueryProviderProps) {
  // For now, just return children without React Query
  // This will be replaced once packages are installed
  return <>{children}</>;
}

// Uncomment this once @tanstack/react-query is installed:
/*
'use client';

import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { queryClient } from '@/lib/queryClient';

interface QueryProviderProps {
  children: React.ReactNode;
}

export function QueryProvider({ children }: QueryProviderProps) {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}
*/
