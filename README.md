# 🎨 ArtBro Sketches — Premium Art Gallery & Ecommerce Platform

A full-stack, cinematic art gallery and ecommerce platform built with **React + Vite** (frontend), **Node.js + Express + Prisma** (backend), and **MySQL** (database). 

Features professional Google OAuth 2.0 authentication, active admin dashboard, interactive shopping cart, custom commission requests, and visual storytelling animations (GSAP/Framer Motion).

---

## ⚡ Developer Quick-Start (Choose Your Workflow)

You can run this project using **Docker (Recommended)** or **Manual local MySQL**.

### 🐳 Workflow A: Docker-Based MySQL Setup (Recommended, Zero-Install)
*No need to install MySQL on your machine! Spins up a containerized database instantly.*

```bash
# 1. Clone the repository
git clone https://github.com/Uday1232004/ArtGallery.git
cd ArtGallery

# 2. Spin up the MySQL container
npm run db:start

# 3. Perform automatic zero-config setup (installs, schema, seeds & consolidates)
npm run setup

# 4. Start the application!
npm run dev
```

### 💻 Workflow B: Traditional Manual Setup (No Docker)
*For developers who prefer using their own pre-installed local MySQL server.*

```bash
# 1. Clone the repository
git clone https://github.com/Uday1232004/ArtGallery.git
cd ArtGallery

# 2. Create the empty local database
mysql -u root -p -e "CREATE DATABASE art_gallery_db;"

# 3. Provision environment variables (Create 'backend/.env' and 'frontend/.env')
#    Update backend/.env with your local MySQL credentials/password!

# 4. Perform automatic setup
npm run setup

# 5. Start the application!
npm run dev
```

---

## 📁 Environment Setup & Provisioning

Environment variables are used to secure credentials and manage DBMS connections. Since `.env` files are ignored by version control to avoid leaks, they must be created locally.

Our automated `npm run setup` script will **automatically create** `.env` files from `.env.example` templates if they do not exist!

### 📂 Backend Settings (`backend/.env`)
```env
PORT=5001

# MySQL connection string format: mysql://USERNAME:PASSWORD@HOST:PORT/DATABASE
# 🐳 For Docker: Kept as-is (uses root:artbro_root_pass)
# 💻 For Local MySQL: Change password to match your local DBMS installation!
DATABASE_URL="mysql://root:artbro_root_pass@localhost:3306/art_gallery_db"

# JWT Token Secret key (any secure random string)
JWT_SECRET="supersecret_jwt_key_art_gallery_local_dev"

# Google Client ID (Must match the frontend!)
GOOGLE_CLIENT_ID="1085731033087-8dna9r3dhg4louvd8javfu3s6p6gahpo.apps.googleusercontent.com"
```

### 📂 Frontend Settings (`frontend/.env`)
```env
VITE_API_URL="http://localhost:5001/api"
VITE_GOOGLE_CLIENT_ID="1085731033087-8dna9r3dhg4louvd8javfu3s6p6gahpo.apps.googleusercontent.com"
```

---

## ☁️ Google OAuth 2.0 Configuration

Google OAuth 2.0 is the main authentication method. For login to work in your own development workspace, you need to configure your own client credentials.

