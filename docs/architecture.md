# TaskFlow Architecture

```text
React (Vite)
  | Axios + Bearer JWT
  v
Express REST API
  | auth middleware verifies JWT
  v
Mongoose models
  |
  v
MongoDB (users, tasks)
```

## Authentication flow
1. User submits signup or login form.
2. API validates input; signup hashes password with bcrypt (12 salt rounds).
3. API signs a JWT containing the user ID (7-day expiry).
4. Client stores token in localStorage and sends it in the Authorization header.
5. Protected middleware verifies token and loads the account.
6. Task queries always include the authenticated user's ID so users cannot access another user's tasks.

## Main data entities
- User: name, email, password hash, timestamps.
- Task: owner, title, description, status, priority, due date, timestamps.
