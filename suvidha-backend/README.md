# SUVIDHA Backend API

Node.js + Express + Supabase REST API for the SUVIDHA Admin Dashboard.

## Setup

```bash
npm install
cp .env.example .env   # fill in your values
npm run dev            # start dev server with nodemon
```

## Environment Variables

| Variable | Description |
|----------|-------------|
| `PORT` | Server port (default: 5000) |
| `SUPABASE_URL` | Supabase project URL |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key |
| `CLIENT_URL` | Frontend URL for CORS |

## API Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/login` | Public | Login |
| GET | `/api/auth/me` | Any | Get current user |
| GET | `/api/kiosks` | Any | List all kiosks |
| PATCH | `/api/kiosks/:id/enable` | Super Admin | Enable kiosk |
| PATCH | `/api/kiosks/:id/disable` | Super Admin | Disable kiosk |
| POST | `/api/kiosks/:id/restart` | Super Admin | Restart kiosk |
| GET | `/api/transactions` | Any | List transactions |
| GET | `/api/transactions/revenue` | Any | Revenue chart data |
| GET | `/api/complaints` | Any | List complaints |
| PATCH | `/api/complaints/:id/status` | Any | Update status |
| POST | `/api/complaints/:id/escalate` | Admin | Escalate |
| GET | `/api/departments` | Any | List departments |
| POST | `/api/departments` | Super Admin | Create department |
| GET | `/api/analytics/overview` | Any | Dashboard metrics |
| GET | `/api/settings` | Super Admin | Get settings |
| PUT | `/api/settings` | Super Admin | Update settings |
| GET | `/api/settings/audit-logs` | Super Admin | Audit trail |

## Folder Structure

```
suvidha-backend/
├── config/         # Supabase client
├── controllers/    # Route logic
├── middleware/     # Auth, error handler
├── routes/         # Express routers
├── utils/          # Helpers (audit, token)
└── server.js       # Entry point
```

## Supabase Setup

1. Create a project at [supabase.com](https://supabase.com)
2. Copy your `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY`
3. Paste them into `.env`
