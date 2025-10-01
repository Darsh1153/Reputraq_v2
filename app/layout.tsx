import type { Metadata } from 'next';
import './globals.scss';
import { ReduxProvider } from '@/lib/providers/ReduxProvider';
import { QueryProvider } from '@/lib/providers/QueryProvider';
import { LoadingIndicator } from '@/components/LoadingIndicator';
import { CronInitializer } from '@/components/CronInitializer';

export const metadata: Metadata = {
  title: 'Reputraq',
  description: 'A Next.js application with PostgreSQL and Drizzle ORM',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <ReduxProvider>
          <QueryProvider>
            {children}
            <LoadingIndicator />
            <CronInitializer />
          </QueryProvider>
        </ReduxProvider>
      </body>
    </html>
  );
}
