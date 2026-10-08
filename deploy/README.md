# Deployment

Production runs on `10.10.80.244` (Ubuntu 22.04, VPN only, SSH on port 2288) at
**http://10.10.80.244:3001**. Everything lives in `/opt/caredashboard` and runs as the
`caredash` system user, separate from the other apps on the server (nginx, MySQL, the
system Node 18 and pm2 are untouched).

```
/opt/caredashboard
├── node/          Node 24 (private copy; the system Node stays at 18)
├── app/backend    API: dist + production node_modules, listens on 127.0.0.1:4000
├── app/frontend   Next.js: .next + production node_modules, listens on 0.0.0.0:3001
├── data/          SQLite database and uploads/ (app/backend/uploads links here)
└── shared/        api.env (holds JWT_SECRET, mode 600) and web.env
```

Services: `caredash-api` and `caredash-web` (systemd units in this folder).

## Redeploying

The server has no internet access, so build on a Mac and copy the result over.

1. Build the API (`npm run build` in `backend/`) and the frontend with the server's API address:
   `API_URL=http://127.0.0.1:4000 npm run build` in `frontend/` (the `/uploads` rewrite is fixed at build time).
2. In a staging folder with each app's `package.json` and `package-lock.json`, install Linux dependencies:
   `npm ci --omit=dev --os=linux --cpu=x64 --libc=glibc --ignore-scripts`.
3. Copy `backend/dist` and `frontend/.next` (without `cache/` and `dev/`) plus those `node_modules`
   into `/opt/caredashboard/app/`, then `chown -R caredash:caredash /opt/caredashboard/app`.
4. `systemctl restart caredash-api caredash-web`.

Never overwrite `data/` or `shared/api.env`. Logs: `journalctl -u caredash-api -u caredash-web -f`.
