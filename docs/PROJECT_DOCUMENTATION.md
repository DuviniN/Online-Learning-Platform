# Online Learning Platform — Project Documentation

**A MERN-stack online learning platform with GPT-powered course recommendations**

Prepared for: *Online Learning Platform with Chat GPT Integration* assessment
Author: De Silva N. D. N.

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Assessment Requirements Coverage](#2-assessment-requirements-coverage)
3. [Tech Stack](#3-tech-stack)
4. [Features](#4-features)
5. [System Architecture](#5-system-architecture)
6. [Database Design](#6-database-design)
7. [Authentication & Authorization](#7-authentication--authorization)
8. [API Documentation](#8-api-documentation)
9. [Frontend Routes](#9-frontend-routes)
10. [Project Structure](#10-project-structure)
11. [Local Development Setup](#11-local-development-setup)
12. [Deployment](#12-deployment)
13. [Security Notes](#13-security-notes)
14. [Version Control](#14-version-control)
15. [Known Limitations & Future Work](#15-known-limitations--future-work)

---

## 1. Project Overview

The Online Learning Platform is a full-stack web application that lets **students**
browse a course catalog, view course details, enroll in courses, track their
enrollments, and get **AI-generated course recommendations** based on a free-text
goal. **Instructors** can register separately, create and manage their own courses,
and see which students have enrolled in each course.

The platform is built on the MERN stack (MongoDB, Express.js, React.js, Node.js) and
integrates GPT-based course recommendations, satisfying the assessment's core
requirement to combine a functional MERN application with a Chat-GPT integration.

## 2. Assessment Requirements Coverage

| Assessment requirement | Status | Where |
|---|---|---|
| RESTful APIs for registration and login | Done | `POST /api/auth/register`, `POST /api/auth/login` |
| JWT-based authentication | Done | `utils/generateToken.js`, `middleware/authMiddleware.js` |
| CRUD operations for courses | Done | `courseController.js` (create, read, update, delete) |
| Course schema (title, description, instructor, content) | Done | `models/Course.js` |
| Registration, login, course listing UI | Done | `pages/Register.jsx`, `pages/Login.jsx`, `pages/CourseCatalog.jsx` |
| Students view and enroll in courses | Done | `pages/CourseCatalog.jsx`, `pages/CourseDetails.jsx` |
| Enrollment status + success message | Done | Enroll button states (`Enrolling…` -> `Enrolled`) |
| Students see their enrolled courses | Done | `pages/MyEnrollments.jsx` |
| Role-based access control (RBAC) | Done | `authorize(...roles)` middleware + per-resource ownership checks |
| Protected routes (frontend) | Done | `components/ProtectedRoute.jsx` |
| GPT-3 integration for recommendations | Done | `POST /api/recommendations` (OpenAI, with Groq fallback) |
| Free-text prompt -> recommended courses | Done | `pages/Recommendations.jsx` |
| Hosted on a cloud platform, internet-accessible | Done | Oracle Cloud Infrastructure VM, Nginx reverse proxy |
| Documentation (setup, architecture, API, DB) | Done | This document |
| Git version control | Done | Git repository, incremental commit history |
| Instructor sign up / log in | Done | Same auth endpoints, `role: 'instructor'` + registration code |
| Instructor: add / view / edit courses | Done | `pages/CreateCourse.jsx`, `pages/InstructorDashboard.jsx`, `pages/ManageCourse.jsx` |
| Instructor: view enrolled students in a table | Done | `GET /api/courses/:id/students`, table in `ManageCourse.jsx` |

## 3. Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18.3, React Router 6.26, Vite 5.4, Axios 1.7 |
| Backend | Node.js, Express 4.19 |
| Database | MongoDB Atlas (Mongoose ODM 8.5) |
| Authentication | JSON Web Tokens (`jsonwebtoken` 9.0), bcrypt password hashing (`bcryptjs` 2.4) |
| AI integration | OpenAI API (GPT), automatic fallback to Groq — both via the `openai` SDK 4.56 |
| Hosting | Oracle Cloud Infrastructure (Linux VM), Nginx reverse proxy |

## 4. Features

### 4.1 Student Features
- Sign up and log in with email and password (JWT-based sessions)
- Browse the full course catalog with search (by title, topic, or instructor)
- View a course's full details: description, structured "what you'll learn" content,
  and instructor
- Enroll in a course with one click; enrollment state updates immediately
  (`Enroll` -> `Enrolling…` -> `Enrolled`), with duplicate-enrollment protection
  enforced server-side
- View a personal list of enrolled courses (`My Enrollments`)
- Enter a free-text goal (e.g. *"I want to be a software engineer, what courses
  should I follow?"*) and receive AI-recommended courses drawn from the real catalog
  — the AI never invents courses that don't exist
- View and edit their own profile (name, password)

### 4.2 Instructor Features
- Sign up and log in with email and password, gated by a server-side
  instructor registration code (see [§7.3](#73-instructor-registration-code))
- Create new courses (title, description, content)
- View all of their own posted courses on a dashboard, with stats (courses posted,
  total enrolled students)
- View and edit a course's details
- Delete a course (cascades to remove its enrollments)
- View a simple table of students enrolled in each course (name, email, enrollment
  date)

### 4.3 AI Course Recommendations
Students describe a career or learning goal in plain language. The backend sends
that goal, together with the **real, current course catalog**, to an LLM and asks it
to select only from the courses that actually exist — the model is explicitly
instructed never to invent course names. The response includes:
- `advice` — 2-4 sentences of personalized guidance
- `recommendations` — an ordered list of matching real courses (with clickable links
  to each course's detail page)

If OpenAI is not configured, or an OpenAI request fails for any reason (invalid key,
quota exceeded, outage), the backend automatically retries the same request against
**Groq** (which exposes an OpenAI-compatible API), so the feature keeps working even
if one provider is down. See [§5.3](#53-ai-provider-fallback) for details.

## 5. System Architecture

### 5.1 High-level architecture

```
Browser (React SPA)
    |
    |  HTTPS / JSON
    v
Nginx (reverse proxy, port 80/443)
    |
    +-- static files (client/dist)  ------------>  served directly to the browser
    |
    +-- /api/*  -------------------------------->  Node.js / Express (port 5000)
                                                          |
                                                          |  Mongoose ODM
                                                          v
                                                    MongoDB Atlas

                                              Express also calls, for /api/recommendations:
                                                    OpenAI API
                                                          |
                                                          |  falls back here if OpenAI fails
                                                          v
                                                    Groq API
```

### 5.2 Request lifecycle

Every API call follows the same path:

1. A React component calls an `api/*.js` helper (`courseApi.js`, `enrollmentApi.js`,
   `recommendationApi.js`, `userApi.js`, or a method on `AuthContext`).
2. `axiosClient.js`'s request interceptor attaches `Authorization: Bearer <jwt>` from
   `localStorage`, if a token is present.
3. Express (`app.js`) runs `cors()` -> `express.json()` -> the matching route.
4. Route middleware runs `protect` (verifies the JWT, loads `req.user` from MongoDB)
   and, where required, `authorize('student' | 'instructor')` to reject the wrong
   role before the controller even runs.
5. The controller reads `req.user` / `req.params` / `req.body`, performs any
   ownership checks (e.g. "does this instructor actually own this course?"), and
   talks to Mongoose models.
6. Any thrown or rejected error is caught by `asyncHandler` and formatted by the
   central `errorHandler` middleware into a consistent `{ message }` JSON response
   (stack traces are included only outside production).

### 5.3 AI provider fallback

`POST /api/recommendations` tries **OpenAI** first. If OpenAI is not configured, or
the request throws for any reason (bad/expired key, quota exceeded, network issue),
the controller transparently retries the same prompt against **Groq**. Groq exposes
an OpenAI-compatible chat-completions API, so the same `openai` npm SDK is reused for
both providers — only the `baseURL`, API key, and model name differ
(`config/aiProviders.js`).

- If neither provider is configured -> `503 AI recommendations are not configured on
  the server yet`
- If both are configured but both requests fail -> `502 AI recommendations are
  temporarily unavailable`
- Otherwise -> `200` with the parsed advice and matched courses

## 6. Database Design

MongoDB Atlas, accessed through Mongoose. Three collections and their relationships:

```
User  (1) ----------< Course       Course.instructor references User._id
                                     — one instructor can own many courses

User  (1) ----------< Enrollment   Enrollment.student references User._id
                                     — one student can have many enrollments

Course (1) ---------< Enrollment   Enrollment.course references Course._id
                                     — one course can have many enrollments
```

### User
| Field | Type | Notes |
|---|---|---|
| `name` | String | required |
| `email` | String | required, unique, lowercased |
| `password` | String | required, min. 8 characters, bcrypt-hashed, `select: false` (never returned by default) |
| `role` | String | enum `student` \| `instructor`, defaults to `student` |
| `createdAt` / `updatedAt` | Date | automatic timestamps |

### Course
| Field | Type | Notes |
|---|---|---|
| `title` | String | required |
| `description` | String | required |
| `content` | String | required — the "what you'll learn" curriculum text |
| `instructor` | ObjectId -> `User` | required |
| `createdAt` / `updatedAt` | Date | automatic timestamps |

### Enrollment
| Field | Type | Notes |
|---|---|---|
| `student` | ObjectId -> `User` | required |
| `course` | ObjectId -> `Course` | required |
| `status` | String | enum `active` |
| `createdAt` / `updatedAt` | Date | automatic timestamps |

A **unique compound index** on `(student, course)` enforces at the database level
that a student cannot enroll in the same course twice — this is the authoritative
duplicate-enrollment guard, not just a frontend check.

## 7. Authentication & Authorization

### 7.1 JWT flow
On register or login, the backend issues a signed JWT (`generateToken.js`) containing
the user's id and role, valid for `JWT_EXPIRES_IN` (default `7d`). The frontend
stores this token in `localStorage` and attaches it as `Authorization: Bearer <jwt>`
on every subsequent request. The `protect` middleware verifies the token's signature
and expiry, then loads the corresponding user from MongoDB into `req.user` for the
rest of the request.

### 7.2 Role-based access control (RBAC)
The `authorize(...roles)` middleware rejects a request with `403` if the
authenticated user's role isn't in the allowed list — e.g.
`authorize('instructor')` on course-creation routes. This runs **before** the
controller, so a student's request to create a course never reaches the database
layer.

Beyond role checks, several endpoints also enforce **resource ownership** inside the
controller itself: an instructor can only update, delete, or view enrollments for
courses **they created** — verified by comparing `course.instructor` to
`req.user._id`, independent of the role check.

### 7.3 Instructor registration code
Because anyone could otherwise register as an instructor by simply choosing that
role, instructor sign-up additionally requires a shared `instructorCode`, checked
against a server-only environment variable (`INSTRUCTOR_REGISTRATION_CODE`) using a
constant-time comparison (`crypto.timingSafeEqual` over SHA-256 digests) so the
comparison can't leak timing information about the correct code. Key properties:

- The real code lives **only** in the server's `.env` file — never in frontend
  source code, never returned by any API response, never stored on the `User`
  document.
- If the code is missing, wrong, or the server-side secret isn't configured at all,
  registration fails closed with `403 Invalid instructor registration code.` — the
  requested role is never silently downgraded or granted anyway.
- The client-submitted `role` field is **never trusted directly**: the backend always
  decides `role: wantsInstructor ? 'instructor' : 'student'` after validating the
  code, so a modified Postman/API request cannot grant instructor access without the
  real code.

## 8. API Documentation

All routes are prefixed with `/api`. Protected routes require
`Authorization: Bearer <token>`.

| Method | Path | Access | Description |
|---|---|---|---|
| `POST` | `/auth/register` | Public | Register a user. Body: `{ name, email, password, role, instructorCode? }`. `instructorCode` is required and validated server-side when `role` is `instructor`. |
| `POST` | `/auth/login` | Public | Log in. Body: `{ email, password }`. Returns `{ _id, name, email, role, token }`. |
| `GET` | `/auth/me` | Authenticated | Get the current user's profile. |
| `PUT` | `/auth/me` | Authenticated | Update profile. Body: `{ name? }` and/or `{ currentPassword, newPassword }` to change password. |
| `GET` | `/courses` | Authenticated | List courses (the catalog), server-side paginated. Query: `page`, `limit`, `search?` (matches title, description, or instructor name). Returns `{ courses, page, totalPages, totalCourses }`. |
| `POST` | `/courses` | Instructor | Create a course. Body: `{ title, description, content }`. |
| `GET` | `/courses/mine` | Instructor | List the logged-in instructor's own courses. |
| `GET` | `/courses/:id` | Authenticated | Get one course's full details. |
| `PUT` | `/courses/:id` | Instructor (owner) | Update a course. `403` if the instructor doesn't own it. |
| `DELETE` | `/courses/:id` | Instructor (owner) | Delete a course and cascade-delete its enrollments. |
| `GET` | `/courses/:id/students` | Instructor (owner) | List students enrolled in a course (name, email, enrollment date). |
| `POST` | `/enrollments` | Student | Enroll in a course. Body: `{ courseId }`. `409` if already enrolled. |
| `GET` | `/enrollments/mine` | Student | List the logged-in student's enrollments. |
| `POST` | `/recommendations` | Student | Get AI-recommended courses. Body: `{ prompt }`. Returns `{ advice, recommendations }`. |
| `GET` | `/health` | Public | Health check — returns `{ status: "ok" }`. |

### Example: register as a student

```http
POST /api/auth/register
Content-Type: application/json

{
  "name": "Jane Doe",
  "email": "jane@example.com",
  "password": "securepass123",
  "role": "student"
}
```

```json
{
  "_id": "6aa385c57f8c7f1b6c84c070",
  "name": "Jane Doe",
  "email": "jane@example.com",
  "role": "student",
  "token": "eyJhbGciOiJIUzI1NiIs..."
}
```

### Example: get AI course recommendations

```http
POST /api/recommendations
Authorization: Bearer <token>
Content-Type: application/json

{
  "prompt": "I want to be a software engineer, what courses should I follow?"
}
```

```json
{
  "advice": "Starting with software engineering fundamentals will give you a solid foundation...",
  "recommendations": [
    { "_id": "6aa63201...", "title": "Software Engineering Fundamentals", "description": "..." },
    { "_id": "6aa62511...", "title": "Git and GitHub for Developers", "description": "..." }
  ]
}
```

## 9. Frontend Routes

| Path | Page | Access |
|---|---|---|
| `/` | Landing page (logged out) / Course catalog (logged in) | Public |
| `/login` | Login | Public |
| `/register` | Register (Student or Instructor, with role-specific fields) | Public |
| `/courses/:id` | Course details | Any authenticated user |
| `/profile` | View/edit profile, change password | Any authenticated user |
| `/student/dashboard` | Student dashboard (quick actions, stats) | Student |
| `/my-enrollments` | Enrolled courses | Student |
| `/recommendations` | AI course advisor | Student |
| `/instructor` | Instructor dashboard (own courses, stats) | Instructor |
| `/instructor/courses/new` | Create a course | Instructor |
| `/instructor/courses/:id` | Manage a course (edit, delete, enrolled students table) | Instructor |

Route protection is enforced client-side by `ProtectedRoute.jsx` (redirects
unauthenticated users to `/login`, and wrong-role users to `/`) **and**
server-side by the `protect`/`authorize` middleware — the frontend guard is a UX
convenience, not the security boundary.

## 10. Project Structure

```
server/
  src/
    config/          # db.js (MongoDB connection), aiProviders.js (OpenAI + Groq clients)
    controllers/      # authController, courseController, enrollmentController, recommendationController
    middleware/        # authMiddleware (protect, authorize), errorMiddleware
    models/            # User, Course, Enrollment
    routes/            # authRoutes, courseRoutes, enrollmentRoutes, recommendationRoutes
    utils/             # asyncHandler, generateToken
    app.js             # Express app setup, middleware, route mounting
    server.js          # Entry point — connects to MongoDB, starts the HTTP server
  .env.example
client/
  src/
    api/               # axiosClient + one helper module per resource
    context/           # AuthContext (login/register/logout/profile state)
    components/        # Navbar, ProtectedRoute, CourseCard, Avatar, EmptyState, AuthLayout
    pages/              # One component per route
    utils/visuals.js    # Deterministic thumbnails/avatars derived from real data
  .env.example
```

## 11. Local Development Setup

**Prerequisites**: Node.js 18+, a MongoDB connection string (local `mongod` or
[MongoDB Atlas](https://www.mongodb.com/atlas)), and an
[OpenAI API key](https://platform.openai.com/api-keys) and/or a free
[Groq API key](https://console.groq.com/keys) for recommendations (either is
enough — OpenAI automatically falls back to Groq).

```bash
git clone <repo-url>
cd Online-Learning-Platform
```

**Backend**
```bash
cd server
npm install
cp .env.example .env
# fill in MONGO_URI, JWT_SECRET, INSTRUCTOR_REGISTRATION_CODE,
# and OPENAI_API_KEY and/or GROQ_API_KEY
npm run dev              # http://localhost:5000
```

**Frontend** (in a second terminal)
```bash
cd client
npm install
cp .env.example .env      # defaults to http://localhost:5000/api
npm run dev                # http://localhost:5173
```

## 12. Deployment

The application is deployed on an **Oracle Cloud Infrastructure (OCI) Linux VM**,
with **Nginx** as a reverse proxy in front of the Node.js backend and serving the
built React frontend.

### 12.1 Provision the server
1. Create an OCI Compute instance (Linux VM).
2. Open ports `80` (HTTP) and `443` (HTTPS) in the instance's security list / network
   security group. The Node app's port (`5000`) does **not** need to be publicly
   open — only Nginx needs to reach it, on `localhost`.
3. Install Node.js 18+, Git, and Nginx on the VM.

### 12.2 Deploy the code
```bash
git clone <repo-url>
cd Online-Learning-Platform/server && npm install --production
cd ../client && npm install && npm run build   # produces client/dist
```
Create `server/.env` on the VM with production values (see `.env.example`) —
never commit this file.

### 12.3 Keep the backend running
Run the Node process with a production process manager rather than a plain
`node`/`nodemon` invocation, so it survives crashes and server reboots — for
example with [PM2](https://pm2.keymetrics.io/):
```bash
npm install -g pm2
pm2 start src/server.js --name olp-api
pm2 save
pm2 startup   # configures PM2 to restart the app on server reboot
```

### 12.4 Nginx reverse proxy
Nginx serves the built frontend as static files and proxies `/api` to the Node
process on `localhost:5000`:

```nginx
server {
    listen 80;
    server_name your-domain-or-ip;

    root /path/to/Online-Learning-Platform/client/dist;
    index index.html;

    location /api/ {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    # React Router — serve index.html for any unknown path
    location / {
        try_files $uri /index.html;
    }
}
```

### 12.5 HTTPS
Once a domain name points at the server, issue a free TLS certificate with
[Certbot](https://certbot.eff.org/) (`certbot --nginx`) so the site serves over
HTTPS rather than plain HTTP — important since login/register requests currently
carry credentials that should not travel unencrypted.

### 12.6 Environment variables in production
Set `NODE_ENV=production` in `server/.env` so the error handler stops including
stack traces in API responses (only the `message` field is returned to clients in
production; full stack traces are still logged server-side for debugging).

## 13. Security Notes

- `.env` files are gitignored on both `client` and `server` — real secrets are never
  committed. `.env.example` is the checked-in template.
- Passwords are hashed with bcrypt before saving (`User` model's `pre('save')` hook)
  and the `password` field is excluded from query results by default
  (`select: false`).
- The instructor registration code is validated with a constant-time comparison to
  avoid leaking information through response timing.
- Role is always decided server-side from validated input, never trusted directly
  from the client — a modified API request cannot self-grant the instructor role.
- Resource ownership (not just role) is checked before mutating or reading
  instructor-owned data.
- `JWT_SECRET` and `INSTRUCTOR_REGISTRATION_CODE` should be long, random values in
  production — the `.env.example` placeholders are not safe to use as-is.
- Password strength is validated on both the client (`utils/passwordRules.js`, for
  instant feedback) and the server (`utils/validatePassword.js`, the real authority):
  at least 8 characters, with an uppercase letter, a lowercase letter, and a number.

## 14. Version Control

The project uses Git for version control, with incremental commits reflecting the
project's development in stages (initial scaffold -> authentication -> course
management -> enrollment -> AI recommendations -> UI/UX passes -> security hardening).

## 15. Known Limitations & Future Work

- No automated test suite yet (unit/integration tests for controllers and key
  frontend flows would be a natural next step).
- No file/image upload support — course thumbnails are generated deterministically
  from course titles rather than instructor-uploaded images.
- HTTPS/TLS should be finalized on the production domain (see §12.5) before the
  platform is used with real user credentials at scale.
