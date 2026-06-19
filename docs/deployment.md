# Public Deployment

This version deploys to Vercel as a single Next.js app.

The old Python/FastAPI verifier is no longer required for public deployment.
Verification now runs inside the Next.js API route.

## Free Setup

- Hosting: Vercel Hobby
- Database: Supabase or Neon free PostgreSQL
- Render: not required
- Docker: not required

## 1. Create PostgreSQL

Create a free PostgreSQL database on Supabase or Neon and copy the connection
string:

```txt
postgresql://USER:PASSWORD@HOST:PORT/DATABASE?sslmode=require
```

If the password contains special characters, use the provider's copied URI
directly instead of typing it by hand.

## 2. Push to GitHub

Push the full repository to GitHub.

## 3. Import to Vercel

1. Open Vercel.
2. Add New Project.
3. Import the GitHub repository.
4. Set Root Directory to:

```txt
apps/web
```

5. Add environment variables:

```txt
DATABASE_URL=postgresql://USER:PASSWORD@HOST:PORT/DATABASE?sslmode=require
JWT_SECRET=replace-with-a-long-random-string
```

6. Deploy.

During build, the app runs:

```txt
prisma db push
prisma generate
stage seed
next build
```

After deployment, Vercel gives you a public URL.

## Important

Do not add `VERIFIER_URL`. The verifier is now built into the Next.js API.

