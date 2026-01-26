# RecallForge Feature-Based Structure

```
recall/
├── app/                          # Next.js App Router (Pages & Layouts)
│   ├── (dashboard)/             # Protected application routes (route group)
│   │   ├── today/               # Today page - due and failed problems
│   │   ├── add/                 # Add problem page
│   │   └── patterns/            # Patterns overview page
│   ├── api/                     # API Routes
│   │   ├── auth/               # Better Auth routes
│   │   ├── problems/           # Problems API endpoints
│   │   ├── patterns/           # Patterns API endpoints
│   │   └── cron/               # Cron jobs (daily digest)
│   ├── layout.tsx              # Root layout
│   ├── page.tsx                # Landing/home page
│   └── globals.css             # Global styles
│
├── components/                  # Shared atomic UI components (shadcn/ui)
│   └── ui/                     # Radix UI primitives
│
├── features/                    # Domain-Driven Design (DDD) modules
│   ├── problems/               # Problem domain
│   │   ├── components/         # Problem-specific components
│   │   │   ├── problem-card.tsx
│   │   │   └── problem-form.tsx
│   │   ├── lib/               # Problem domain logic
│   │   │   └── state-machine.ts
│   │   └── types.ts           # Problem domain types
│   │
│   ├── patterns/               # Pattern domain
│   │   ├── components/         # Pattern-specific components
│   │   │   ├── pattern-badge.tsx
│   │   │   └── pattern-card.tsx
│   │   └── types.ts           # Pattern domain types
│   │
│   └── email/                  # Email domain
│       ├── templates/          # Email templates
│       │   └── daily-digest.tsx
│       └── lib/               # Email logic
│           └── send-daily-digest.ts
│
├── lib/                        # Shared utilities
│   ├── auth.ts                 # Better Auth configuration
│   ├── auth-client.ts          # Client-side auth
│   ├── auth-helpers.ts         # Server-side auth helpers
│   ├── prisma.ts               # Prisma client singleton
│   ├── email.ts                # Resend client (shared)
│   ├── utils.ts                # General utilities
│   └── types/                  # Shared types
│       └── enums.ts            # Shared enums
│
├── hooks/                      # Shared React hooks
│   ├── use-auth.ts            # Auth hook
│   └── use-mobile.ts          # Mobile detection hook
│
├── prisma/                     # Database schema & migrations
│   ├── schema.prisma
│   ├── seed.ts
│   └── migrations/
│
├── middleware.ts               # Next.js middleware
├── next.config.ts
├── tsconfig.json
└── package.json
```

## Feature Organization Principles

### Features (Domain-Driven Design)
Each feature is self-contained with:
- **components/** - Feature-specific UI components
- **lib/** - Feature-specific business logic
- **types.ts** - Feature-specific TypeScript types
- **api/** - Feature API routes (in `app/api/`)

### Shared Resources
- **components/ui/** - Atomic, reusable UI primitives (shadcn/ui)
- **lib/** - Cross-cutting concerns (auth, db, email client)
- **hooks/** - Shared React hooks

### App Router Structure
- **app/(dashboard)/** - Protected routes (grouped for layout)
- **app/api/** - All API endpoints organized by feature
