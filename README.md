# DevPulse

A RESTful issue-tracking API built with Node.js, TypeScript, and PostgreSQL (Neon). Supports user authentication with JWT and role-based access control for managing development issues.

**Live URL:** [https://dev-pulse-lime-nu.vercel.app/](https://dev-pulse-lime-nu.vercel.app/)

---

## Features

- User registration and login with hashed passwords (bcrypt)
- JWT-based authentication (access token)
- Role-based authorization: `contributor` and `maintainer`
- Full CRUD for issues: create, list, get by ID, update, delete
- Only maintainers can delete issues
- Neon serverless PostgreSQL — schema auto-initializes on startup
- Deployed on Vercel (serverless)

---

## Tech Stack

| Layer | Technology |
|---|---|
| Runtime | Node.js |
| Language | TypeScript |
| Framework | Express.js |
| Database | PostgreSQL (Neon Serverless) |
| ORM/Query | `@neondatabase/serverless` (raw SQL) |
| Auth | JSON Web Tokens (JWT) + bcrypt |
| Build | tsup |
| Deploy | Vercel |

---

## Setup

### Prerequisites

- Node.js v18+
- A [Neon](https://neon.tech) PostgreSQL database
- npm

### Steps

```bash
# 1. Clone the repository
git clone https://github.com/Mahfujul-hasan/DevPulse.git
cd DevPulse

# 2. Install dependencies
npm install

# 3. Create .env file
cp .env.example .env
# Fill in the values (see Environment Variables section)

# 4. Run in development
npm run dev

# 5. Build for production
npm run build

# 6. Start production server
npm start
```


## API Endpoints

Base URL (production): `https://dev-pulse-lime-nu.vercel.app`

### Health Check

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/` | No | Server health check |

### Auth

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/api/auth/signup` | No | Register a new user |
| POST | `/api/auth/login` | No | Login and receive JWT |

### Issues

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/api/issues/` | Required | Create a new issue |
| GET | `/api/issues/` | No | Get all issues |
| GET | `/api/issues/:id` | No | Get a single issue by ID |
| PATCH | `/api/issues/:id` | Required | Update an issue |
| DELETE | `/api/issues/:id` | Required (maintainer) | Delete an issue |

#### Auth Header Format

```
Authorization: Bearer <access_token>
```

#### Request Body Examples

**POST /api/auth/signup**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securepassword",
  "role": "contributor"
}
```

**POST /api/auth/login**
```json
{
  "email": "john@example.com",
  "password": "securepassword"
}
```

**POST /api/issues/**
```json
{
  "title": "Fix login redirect",
  "description": "Users are not redirected after login",
  "type": "bug"
}
```

---

## Database Schema

### `users` table

| Column | Type | Constraints |
|---|---|---|
| id | SERIAL | PRIMARY KEY |
| name | VARCHAR | NOT NULL |
| email | VARCHAR | NOT NULL, UNIQUE |
| password | VARCHAR | NOT NULL |
| role | VARCHAR | DEFAULT `'contributor'` |
| created_at | TIMESTAMP | DEFAULT NOW() |
| updated_at | TIMESTAMP | DEFAULT NOW() |

### `issues` table

| Column | Type | Constraints |
|---|---|---|
| id | SERIAL | PRIMARY KEY |
| title | VARCHAR | NOT NULL |
| description | TEXT | |
| type | VARCHAR | NOT NULL |
| status | VARCHAR | DEFAULT `'open'` |
| reporter_id | INTEGER | REFERENCES users(id) |
| created_at | TIMESTAMP | DEFAULT NOW() |
| updated_at | TIMESTAMP | DEFAULT NOW() |

**Issue types:** `bug`, `feature`, `enhancement` (or as defined in app)  
**Issue statuses:** `open`, `in_progress`, `closed`  
**User roles:** `contributor`, `maintainer`

---

## Project Structure

```
src/
├── config/         # Environment variable loader
├── db/             # Neon DB connection + schema init
├── middleware/     # Auth middleware, error handler
├── modules/
│   ├── auth/       # Signup, login controllers/services/routes
│   └── issues/     # CRUD controllers/services/routes
├── types/          # TypeScript interfaces and enums
├── utils/          # JWT helpers, response formatter
├── app.ts          # Express app setup
└── index.ts        # Server entry point
```

---
