# LMS Deployment Guide
## Google OAuth + Neon PostgreSQL + Vercel (Frontend) + Render (Backend)

---

## 1. Set Up Neon PostgreSQL

1. Go to [neon.tech](https://neon.tech) → Create a free account
2. Create a new project → name it `lms`
3. Copy the **connection string** (looks like `postgresql://user:pass@ep-xxx.neon.tech/neondb?sslmode=require`)
4. Keep it handy for Step 3

---

## 2. Set Up Google OAuth

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project (or select existing)
3. Navigate to **APIs & Services → Credentials**
4. Click **Create Credentials → OAuth 2.0 Client ID**
5. Choose **Web application**
6. Set **Authorized redirect URIs**:
   - For dev: `http://localhost:5000/api/auth/google/callback`
   - For prod: `https://your-backend.onrender.com/api/auth/google/callback`
7. Copy **Client ID** and **Client Secret**

---

## 3. Deploy Backend to Render

1. Push your code to GitHub
2. Go to [render.com](https://render.com) → New → Web Service
3. Connect your GitHub repo
4. Settings:
   - **Root Directory**: `server`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
5. Add **Environment Variables**:

   | Key | Value |
   |-----|-------|
   | `NODE_ENV` | `production` |
   | `PORT` | `5000` |
   | `JWT_SECRET` | (generate: `openssl rand -hex 32`) |
   | `DATABASE_URL` | (Neon connection string from Step 1) |
   | `GOOGLE_CLIENT_ID` | (from Step 2) |
   | `GOOGLE_CLIENT_SECRET` | (from Step 2) |
   | `GOOGLE_CALLBACK_URL` | `https://your-backend.onrender.com/api/auth/google/callback` |
   | `CLIENT_URL` | `https://your-frontend.vercel.app` (fill in after Step 4) |
   | `EMAIL_USER` | (optional — Gmail for teacher invites) |
   | `EMAIL_PASSWORD` | (optional — Gmail App Password) |

6. Deploy → note your Render URL (e.g. `https://lms-backend.onrender.com`)

---

## 4. Deploy Frontend to Vercel

1. Go to [vercel.com](https://vercel.com) → New Project → Import from GitHub
2. Set **Root Directory**: `client`
3. Framework: **Vite** (auto-detected)
4. Add **Environment Variable**:

   | Key | Value |
   |-----|-------|
   | `VITE_API_URL` | `https://your-backend.onrender.com/api` |

5. Deploy → note your Vercel URL

---

## 5. Final Configuration

1. **Update `CLIENT_URL`** in Render env vars → set to your Vercel URL
2. **Update Google Console** → add your Render callback URL to Authorized redirect URIs
3. **Update `GOOGLE_CALLBACK_URL`** in Render → use your actual Render URL

---

## 6. Test Auth Flow

1. Open your Vercel URL → click **Continue with Google**
2. After sign-in, you'll be redirected back to `/dashboard`
3. First-time users are auto-created as `student` role
4. Admin can promote users via the Admin Dashboard

---

## Local Development

```bash
# Backend
cd server
cp ../.env.example .env
# Fill in your .env values (use localhost callback URL)
npm install
npm run dev

# Frontend (new terminal)
cd client
echo "VITE_API_URL=http://localhost:5000/api" > .env.local
npm install
npm run dev
```

**Google OAuth local callback URL**: `http://localhost:5000/api/auth/google/callback`
(Add this to your Google Console Authorized redirect URIs for local dev)

---

## Architecture Overview

```
Browser → Vercel (React/Vite)
              ↓ API calls (VITE_API_URL)
         Render (Node/Express)
              ↓ Sequelize ORM
         Neon PostgreSQL (SSL)
```

**Auth flow**:
1. User clicks "Continue with Google" → frontend redirects to `/api/auth/google`
2. Passport redirects to Google
3. Google redirects to `/api/auth/google/callback`
4. Passport verifies, finds/creates user in DB
5. Backend issues JWT, redirects to `CLIENT_URL/auth/callback?token=<jwt>`
6. Frontend stores JWT in localStorage, loads profile
