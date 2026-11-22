# NexoCRM

A CRM for small sales and support teams, with AI features that run **locally** on your own hardware.

NexoCRM manages contacts, companies, sales opportunities, activities and support tickets. It is being built in phases: first a solid CRM that works without AI, then AI features on top of real data — summaries, ticket classification, reply drafts, semantic search and a chat assistant that answers questions about the CRM. All AI runs through [LM Studio](https://lmstudio.ai) with open models, so customer data never leaves the machine.

> **Status:** Phase 1 (core CRM) in progress. This is a personal learning and portfolio project.

## Features

### Available now

- **Authentication** with email and password ([Better Auth](https://www.better-auth.com)), database sessions and role-based access (Admin, Manager, Agent)
- **Protected app layout** with sidebar navigation
- **Dashboard** with live counts: contacts, open deals, open tickets and the current user's pending tasks
- **Contacts**
  - List with search (name, email, company), lifecycle-stage filter and pagination
  - Contact profile with activity timeline, deals, tickets, pending tasks and tags
  - Create form with server-side validation (Zod)
  - Row-level permissions: agents only see the contacts they own

### Planned

| Phase | Scope |
|---|---|
| 1 — Core CRM | Companies, deals pipeline (kanban), activities and tasks, support tickets, dashboard |
| 2 — Inline AI | Chat assistant with read-only tools, contact summaries, reply drafts, ticket classification |
| 3 — Advanced AI | Embeddings with pgvector, semantic search, lead scoring, churn-risk signals |
| 4 — Polish | Optional memberships module, AI usage metrics, public demo |

### AI design principles

- **AI suggests, people decide.** No AI feature changes data without an explicit user action.
- **Everything is logged.** Every model call stores input, output, model, tokens and whether the suggestion was accepted.
- **Swappable provider.** The app talks to an OpenAI-compatible API; moving from LM Studio to a hosted model is a configuration change.

## Tech stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router), React 19, TypeScript |
| UI | Tailwind CSS 4, shadcn/ui |
| Auth | Better Auth (email and password, database sessions) |
| Database | PostgreSQL 16 + pgvector (Docker) |
| ORM | Prisma 7 with the `pg` driver adapter |
| Validation | Zod |
| AI (planned) | Vercel AI SDK + LM Studio (OpenAI-compatible API) |

## Getting started

### Prerequisites

- Node.js (LTS)
- Docker Desktop
- Git

### 1. Clone and install

```bash
git clone https://github.com/CrazierMars/nexocrm.git
cd nexocrm
npm install
```

### 2. Environment variables

Create a `.env` file in the project root:

```env
DATABASE_URL="postgresql://nexo:nexo@localhost:5432/nexocrm"
BETTER_AUTH_SECRET="generate-with: npx auth@latest secret"
BETTER_AUTH_URL="http://localhost:3000"
```

### 3. Start the database

```bash
docker compose up -d
```

### 4. Set up Prisma

```bash
npx prisma migrate dev
npx prisma generate
npx prisma db seed
```

The seed creates sample data: 3 users, a sales pipeline with 6 stages, 8 companies, 30 contacts, and their activities, deals, tickets and tasks.

### 5. Run the app

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) and sign in with one of the seeded users.

### Seeded users (local development only)

| Role | Email |
|---|---|
| Admin | `admin@nexocrm.dev` |
| Manager | `manager@nexocrm.dev` |
| Agent | `agente@nexocrm.dev` |

All seeded users share the password defined in `prisma/seed.ts`. Re-running the seed wipes and recreates all data.

## Project structure

```text
src/
├── app/
│   ├── (auth)/login/          # Sign-in page
│   ├── (crm)/                 # Protected area: layout, dashboard, contacts…
│   └── api/auth/[...all]/     # Better Auth endpoint
├── components/
│   ├── ui/                    # shadcn/ui components
│   └── crm/                   # CRM components (forms, badges…)
├── lib/                       # Auth client, labels, Zod schemas
├── server/
│   ├── actions/               # Server Actions (form handling)
│   ├── services/              # Data access and business rules
│   ├── auth.ts                # Better Auth configuration
│   ├── db.ts                  # Prisma client
│   ├── permissions.ts         # Role-based scoping
│   └── session.ts             # Session helpers
└── proxy.ts                   # Fast redirect for unauthenticated requests
prisma/
├── schema.prisma
├── migrations/
└── seed.ts
```

Every module follows the same flow: **page → Server Action → Zod validation → service → Prisma**. Services are the single place where queries and permissions live, so the future AI assistant can reuse them without duplicating rules.

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start the development server |
| `npm run build` | Build for production |
| `npx prisma studio` | Browse the database in the browser |
| `npx prisma db seed` | Reset sample data |
| `docker compose stop` | Stop the database (data is kept) |

## License

Personal project — all rights reserved for now.