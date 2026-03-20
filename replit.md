# Workspace

## Overview

pnpm workspace monorepo using TypeScript. Each package manages its own dependencies.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)

## Structure

```text
artifacts-monorepo/
├── artifacts/              # Deployable applications
│   ├── api-server/         # Express API server
│   └── edf-inscricoes/     # EDF School Event Registration site (React + Vite)
├── lib/                    # Shared libraries
│   ├── api-spec/           # OpenAPI spec + Orval codegen config
│   ├── api-client-react/   # Generated React Query hooks
│   ├── api-zod/            # Generated Zod schemas from OpenAPI
│   └── db/                 # Drizzle ORM schema + DB connection
├── scripts/                # Utility scripts (single workspace package)
│   └── src/                # Individual .ts scripts
├── pnpm-workspace.yaml     # pnpm workspace
├── tsconfig.base.json      # Shared TS options
├── tsconfig.json           # Root TS project references
└── package.json            # Root package with hoisted devDeps
```

## Features

### EDF Inscrições (artifacts/edf-inscricoes)

School Physical Education event registration website:

- **Home page** (`/`): Welcome banner, QR code linking to /register
- **Register page** (`/register`): Student registration form (name, birth year, school year, class)
- **Admin login** (`/admin/login`): Credentials: `edfvarela026` / `varelaedf026`
- **Admin dashboard** (`/admin`): View registrations sorted alphabetically or by birth year, input 5 activity scores (0-100) per student, auto-calculated average, Excel export with AVERAGE formulas

### API Server (artifacts/api-server)

Express 5 API server with session-based admin auth:
- `GET /api/registrations` - list all registrations
- `POST /api/registrations` - create registration
- `PUT /api/registrations/:id/scores` - update activity scores
- `POST /api/admin/login` - admin login (session cookie)
- `POST /api/admin/logout` - admin logout
- `GET /api/admin/me` - check session

### Database Schema

`lib/db/src/schema/registrations.ts`:
- `registrations` table: id, name, birth_year, school_year, class_name, activity1-5, created_at

## TypeScript & Composite Projects

Every package extends `tsconfig.base.json` which sets `composite: true`. The root `tsconfig.json` lists all packages as project references.

## Root Scripts

- `pnpm run build` — runs `typecheck` first, then recursively runs `build` in all packages
- `pnpm run typecheck` — runs `tsc --build --emitDeclarationOnly` using project references

## Packages

### `artifacts/api-server` (`@workspace/api-server`)

Express 5 API server. Routes in `src/routes/`. Uses `express-session` for admin auth.

### `lib/db` (`@workspace/db`)

Database layer using Drizzle ORM with PostgreSQL.

### `lib/api-spec` (`@workspace/api-spec`)

OpenAPI 3.1 spec and Orval config. Run codegen: `pnpm --filter @workspace/api-spec run codegen`

### `lib/api-zod` (`@workspace/api-zod`)

Generated Zod schemas from the OpenAPI spec.

### `lib/api-client-react` (`@workspace/api-client-react`)

Generated React Query hooks and fetch client from the OpenAPI spec.
