# WHMCS-First Server Management Platform

Monorepo:
- `apps/web`: Next.js (React + TypeScript)
- `apps/api`: Express + TypeScript
- `packages/shared`: shared types/schemas

## Quick start (local dev)

1) Install dependencies:

```bash
npm install
```

2) Create a Postgres database and set `DATABASE_URL` for `apps/api` (example):

```bash
setx DATABASE_URL "postgresql://postgres:postgres@localhost:5432/whmcs_saas?schema=public"
```

3) Run Prisma migrations (once implemented):

```bash
npm -w apps/api run prisma:migrate
```

4) Run dev servers:

```bash
npm run dev
```


# zain
