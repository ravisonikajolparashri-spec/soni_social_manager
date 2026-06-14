# SMM Panel — Setup Guide

## Prerequisites
- Python 3.11+
- Node.js 18+
- PostgreSQL 14+ (or Docker)

---

## 1. Database (choose one)

**Option A — Docker (easiest):**
```bash
docker run -d --name smm-db \
  -e POSTGRES_PASSWORD=password \
  -e POSTGRES_DB=smmpanel \
  -p 5432:5432 postgres:16
```

**Option B — Local PostgreSQL:**
Create a database called `smmpanel`.

---

## 2. Backend

```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate        # Mac/Linux
# venv\Scripts\activate         # Windows

# Install dependencies
pip install -r requirements.txt

# Copy and edit .env
cp ../.env.example ../.env
# Edit .env — set your DB URL, secrets, etc.
# Your API key is already filled in: 456e7e26685b073682a66e87fc1d19b9

# Run the server
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

The backend will:
- Auto-create all DB tables on first startup
- Create an admin user (admin@yourdomain.com / changeme123)
- Start a background job syncing order statuses every 5 minutes

API docs available at: http://localhost:8000/docs

---

## 3. Frontend

```bash
cd frontend
npm install
npm run dev
```

App runs at: http://localhost:5173

---

## 4. First Steps After Launch

1. **Login as admin:** admin@yourdomain.com / changeme123 (change the password in .env!)
2. **Sync services:** Go to Admin → Services → click "Sync from EasySMM"
3. **Set markup prices:** Edit rates on individual services (default is 30% markup)
4. **Add funds to test:** Admin → Users → Add Funds to yourself
5. **Place a test order:** New Order → pick a service → place order

---

## 5. Full Docker Deployment

```bash
# From the smm-panel root
docker-compose up -d
```

This starts: PostgreSQL + FastAPI backend + React frontend (nginx)

---

## 6. Production Checklist

- [ ] Change `SECRET_KEY` to a long random string
- [ ] Change `ADMIN_PASSWORD`
- [ ] Set `FRONTEND_URL` to your actual domain
- [ ] Add a real payment gateway (Stripe/PayPal) to replace demo fund-adding
- [ ] Enable HTTPS (nginx + certbot)
- [ ] Set `echo=False` in database.py (already done)
- [ ] Consider rate limiting (nginx or fastapi-limiter)

---

## File Structure

```
smm-panel/
├── backend/
│   └── app/
│       ├── main.py          ← FastAPI entry point
│       ├── config.py        ← Settings from .env
│       ├── database.py      ← DB engine + session
│       ├── models/          ← SQLAlchemy ORM models
│       ├── routers/         ← API endpoints
│       ├── schemas/         ← Pydantic request/response models
│       ├── services/        ← EasySMM API client
│       └── utils/           ← JWT auth + background tasks
├── frontend/
│   └── src/
│       ├── App.jsx          ← Routes
│       ├── api/             ← Axios API calls
│       ├── context/         ← Auth context
│       ├── pages/           ← All pages
│       └── components/      ← Shared components
├── .env                     ← Your secrets (gitignore this!)
├── docker-compose.yml
└── SETUP.md
```
