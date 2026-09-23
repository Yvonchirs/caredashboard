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
