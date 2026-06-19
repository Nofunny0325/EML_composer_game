# Architecture

## Current Vercel Architecture

`apps/web` is the deployed app. It owns:

- Login and registration
- JWT token issuing
- Stage selection and lock state
- Stage clear submission API
- Prisma database access
- Numeric EML equivalence verification

The verifier runs inside the Next.js API route. There is no separate Python
service in the public deployment path.

## Request Flow

1. User logs in and receives a JWT.
2. User opens a stage.
3. User builds a block through the EML combiner.
4. User submits the selected workspace block.
5. Next.js checks the stage unlock rule.
6. Next.js verifies the composition numerically against the target.
7. Next.js stores clear progress in PostgreSQL when the answer is valid.

## Legacy Python Verifier

`services/verifier` is kept as an experimental legacy verifier. It is not used
by Vercel deployment.

