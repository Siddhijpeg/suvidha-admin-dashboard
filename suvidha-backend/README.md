# SUVIDHA Backend API

Node.js + Express + MongoDB REST API for the SUVIDHA Admin Dashboard.

## Setup

```bash
npm install
cp .env.example .env   # fill in your values
npm run seed           # seed initial data into MongoDB
npm run dev            # start dev server with nodemon
```

## Environment Variables

| Variable | Description |
|----------|-------------|
| `PORT` | Server port (default: 5000) |
| `MONGO_URI` | MongoDB Atlas connection string |
| `JWT_SECRET` | Secret key for JWT signing |
| `JWT_EXPIRES_IN` | Token expiry (e.g. 7d) |
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
├── config/         # DB connection
├── controllers/    # Route logic
├── middleware/     # Auth, error handler
├── models/         # Mongoose schemas
├── routes/         # Express routers
├── utils/          # Helpers (audit, seed, token)
└── server.js       # Entry point
```

## Setting Up MongoDB Atlas (Free)

1. Go to [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
2. Create a free account → Create a free M0 cluster
3. Click **Connect** → **Drivers** → copy the connection string
4. Replace `<username>` and `<password>` in your `.env` file
5. In **Network Access**, add `0.0.0.0/0` to allow all IPs (for dev)
