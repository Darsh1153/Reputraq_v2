# Reputraq

A Next.js application with React, PostgreSQL, Drizzle ORM, SCSS, and TypeScript.

## Features

- ⚡ Next.js 14 with App Router
- ⚛️ React 18
- 🗄️ PostgreSQL database
- 🔧 Drizzle ORM for database operations
- 🎨 SCSS for styling
- 📘 TypeScript for type safety
- 🚀 API routes for backend functionality

## Getting Started

### Prerequisites

- Node.js 18+ 
- PostgreSQL database
- Node.js package manager (npm)

### Installation

1. Install dependencies:
```bash
npm install
```

2. Set up your environment variables:
Create a `.env.local` file in the root directory:
```env
DATABASE_URL="postgresql://username:password@localhost:5432/reputraq"
```

3. Generate and run database migrations:
```bash
npm run db:generate
npm run db:migrate
```

4. Migrate the existing schema (if you have existing data):
```bash
npm run migrate-schema
```

5. Create an admin user for testing:
```bash
npm run create-admin
```

6. Start the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Database Schema

The application includes a `users` table with the following structure:
- `id` (serial, primary key)
- `name` (varchar, not null)

## API Routes

- `GET /api/users` - Fetch all users from the database

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run db:generate` - Generate Drizzle migrations
- `npm run db:migrate` - Push schema to database
- `npm run db:studio` - Open Drizzle Studio

## Project Structure

```
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   │   └── users/         # Users API endpoint
│   ├── globals.scss       # Global styles
│   ├── layout.tsx         # Root layout
│   ├── page.tsx           # Home page
│   └── page.module.scss   # Home page styles
├── components/            # React components
│   ├── UsersList.tsx      # Users list component
│   └── UsersList.module.scss
├── lib/                   # Utility libraries
│   └── db/                # Database configuration
│       ├── index.ts       # Database connection
│       └── schema.ts      # Database schema
├── drizzle/               # Generated migrations
└── drizzle.config.ts      # Drizzle configuration
```
# reputraq
# reputraq
# reputraq
# reputraq_app
# social_listening
# social_listening_v1
# social_listening_v1
# Reputraq_v2
