# 📚 Complete LMS — Learning Management System

A full-stack Learning Management System built with React, Node.js, PostgreSQL and Socket.io. Students can access courses, subjects and assignments based on their course field. Teachers are invited by admin and can manage content. Fully deployed on Vercel + Render.

🌐 **Live Demo:** [complete-lms-eight.vercel.app](https://complete-lms-eight.vercel.app)

---

## 📸 Screenshots

> Login page → Student dashboard → Admin panel → Assignment submission

---

## ✨ Features

### 👨‍🎓 Student
- Sign in with Google OAuth
- Select course field on first login (B.Tech, BCA, MBA, MCA, B.Sc)
- View courses, subjects and assignments filtered by their field
- Submit assignments
- View study materials

### 👨‍🏫 Teacher
- Invited by admin via email
- Create and manage courses and subjects
- Upload assignments and study materials
- View student submissions

### 🛡️ Admin
- Full dashboard to manage users
- Invite teachers via email
- Manage all courses, subjects and assignments
- View all student and teacher activity

---

## 🛠️ Tech Stack

### Frontend
| Technology | Purpose |
|---|---|
| React 18 + Vite | UI framework and build tool |
| React Router v6 | Client-side routing |
| Tailwind CSS | Styling |
| Axios | HTTP requests |
| Socket.io Client | Real-time communication |

### Backend
| Technology | Purpose |
|---|---|
| Node.js + Express | REST API server |
| Sequelize ORM | Database queries |
| PostgreSQL (Neon) | Database |
| Passport.js | Google OAuth authentication |
| JWT | Session tokens |
| Nodemailer | Teacher invitation emails |
| Multer | File uploads |
| Socket.io | Real-time features |

### Deployment
| Service | Purpose |
|---|---|
| Vercel | Frontend hosting |
| Render | Backend hosting |
| Neon | Serverless PostgreSQL |

---

## 🚀 Getting Started Locally

### Prerequisites
- Node.js v18+
- Git
- A Neon PostgreSQL database (free at [neon.tech](https://neon.tech))
- A Google Cloud OAuth app

### 1. Clone the repo
```bash
git clone https://github.com/paritoshchauhan01/Complete_LMS.git
cd Complete_LMS
```

### 2. Setup the server
```bash
cd server
npm install
```

Create a `.env` file in the `server/` folder:
```env
NODE_ENV=development
PORT=5000

JWT_SECRET=your_jwt_secret_here

DATABASE_URL=postgresql://user:password@host/dbname?sslmode=require

GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_CALLBACK_URL=http://localhost:5000/api/auth/google/callback

CLIENT_URL=http://localhost:5173

EMAIL_USER=your_gmail@gmail.com
EMAIL_PASSWORD=your_16_char_app_password
```

> **Note on EMAIL_PASSWORD:** This is a Gmail App Password, NOT your Gmail login password.
> Generate one at [myaccount.google.com/apppasswords](https://myaccount.google.com/apppasswords) (requires 2FA enabled).

Start the server:
```bash
npm run dev
```

### 3. Setup the client
```bash
cd ../client
npm install
```

Create a `.env.local` file in the `client/` folder:
```env
VITE_API_URL=http://localhost:5000/api
```

Start the client:
```bash
npm run dev
```

### 4. Seed demo data (optional)
To populate the database with courses, subjects and assignments for all course fields:
```bash
cd server
node seed-all-fields.js
```

---

## 🌐 Deployment Guide

### Render (Backend)
1. Create a new **Web Service** on [render.com](https://render.com)
2. Connect your GitHub repo
3. Set **Root Directory** to `server`
4. Set **Build Command** to `npm install`
5. Set **Start Command** to `npm start`
6. Add these environment variables:

| Key | Value |
|---|---|
| `NODE_ENV` | `production` |
| `DATABASE_URL` | Your Neon connection string |
| `JWT_SECRET` | Any long random string |
| `GOOGLE_CLIENT_ID` | From Google Cloud Console |
| `GOOGLE_CLIENT_SECRET` | From Google Cloud Console |
| `GOOGLE_CALLBACK_URL` | `https://your-render-url.onrender.com/api/auth/google/callback` |
| `CLIENT_URL` | `https://your-vercel-url.vercel.app` |
| `EMAIL_USER` | Your Gmail address |
| `EMAIL_PASSWORD` | 16-char Gmail App Password (no spaces) |

### Vercel (Frontend)
1. Create a new project on [vercel.com](https://vercel.com)
2. Connect your GitHub repo
3. Set **Root Directory** to `client`
4. Add this environment variable:

| Key | Value |
|---|---|
| `VITE_API_URL` | `https://your-render-url.onrender.com/api` |

5. Deploy — Vercel auto-deploys on every `git push`

### Google Cloud Console
1. Go to [console.cloud.google.com](https://console.cloud.google.com) → APIs & Services → Credentials
2. Create an OAuth 2.0 Client ID
3. Add to **Authorized JavaScript origins:**
   ```
   https://your-vercel-url.vercel.app
   https://your-render-url.onrender.com
   ```
4. Add to **Authorized redirect URIs:**
   ```
   https://your-render-url.onrender.com/api/auth/google/callback
   http://localhost:5000/api/auth/google/callback
   ```

---

## 📁 Project Structure

```
Complete_LMS/
├── client/                   # React frontend
│   ├── src/
│   │   ├── components/       # Reusable UI components
│   │   ├── contexts/         # AuthContext and other providers
│   │   ├── pages/            # Page components (one per route)
│   │   │   ├── LoginPage.jsx
│   │   │   ├── DashboardPage.jsx
│   │   │   ├── SelectFieldPage.jsx
│   │   │   ├── AdminDashboardPage.jsx
│   │   │   └── ...
│   │   ├── services/
│   │   │   └── api.js        # Axios instance and base URL config
│   │   └── App.jsx           # Routes
│   └── vite.config.js
│
├── server/                   # Node.js backend
│   ├── src/
│   │   ├── controllers/      # Route handlers
│   │   ├── middleware/       # Auth, validation middleware
│   │   ├── models/           # Sequelize models
│   │   ├── routes/           # Express routers
│   │   ├── services/         # Email service etc.
│   │   ├── config/           # Passport, DB config
│   │   └── app.js            # Express app entry point
│   └── seed-all-fields.js    # Demo data seed script
│
└── README.md
```

---

## 🔑 User Roles

| Role | How to get access | What they can do |
|---|---|---|
| **Student** | Sign in with any Google account | View courses/subjects/assignments for their field |
| **Teacher** | Admin sends email invitation | Manage courses, upload materials and assignments |
| **Admin** | Set manually in database | Full access to everything |

### Setting up your first Admin
After first Google login, run this SQL on your Neon database:
```sql
UPDATE "Users" SET role = 'admin' WHERE email = 'your@email.com';
```

---

## 📧 Teacher Invitation Flow
1. Admin logs in → goes to Admin Dashboard
2. Clicks **Invite Teacher** → enters teacher's email
3. Teacher receives an email with a registration link
4. Teacher clicks the link → signs in with Google → account is created as teacher role

---

## ⚠️ Known Limitations
- Render free tier **sleeps after 15 minutes** of inactivity — first load may take 30–60 seconds
- File uploads are stored temporarily on Render (not persisted across deploys) — consider adding Cloudinary for production

---

## 📄 License
MIT License — feel free to use this project for learning or as a base for your own LMS.

---

## 🙋‍♂️ Author
**Paritosh Chauhan**
- GitHub: [@paritoshchauhan01](https://github.com/paritoshchauhan01)
- Email: chauhan.paritosh01@gmail.com
