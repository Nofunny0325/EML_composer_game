# EML Composer Game

Educational puzzle game built around one binary operator:

```txt
eml(x, y) = exp(x) - log(y)
```

Players drag blocks into an EML combiner. Every player-created block is made by
the same rule:

```txt
new block = EML(left block, right block)
```

## Project Parts

- `apps/web`: Next.js app, auth, stage UI, Prisma database access, verifier API
- `services/verifier`: legacy Python verifier, not needed for Vercel deployment

## Requirements

- Node.js 20+
- PostgreSQL connection string from Supabase or Neon

## Local Setup

Copy the env file:

```powershell
cd apps\web
copy .env.example .env
```

Edit `apps\web\.env`:

```txt
DATABASE_URL=postgresql://USER:PASSWORD@HOST:PORT/DATABASE?sslmode=require
JWT_SECRET=dev-secret-change-later
```

Then from the repository root:

```powershell
.\scripts\start-local.ps1
```

Open:

```txt
http://127.0.0.1:3000
```

There is no separate verifier server anymore.

## Database

Use Prisma Studio:

```powershell
cd apps\web
npx prisma studio
```

More notes: `docs/database.md`.

## Public Link

Deploy with Vercel plus Supabase/Neon PostgreSQL.

See:

```txt
docs/deployment.md
```

## First Test Submission

Register and open Stage 1. Build:

```txt
EML(1, 1)
```

Drag `1` into both EML slots, combine, then submit the selected workspace block.
