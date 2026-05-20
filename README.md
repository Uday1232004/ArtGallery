# 🎨 ArtBro Sketches

A cinematic art gallery and ecommerce platform — browse artworks, request custom commissions, and manage your own artist portfolio.

Built with **React + Vite**, **Node.js + Express + Prisma**, and **MySQL**.

---

## 🚀 Quick Start (3 commands)

```bash
git clone https://github.com/Uday1232004/ArtGallery.git
cd ArtGallery
npm run setup
npm run dev
```

That's it. `npm run setup` handles everything — installs dependencies, creates `.env` files, pushes the database schema, and seeds the catalog.

> **Requires**: Node.js 18+, Docker (for the database)

---

## 🐳 Database Setup

The project uses a **Docker MySQL container** — no local MySQL installation needed.

```bash
# Start the database (run this before setup if Docker isn't running)
npm run db:start

# Then run setup
npm run setup
```

If you already have MySQL installed locally and don't want Docker:

```bash
# Create the database manually
mysql -u root -p -e "CREATE DATABASE art_gallery_db;"

# Edit backend/.env and set your MySQL password, then:
npm run setup
```

---

## ⚙️ Environment Variables

`npm run setup` auto-creates `.env` files from the `.env.example` templates. You only need to edit them if you want to change defaults.

**`backend/.env`**
```env
PORT=5001
DATABASE_URL="mysql://root:artbro_root_pass@localhost:3306/art_gallery_db"
JWT_SECRET="supersecret_jwt_key_art_gallery_local_dev"
GOOGLE_CLIENT_ID="your_google_client_id_here"
```

**`frontend/.env`**
```env
VITE_API_URL="http://localhost:5001/api"
VITE_GOOGLE_CLIENT_ID="your_google_client_id_here"
```

---

## 🔐 Google Login Setup

Google login works out of the box with the default Client ID for `localhost:5173`. If you want your own Google credentials:

1. Go to [Google Cloud Console](https://console.cloud.google.com/) → **APIs & Services** → **Credentials**
2. Create an **OAuth 2.0 Client ID** (Web Application)
3. Add `http://localhost:5173` to **Authorized JavaScript origins** and **Authorized redirect URIs**
4. Copy the Client ID into both `.env` files
5. Restart with `npm run dev`

---

## 👤 Accounts

| Role | Email | Password |
|------|-------|----------|
| **Super Admin** | `udaychandrabindhani@gmail.com` | `admin123` (or Google login) |
| **Collector** | Sign up at `/signup` | Your choice |
| **Artist/Curator** | Sign up at `/signup` → "Join as Artist" | Your choice |

The admin account owns all seeded artworks and has full access to `/admin`.

---

## 📋 All Commands

| Command | What it does |
|---------|-------------|
| `npm run setup` | Full one-time setup (install + DB + seed) |
| `npm run dev` | Start frontend + backend together |
| `npm run db:start` | Start MySQL Docker container |
| `npm run db:stop` | Stop MySQL Docker container |
| `npm run db:reset` | Wipe DB and re-seed from scratch |

---

## 🌐 URLs

| Service | URL |
|---------|-----|
| Frontend | http://localhost:5173 |
| Backend API | http://localhost:5001/api |
| API Health | http://localhost:5001/api/health |
| DB Health | http://localhost:5001/api/db-health |
| Admin Panel | http://localhost:5173/admin |

---

## 🗂️ Project Structure

```
ArtGallery/
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma     # Database models
│   │   └── seed.js           # Sample data seeder
│   ├── src/
│   │   ├── controllers/      # Route handlers
│   │   ├── routes/           # API routes
│   │   └── index.js          # Server entry point
│   └── uploads/              # Local image storage
│
├── frontend/
│   └── src/
│       ├── pages/            # Page components
│       ├── sections/         # Hero, Gallery, etc.
│       ├── store/            # Zustand state
│       └── components/       # Reusable UI
│
├── docker-compose.yml        # MySQL container config
├── scripts/setup.js          # One-time setup script
└── package.json              # Root scripts
```

---

## ❓ Troubleshooting

**Port 3306 already in use (Docker)**
```bash
brew services stop mysql        # Mac
sudo systemctl stop mysql       # Linux
# Windows: Stop MySQL in services.msc
```

**Reset everything from scratch**
```bash
npm run db:reset
```

**Google login shows `invalid_client`**
- Make sure `GOOGLE_CLIENT_ID` matches in both `backend/.env` and `frontend/.env`
- Confirm `http://localhost:5173` is in your Google Cloud Console authorized origins (no trailing slash)
