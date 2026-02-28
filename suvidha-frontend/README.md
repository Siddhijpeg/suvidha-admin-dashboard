# SUVIDHA Admin Dashboard

Centralized admin portal for monitoring and managing the SUVIDHA e-Governance kiosk network.

## Tech Stack

- **Frontend:** React 18 + Vite
- **Styling:** Tailwind CSS
- **Routing:** React Router v6
- **Backend (separate repo):** Node.js + Express + MongoDB

## Features

- 🔐 JWT-based auth with Role-Based Access Control (Super Admin / Dept Admin / Operator)
- 🖥️ Kiosk fleet monitoring with remote controls
- 💰 Transaction & revenue management with CSV export
- 📋 Complaint workflow management
- 🏛️ Department & service configuration
- 📊 Analytics with custom charts
- ⚙️ System settings with audit logs
- 🌙 Dark / Light mode toggle

## Getting Started

```bash
# Install dependencies
npm install

# Copy env file and fill in your values
cp .env.example .env

# Start dev server
npm run dev
```

## Demo Accounts (dev only)

| Role | Email | Password |
|------|-------|----------|
| Super Admin | superadmin@suvidha.gov.in | Admin@123 |
| Dept Admin | dept@suvidha.gov.in | Admin@123 |
| Operator | operator@suvidha.gov.in | Admin@123 |

## Environment Variables

```
VITE_API_URL=http://localhost:5000/api
```

## Project Structure

```
src/
├── components/
│   ├── layout/       # Sidebar, Topbar, Layout
│   └── ui/           # Card, Table, Modal, Loader
├── context/          # AuthContext, ToastContext
├── hooks/            # useApi, useMutation
├── pages/            # All 8 pages
├── routes/           # ProtectedRoute
├── services/         # API service files
└── utils/            # formatDate, exportCSV
```

## Notes

- All pages fall back to mock data if backend is unavailable
- Never commit your `.env` file — it's in `.gitignore`
- Replace mock login in `AuthContext.jsx` with real API call once backend is ready