### 1. Register a Google Developer Project
1. Open the [Google Cloud Console](https://console.cloud.google.com/).
2. Click the project dropdown (top-left) → **New Project**. Name it `ArtBro Sketches`.
3. Go to **APIs & Services** → **OAuth Consent Screen**:
   * Choose **External**.
   * Fill in the App Name (`ArtBro Sketches`) and Developer/Support emails.
   * Click **Save and Continue** through the remaining prompts.

### 2. Generate Client Credentials
1. Navigate to **APIs & Services** → **Credentials**.
2. Click **+ Create Credentials** → **OAuth client ID**.
3. Select **Web Application** under Application Type.
4. Add the following strictly configured origins:
   * **Authorized JavaScript origins**: `http://localhost:5173`
   * **Authorized redirect URIs**: `http://localhost:5173`
5. Click **Create** and copy your generated **Client ID**.
6. Paste the ID into `VITE_GOOGLE_CLIENT_ID` in your `frontend/.env` and `GOOGLE_CLIENT_ID` in your `backend/.env`.
7. **Restart your server** (`npm run dev`) to apply.

---

## 🛠️ CLI Automation Commands

All primary DBMS, container, and compilation pipelines are mapped directly to standard NPM scripts at the root level:

| Command | Action | Platform |
|---------|--------|----------|
| `npm run setup` | Performs zero-config environment provisioning, module install, Prisma schema compilation, mock catalog seeding, and admin user consolidation. | macOS, Windows, Linux |
| `npm run dev` | Clears dead processes and starts both Vite and Express concurrently. | macOS, Windows, Linux |
| `npm run db:start` | Launches the containerized MySQL 8 database service in the background. | Docker required |
| `npm run db:stop` | Safely tears down the MySQL container without destroying data. | Docker required |
| `npm run db:reset` | Drops all tables, rebuilds schema, re-seeds database, and re-consolidates from scratch. | macOS, Windows, Linux |

---

## 🔐 Default Login Credentials

Use these seeded credentials to navigate your way through the portal and the dedicated administrative panels:

| Role | Email | Password | Access Capabilities |
|------|-------|----------|---------------------|
| **Super Admin** | `udaychandrabindhani@gmail.com` | `admin123` | Full admin panel at `/admin/login`, inventory, commissions, order fulfillment. |
| **Artist** | `artist@artbro.com` | `password123` | Profile dashboard, portfolio sketches management. |
| **Google User** | *(your own Google account)* | *(OAuth login)* | Art purchasing, cart checkout, write reviews, order history, request custom sketches. |

---

## 🔌 API Health Checkpoints

We have implemented two diagnostic API endpoints to verify the network and DBMS layers:
* 🌐 **API Health Endpoint**: [http://localhost:5001/api/health](http://localhost:5001/api/health)
* 💾 **Database Connectivity Endpoint**: [http://localhost:5001/api/db-health](http://localhost:5001/api/db-health)

---

## ❓ DBMS Troubleshooting & FAQ

### ❌ Docker container won't start / Port 3306 conflict
If port `3306` is already occupied by a pre-installed manual MySQL server on your host machine, you will see a bind error.
* **Solution**: Stop your local manual MySQL service first:
  * **Mac**: `brew services stop mysql`
  * **Windows**: Press `Win + R`, type `services.msc`, locate `MySQL`, right-click and choose `Stop`.
  * **Linux**: `sudo systemctl stop mysql`
  * Alternatively, edit `docker-compose.yml` to expose a different port, e.g., `'3307:3306'` and adjust the port in `DATABASE_URL`.

### ❌ Google Login displays `invalid_client` or fails
* Check that the Client ID in `frontend/.env` is identical to `backend/.env`.
* Confirm `http://localhost:5173` is accurately written (no trailing slashes, exact casing) inside your Google Cloud Console Web Credentials.
* Google can take up to 5-10 minutes to propagate credentials globally when first created.

### ❌ Resetting database state manually
If you want to clear all data and start completely fresh, run:
```bash
npm run db:reset
```
This drops the physical database, regenerates the schema, runs the seed script, and links everything under your primary email!

---

## 📁 Technical Architecture
```
ArtGallery/
├── backend/                    # Node.js + Express REST API Gateway
│   ├── prisma/
│   │   ├── schema.prisma       # Prisma DB Relational Model
│   │   ├── seed.js             # Database catalog seeder
│   │   └── consolidate.js      # Core account consolidation tool
│   ├── src/
│   │   ├── controllers/        # Route logic (Orders, Artworks, Auth)
│   │   ├── index.js            # Server entrypoint
│   │   └── utils/prismaClient  # Prisma connection singleton
│   └── .env.example
│
├── frontend/                   # React.js + Vite Client SPA
│   ├── src/
│   │   ├── store/              # Zustand global application state
│   │   ├── pages/              # Interface views & Admin portals
│   │   └── App.jsx             # Router and layout configuration
│   └── .env.example
│
├── docker-compose.yml          # Container configuration for MySQL 8
├── ER_DIAGRAM.md               # Database schema relationships diagram
└── package.json                # Root automation configuration
```

---

## 📄 License
Licensed under the [ISC License](LICENSE).
