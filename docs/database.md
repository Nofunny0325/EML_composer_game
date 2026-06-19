# Database Inspection

This project now uses PostgreSQL through Prisma.

## Local and Production DB

Set this in `apps/web/.env`:

```txt
DATABASE_URL=postgresql://USER:PASSWORD@HOST:PORT/DATABASE?sslmode=require
```

Use the same style of URL in Vercel's environment variables.

## Apply Schema and Seed Stages

From `apps/web`:

```bash
npx prisma db push
npm run db:seed
```

## Prisma Studio

From `apps/web`:

```bash
npx prisma studio
```

Open the URL shown in the terminal. You can inspect:

- `User`
- `Stage`
- `UserStageProgress`

## Reset the DB

Careful: this deletes data.

```bash
npx prisma db push --force-reset
npm run db:seed
```
