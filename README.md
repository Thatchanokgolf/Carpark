# Carpark Slot Manager · จัดการช่องจอดรถ

Edit carpark slots (slot code, name, room, status, note) in a clean web UI.
Built with **HTML + Tailwind CSS**, a **Neon** (PostgreSQL) database, and a
**Netlify Function** API. Data seeded from *สรุปช่องจอด (อัฟเดท 22-6-69)*.

```
carpark-app/
├── index.html              # Frontend (Tailwind via CDN, vanilla JS)
├── netlify/functions/
│   └── slots.js            # CRUD API at /api/slots (Neon serverless driver)
├── db/
│   ├── schema.sql          # Table + trigger
│   └── seed.sql            # Initial data from the Word doc
├── netlify.toml
└── package.json
```

## 1. Create the Neon database

1. Sign up at <https://neon.tech> and create a project.
2. Copy the connection string (looks like
   `postgresql://user:pass@ep-xxx.region.aws.neon.tech/dbname?sslmode=require`).
3. Load the schema and seed data:

   ```bash
   psql "YOUR_NEON_CONNECTION_STRING" -f db/schema.sql -f db/seed.sql
   ```

   No `psql`? Paste the contents of `db/schema.sql` then `db/seed.sql` into the
   **SQL Editor** in the Neon console.

## 2. Run locally

```bash
npm install
npm install -g netlify-cli          # if you don't have it
export DATABASE_URL="YOUR_NEON_CONNECTION_STRING"
netlify dev                         # serves index.html + /api/slots
```

Open the URL Netlify prints (usually <http://localhost:8888>).

## 3. Deploy to Netlify

1. Push this folder to a GitHub repo.
2. In Netlify: **Add new site → Import from Git**, pick the repo.
   Build command: *(leave empty)* · Publish directory: `.`
3. **Site settings → Environment variables** → add
   `DATABASE_URL` = your Neon connection string.
4. Deploy. The app is live; the function runs at `/api/slots`.

> Tip: in Neon, copy the **pooled** connection string for serverless functions.

## API

| Method | Path                | Body                                            |
|--------|---------------------|-------------------------------------------------|
| GET    | `/api/slots`        | —                                               |
| POST   | `/api/slots`        | `{ slot_code, zone, name, plate, room, status, note }` |
| PUT    | `/api/slots?id=123` | same as POST                                     |
| DELETE | `/api/slots?id=123` | —                                               |

`status` must be `"Vacant"` or `"Occupied"`.
