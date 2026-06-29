# TraceBack — Chandigarh University Lost & Found Portal

A complete, production-ready MERN-stack web application for students, teachers, security guards, and wardens of Chandigarh University to report, search, smart-match, claim, and recover lost or found items on campus in real-time.

**Both frontend and backend are deployed on Render.**

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, Vite, Tailwind CSS, Lucide Icons, Axios |
| Backend | Node.js, Express.js, Socket.io, bcryptjs, JWT, Multer |
| Database | MongoDB Atlas (Mongoose ODM) |
| Hosting | Render (Web Service + Static Site) |

---

## Key Features

- **JWT Authentication & Role Control** — Student, Teacher, Security Guard, Warden, Super Admin
- **Smart Keyword Matching** — Auto-compares lost & found items by category, name, and description
- **Claims Verification** — Submit ownership proof; finder/admin approves or rejects
- **Real-Time Chat (Socket.io)** — Direct peer-to-peer messaging with online/offline status
- **Admin Governance Panel** — Manage users, reports, roles, and claims
- **In-App Notifications** — Match alerts, claim approvals, and rejections

---

## Seeded Super Admin Accounts

These are auto-created on first server startup:

| Email | Password |
|---|---|
| `riyagargofficial@gmail.com` | `Admin@123` |
| `deepakbawa004@gmail.com` | `Admin@123` |

---

## Running Locally

### Step 1 — Clone & Install Dependencies
```bash
git clone https://github.com/rgarg1928/TraceBack.git
cd TraceBack
npm run install-all
```

### Step 2 — Create Environment Files

**`backend/.env`** (copy-paste this exactly):
```
PORT=5000
MONGODB_URI=mongodb+srv://riyagargofficial_db_user:Traceback123@cluster0.sqyqmzo.mongodb.net/traceback?retryWrites=true&w=majority&appName=Cluster0
JWT_SECRET=tracebacksecret12345
JWT_EXPIRE=30d
NODE_ENV=development
CLIENT_URL=http://localhost:5173
```

**`client/.env`** (copy-paste this exactly):
```
VITE_API_URL=
```
> Leave `VITE_API_URL` empty in development — Vite's dev proxy forwards `/api/*` calls to `localhost:5000` automatically.

### Step 3 — Start Development Servers
```bash
npm run dev
```
- Frontend → `http://localhost:5173`
- Backend API → `http://localhost:5000`

---

## Render Deployment Guide

Both frontend and backend are hosted on Render. Deploy in this order:

### 1. Deploy Backend (Web Service)

1. Go to [render.com](https://render.com) → **New → Web Service**
2. Connect your GitHub repo: `rgarg1928/TraceBack`
3. Configure:

   | Setting | Value |
   |---|---|
   | **Root Directory** | `backend` |
   | **Build Command** | `npm install` |
   | **Start Command** | `node server.js` |
   | **Environment** | `Node` |

4. **Add these Environment Variables** (copy from `backend/.env.render`):

   | Key | Value |
   |---|---|
   | `MONGODB_URI` | `mongodb+srv://riyagargofficial_db_user:Traceback123@cluster0.sqyqmzo.mongodb.net/traceback?retryWrites=true&w=majority&appName=Cluster0` |
   | `JWT_SECRET` | `tracebacksecret12345` |
   | `JWT_EXPIRE` | `30d` |
   | `NODE_ENV` | `production` |
   | `PORT` | `5000` |
   | `CLIENT_URL` | *(paste your frontend Render URL after deploying the frontend, e.g. `https://traceback-client.onrender.com`)* |

5. Click **Deploy**. Copy the deployed URL (e.g. `https://traceback-backend.onrender.com`).

---

### 2. Deploy Frontend (Static Site)

1. Go to Render → **New → Static Site**
2. Connect the same GitHub repo: `rgarg1928/TraceBack`
3. Configure:

   | Setting | Value |
   |---|---|
   | **Root Directory** | `client` |
   | **Build Command** | `npm run build` |
   | **Publish Directory** | `dist` |

4. **Add this Environment Variable** (copy from `client/.env.render`):

   | Key | Value |
   |---|---|
   | `VITE_API_URL` | *(your backend Render URL, e.g. `https://traceback-backend.onrender.com`)* |

5. Click **Deploy**.

> **Note:** The `public/_redirects` file is already configured to rewrite all routes to `/index.html` for React Router to work correctly.

6. **Go back to the backend service** and update `CLIENT_URL` to your frontend's Render URL.

---

## Directory Structure

```
TraceBack/
├── .env.example              ← Local dev env template
├── backend/
│   ├── .env.render           ← Render backend env variables (copy-paste into Render)
│   ├── .env                  ← Local dev only (not committed)
│   ├── config/db.js
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── uploads/              ← Multer stores images here
│   └── server.js
└── client/
    ├── .env.render           ← Render frontend env variables (copy-paste into Render)
    ├── .env                  ← Local dev only (not committed)
    ├── public/_redirects     ← Render SPA routing fix
    ├── src/
    │   ├── components/
    │   ├── context/
    │   ├── pages/
    │   └── main.jsx
    └── vite.config.js
```
