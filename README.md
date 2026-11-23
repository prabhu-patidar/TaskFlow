# TaskFlow — MERN Task & Project Management System

A responsive full-stack task manager built for the Full Stack Web Development Internship project.

## Features
- Register/login with JWT; passwords hashed using bcrypt
- Protected dashboard and task APIs
- Create, read, update, delete tasks
- Search and filter by status / priority
- Dashboard statistics
- Responsive React UI
- MongoDB persistence with Mongoose
- Express REST API and validation

## Stack
React + Vite, React Router, Axios, plain CSS, Node.js, Express, MongoDB, Mongoose, JWT, bcryptjs.

## Requirements
Node.js 18+ and MongoDB (local or Atlas).

## Run locally
### 1. Backend
```bash
cd server
cp .env.example .env
npm install
npm run dev
```
Set `MONGODB_URI` and a long random `JWT_SECRET` in `server/.env`.
Backend runs at http://localhost:5000.

### 2. Frontend
Open a second terminal:
```bash
cd client
npm install
npm run dev
```
Open the Vite URL (normally http://localhost:5173).

## API routes
| Method | Route | Auth | Purpose |
|---|---|---:|---|
| GET | /api/health | No | API health |
| POST | /api/auth/register | No | Create account |
| POST | /api/auth/login | No | Login |
| GET | /api/auth/me | Yes | Current user |
| GET | /api/tasks | Yes | List own tasks; supports `?status=todo&priority=high&search=...` |
| POST | /api/tasks | Yes | Create task |
| GET | /api/tasks/:id | Yes | Get one task |
| PUT | /api/tasks/:id | Yes | Update task |
| DELETE | /api/tasks/:id | Yes | Delete task |

All protected routes require `Authorization: Bearer <token>`.

## Suggested deployment
- MongoDB: MongoDB Atlas
- Backend: Render (Root Directory `server`, Build `npm install`, Start `npm start`)
- Frontend: Netlify or Vercel (Root Directory `client`, Build `npm run build`, Publish `dist`)
- Set frontend `VITE_API_URL` to the deployed backend URL plus `/api`.
- Set backend `CLIENT_URL` to the deployed frontend URL.

## Project structure
```text
server/  Express API, models, middleware, controllers
client/  React application
 docs/   Architecture and authentication flow
```

## Notes
This is a working starter implementation. Configure your own MongoDB connection and deployment environment before publishing. Do not commit `.env` or production secrets.
