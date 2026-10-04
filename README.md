# Task Management API

A TypeScript-based REST API for managing users and their tasks. Built with Express, Prisma ORM, PostgreSQL, JWT authentication, and Zod validation.

## Overview

This project exposes a straightforward task management backend with:

- User registration and login
- JWT-protected routes
- Task creation, retrieval, updates, and deletion
- Query filtering and pagination for tasks
- Postgres-backed persistence via Prisma ORM
- Structured API responses and error handling

## Tech Stack

- Node.js
- TypeScript
- Express
- PostgreSQL
- Prisma ORM
- JWT
- bcryptjs
- Zod
- CORS

## Project Structure

```text
src/
├── controllers/
│   ├── auth/
│   ├── task/
│   └── user/
├── middleware/
│   ├── auth-check/
│   └── error-handler/
├── routes/
│   ├── auth/
│   ├── task/
│   └── user/
├── validators/
│   ├── env/
│   ├── pagination/
│   ├── task/
│   └── user/
├── prisma/
├── lib/
├── utils/
├── types/
├── index.ts
└── ...
```

## Features

### Authentication

- `POST /api/v1/auth/register`
- `POST /api/v1/auth/login`

User registration creates a user record and returns a JWT token. Login verifies credentials and returns the same token for protected API access.

### User Management

Protected routes requiring `Authorization: Bearer <token>`:

- `GET /api/v1/users/:id`
- `PATCH /api/v1/users/:id`
- `DELETE /api/v1/users/:id`

### Task Management

Protected routes:

- `POST /api/v1/tasks`
- `GET /api/v1/tasks`
- `GET /api/v1/tasks/:id`
- `PATCH /api/v1/tasks/:id`
- `DELETE /api/v1/tasks/:id`

Task query filtering supports:

- `status` — `pending`, `completed`, or `cancelled`
- `q` — search across task title and description
- `sort` — created time ordering
- `page` and `limit` — pagination

### Health and Base Routes

- `GET /` — API welcome message with available route groups
- `GET /health` — health check endpoint

## Getting Started

### Prerequisites

- Node.js 20+
- pnpm
- PostgreSQL database

### 1) Install dependencies

```bash
pnpm install
```

### Deploy to Vercel

The Express application is exported from `api/index.ts`, which Vercel detects
as a Node.js serverless function. Configure the required `NODE_ENV`,
`JWT_SECRET`, and `DATABASE_URL` environment variables in the Vercel project
settings, then deploy from the repository root.

Database connections are established lazily for API requests and reused while
the serverless instance remains warm. The `/health` endpoint does not require a
database connection.

### 2) Configure environment variables

Copy the example file and update the values:

```bash
cp .env.example .env
```

Example `.env`:

```env
NODE_ENV=development
PORT=3000
JWT_SECRET=your_super_secure_jwt_secret_at_least_32_chars
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/task_management
```

The app validates these values at startup. Missing or invalid variables will prevent the server from running.

### 3) Start the API

```bash
pnpm dev
```

The server will run using the entry point in `src/index.ts` and listen on the configured port.

## Available Scripts

```bash
pnpm dev
pnpm build
pnpm start
pnpm run db:emit
pnpm run db:sign
pnpm run db:migrate:plan
pnpm run db:migrate:apply
pnpm run db:migration:status
```

## API Examples

### Register a user

```bash
curl -X POST http://localhost:3000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Jane Doe",
    "email": "jane@example.com",
    "password": "secret123"
  }'
```

### Login

```bash
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "jane@example.com",
    "password": "secret123"
  }'
```

### Create a task

```bash
curl -X POST http://localhost:3000/api/v1/tasks \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{
    "title": "Write project README",
    "description": "Document the API and setup instructions.",
    "status": "pending"
  }'
```

### Get tasks with filters

```bash
curl "http://localhost:3000/api/v1/tasks?status=pending&page=1&limit=10&q=README" \
  -H "Authorization: Bearer <token>"
```

## Response Format

The API returns structured JSON responses with consistent fields for success and error states.

Example success response:

```json
{
  "success": true,
  "message": "Task created successfully.",
  "data": {
    "id": "task_id",
    "title": "Write project README",
    "description": "Document the API and setup instructions.",
    "status": "pending",
    "userId": "user_id"
  }
}
```

Example error response:

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Password must be at least 6 characters long"
  }
}
```

## Notes

- All task and user routes except auth are protected by JWT middleware.
- Passwords are hashed with `bcryptjs` before being stored.
- The task status enum is limited to `pending`, `completed`, and `cancelled`.
- This project is designed to use PostgreSQL through Prisma ORM and expects a live database connection.

## License

This project is currently licensed under **MIT License**.
