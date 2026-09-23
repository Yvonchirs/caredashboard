# CLAUDE.md

Project rules for Claude Code. Follow these on every task.

## Stack

- **Frontend:** Next.js (App Router), styled with Tailwind CSS.
- **Backend (when needed):** Node.js with NestJS.
- **Database:** SQLite for now (production database decided at deploy time).
- **ORM:** MikroORM. Don't use Prisma, TypeORM or raw SQL clients, even with SQLite.
- **API docs:** Document every backend endpoint with Swagger (`@nestjs/swagger`): DTOs, responses and auth.

## Data

- Seed initial data for testing (MikroORM seeders) so the app is usable right after setup.

## Code quality

- No lint errors. Run the linter and fix everything before finishing a task.
- The build must pass. Run the build for every affected app (frontend and backend) before committing.
- Keep code clean and use current, non-deprecated APIs and the latest stable dependency versions.
- Keep comments short. Only comment where the code isn't self-explanatory.

## UI / Design

- Build a modern, professional UI. Avoid generic "AI-looking" design: no gratuitous gradients, glowing effects, emoji-heavy copy or stock card grids.
- Avoid box shadows. Use them only for modals and overlays. Rely on borders, spacing and contrast for hierarchy.
- Check UI work against the guidance in the `modern-web-guidance@claude-plugins-official` plugin and fix anything that doesn't match.

## Git workflow

- When a feature is complete (lint clean and build passing), commit it and push directly to GitHub.

## Project layout

- `frontend/`: Next.js 16 app. Read `frontend/AGENTS.md`: Next 16 APIs differ from older versions, and its docs are in `frontend/node_modules/next/dist/docs/`. The frontend calls the API server-side only (`src/lib/api.ts`), and the JWT is stored in an httpOnly `care_session` cookie. `/uploads/*` is rewritten to the API.
- `backend/`: NestJS 12 + MikroORM 7, both ESM-only. Use `.js` extensions in relative imports. Entities use `defineEntity` (no decorators). SQLite via `@mikro-orm/sqlite` (better-sqlite3; its build script is approved in `allowScripts`).
- Node 24 is required (`.nvmrc`). It's installed via nvm, while `/usr/local/bin/node` is an old 22.13 that breaks the Nest CLI and better-sqlite3, so make sure nvm's Node is first on PATH.
- Swagger UI is at `http://localhost:4000/docs`.
- `npm run db:seed` in `backend/` resets the DB. Seed logins are in `README.md`.
