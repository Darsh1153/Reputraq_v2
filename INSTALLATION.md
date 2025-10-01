# Installation Guide

## Required Packages

To use the full Redux + React Query implementation, you need to install the following packages:

```bash
npm install @reduxjs/toolkit react-redux @tanstack/react-query @tanstack/react-query-devtools
```

## After Installation

1. **Update QueryProvider** (`lib/providers/QueryProvider.tsx`):
   - Uncomment the React Query version
   - Comment out the fallback version

2. **Update queryClient** (`lib/queryClient.ts`):
   - Uncomment the React Query version
   - Comment out the fallback version

3. **Update useNews hooks** (`components/NewsMonitoringRedux.tsx`):
   - Change import from `useNewsSimple` to `useNews`

## Database Migration

Run the database migration to create the new tables:

```bash
npm run db:migrate
```

## Current Status

The application currently uses:
- ✅ Redux store for state management
- ✅ Database schema for news articles
- ✅ API endpoints for CRUD operations
- ✅ Simplified hooks (without React Query)
- ✅ Clean UI components

Once you install the packages and update the files, you'll have:
- ✅ Full React Query integration
- ✅ Automatic caching and background updates
- ✅ Optimistic updates
- ✅ DevTools for debugging
