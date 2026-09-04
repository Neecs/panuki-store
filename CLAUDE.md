# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

NestJS REST API (TypeScript) for an e-commerce product store. Uses TypeORM with PostgreSQL. Currently on NestJS 11, TypeScript 5.7.

## Commands

| Command | Purpose |
|---------|---------|
| `npm run start:dev` | Development server with watch mode (default port 8080) |
| `npm run build` | Compile TypeScript to dist/ |
| `npm run lint` | ESLint with auto-fix |
| `npm test` | Unit tests (Jest) |
| `npm run test:e2e` | End-to-end tests (Supertest) |
| `npm run test:cov` | Unit tests with coverage |
| `npm run migration:generate` | Auto-generate TypeORM migration from entity changes |
| `npm run migration:run` | Execute pending migrations |
| `npm run migration:revert` | Revert last migration |

To run a single test file: `npx jest path/to/file.spec.ts`

## Architecture

Modular NestJS architecture. Each domain lives in its own module under `src/` containing its entity, DTOs, controller, service, and tests.

**Request flow:** Controller (thin, delegates only) → Service (business logic + TypeORM repository access) → PostgreSQL

**Key files:**
- `src/app.module.ts` — root module; imports ConfigModule (global), TypeORM, and feature modules
- `src/config/database/database.config.ts` — TypeORM config factory using ConfigService
- `src/database/data-source.ts` — DataSource for CLI migration commands
- `src/database/migrations/` — TypeORM migration files

**Module pattern** (example: `src/product/`):
- `product.module.ts` — registers controller, service, and TypeOrmModule.forFeature
- `product.controller.ts` — route handlers with decorators
- `product.service.ts` — business logic, repository injection, Logger
- `model/product.entity.ts` — TypeORM entity
- `dto/` — request/response DTOs

**Authentication** (single admin user, `src/user/` + `src/auth/`):
- `src/user/` owns the `User` entity and `UserService` (`findByEmail`, `findById`, `createAdmin` — hashes the password with `bcrypt` before persisting). `UserController` exposes `POST /user` to create the admin account; there is only ever one admin, so `createAdmin` throws `ConflictException` on a second call — this is the endpoint's only protection, there is no guard on it and no seed script. Call it once (e.g. via Postman) after deploying.
- `src/auth/` owns login and route protection: `AuthController` (`POST /auth/login`), `AuthService` (verifies credentials with `bcrypt.compare`, signs a JWT via `JwtService`), `strategies/jwt.strategy.ts` (`passport-jwt`, verifies the token and re-checks the user still exists in the DB), `guards/jwt-auth.guard.ts` (`JwtAuthGuard`, wraps the `'jwt'` Passport strategy).
- Protect a route by adding `@UseGuards(JwtAuthGuard)` to the controller method (see `product.controller.ts`'s `createProduct`/`updateProduct`/`deleteProduct` — reads stay public).
- `AuthModule` must be imported in `app.module.ts` even though nothing injects from it directly — instantiating `JwtStrategy` as a provider is what registers it with Passport under the `'jwt'` name that `JwtAuthGuard` looks up at request time.

## Development Rules

- Use `ConfigModule`/`ConfigService` for environment access; never use `dotenv` or read `process.env` directly (exception: `data-source.ts` for CLI).
- Keep controllers thin: receive params/DTOs, delegate to service, no direct repository access.
- Use DTOs for API inputs/outputs, not raw entities.
- Declare explicit return types on new/modified methods. Avoid `any`, unnecessary casts, and `@ts-ignore`.
- PostgreSQL `bigint` columns are returned as `string` by the driver. `numeric` fields need careful handling.
- Never enable `synchronize: true` in production. In dev mode (`IS_PRODUCTION=false`), schema sync is automatic.
- Register all injected tokens in unit tests, including `getRepositoryToken(Entity)`.
- Use NestJS HTTP exceptions (`NotFoundException`, `ConflictException`, etc.) with consistent messages.
- Add `Logger` calls for business operations and errors; never log secrets or credentials.

## Environment Variables

Required in `.env`: `PORT`, `DB_HOST`, `DB_PORT`, `DB_USERNAME`, `DB_PASSWORD`, `DB_NAME`, `IS_PRODUCTION`, `JWT_SECRET`, `JWT_EXPIRES_IN`

`JWT_SECRET` is read with `ConfigService.getOrThrow` (both when signing in `AuthModule` and verifying in `JwtStrategy`) — the app refuses to boot without it. `JWT_EXPIRES_IN` is a number of seconds (e.g. `3600`), not a duration string; defaults to `3600` if unset.

## Database

PostgreSQL with TypeORM. Entities use soft deletes via `@DeleteDateColumn`. Dev mode auto-syncs schema; production runs migrations on startup.
