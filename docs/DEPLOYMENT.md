# Deployment Guide - Decora

Production deployment for the Decora website (React/Vite frontend + Express/MongoDB API).

## Architecture

| Component | What it is                          | Where it runs (recommended)                    |
| --------- | ----------------------------------- | ---------------------------------------------- |
| Frontend  | Static build (`frontend/dist`)      | Nginx (same server) or Vercel/Netlify          |
| Backend   | Node.js API (`backend/src/server.js`) | VPS behind Nginx + PM2, or Render/Railway    |
| Database  | MongoDB                             | MongoDB Atlas (or self-hosted)                 |
| Uploads   | `backend/uploads/` on the API server | Persisted disk volume (NOT serverless)        |

The simplest robust setup is **one VPS with Nginx**:

```
Internet -> Nginx (443, SSL)
              ├── /            -> static files from frontend/dist
              ├── /api/...     -> proxy to Node API (127.0.0.1:5000)
              ├── /uploads/... -> proxy to Node API (static files)
              └── /sitemap.xml -> proxy to Node API
```

Because everything is served from one origin, there are no CORS problems and `/uploads/...` image URLs resolve automatically.

---

## Pre-deployment checklist

1. **Generate real secrets**
   - `JWT_SECRET`: `node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"` (min 32 chars enforced in production)
   - Change `SEED_ADMIN_EMAIL` / `SEED_ADMIN_PASSWORD` to real values **before** seeding production.
2. **Set `NODE_ENV=production`** for the API (enables production hardening paths; rate limits and morgan behave accordingly).
3. **Set `FRONTEND_URL`** to the exact public origin(s) of the site, e.g. `https://karigordecore.com` (comma-separate multiple origins). CORS rejects anything else.
4. **Never commit `.env`** - it is already in `.gitignore`.
5. Decide on a database: MongoDB Atlas (managed) or a self-hosted MongoDB on the server.

---

## 1. Database (MongoDB Atlas)

