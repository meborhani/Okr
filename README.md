# OKR Management System

NestJS + MSSQL backend — React 19 + Vite + Tailwind frontend (RTL / Persian)

---

## Prerequisites

- Node.js 20+
- SQL Server 2019+
- `.env` files (see below)

---

## Backend

### Environment — `.env`

```
DB_SERVER=localhost
DB_PORT=1433
DB_DATABASE=okr_db
DB_USER=sa
DB_PASSWORD=yourpassword
JWT_SECRET=change_me_in_production
JWT_EXPIRY=7d
PORT=3000
```

> **Never commit `.env` to git.**

### Install & run

```bash
npm install
npm run build          # compiles TypeScript to dist/
npm run start:prod     # runs dist/main.js
```

### Database migrations

Run SQL files in order inside `migrations/` against your SQL Server instance:

```
0001_initial.sql
0002_...
0003_...
0004_...
0005_...
0006_scope_sessionid.sql
```

---

## Frontend

### Environment — `frontend/.env.production`

```
VITE_API_BASE_URL=https://your-backend-domain/api
```

### Build

```bash
cd frontend
npm install
npm run build          # output: frontend/dist/
```

Serve `frontend/dist/` via Nginx or any static host. All routes must fall back to `index.html` (SPA).

### Nginx example

```nginx
server {
    listen 80;
    root /var/www/okr/dist;
    index index.html;

    location /api {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

---

## Security notes

- All SQL queries are parameterized — SQL injection is not possible.
- Passwords are hashed with bcryptjs (cost 12).
- `.env` is in `.gitignore` and must never be committed.
- JWT secret must be a long random string in production.
