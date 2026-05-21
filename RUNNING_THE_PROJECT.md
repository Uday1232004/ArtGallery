# ArtBro Gallery — How to Run the Project

This document covers every command needed to set up, configure, and run the **ArtBro Gallery** full-stack application locally.

---

## Project Structure

```
ArtGallery/
├── backend/    → Express.js REST API (Node.js + Prisma + MySQL)
└── frontend/   → React SPA (Vite + TailwindCSS)
```

---

## Prerequisites

Make sure the following are installed on your machine before proceeding:

| Tool | Version | Purpose |
|------|---------|---------|
| Node.js | v18+ | Runtime for both backend and frontend |
| npm | v9+ | Package manager |
| MySQL | v8+ | Database (or use Docker) |

---

## Step 1 — Install Dependencies

Open two separate terminals, one for each part of the project.

### Backend
```bash
cd backend
npm install
```

### Frontend
```bash
cd frontend
npm install
```

---

## Step 2 — Configure Environment Variables

The backend requires a `.env` file. A template is already provided.

```bash
cd backend
cp .env.example .env
```

Then open `.env` and fill in your values:

```env
# Server port
PORT=5001

# MySQL connection string
DATABASE_URL="mysql://root:YOUR_PASSWORD@localhost:3306/art_gallery_db"

# JWT secret (use a long random string in production)
JWT_SECRET="supersecret_jwt_key_art_gallery_local_dev"

# Google OAuth Client ID (from Google Cloud Console)
GOOGLE_CLIENT_ID="your_google_client_id_here"

# Cloudinary (optional — leave as-is to use local disk storage instead)
CLOUDINARY_CLOUD_NAME="your_cloudinary_cloud_name"
CLOUDINARY_API_KEY="your_cloudinary_api_key"
CLOUDINARY_API_SECRET="your_cloudinary_api_secret"
```

> **Note:** If Cloudinary credentials are left as placeholders, the backend automatically falls back to saving uploaded images to the local `backend/uploads/` folder.

---

## Step 3 — Set Up the Database

### Option A — Local MySQL

1. Start your MySQL server.
2. Create the database:
   ```sql
   CREATE DATABASE art_gallery_db;
   ```
3. Update `DATABASE_URL` in `.env` with your MySQL username and password.

### Option B — Docker (zero manual config)

```bash
docker run --name artbro-mysql \
  -e MYSQL_ROOT_PASSWORD=artbro_root_pass \
  -e MYSQL_DATABASE=art_gallery_db \
  -p 3306:3306 \
  -d mysql:8
```

The default `DATABASE_URL` in `.env.example` already matches this Docker setup.

---

## Step 4 — Run Prisma Migrations

From the `backend/` directory, apply the database schema:

```bash
cd backend
npx prisma migrate dev
```

This creates all tables defined in `prisma/schema.prisma`.

### (Optional) Generate Prisma Client manually

```bash
npx prisma generate
```

### (Optional) Seed the database with sample data

```bash
npm run seed
# or directly:
node prisma/seed.js
```

### (Optional) Open Prisma Studio (visual DB browser)

```bash
npx prisma studio
```

Prisma Studio opens at `http://localhost:5555`.

---

## Step 5 — Run the Backend

```bash
cd backend
npm run dev
```

**What this does:** Runs `node src/index.js` — starts the Express server.

**Expected output:**
```
🎨 ArtBro Sketches API running on port 5001
🔍 Starting Asset Diagnostics...
✅ Asset Diagnostics completed.
```

The API is now available at `http://localhost:5001`.

### Health check endpoints

| Endpoint | Description |
|----------|-------------|
| `GET /api/health` | Confirms the API server is running |
| `GET /api/db-health` | Confirms the MySQL database is connected |

---

## Step 6 — Run the Frontend

```bash
cd frontend
npm run dev
```

**What this does:** Starts the Vite development server with hot module replacement (HMR).

**Expected output:**
```
  VITE v5.4.x  ready in ~113 ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
```

Open `http://localhost:5173` in your browser.

---

## All Available Commands — Quick Reference

### Backend (`cd backend`)

| Command | Description |
|---------|-------------|
| `npm install` | Install all backend dependencies |
| `npm run dev` | Start the backend server (development) |
| `npm start` | Start the backend server (production) |
| `npx prisma migrate dev` | Apply schema migrations to the database |
| `npx prisma generate` | Regenerate the Prisma client |
| `npx prisma studio` | Open visual database browser at port 5555 |
| `node prisma/seed.js` | Seed the database with sample data |

### Frontend (`cd frontend`)

| Command | Description |
|---------|-------------|
| `npm install` | Install all frontend dependencies |
| `npm run dev` | Start Vite dev server at `http://localhost:5173` |
| `npm run build` | Build the app for production (outputs to `dist/`) |
| `npm run preview` | Preview the production build locally |

---

## Ports Summary

| Service | URL |
|---------|-----|
| Frontend (Vite) | `http://localhost:5173` |
| Backend (Express) | `http://localhost:5001` |
| Prisma Studio | `http://localhost:5555` |
| MySQL | `localhost:3306` |

---

## Troubleshooting

**`Cannot connect to database`**
- Make sure MySQL is running and the `DATABASE_URL` in `.env` is correct.
- Run `GET /api/db-health` to check the connection status.

**`Cloudinary credentials missing`**
- This is just a warning. The app falls back to local disk storage automatically.
- To enable Cloudinary, fill in the three `CLOUDINARY_*` values in `.env`.

**`Port already in use`**
- Change `PORT` in `.env` for the backend, or kill the process using the port:
  ```bash
  lsof -ti:5001 | xargs kill
  lsof -ti:5173 | xargs kill
  ```

**`Prisma client not generated`**
- Run `npx prisma generate` inside the `backend/` directory.
