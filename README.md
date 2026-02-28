# 🏢 Suvidha Admin Dashboard

A full-stack Admin Dashboard for managing the Suvidha Kiosk System.

This repository follows a **monorepo structure**, containing both frontend and backend in a single project.

---

## 📁 Project Structure

```
suvidha-admin-dashboard/
│
├── suvidha-frontend/    # Admin dashboard UI (React + Vite + Tailwind)
├── suvidha-backend/     # Backend API (Node.js + Express + Supabase)
└── README.md
```

---

## 🚀 Tech Stack

### 🎨 Frontend
- React (Vite)
- Tailwind CSS
- Supabase (client-side)

### ⚙️ Backend
- Node.js
- Express.js
- Supabase (Service Role Key)
- dotenv

---

## 🛠️ Setup Instructions

### 1️⃣ Clone the Repository

```bash
git clone https://github.com/YOUR_USERNAME/suvidha-admin-dashboard.git
cd suvidha-admin-dashboard
```

---

## 🎨 Frontend Setup

```bash
cd suvidha-frontend
npm install
npm run dev
```

Create a `.env` file inside `suvidha-frontend/` with:

```
VITE_SUPABASE_URL=your_project_url
VITE_SUPABASE_ANON_KEY=your_anon_key
```

Frontend runs on:
```
http://localhost:5173
```

---

## ⚙️ Backend Setup

```bash
cd suvidha-backend
npm install
npm run dev
```

Create a `.env` file inside `suvidha-backend/` with:

```
SUPABASE_URL=your_project_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

Backend runs on:
```
http://localhost:5000
```
(or your configured port)

---

## 🔐 Environment Variables

Each folder manages its own `.env` file.

⚠️ Important:
- Never commit `.env` files
- Ensure `.gitignore` contains:
```
node_modules
.env
```

---

## 🌐 Development Flow

- Backend connects securely to Supabase.
- Frontend communicates with backend via REST APIs.
- Supabase handles database and authentication.

---

## 📌 Current Features

- Admin dashboard interface
- Supabase integration
- Secure backend APIs
- Modular folder structure
- Environment-based configuration

---

## 👩‍💻 Author

Siddhi Tomar 🚀
