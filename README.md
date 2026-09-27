# Karigor Decore - Website & Admin Dashboard

Full-stack website for **Karigor Decore** - a windows, doors, glass, aluminum and interior/exterior decoration company in Bangladesh.

The business principle behind the site: customers can **buy ready products** (windows, doors, glass, partitions...) *or* **bring their own project** and get a fully customized solution. Both paths are equally supported across the public site and the admin dashboard.

- **Public website** - Home (fully dashboard-editable), About, Products with search/filter, Product details, Services, Projects, Project details, Contact, Request a Quote (with optional file attachments).
- **Admin dashboard** (`/admin`) - JWT-protected content management: products, categories, services, projects, inquiries, quote requests, customer leads, homepage sections, company settings, media library, profile and password.

Everything displayed on the site is stored in MongoDB and editable from the dashboard - there is no hard-coded business content.

---

## Tech stack

| Layer     | Technology                                                                                      |
| --------- | ----------------------------------------------------------------------------------------------- |
| Frontend  | React 18, React Router 6, Vite 5, Axios - no UI/icon/state libraries (inline SVG icon set)      |
| Backend   | Node.js, Express 4, JWT auth, bcryptjs, express-validator                                       |
| Database  | MongoDB with Mongoose 8 (11 collections: products, categories, services, projects, inquiries, quotes, customers, media, settings, homepage, admins) |
| Security  | helmet, CORS allow-list, rate limiting, mongo-sanitize, upload MIME/size validation, honeypot anti-spam fields, soft delete |

---

## Repository layout

```
KarigorDecorWeb/
├── backend/
│   ├── src/
│   │   ├── config/         # env loading + MongoDB connection
│   │   ├── controllers/    # REST route handlers
│   │   ├── middleware/     # auth, validation, uploads, errors, rate limits
│   │   ├── models/         # Mongoose schemas
│   │   ├── routes/         # Express routers (mounted under /api)
│   │   ├── seed/           # sample data + seed script
│   │   ├── services/       # media storage helpers
│   │   └── utils/          # response helpers, slugs, pagination
│   ├── uploads/            # runtime uploaded images (git-ignored)
│   ├── .env.example
│   └── package.json
├── frontend/
│   ├── public/
│   │   ├── seed-images/    # 48 placeholder SVGs (generated, see below)
│   │   └── favicon.svg
│   ├── scripts/
│   │   └── generate-placeholders.mjs
│   ├── src/
│   │   ├── components/     # common / admin / public UI building blocks
│   │   ├── context/        # Auth, Settings, Toast providers
│   │   ├── hooks/          # data fetching, debounce, scroll, SEO helpers
│   │   ├── layouts/        # PublicLayout, AdminLayout
│   │   ├── pages/          # public/ and admin/ pages
│   │   ├── services/       # axios client + endpoint functions
│   │   ├── styles/         # design tokens + global/admin CSS
│   │   └── utils/          # constants, formatting, image helpers
│   ├── .env.example
│   └── package.json
├── docs/
│   └── DEPLOYMENT.md       # production deployment guide
└── .gitignore
```

---

## Getting started (local development)

### Prerequisites

- Node.js 18+ (developed on Node 22)
- MongoDB 6+ running locally, or a MongoDB Atlas connection string
- npm

### 1. Backend

```powershell
cd backend
npm install
Copy-Item .env.example .env   # then edit values if needed
npm run seed                  # creates collections + realistic sample content + first admin
npm run dev                   # starts on http://localhost:5000
```

Health check: `http://localhost:5000/api/health`

> **Note:** `npm run seed` is destructive for catalog collections - it clears and re-inserts products, categories, services, projects, inquiries, quotes, customers, media, settings and homepage content. Admin accounts are never touched, so it is safe to re-run during development.

### 2. Frontend

```powershell
cd frontend
npm install
npm run dev                   # starts on http://localhost:5173
```

Vite proxies `/api` and `/uploads` to `http://localhost:5000`, so no frontend `.env` is needed for local development.

### 3. Sign in to the dashboard

- URL: `http://localhost:5173/admin`
- Email: `admin@karigordecore.com`
- Password: `Karigor@Admin2026`

> These are **development-only** credentials created by the seed script. Override them with the `SEED_ADMIN_*` environment variables before seeding, and change the password right after your first login in production. See [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md).

---

## npm scripts

### backend

| Script       | Description                              |
| ------------ | ---------------------------------------- |
| `npm run dev`   | Start with nodemon (auto-reload)     |
| `npm start`     | Start without watch (production mode)|
| `npm run seed`  | Wipe catalog collections and insert sample data + first admin |

### frontend

| Script                        | Description                                  |
| ----------------------------- | -------------------------------------------- |
| `npm run dev`                 | Vite dev server on port 5173                 |
| `npm run build`               | Production build to `dist/`                  |
| `npm run preview`             | Preview the production build locally         |
| `npm run generate:placeholders` | Regenerate the 48 seed placeholder SVGs + favicon |

---

## Environment variables

### backend/.env

