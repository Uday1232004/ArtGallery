# ArtBro Sketches — Premium Full-Stack Google OAuth 2.0 Identity System

This document outlines the architectural details, directory configurations, and Google Cloud Console settings to operate our production-grade Google Authentication ecosystem.

---

## 🛠️ Directory & Environment Mappings

### 1. Frontend Configuration
* File: `frontend/.env` (and template template: `frontend/.env.example`)
* Parameters:
  * `VITE_API_URL="http://localhost:5001/api"`
  * `VITE_GOOGLE_CLIENT_ID="<your-google-oauth-client-id>.apps.googleusercontent.com"`

### 2. Backend Configuration
* File: `backend/.env` (and template: `backend/.env.example`)
* Parameters:
  * `PORT=5001`
  * `DATABASE_URL="mysql://root:@localhost:3306/art_gallery_db"`
  * `JWT_SECRET="<your-secure-jwt-random-signing-secret>"`
  * `GOOGLE_CLIENT_ID="<your-google-oauth-client-id>.apps.googleusercontent.com"`

---

## ☁️ Google Cloud Developer Console Setup Guide

Follow these exact steps to register your web application and generate your active Google OAuth Client Credentials:

### Step 1: Create a Google Cloud Project
1. Open the [Google Cloud Developer Console](https://console.cloud.google.com/).
2. Log in with your Google account.
3. Click the project selector dropdown at the top navigation bar, then click **New Project**.
4. Set the **Project Name** to `ArtBro Sketches` and click **Create**.

### Step 2: Configure the OAuth Consent Screen
1. On the left sidebar menu, navigate to **APIs & Services** ➔ **OAuth consent screen**.
2. Under **User Type**, select **External** (this allows any Google collector account to authorize).
3. Click **Create** and complete the form:
   * **App name**: `ArtBro Sketches`
   * **User support email**: Select your developer email address.
   * **Developer contact information**: Input your email address.
4. Click **Save and Continue** through the remaining Scopes and Test Users screens (defaults are fully sufficient for prototype and testing phases).
5. On the final summary page, click **Back to Dashboard**.

### Step 3: Generate OAuth 2.0 Credentials
1. On the left menu, select **Credentials**.
2. Click the **+ Create Credentials** button at the top, and select **OAuth client ID**.
3. Under **Application type**, choose **Web application**.
4. Set the **Name** to `ArtBro Sketches Web Client`.
5. Under **Authorized JavaScript origins**:
   * Click **+ Add URI** and enter:
     * `http://localhost:5173` *(Localhost development)*
6. Under **Authorized redirect URIs**:
   * Click **+ Add URI** and enter:
     * `http://localhost:5173` *(Localhost callback authorization)*
7. Click **Create**.
8. A modal will display your **Client ID** (ending in `.apps.googleusercontent.com`) and your **Client Secret**. Copy the Client ID.

---

## 🚀 Production Deployment Setup

When migrating your art gallery from development to production servers (e.g., Vercel, Netlify, AWS, or Render):

1. **Create a Production Build**:
   * Build the React production artifacts using:
     ```bash
     npm run build
     ```
2. **Update Environment Variables**:
   * Ensure that the production hosting dashboard has corresponding `VITE_GOOGLE_CLIENT_ID`, `VITE_API_URL` (pointing to your live backend domain), and `GOOGLE_CLIENT_ID` variables securely bound.
3. **Register Production Domains in Google Console**:
   * Go back to your [Google Credentials Panel](https://console.cloud.google.com/apis/credentials).
   * Edit your `ArtBro Sketches Web Client` credentials.
   * Add your live production URLs under:
     * **Authorized JavaScript origins**: e.g., `https://yourdomain.com`
     * **Authorized redirect URIs**: e.g., `https://yourdomain.com`
   * Save changes. (Note: Google Cloud can take up to 5 minutes to propagate brand new production credentials globally).

---

## 🏃 Terminal Startup Checklist

To launch your development workspace fresh:

```bash
# 1. Update the environment variables in frontend/.env and backend/.env with your Google Client ID

# 2. Synchronize your MySQL database tables
cd backend
npx prisma db push --accept-data-loss

# 3. Start the backend api server
node src/index.js

# 4. Start the Vite React development server
cd ../frontend
npm run dev
```
