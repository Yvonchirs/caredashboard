# CARE Rwanda Activity Board

A shared board showing what staff are working on, grouped by project, for a single day or a whole week. Anyone can view the board. Staff sign in to log activities, and admins manage projects and users.

| App | Stack | Port |
| --- | --- | --- |
| `frontend/` | Next.js 16 (App Router), Tailwind CSS 4 | 3000 |
| `backend/` | NestJS 12, MikroORM 7, SQLite (`node:sqlite`), Swagger | 4000 |

## Getting started

Requires Node.js 22.13 or newer (Node 24 LTS recommended).

```bash
cd backend && npm install && cp .env.example .env && npm run db:seed
npm run dev              # API on http://localhost:4000, docs on /docs

cd ../frontend && npm install && cp .env.example .env.local
npm run dev              # App on http://localhost:3000
```

`npm run db:seed` **drops and recreates** the database, then fills it with sample projects, staff and activities for the previous, current and next week.

| Account | Email | Password |
| --- | --- | --- |
| Admin | `admin@care.org.rw` | `Admin@12345` |
| Staff | `aline@care.org.rw`, `jean@care.org.rw`, `diane@care.org.rw`, … | `Staff@12345` |

## Roles

- **Visitors (no sign-in):** view the board by day or week, navigate between dates, open activity details and photos.
- **Staff:** log activities (date, time, location, details, up to 6 photos) for the projects they're assigned to, and manage their own entries.
- **Admins:** everything staff can do, plus create/edit/archive projects, create users, assign roles and project access, reset passwords (one-time password, changed at next sign-in) and activate or deactivate accounts.

## Scripts

| | backend | frontend |
| --- | --- | --- |
| Dev server | `npm run dev` | `npm run dev` |
| Build | `npm run build` | `npm run build` |
| Lint | `npm run lint` | `npm run lint` |
| Reset and seed DB | `npm run db:seed` | – |