| Variable          | Description                                                        |
| ----------------- | ------------------------------------------------------------------ |
| `PORT`            | API port (default `5000`)                                          |
| `NODE_ENV`        | `development` or `production`                                      |
| `MONGODB_URI`     | MongoDB connection string (required)                               |
| `JWT_SECRET`      | Long random secret, min 32 chars in production (required)          |
| `JWT_EXPIRES_IN`  | Token lifetime, e.g. `7d`                                          |
| `FRONTEND_URL`    | Comma-separated allowed CORS origins, e.g. `http://localhost:5173` |
| `UPLOAD_MAX_MB`   | Max upload size in MB (default `5`)                                |
| `SEED_ADMIN_NAME` / `SEED_ADMIN_EMAIL` / `SEED_ADMIN_PASSWORD` | First admin account created by `npm run seed` |

The server refuses to start when `MONGODB_URI` or `JWT_SECRET` are missing.

### frontend/.env (optional)

| Variable       | Description                                                                                     |
| -------------- | ----------------------------------------------------------------------------------------------- |
| `VITE_API_URL` | API base URL. Defaults to `/api` (dev proxy). In production set e.g. `https://api.example.com/api`; the origin is used to resolve `/uploads/...` image URLs. |

---

## Placeholder images

The seed content references 48 placeholder SVGs served from `frontend/public/seed-images/` (products, services, projects, homepage hero and about sections) plus `public/favicon.svg`. They are generated by:

```powershell
cd frontend
npm run generate:placeholders
```

Replace them with real photography by uploading images from the dashboard (Media library, product/project forms, homepage/settings editors). The generated files are committed so the site works out of the box.

---

## API overview

All responses use the envelope `{ "success": bool, "message": string, "data": ..., "meta": ... }`. Admin endpoints require an `Authorization: Bearer <jwt>` header.

### Public

| Method & path                                       | Description                                    |
| --------------------------------------------------- | ---------------------------------------------- |
| `GET  /api/health`                                  | Health check                                   |
| `POST /api/auth/login`                              | Admin login (rate-limited)                     |
| `GET  /api/products`                                | Product list (search, category, sort, pagination) |
| `GET  /api/products/:slug`                          | Product details                                |
| `GET  /api/categories`                              | Categories (`?scope=product\|project`)         |
| `GET  /api/services`, `GET /api/services/:slug`     | Services list / details                        |
| `GET  /api/projects`, `GET /api/projects/:slug`     | Projects list / details                        |
| `GET  /api/projects/categories`                     | Distinct project categories                    |
| `GET  /api/settings`                                | Public company settings                        |
| `GET  /api/homepage`                                | Homepage content                               |
| `POST /api/inquiries`                               | Contact form submission (honeypot protected)   |
| `POST /api/quotes`                                  | Quote request submission                       |
| `POST /api/quotes/attachments`                      | Optional quote file uploads (multipart, max 5) |
| `GET  /sitemap.xml`                                 | SEO sitemap generated from live content        |

### Admin (JWT required)

| Area            | Endpoints                                                                                     |
| --------------- | --------------------------------------------------------------------------------------------- |
| Auth            | `GET /api/auth/me`, `PUT /api/auth/profile`, `PUT /api/auth/change-password`, `POST /api/auth/logout` |
| Products        | CRUD + `PATCH /api/products/:id/toggle` (visibility), `PATCH /api/products/:id/featured`      |
| Categories      | CRUD (scope `product` or `project`)                                                           |
| Services        | CRUD + toggle visibility / featured                                                           |
| Projects        | CRUD + toggle visibility / featured                                                           |
| Inquiries       | list / get / `PATCH :id/status` / `PUT :id/notes` / delete                                    |
| Quote requests  | list / get / status / notes / delete                                                          |
| Customers       | list / get (with inquiry + quote history) / update / delete                                   |
| Media           | `GET /api/media`, `POST /api/media/upload` (multipart, max 12), `GET /api/media/:id/usage`, `DELETE /api/media/:id` (409 when in use, `?force=true` to override) |
| Settings        | `GET /api/settings/admin`, `PUT /api/settings`                                                |
| Homepage        | `GET /api/homepage/admin`, `PUT /api/homepage`                                                |
| Dashboard       | `GET /api/dashboard/stats` (live counts for the overview page)                                |

---

## Security notes

- Passwords hashed with bcrypt (cost 12); JWT expiry configurable.
- `helmet`, strict CORS allow-list (`FRONTEND_URL`), rate limiting (disabled in development), and `express-mongo-sanitize` are enabled globally.
- Every mutating endpoint is validated with `express-validator`; forms use honeypot fields to reduce spam.
- Uploads are validated by MIME type and size, stored under `backend/uploads/<yyyy>/<mm>/` and served read-only from `/uploads`.
- Records use soft delete (`deletedAt`), so accidentally removed content can be recovered from the database when needed.

---

## Deployment

See **[docs/DEPLOYMENT.md](docs/DEPLOYMENT.md)** for a complete production guide: MongoDB Atlas, deploying the API behind Nginx + PM2 (or Render/Railway), static hosting for the frontend (Vercel/Netlify/Nginx), SSL, CORS wiring, backups and a post-deploy checklist.
