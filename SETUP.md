# LMS — Setup & Deployment Guide

## What was changed in this update

| Area | Change |
|------|--------|
| 📧 Email service | Beautiful HTML invite email; proper Gmail App Password auth |
| 🔐 Teacher invite flow | Teacher accepts via **Google OAuth** (no password form) |
| 🗃️ Passport.js | Reads `inviteToken` from OAuth state → auto-sets role to `teacher` |
| 🖥️ AdminDashboard | No more `alert()` — shows inline panel with email status + copy link |
| 📬 AuthCallbackPage | Friendly error messages for wrong Google account / expired token |
| 🌱 Seed script | `seed-demo-data.js` — 3 teachers, 8 students, 5 courses, 16 subjects, 31 assignments |

---

## 1. Gmail App Password (REQUIRED for invite emails)

Your regular Gmail password **does not work** with SMTP. You need a 16-char App Password:

1. Go to → https://myaccount.google.com/security
2. Make sure **2-Step Verification** is ON
3. Go to → https://myaccount.google.com/apppasswords
4. App: **Mail** | Device: **Other** (type "LMS") → **Generate**
5. Copy the 16-character password (looks like: `abcd efgh ijkl mnop`)
6. Open `server/.env` and set:

```env
EMAIL_USER=your-gmail@gmail.com
EMAIL_PASSWORD=abcdefghijklmnop    ← no spaces
```

---

## 2. Environment variables

### `server/.env`
```env
NODE_ENV=development
PORT=5000
JWT_SECRET=rsdqednondfwefnfujwebhiqbhubiirnqwenif

# Neon PostgreSQL
DATABASE_URL=postgresql://neondb_owner:...@ep-....neon.tech/neondb?sslmode=require

# Google OAuth
GOOGLE_CLIENT_ID=xxxx.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-xxxx
GOOGLE_CALLBACK_URL=http://localhost:5000/api/auth/google/callback

# CORS
CLIENT_URL=http://localhost:5173

# Gmail (see step 1)
EMAIL_USER=your-gmail@gmail.com
EMAIL_PASSWORD=your16charapppassword
```

### `client/.env.local`
```env
VITE_API_URL=http://localhost:5000/api
```

---

## 3. Run the project

```bash
# Terminal 1 — backend
cd lms/server
npm install
npm run dev

# Terminal 2 — frontend
cd lms/client
npm install
npm run dev
```

---

## 4. Create admin user

```bash
cd lms/server
node create-admin.js
```

---

## 5. Seed demo data (makes website look populated)

```bash
cd lms/server
node seed-demo-data.js
```

This creates:
- **3 demo teachers** (Priya Sharma, Rahul Verma, Anjali Gupta)
- **8 demo students** across B.Tech / BCA / MBA
- **5 courses** with subjects and assignments
- **31 assignments** total

---

## 6. How teacher invitations work (end-to-end)

```
Admin fills invite form
        ↓
Backend saves invitation + sends Gmail to teacher
        ↓
Teacher receives beautiful HTML email in their inbox
        ↓
Teacher clicks "Accept Invitation →" button
        ↓
TeacherRegisterPage loads (shows their name/email/role)
        ↓
Teacher clicks "Accept with Google"
        ↓
Google OAuth → callback with inviteToken in state
        ↓
Passport verifies: token valid + Google email matches invited email
        ↓
User created/updated with role = 'teacher' in DB
        ↓
Teacher redirected to /dashboard as Teacher ✅
```

### If email fails (wrong App Password etc.)
The admin dashboard shows an **inline panel** with:
- The exact error and how to fix it
- A copyable invitation link to share manually

---

## 7. Google OAuth setup

1. Go to → https://console.cloud.google.com
2. Create/select your project
3. APIs & Services → Credentials → Create OAuth 2.0 Client ID
4. Application type: **Web application**
5. Authorised JavaScript origins: `http://localhost:5173`
6. Authorised redirect URIs: `http://localhost:5000/api/auth/google/callback`
7. Copy Client ID and Secret → paste in `server/.env`

---

## 8. Production deployment

| Service | Platform | Notes |
|---------|----------|-------|
| Backend | **Render** | `npm start` in `server/` |
| Frontend | **Vercel** | root = `client/`, build = `npm run build`, output = `dist` |
| Database | **Neon PostgreSQL** | Already configured |

Update `.env` / environment variables on each platform:
- `GOOGLE_CALLBACK_URL` → `https://your-render-url.onrender.com/api/auth/google/callback`
- `CLIENT_URL` → `https://your-vercel-url.vercel.app`

Also update Google Console's Authorised redirect URIs to the production callback URL.
