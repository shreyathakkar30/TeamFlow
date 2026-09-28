# TeamFlow API Documentation

Base URL: `http://localhost:5000/api`

All protected routes require an `Authorization: Bearer <token>` header.
All responses follow the shape:

```json
{ "success": true, "data": ..., "pagination": { ... } }
```

or, on error:

```json
{ "success": false, "message": "...", "errors": ["..."] }
```

## Authentication

| Method | Route                     | Access | Description                          |
|--------|---------------------------|--------|---------------------------------------|
| POST   | `/auth/register`          | Public | Register a new user                   |
| POST   | `/auth/login`              | Public | Log in, returns a JWT                 |
| GET    | `/auth/me`                  | Auth   | Get the current logged-in user        |
| PUT    | `/auth/change-password`    | Auth   | Change your own password              |

**Register body:** `{ "name", "email", "password" }`
**Login body:** `{ "email", "password" }`
Response: `{ user, token }`

## Users

| Method | Route                          | Access        | Description                       |
|--------|--------------------------------|---------------|-------------------------------------|
| GET    | `/users`                       | Admin          | List users (search/filter/paginate) |
| GET    | `/users/:id`                    | Auth           | Get a single user                   |
| PUT    | `/users/:id`                    | Self or admin  | Update name (admin can also set role) |
| PUT    | `/users/:id/profile-image`      | Self only      | Upload a profile photo (multipart)  |
| PATCH  | `/users/:id/status`             | Admin          | Activate/deactivate a user          |
| DELETE | `/users/:id`                    | Admin          | Delete a user                       |

Query params for `GET /users`: `search`, `role`, `isActive`, `page`, `limit`.

A user can never set their own `role` — this is enforced server-side, not
just hidden in the UI.

## Projects

| Method | Route                                   | Access                    | Description                     |
|--------|------------------------------------------|---------------------------|-----------------------------------|
| POST   | `/projects`                               | Admin                      | Create a project                  |
| GET    | `/projects`                                | Auth (scoped by membership)| List projects                     |
| GET    | `/projects/:id`                            | Member of project or admin | Get one project                   |
| PUT    | `/projects/:id`                            | Admin                      | Update a project                  |
| DELETE | `/projects/:id`                            | Admin                      | Delete a project (and its tasks)  |
| POST   | `/projects/:id/members`                    | Admin                      | Add members: `{ memberIds: [] }`  |
| DELETE | `/projects/:id/members/:userId`            | Admin                      | Remove a member                   |

Query params for `GET /projects`: `search`, `status`, `page`, `limit`.
Non-admins automatically only see projects they're a member of.

## Tasks

| Method | Route                          | Access                              | Description                    |
|--------|---------------------------------|--------------------------------------|----------------------------------|
| POST   | `/tasks`                         | Admin                                | Create a task                   |
| GET    | `/tasks`                          | Auth (scoped by project membership)  | List tasks                      |
| GET    | `/tasks/:id`                      | Member of the task's project or admin| Get one task                    |
| PUT    | `/tasks/:id`                      | Admin                                | Full edit                       |
| PATCH  | `/tasks/:id/status`               | Admin or the assignee                | Update only the status          |
| DELETE | `/tasks/:id`                      | Admin                                | Delete a task                   |

Query params for `GET /tasks`: `search`, `project`, `assignedTo`, `status`,
`priority`, `dueBefore`, `dueAfter`, `overdue=true`, `sortBy`
(`createdAt`|`dueDate`|`priority`|`status`), `order` (`asc`|`desc`), `page`,
`limit`.

Example:

```
GET /api/tasks?status=In Progress&priority=High&page=1&limit=10
```

## Comments

| Method | Route                          | Access             | Description               |
|--------|----------------------------------|---------------------|----------------------------|
| POST   | `/tasks/:taskId/comments`        | Auth                 | Add a comment              |
| GET    | `/tasks/:taskId/comments`        | Auth                 | List a task's comments     |
| PUT    | `/comments/:id`                    | Comment owner        | Edit your own comment      |
| DELETE | `/comments/:id`                    | Comment owner/admin  | Delete a comment           |

## Activity history

| Method | Route                          | Access | Description                          |
|--------|----------------------------------|--------|----------------------------------------|
| GET    | `/tasks/:taskId/activity`        | Auth   | Chronological activity log for a task  |

Activity entries are created automatically when a task is created, assigned,
or has its status/priority/due date changed, and when a comment is added.

## Dashboard

| Method | Route                | Access | Description                     |
|--------|-----------------------|--------|-----------------------------------|
| GET    | `/dashboard/admin`     | Admin  | Org-wide counts                   |
| GET    | `/dashboard/member`    | Auth   | The current user's projects/tasks |

## Error handling

The API centralizes error formatting in one middleware
(`server/src/middleware/errorHandler.js`), which normalizes:

- Invalid MongoDB ObjectIds (`CastError` → 400)
- Mongoose validation errors → 400, with a message per field
- Duplicate keys, e.g. a duplicate email → 409
- Invalid/expired JWTs → 401
- Multer upload errors (wrong type, too large) → 400
- Everything else → 500, with the error hidden in production
