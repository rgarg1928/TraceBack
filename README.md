# TraceBack - Chandigarh University Lost & Found Portal

TraceBack is a complete, production-ready MERN-stack web application designed for students, teachers, security guards, and wardens of Chandigarh University to report, search, smart-match, claim, and recover lost or found items on campus in real-time.

## Tech Stack
*   **Frontend:** React 18, Vite, Tailwind CSS, Lucide icons, Axios
*   **Backend:** Node.js, Express.js, Socket.io, Mongoose, JWT, bcryptjs, Multer
*   **Database:** MongoDB Atlas (Mongoose ODM)

---

## Key Features
1.  **JWT Authentication & Role Control:** Complete sign up, sign in, profile updates, and password changes. Supports roles: Student, Teacher, Security Guard, Warden, and Super Admin.
2.  **Smart Keyword Matching:** When items are reported lost or found, an inline matching algorithm evaluates similarity across category, title, and descriptions. Displays a percentage score and fires "Possible Match Found" database notifications.
3.  **Claims Verification:** Claimants submit proof-of-ownership verification messages. Finders and admins can review, approve, or reject claim requests.
4.  **Real-Time WebSocket Chat:** Built-in direct messaging (Socket.io) with history preservation and live connection (online/offline) indicators.
5.  **Administrative Panel:** Centralized governance for Super Admins, Security Guards, and Wardens to oversee user profiles, delete reports, adjust roles, and approve claim handovers.

---

## Directory Structure
```
TraceBack
├── client              # React (Vite) Single Page App
│   ├── src
│   │   ├── components  # Navbar, Sidebar, ProtectedRoute, Toast
│   │   ├── context     # AuthContext, SocketContext, ToastContext
│   │   ├── pages       # Home, About, Contact, FAQ, Login, Register, Dashboards
│   │   └── main.jsx
│   └── package.json
└── backend             # Node.js + Express + Socket.io Server
    ├── config          # Database connection
    ├── middleware      # Auth guards, Multer configuration
    ├── models          # Mongoose Schemas (User, Items, Claims, Messages, Notifications)
    ├── controllers     # Modular logic handlers
    ├── routes          # API Endpoints
    └── server.js
```

---

## Environment Variables Configuration

Copy the sample configurations and fill in your private credentials.

### Backend (`backend/.env`)
Create a file named `.env` in the `backend/` directory:
```env
PORT=5000
MONGODB_URI=mongodb+srv://riyagargofficial_db_user:Traceback123@cluster0.sqyqmzo.mongodb.net/traceback?retryWrites=true&w=majority&appName=Cluster0
JWT_SECRET=tracebacksecret12345
JWT_EXPIRE=30d
NODE_ENV=development
CLIENT_URL=http://localhost:5173
```

### Frontend (`client/.env`)
Create a file named `.env` in the `client/` directory:
```env
VITE_API_URL=http://localhost:5000
```
*Note: In production (Vercel), set `VITE_API_URL` to match your deployed Render backend API URL (e.g. `https://traceback-api.onrender.com`).*

---

## Seed Admin Accounts
The database automatically seeds these Super Admin accounts on startup:

1.  **Email:** `riyagargofficial@gmail.com`  
    **Password:** `Admin@123`
2.  **Email:** `deepakbawa004@gmail.com`  
    **Password:** `Admin@123`

---

## Running Locally

1.  **Install all dependencies:**
    Run this at the root directory of the project:
    ```bash
    npm run install-all
    ```
2.  **Run Development Servers:**
    Start both frontend and backend concurrently:
    ```bash
    npm run dev
    ```
    *   Frontend will launch at: `http://localhost:5173`
    *   Backend API will run at: `http://localhost:5000`

---

## Production Deployment Guide

### Backend → Render Deployment
1.  Sign in to **Render** and click **New Web Service**.
2.  Connect your Git repository.
3.  Configure these details:
    *   **Environment:** `Node`
    *   **Build Command:** `npm install` (run in root or backend subfolder depending on setup. Recommended: root setting with build/start pointing to backend).
    *   *Alternative (Recommended):* Set base directory to `backend`, Build Command to `npm install`, and Start Command to `node server.js`.
4.  Add these **Environment Variables** in Render:
    *   `MONGODB_URI` = `mongodb+srv://riyagargofficial_db_user:Traceback123@cluster0.sqyqmzo.mongodb.net/traceback?retryWrites=true&w=majority&appName=Cluster0`
    *   `JWT_SECRET` = `(your_secure_random_string)`
    *   `JWT_EXPIRE` = `30d`
    *   `PORT` = `5000`
    *   `NODE_ENV` = `production`
    *   `CLIENT_URL` = `(your_vercel_frontend_domain_url)`
5.  Deploy the service.

### Frontend → Vercel Deployment
1.  Sign in to **Vercel** and click **Add New Project**.
2.  Import your Git repository.
3.  Configure these details:
    *   **Framework Preset:** `Vite`
    *   **Root Directory:** `client`
    *   **Build Command:** `npm run build`
    *   **Output Directory:** `dist`
4.  Add this **Environment Variable** in Vercel:
    *   `VITE_API_URL` = `(your_deployed_render_backend_url)` (e.g. `https://traceback-backend.onrender.com`)
5.  Deploy. The `vercel.json` rewrite configuration handles direct subpage loading issues automatically.
