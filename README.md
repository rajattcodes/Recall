# RecallForge

**NeetCode 150–style practice, but yours—and with spaced repetition.**

RecallForge is a pattern-first LeetCode practice system that feels like NeetCode's curated roadmap: problems grouped by algorithm pattern (Two Pointers, Sliding Window, DP, etc.). Unlike NeetCode's fixed 150, you **build your own list** from any LeetCode problems you care about. On top of that, **spaced repetition** tells you when to revisit each problem (3 → 10 → 30 days) so you retain patterns long-term instead of cram-and-forget.

**In short:** NeetCode 150 structure + your custom problems + science-backed revision = interview-ready pattern mastery.

## Features

- **Pattern-Based Organization**: 25+ canonical patterns (Binary Search, Sliding Window, Two Pointers, DP, etc.) plus custom patterns
- **Spaced Repetition**: Automatic scheduling at 3-day, 10-day, and 30-day intervals
- **Daily Practice**: "Today" page shows problems due for review and failed problems needing attention
- **Progress Tracking**: Track attempts, failures, and mastery status for each problem
- **Daily Digest Emails**: Get email reminders of problems due today (optional, via Resend)
- **Clean UI**: Minimal, focused interface built with Tailwind CSS and shadcn/ui components

## Tech Stack

<div align="center">
  <img src="https://img.shields.io/badge/Next.js-black?style=for-the-badge&logo=next.js&logoColor=white" alt="Next.js" />
  <img src="https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white" alt="PostgreSQL" />
  <img src="https://img.shields.io/badge/Prisma-3982CE?style=for-the-badge&logo=Prisma&logoColor=white" alt="Prisma" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="Tailwind CSS" />
  <img src="https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Radix%20UI-161618?style=for-the-badge&logo=radix-ui&logoColor=white" alt="Radix UI" />
  <img src="https://img.shields.io/badge/shadcn%2Fui-000000?style=for-the-badge&logo=shadcnui&logoColor=white" alt="shadcn/ui" />
  <img src="https://img.shields.io/badge/Zod-3068b7?style=for-the-badge&logo=zod&logoColor=white" alt="Zod" />
  <img src="https://img.shields.io/badge/Resend-000000?style=for-the-badge&logo=resend&logoColor=white" alt="Resend" />
</div>
<br />

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (App Router) |
| Database | PostgreSQL (Neon, Supabase, etc.) |
| ORM | Prisma |
| Auth | Better Auth (email/password, sessions) |
| Email | Resend |
| UI | Tailwind CSS, Radix UI, shadcn/ui components |
| Validation | Zod |

## Architecture

The system follows a typical Next.js full-stack architecture:

1. **Frontend (Client)**
   - React components (Server & Client components).
   - Tailwind CSS and shadcn/ui for UI components.
   - Server Actions for form submissions and data mutations.

2. **Backend (Server)**
   - Next.js API Routes for webhook integrations (e.g., cron jobs).
   - Next.js Server Components for data fetching.
   - Better Auth handles session management and authentication securely.
   
3. **Data Layer**
   - PostgreSQL serves as the primary data store.
   - Prisma ORM is used for typed database access and schema management.
   
4. **External Services**
   - **Resend**: Used for triggering and sending daily digest emails to users.
   - **Cron Jobs**: Vercel Cron is configured to hit an API route (`/api/cron/daily-digest`) daily to execute scheduled tasks.

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- PostgreSQL database (Neon, Supabase, or self-hosted)
- Resend account (optional, for email digests)

### Installation

1. **Clone the repository**

```bash
git clone <repository-url>
cd recall
```

2. **Install dependencies**

```bash
npm install
```

3. **Set up environment variables**

Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

