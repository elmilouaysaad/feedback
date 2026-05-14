 # Quick Start Guide - Feedback Kiosk

 ## 5-Minute Setup (Exact Steps)

 ### Step 0 — Prerequisites
 - Node.js (>=18) and npm installed
 - Either a local PostgreSQL server or Docker
 - `psql` or `createdb` available (for local Postgres)

 ### Step 1 — Install dependencies
```bash
npm install
```

 ### Step 2 — Create the PostgreSQL database
Choose one of the following depending on your environment.

Option A — Local Postgres (PowerShell / CMD):
```powershell
# If createdb is available
createdb feedback_kiosk

# Or with psql (replace user if different):
psql -U postgres -c "CREATE DATABASE feedback_kiosk;"
```

Option B — Docker (quick):
```bash
docker run --name feedback-db -e POSTGRES_DB=feedback_kiosk -e POSTGRES_PASSWORD=password -p 5432:5432 -d postgres:15
# Connection string after this: postgresql://postgres:password@localhost:5432/feedback_kiosk
```

Option C — Hosted DB
- Create a database named `feedback_kiosk` on your provider and copy the connection string.

### Step 3 — Create or update `.env.local`
Open the file `.env.local` at the project root and replace or add these exact entries (copy/paste and fill secrets):

Local / Docker example:
```
DATABASE_URL=postgresql://postgres:password@localhost:5432/feedback_kiosk
JWT_SECRET=REPLACE_WITH_RANDOM_HEX
ADMIN_PASSWORD_HASH=REPLACE_WITH_BCRYPT_HASH
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_KEY=
ANALYTICS_ACCESS_TOKEN=public_analytics_key
```

Hosted example (replace placeholders):
```
DATABASE_URL=postgresql://dbuser:dbpass@your-host:5432/feedback_kiosk
JWT_SECRET=REPLACE_WITH_RANDOM_HEX
ADMIN_PASSWORD_HASH=REPLACE_WITH_BCRYPT_HASH
ANALYTICS_ACCESS_TOKEN=public_analytics_key
```

How to generate the secrets (run in your project root):

Generate a secure `JWT_SECRET`:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Generate a bcrypt hash for an admin password (example uses `admin123` — change this for production):
```bash
node -e "require('bcryptjs').hash('admin123', 10).then(h => console.log(h))"
```
Copy the printed hash into `ADMIN_PASSWORD_HASH`.

File location: [.env.local](.env.local)

### Step 4 — Run migrations (create tables + seed)
```bash
npm run db:migrate
```

Expected output includes `✓ Database migrations completed successfully` and insertion of a default "Welcome Event".

### Step 5 — Start the development server
```bash
npm run dev
```

### Step 6 — Verify everything works

Check database tables (replace password if you used another):
```bash
psql "postgresql://postgres:stragesaad@localhost:5432/feedback_kiosk" -c "\dt"
psql "postgresql://postgres:stragesaad@localhost:5432/feedback_kiosk" -c "SELECT * FROM events;"
psql "postgresql://postgres:stragesaad@localhost:5432/feedback_kiosk" -c "SELECT * FROM feedback;"
```

Test API endpoints (after `npm run dev`):
```bash
curl http://localhost:3000/api/events/current

curl -X POST http://localhost:3000/api/feedback -H "Content-Type: application/json" -d '{"rating":5}'

curl -X POST http://localhost:3000/api/admin/login -H "Content-Type: application/json" -d '{"password":"admin123"}'
```

Pages to open in your browser:
- http://localhost:3000 — Tablet UI
- http://localhost:3000/?tablet=lobby — Example custom tablet address created from the admin page
- http://localhost:3000/admin — Admin dashboard (default dev password: `admin123`)
- http://localhost:3000/analytics — Public analytics

---

## Troubleshooting

Cannot connect to database
```bash
# Check Postgres is running and accessible
psql -U postgres -c "SELECT 1"

# Verify `DATABASE_URL` in .env.local is correct and URL-encode special characters
```

If `npm run db:migrate` reports `DATABASE_URL not set`, ensure `.env.local` exists at the project root and includes `DATABASE_URL`. The migration script will read `.env.local` if the environment variable is not exported.

Admin login fails
- Ensure `JWT_SECRET` and `ADMIN_PASSWORD_HASH` are set in `.env.local`.
- For local development you may keep the default password `admin123`, but replace it for production.

Tablet shows "No Active Event"
- Go to /admin, create and activate an event. The tablet UI polls every 2 seconds for the event assigned to its `?tablet=...` address, or the global active event if no tablet code is set.

---

## Quick Checklist
- [ ] Create DB: `createdb feedback_kiosk` or Docker
- [ ] Edit `.env.local` with `DATABASE_URL`, `JWT_SECRET`, `ADMIN_PASSWORD_HASH`
- [ ] `npm run db:migrate`
- [ ] `npm run dev`
- [ ] Verify pages and endpoints

---

If you want, tell me which DB option you used (local/Docker/hosted) and the DB username and password (or say you used `postgres`/`password`) and I will populate an exact `.env.local` snippet for you to paste.
