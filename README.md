# TeamFlow

A MERN-stack team project management system. Admins create projects, add team
members, assign tasks, and track progress; team members manage their own
assigned work, comment on tasks, and see their history.

## Tech stack

- **Frontend:** React (Vite), React Router, Context API, Axios, Tailwind CSS
- **Backend:** Node.js, Express.js
- **Database:** MongoDB with Mongoose
- **Auth:** JWT + bcrypt
- **Uploads:** Multer (local disk storage for profile images)

## Project structure

```
teamflow/
├── client/     React frontend (Vite)
└── server/     Express + MongoDB API
```

## Prerequisites

- Node.js 18+
- A MongoDB instance (local, Docker, or MongoDB Atlas)

## Setup

### 1. Backend

```bash
cd teamflow
cd server
cp .env.example .env    # then edit MONGO_URI / JWT_SECRET as needed
npm install
npm run seed             # optional: creates demo admin + member accounts
npm run dev               # starts on http://localhost:5000
```

### 2. Frontend

```bash
cd teamflow
cd client
cp .env.example .env    # points VITE_API_URL at the backend
npm install
npm run dev               # starts on http://localhost:5173
```

Open `http://localhost:5173` in your browser.

## Demo accounts

After running `npm run seed` in `server/`:

| Role   | Email                 | Password       |
|--------|-----------------------|----------------|
| Admin  | admin@teamflow.dev    | Password123!   |
| Member | member@teamflow.dev   | Password123!   |

You can also register your own account from the UI -   the very first person
to register becomes an admin automatically; everyone after that registers as
a team member (an admin can promote them later from the Users page).

## How authentication works

1. On login/register, the server verifies credentials (bcrypt-hashed
   passwords) and issues a signed JWT containing the user's ID.
2. The client stores the token in `localStorage` and attaches it as
   `Authorization: Bearer <token>` on every API request (see
   `client/src/api/axios.js`).
3. The `protect` middleware (`server/src/middleware/auth.js`) verifies the
   token on every protected route, loads the user, and rejects the request
   if the token is invalid/expired or the account has been deactivated.
4. Role-based authorization is layered on top with `requireRole('admin')`
   and project-membership checks, so authentication (who you are) and
   authorization (what you're allowed to do) are handled as two separate
   steps.

## Key design decisions

- **Access control lives on the backend.** Every list/detail endpoint for
  tasks and projects re-checks project membership server-side — the
  frontend hiding a button is a UX nicety, not a security boundary.
- **Activity history is derived from real state changes.** The task
  controller diffs incoming updates against the stored document and only
  logs an activity entry for fields that actually changed.
- **Search/filter/sort/pagination** are implemented once, in
  `server/src/utils/apiFeatures.js`, and reused across the users, projects,
  and tasks endpoints via query parameters (`?search=&status=&page=&limit=`).
- **First registered user becomes admin.** This avoids a chicken-and-egg
  problem for a fresh install without requiring a separate seed step,
  while `npm run seed` remains available for demo data.

## Documentation

- [`docs/API.md`](./docs/API.md) — full endpoint reference
- [`docs/DATABASE.md`](./docs/DATABASE.md) — data model explanation
- [`docs/TeamFlow.postman_collection.json`](./docs/TeamFlow.postman_collection.json) — importable Postman collection

## Security notes

- Passwords are hashed with bcrypt and never returned in API responses.
- JWT secret and Mongo credentials are read from environment variables —
  never commit a real `.env` file.
- Login and registration are rate-limited to slow down brute-force attempts.
- Helmet and a locked-down CORS origin are enabled on the API.
