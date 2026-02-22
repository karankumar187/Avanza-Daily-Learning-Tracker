# Avanza — Daily Learning Tracker

> A full-stack AI-powered daily learning management system with smart scheduling, streak tracking, analytics, and in-app notifications.

[![Deploy on Render](https://img.shields.io/badge/Deploy-Render-46E3B7?logo=render)](https://render.com)
[![React](https://img.shields.io/badge/Frontend-React%20+%20Vite-61DAFB?logo=react)](https://vitejs.dev)
[![Node.js](https://img.shields.io/badge/Backend-Node.js%20+%20Express-339933?logo=node.js)](https://expressjs.com)
[![MongoDB](https://img.shields.io/badge/Database-MongoDB-47A248?logo=mongodb)](https://mongodb.com)

---

## Features

### Core
- **Daily Schedule** — View, complete, and mark tasks done with optional time-spent tracking and cancellation flow
- **Learning Objectives** — Create objectives with categories, priorities, estimated time, and color coding
- **Progress Tracking** — Per-objective and per-category completion streaks, rates, and time summaries
- **AI Schedule Assistant** — Generates a personalized weekly schedule via HuggingFace LLM based on your goals
- **AI Chat** — Context-aware chat assistant with token-limited conversation memory

### Analytics
- Weekly bar chart with **accurate time display** (e.g. "2h 30m" not "3h") — fixed `Math.round()` rounding bug
- Objective performance table with completion rates, time spent, and activity history
- Category breakdown cards with progress bars
- Streak tracking — current, longest, and total completed days

### Notes
- Rich text note editor with colour-coded categories
- Markdown-style notes panel inside the main layout
- Full CRUD with search

### Notifications
- In-app notification bell with unread badge count
- **Real-time pending task reminder** triggered on bell open (no need to wait for cron)
- Mark single / all-read in one click
- Scheduled crons: 5 PM and 10 PM IST reminders for pending tasks, Monday morning weekly summary
- Welcome notification on registration

### Authentication
- Email/password with JWT
- Google OAuth and GitHub OAuth via Passport.js
- OAuth callback with error handling and redirect

### UI & Theme
- **Avanza branding** — geometric triangle + upward arrow SVG logo, custom `favicon.svg`
- **Combined beige + sage green + light gray** palette — warm off-white page background, crisp white cards, sage green accents
- **No gradients anywhere** — flat, minimal design inspired by Linear/Notion
- Dark mode with full CSS variable override for correct colours in all components
- Themed stat icons (Target → beige-green, Tick → pale sage, Trend → sage, Flame → warm amber)
- GSAP animations on page transitions

---

## Tech Stack

| Layer | Tech |
|---|---|
| Frontend | React 18, Vite, Tailwind CSS, Recharts, GSAP, Lucide Icons |
| Backend | Node.js, Express.js |
| Database | MongoDB + Mongoose |
| Auth | JWT, Passport.js (Google, GitHub OAuth) |
| AI | HuggingFace Inference SDK |
| Scheduling | node-cron (IST timezone) |
| Security | helmet, express-mongo-sanitize, xss-clean, hpp, express-rate-limit |

---

## Security

| Measure | Detail |
|---|---|
| **Helmet** | Strict HTTP security headers on all responses |
| **NoSQL Injection** | `express-mongo-sanitize` strips `$` and `.` from inputs |
| **XSS** | `xss-clean` sanitises all request body, params, and query |
| **HTTP Param Pollution** | `hpp` middleware enabled |
| **Rate Limiting** | 100 req / 10 min globally; **10 req / 15 min on `/api/auth/login` and `/api/auth/register`** (brute-force protection) |
| **Body Size** | JSON and URL-encoded body capped at `10kb` (ReDoS / DoS mitigation) |
| **Session Cookie** | `httpOnly: true`, `sameSite: strict` in production, `secure: true` in production |
| **JWT** | Signed with `JWT_SECRET`, expiry controlled by `JWT_EXPIRE` |
| **Password Hashing** | bcrypt with 12 salt rounds |
| **Password Length** | Minimum 8 characters enforced at model level |
| **Auth Middleware** | Selects only `_id name email preferences authProvider` — never exposes password hash in `req.user` |
| **AI Prompt Injection** | User input is capped at 500 chars, newlines stripped, angle brackets removed before embedding in prompts |
| **Production Guard** | Server exits at startup if `JWT_SECRET` / `SESSION_SECRET` is missing in production |

---

## Directory Structure

```
avanza/
├── client/                  # React + Vite frontend
│   ├── public/
│   │   └── favicon.svg      # Avanza geometric triangle logo
│   ├── src/
│   │   ├── components/
│   │   │   ├── Layout.jsx       # Sidebar, header, notification bell
│   │   │   ├── LogoIcon.jsx     # SVG logo component
│   │   │   └── layout/Footer.jsx
│   │   ├── pages/
│   │   │   ├── Dashboard.jsx
│   │   │   ├── Schedule.jsx
│   │   │   ├── Objectives.jsx
│   │   │   ├── Analytics.jsx
│   │   │   ├── Notes.jsx
│   │   │   ├── AIAssistant.jsx
│   │   │   ├── Login.jsx
│   │   │   └── Register.jsx
│   │   ├── services/api.js      # Axios API client
│   │   ├── App.css              # Global theme, CSS variables
│   │   └── index.css
│   ├── index.html
│   └── vite.config.ts
├── server/                  # Express API backend
│   ├── config/
│   │   ├── db.js
│   │   ├── config.js
│   │   └── passportConfig.js
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── analyticsController.js
│   │   ├── aiAssistantController.js
│   │   ├── notificationController.js
│   │   └── ...
│   ├── middleware/
│   │   ├── auth.js          # JWT protect + optionalAuth
│   │   └── errorHandler.js
│   ├── models/
│   │   ├── User.js
│   │   ├── DailyProgress.js
│   │   ├── LearningObjective.js
│   │   ├── Schedule.js
│   │   ├── Notification.js
│   │   ├── Note.js
│   │   └── AISuggestion.js
│   ├── routes/
│   ├── utils/syncProgress.js
│   ├── server.js
│   └── .env.example
└── README.md
```

---

## Environment Variables

### Backend (`server/.env`)

```env
NODE_ENV=development
PORT=5000
MONGO_URI=mongodb+srv://...
JWT_SECRET=your_jwt_secret_here        # Required
SESSION_SECRET=your_session_secret     # Optional, falls back to JWT_SECRET
JWT_EXPIRE=7d
CLIENT_URL=http://localhost:5173
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
GITHUB_CLIENT_ID=...
GITHUB_CLIENT_SECRET=...
HUGGINGFACE_API_KEY=...                # Optional, AI features degrade gracefully
```

### Frontend (`client/.env`)

```env
VITE_API_URL=http://localhost:5000/api
```

---

## Local Development

```bash
# Backend
cd server
cp .env.example .env
# Edit .env with your values
npm install
npm run dev          # runs on http://localhost:5000

# Frontend (new terminal)
cd client
npm install
npm run dev          # runs on http://localhost:5173
```

---

## Deploy on Render

### Option A — Blueprint (Recommended)

1. Push repo to GitHub
2. Render Dashboard → **New** → **Blueprint**
3. Connect repo; Render reads `render.yaml` and creates:
   - `avanza-api` — Node.js Web Service (backend)
   - `avanza-web` — Static Site (frontend)

**Required env vars:**

| Service | Variable | Value |
|---|---|---|
| `avanza-api` | `MONGO_URI` | MongoDB Atlas connection string |
| `avanza-api` | `JWT_SECRET` | Strong random string |
| `avanza-api` | `CLIENT_URL` | e.g. `https://avanza-web.onrender.com` |
| `avanza-api` | `HUGGINGFACE_API_KEY` | (optional) HuggingFace token |
| `avanza-web` | `VITE_API_URL` | e.g. `https://avanza-api.onrender.com/api` |

### Option B — Manual

**Backend (Web Service)**
- Build: `cd server && npm install`
- Start: `cd server && node server.js`
- Env vars: `MONGO_URI`, `JWT_SECRET`, `CLIENT_URL`

**Frontend (Static Site)**
- Build: `cd client && npm install && npm run build`
- Publish directory: `client/dist`
- Env var: `VITE_API_URL`

---

## API Endpoints

| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/api/auth/register` | Public | Register user |
| POST | `/api/auth/login` | Public | Login (rate limited: 10/15min) |
| GET | `/api/objectives` | Private | Get all objectives |
| GET | `/api/progress` | Private | Get daily progress |
| GET | `/api/analytics/overall` | Private | Stats for period |
| GET | `/api/analytics/weekly-chart` | Private | Chart data (minutes accurate) |
| GET | `/api/analytics/streak` | Private | Streak info |
| POST | `/api/ai/suggest-schedule` | Private | AI schedule suggestion |
| POST | `/api/ai/chat` | Private | AI chat (context memory) |
| GET | `/api/notifications` | Private | Get notifications |
| PUT | `/api/notifications/read-all` | Private | Mark all read |
| POST | `/api/notifications/trigger-reminder` | Private | Trigger pending task reminder now |
| GET | `/api/notes` | Private | Get all notes |
| POST | `/api/feedback` | Private | Submit bug / feedback |

---

## Recent Changes

### v2.0 — Avanza Rebrand & Security Hardening
- **Rebranded** from "LearnFlow" to "Avanza" across all files, UI, and notifications
- **New logo**: geometric triangle + upward arrow SVG at all sizes, custom `favicon.svg`
- **Theme**: combined warm beige + sage green + light gray, zero gradients, dark mode fully fixed
- **Security hardening**: brute-force rate limiter, body size cap, httpOnly session cookie, bcrypt rounds 12, AI prompt injection guard
- **Analytics time fix**: `Math.round()` rounding bug fixed — 2h 30m now shows correctly instead of 3h
- **Notifications**: real-time pending reminder on bell open, Mark All Read, new backend trigger endpoint
- **Notes**: full CRUD, search, colour-coded notes UI
- **Schedule**: cancel completion flow, time-spent auto-fill
- **AI Chat**: conversation context memory, token limit management