1. Create a free/paid cluster at [cloud.mongodb.com](https://cloud.mongodb.com).
2. Create a database user (strong password) and allow access from your server IP (or `0.0.0.0/0` during setup only).
3. Copy the connection string and set it in `backend/.env`:

```
MONGODB_URI=mongodb+srv://<user>:<password>@<cluster>/karigor-decore
```

Self-hosted alternative: install MongoDB on the VPS, bind it to `127.0.0.1`, and use `MONGODB_URI=mongodb://127.0.0.1:27017/karigor-decore`.

---

## 2. Backend deployment (VPS + PM2 + Nginx)

### 2.1 Upload the code and install

```bash
cd /var/www/karigor
git clone <your-repo> .            # or upload via rsync/scp
cd backend
npm ci --omit=dev
cp .env.example .env               # then edit with production values
```

### 2.2 Seed the database (first deploy only)

```bash
# with SEED_ADMIN_* set to real production values in .env
npm run seed
```

> `npm run seed` **clears catalog collections** (products, categories, services, projects, inquiries, quotes, customers, media, settings, homepage) and re-inserts sample content. Only run it on a fresh database, or when you deliberately want to reset demo content. Admin accounts are preserved.

After the first login, change the admin password from **Dashboard -> Change Password**.

### 2.3 Run with PM2

Create `backend/ecosystem.config.cjs`:

```js
module.exports = {
  apps: [
    {
      name: 'karigor-api',
      cwd: '/var/www/karigor/backend',
      script: 'src/server.js',
      env: { NODE_ENV: 'production' },
      instances: 1,
      autorestart: true,
      max_memory_restart: '300M',
    },
  ],
};
```

```bash
npm i -g pm2
pm2 start ecosystem.config.cjs
pm2 save
pm2 startup            # follow the printed instruction so PM2 survives reboots
```

Make sure the uploads directory is writable and persisted:

```bash
mkdir -p /var/www/karigor/backend/uploads
chmod -R 755 /var/www/karigor/backend/uploads
```

### 2.4 Nginx site config (API + static frontend on one domain)

Build the frontend first (see section 3), then use a config like:

```nginx
server {
    listen 80;
    server_name karigordecore.com www.karigordecore.com;

    client_max_body_size 10m;   # must be >= UPLOAD_MAX_MB plus overhead

    # Frontend static build
    root /var/www/karigor/frontend/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;   # SPA fallback for React Router
    }

    # REST API
    location /api/ {
        proxy_pass http://127.0.0.1:5000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Uploaded media (served by the API)
    location /uploads/ {
        proxy_pass http://127.0.0.1:5000;
        proxy_set_header Host $host;
    }

    # SEO sitemap
    location = /sitemap.xml {
        proxy_pass http://127.0.0.1:5000;
        proxy_set_header Host $host;
    }
}
```

### 2.5 HTTPS

```bash
sudo certbot --nginx -d karigordecore.com -d www.karigordecore.com
```

`app.set('trust proxy', 1)` is already enabled, so rate limiting and logs see real client IPs behind the proxy.

### Alternative: Render / Railway

- Create a **Web Service** from the repo, root directory `backend`, start command `npm start`.
- Add a **persistent disk** mounted at `backend/uploads` (uploads must survive deploys) and set env vars (`MONGODB_URI`, `JWT_SECRET`, `FRONTEND_URL`, `NODE_ENV=production`).
- Note: on serverless-style platforms without a disk, uploaded images are lost on redeploy.

---

## 3. Frontend deployment

### 3.1 Build

```bash
cd frontend
npm ci
npm run build          # -> frontend/dist
npm run generate:placeholders   # only if you want fresh placeholder images
```

### 3.2 Option A - same server (recommended)

Already covered above: point Nginx `root` at `frontend/dist` and keep `VITE_API_URL` unset (defaults to `/api`, same origin).

### 3.3 Option B - Vercel / Netlify (separate domain)

1. Build command `npm run build`, output directory `dist`, root directory `frontend`.
2. Set the environment variable:

```
VITE_API_URL=https://api.karigordecore.com/api
```

3. Add the frontend origin to the backend `FRONTEND_URL` (CORS), e.g.:

```
FRONTEND_URL=https://karigordecore.com,https://www.karigordecore.com
```

4. SPA routing: add rewrites so deep links (`/products/...`, `/admin/...`) reach `index.html`.
   - Vercel `vercel.json`:

     ```json
     { "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }] }
     ```

   - Netlify `public/_redirects`:

     ```
     /*  /index.html  200
     ```

5. Images: with `VITE_API_URL=https://api.karigordecore.com/api`, the app resolves `/uploads/...` URLs against `https://api.karigordecore.com` automatically (`API_ORIGIN` in `src/services/api.js`). The API already sends `Cross-Origin-Resource-Policy: cross-origin`, so images display fine across domains.

---

## 4. Post-deploy verification

- [ ] `GET https://<api-domain>/api/health` returns `{ "success": true, ... }`
- [ ] `GET https://<site>/sitemap.xml` returns XML with your pages
- [ ] Homepage loads products/services/projects from the database
- [ ] `/admin` login works with the production admin account; change the password immediately
- [ ] Create a product in the dashboard -> appears on the public site
- [ ] Submit the contact form and the quote form -> inquiries/quotes appear in the dashboard
- [ ] Upload an image in Media -> file is served from `/uploads/...` after a redeploy/restart
- [ ] Contact form honeypot still blocks obvious spam (send a POST with `website` filled -> rejected)

## 5. Backups & maintenance

- **Database**: `mongodump --uri="<MONGODB_URI>" --out=/backups/$(date +%F)` on a schedule; restore with `mongorestore`.
- **Uploads**: back up `backend/uploads/` (rsync to object storage or another disk).
- **Updates**: `git pull && cd backend && npm ci --omit=dev && pm2 restart karigor-api && cd ../frontend && npm ci && npm run build`.
- Rotate `JWT_SECRET` if it is ever exposed - all admin sessions are invalidated and users must log in again.

## 6. Troubleshooting

| Symptom                                   | Likely cause / fix                                                                                     |
| ----------------------------------------- | ------------------------------------------------------------------------------------------------------- |
| `413 Request Entity Too Large` on upload  | Nginx `client_max_body_size` too small - raise it (e.g. `10m`) and/or `UPLOAD_MAX_MB`                  |
| `Not allowed by CORS` in the browser      | The frontend origin is missing from `FRONTEND_URL` - add it (comma-separated) and restart the API      |
| Images broken after deploy                | Uploads volume not persisted, or `VITE_API_URL` missing so `/uploads` resolves to the wrong origin     |
| Deep links 404 on refresh                 | Missing SPA fallback: Nginx `try_files ... /index.html` or platform rewrite rules                      |
| Server exits at startup with missing env  | `MONGODB_URI` or `JWT_SECRET` unset - check `backend/.env`                                             |
| Admin locked out                          | Re-run seed with `SEED_ADMIN_*` overrides, or create a new admin directly in MongoDB (`Admins` collection with a bcrypt-hashed password) |
