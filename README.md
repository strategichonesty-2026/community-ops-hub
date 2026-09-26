# Community Ops Hub

A multi-tenant member directory, dues, events, and communication hub for
community organizations — nonprofits, churches, HOAs, unions/associations,
youth leagues. One deployment, one codebase, many client organizations,
each customized by configuration (see `docs/DESIGN.md`), not by forking
the code.

Built to be given away free or run as a low-cost hosted service, with
revenue coming from setup + an ongoing support retainer rather than
per-feature pricing.

## Status: v1 slice

What exists right now: sign-up/sign-in, creating and switching between
organizations, and a member directory (add, change status, remove, tag).
See `docs/DESIGN.md` for exactly what's scoped out of this slice and in
what order to add it (dues/payments, events, communication, documents,
a public join page, per-niche fields).

## Stack

Next.js 15 (App Router) + React 19, PostgreSQL + Prisma 6, Better Auth,
Tailwind 4, Vitest.

## Running locally

```bash
cp .env.example .env   # fill in DATABASE_URL and a random BETTER_AUTH_SECRET
npm install
npx prisma migrate dev
npm run db:seed        # creates a demo org + members, prints a demo login
npm run dev
```

## Tests

```bash
npm test
```
