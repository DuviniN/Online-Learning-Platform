# Online Learning Platform

A MERN-stack online learning platform. Students can browse courses, view course
details, enroll, track their enrollments, and get AI-powered course recommendations.
Instructors can create, edit, and delete their own courses, and see who has enrolled
in each one.

## Tech stack

| Layer | Technology |
|---|---|
| Frontend | React 18, React Router 6, Vite, Axios |
| Backend | Node.js, Express 4 |
| Database | MongoDB (Mongoose ODM) |
| Auth | JWT (jsonwebtoken), bcryptjs for password hashing |
| AI | OpenAI API (GPT), with automatic fallback to Groq if OpenAI is unavailable |

## Features

**Student**
- Sign up / log in
- Browse the course catalog and view full course details
- Enroll in a course (with a success confirmation and duplicate-enrollment protection)
- View a list of their enrolled courses
- Enter a free-text goal (e.g. *"I want to be a software engineer, what courses should
  I follow?"*) and get AI-recommended courses drawn from the real catalog

**Instructor**
- Sign up / log in
- Create new courses
- View all of their own posted courses on a dashboard
- View and edit a course's details
- Delete a course (also removes its enrollments)
- View a table of students enrolled in each course

**Cross-cutting**
- JWT-based authentication on every protected route
- Role-based access control (RBAC): instructor-only and student-only endpoints,
  enforced both by role and by resource ownership (an instructor can only edit/view
  enrollments for *their own* courses)

## Architecture

```
React (Vite)  →  axios (JWT in Authorization header)  →  Express API  →  Mongoose  →  MongoDB
```

Request lifecycle for every call:

1. A component calls an `api/*.js` helper (`courseApi.js`, `enrollmentApi.js`,
   `recommendationApi.js`, or `AuthContext`).
2. `axiosClient.js`'s request interceptor attaches `Authorization: Bearer <jwt>` from
   `localStorage`.
3. Express (`app.js`) runs `cors()` → `express.json()` → the matching route.
4. Route middleware runs `protect` (verifies the JWT, loads `req.user`) and, where
   required, `authorize('student' | 'instructor')`.
5. The controller reads `req.user` / `req.params` / `req.body`, does the necessary
   ownership checks, and talks to Mongoose models.
6. Any thrown/rejected error is caught by `asyncHandler` and formatted by the central
   `errorHandler` middleware into a consistent `{ message }` JSON response.

**AI provider fallback**: `POST /api/recommendations` tries OpenAI first. If OpenAI
isn't configured, or the request fails for any reason (invalid/expired key, quota
exceeded, an outage), it automatically retries with Groq — which exposes an
OpenAI-compatible API, so the same `openai` SDK talks to both, just with a different
`baseURL`, key, and model (see `config/aiProviders.js`). If neither provider is
configured, the endpoint responds with `503` instead of crashing; if both are
configured but both fail, it responds with `502`.

### Project structure

```
server/
  src/
    config/         # db.js (Mongo connection), aiProviders.js (OpenAI + Groq clients)
    controllers/     # authController, courseController, enrollmentController, recommendationController
    middleware/       # authMiddleware (protect, authorize), errorMiddleware
    models/           # User, Course, Enrollment
    routes/           # authRoutes, courseRoutes, enrollmentRoutes, recommendationRoutes
    utils/            # asyncHandler, generateToken
    app.js / server.js
client/
  src/
    api/              # axiosClient + one helper module per resource
    context/          # AuthContext (login/register/logout, current user)
    components/       # Navbar, ProtectedRoute
    pages/            # one component per route (see table below)
```

## Database schema

**User**
| Field | Type | Notes |
|---|---|---|
| name | String | required |
| email | String | required, unique |
| password | String | required, bcrypt-hashed, never returned by default |
| role | String | `student` \| `instructor` |

**Course**
| Field | Type | Notes |
|---|---|---|
| title | String | required |
| description | String | required |
| content | String | required |
| instructor | ObjectId → User | required |

**Enrollment**
| Field | Type | Notes |
|---|---|---|
| student | ObjectId → User | required |
| course | ObjectId → Course | required |
| status | String | `active` |

A unique compound index on `(student, course)` prevents duplicate enrollments.

## API reference

All routes are prefixed with `/api`. Protected routes require
`Authorization: Bearer <token>`.

| Method | Path | Access | Description |
|---|---|---|---|
| POST | `/auth/register` | Public | Register a user (`name`, `email`, `password`, `role`) |
| POST | `/auth/login` | Public | Log in, returns `{ token, ...user }` |
| GET | `/auth/me` | Authenticated | Get the current user |
| GET | `/courses` | Authenticated | List all courses (catalog) |
| POST | `/courses` | Instructor | Create a course |
| GET | `/courses/mine` | Instructor | List the logged-in instructor's own courses |
| GET | `/courses/:id` | Authenticated | Get one course's details |
| PUT | `/courses/:id` | Instructor (owner) | Update a course |
| DELETE | `/courses/:id` | Instructor (owner) | Delete a course and its enrollments |
| GET | `/courses/:id/students` | Instructor (owner) | List students enrolled in a course |
| POST | `/enrollments` | Student | Enroll in a course (`courseId`) |
| GET | `/enrollments/mine` | Student | List the logged-in student's enrollments |
| POST | `/recommendations` | Student | Get AI-recommended courses for a free-text `prompt` |
| GET | `/health` | Public | Health check |

Ownership is enforced in the controller, not just by role: an instructor gets `403`
if they try to update, delete, or view enrollments for a course they don't own.

## Local setup

Prerequisites: Node.js 18+, a MongoDB connection string (local or
[MongoDB Atlas](https://www.mongodb.com/atlas)), and optionally an
[OpenAI API key](https://platform.openai.com/api-keys) and/or a
[Groq API key](https://console.groq.com/keys) (free) for recommendations — either one
is enough, and OpenAI automatically falls back to Groq if it fails.

```bash
git clone <repo-url>
cd Online-Learning-Platform
```

**Backend**
```bash
cd server
npm install
cp .env.example .env   # then fill in MONGO_URI, JWT_SECRET, and OPENAI_API_KEY and/or GROQ_API_KEY
npm run dev             # http://localhost:5000
```

**Frontend** (in a second terminal)
```bash
cd client
npm install
cp .env.example .env   # defaults to http://localhost:5000/api, adjust if needed
npm run dev             # http://localhost:5173
```





## Security notes

- `.env` files are gitignored on both `client` and `server` — never commit real
  secrets. Use `.env.example` as the template.
- Rotate `JWT_SECRET` to a long random string before deploying (the placeholder in
  `.env.example` is not safe to use as-is).
- Passwords are hashed with bcrypt and the `password` field is excluded from query
  results by default (`select: false`).