Fill in the required environment variables (see [Environment Variables](#environment-variables) below).

4. **Set up the database**

```bash
# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma migrate dev

# Seed canonical patterns
npm run db:seed
```

5. **Start the development server**

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Environment Variables

| Variable | Purpose | Required |
|----------|---------|----------|
| `DATABASE_URL` | PostgreSQL connection string | Yes |
| `BETTER_AUTH_SECRET` | Auth signing secret (generate with `openssl rand -base64 32`) | Yes |
| `BETTER_AUTH_URL` | Server-side base URL (use deployed URL in production) | Yes |
| `NEXT_PUBLIC_BETTER_AUTH_URL` | Client-side base URL (use deployed URL in production) | Yes |
| `RESEND_API_KEY` | Resend API key for email digests | No |
| `RESEND_FROM_EMAIL` | Verified sender email address | No |
| `CRON_SECRET` | Bearer token for cron job authentication (generate with `openssl rand -base64 32`) | No |

See `.env.example` for detailed descriptions.

## Database Schema

The application uses the following main entities:

- **canonical_patterns**: System-provided algorithm patterns (25+ patterns seeded)
- **custom_patterns**: User-defined patterns that map to canonical patterns
- **problems**: Core entity tracking LeetCode problems with status, reminder stage, and attempt history
- **attempt_history**: Records of each attempt (solved/failed) for analytics

See `prisma/schema.prisma` for the complete schema.

## Available Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm test` | Run tests |
| `npm run db:migrate` | Run database migrations |
| `npm run db:seed` | Seed canonical patterns |
| `npm run db:generate` | Generate Prisma client |
| `npm run db:studio` | Open Prisma Studio |

## Project Structure

```
recall/
├── app/                    # Next.js App Router
│   ├── (auth)/            # Authentication pages
│   ├── (dashboard)/       # Protected routes (Today, Add, Patterns)
│   └── api/               # API routes
├── components/            # React components
│   └── ui/               # shadcn/ui components
├── lib/                  # Shared utilities
│   ├── auth.ts          # Better Auth configuration
│   ├── prisma.ts        # Prisma client
│   └── types/           # TypeScript types
├── features/             # Feature modules
│   └── problems/        # Problem domain logic
├── prisma/              # Database schema and migrations
└── hooks/               # React hooks
```

## Daily Digest Emails (Optional)

The app can send daily digest emails via Resend. To enable:

1. **Set up Resend**:
   - Sign up at [resend.com](https://resend.com)
   - Create an API key
   - For testing, use `onboarding@resend.dev` (no verification needed)
   - For production, verify your domain

2. **Configure cron job**:
   - Set `CRON_SECRET` in your environment variables
   - The cron schedule is configured in `vercel.json` (default: 8:00 AM UTC daily)
   - Cron runs only on production deployments

3. **Test locally**:

```bash
curl -H "Authorization: Bearer YOUR_CRON_SECRET" "http://localhost:3000/api/cron/daily-digest"
```

## Deployment

### Vercel

1. Push your code to GitHub
2. Import the project in Vercel
3. Add all environment variables in Vercel project settings
4. Deploy

The cron job for daily digests is automatically configured via `vercel.json`.

### Database

Use a managed PostgreSQL service:
- **Neon**: [neon.tech](https://neon.tech)
- **Supabase**: [supabase.com](https://supabase.com)

## How It Works

1. **Add Problems**: Add LeetCode problems and assign them to patterns
2. **Practice**: Problems appear on "Today" when due (3, 10, or 30 days after last attempt)
3. **Mark Results**: Mark problems as "Solved" or "Failed"
4. **Spaced Repetition**: Solved problems advance to the next stage; failed problems reset to 3-day stage
5. **Mastery**: Problems that complete all stages (3 → 10 → 30 days) are marked as mastered

## State Machine

Problems follow this lifecycle:

- **Status**: `fresh` → `active` → `mastered`; `failed` resets to `day_3`
- **Stages**: `day_3` → `day_10` → `day_30` → `completed`
- Failed problems always appear in the "Failed" section until solved
- Mastered problems are excluded from "due today"

See `features/problems/lib/state-machine.ts` for implementation details.

## License

Private project.

## Support

For issues or questions, please open an issue in the repository.
