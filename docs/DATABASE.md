# TeamFlow Database Model

MongoDB with Mongoose. Relationships are modeled with `ObjectId` references
and resolved with `.populate()` rather than embedding, since projects,
tasks, comments, and activity all need to be queried and updated
independently.

## User

| Field         | Type    | Notes                                   |
|---------------|---------|-------------------------------------------|
| name           | String  | Required                                  |
| email          | String  | Required, unique, lowercased              |
| password       | String  | Required, bcrypt-hashed, never returned   |
| role           | String  | `admin` \| `member`                       |
| profileImage   | String  | Path under `/uploads/profiles`            |
| isActive       | Boolean | Deactivated users cannot log in           |
| createdAt/updatedAt | Date | Managed by Mongoose timestamps        |

The password is hashed in a `pre('save')` hook, so it's impossible to save
a user with a plaintext password by accident. `comparePassword()` wraps
`bcrypt.compare` for login.

## Project

| Field       | Type            | Notes                                  |
|-------------|-----------------|-------------------------------------------|
| name         | String           | Required                                  |
| description  | String           |                                            |
| status       | String           | `Planning` \| `Active` \| `On Hold` \| `Completed` |
| startDate    | Date             | Required                                  |
| dueDate      | Date             | Required, validated to be ≥ startDate     |
| members      | [ObjectId → User]| Team members with access to this project  |
| createdBy    | ObjectId → User  | Who created it                            |

## Task

| Field       | Type              | Notes                                    |
|-------------|-------------------|---------------------------------------------|
| title        | String             | Required                                    |
| description  | String             |                                              |
| project      | ObjectId → Project | Required                                    |
| assignedTo   | ObjectId → User    | Nullable (unassigned)                       |
| priority     | String             | `Low` \| `Medium` \| `High` \| `Urgent`     |
| status       | String             | `Pending` \| `In Progress` \| `Under Review` \| `Completed` |
| startDate    | Date               | Required                                    |
| dueDate      | Date               | Required                                    |
| createdBy    | ObjectId → User    |                                              |

A virtual `isOverdue` (status ≠ Completed and dueDate in the past) is
computed on read rather than stored, so it's always accurate without a
background job.

## Comment

| Field    | Type              | Notes                    |
|----------|-------------------|----------------------------|
| task      | ObjectId → Task    | Required                  |
| user      | ObjectId → User    | Required                  |
| comment   | String             | Required, max 2000 chars  |

## Activity

| Field         | Type             | Notes                                                      |
|----------------|------------------|---------------------------------------------------------------|
| task            | ObjectId → Task  |Required                                                       |
| user            | ObjectId → User  | Who performed the action                                       |
| action          | String            | One of a fixed set (see below)                                 |
| previousValue   | String            | Stringified prior value, if applicable                         |
| newValue        | String            | Stringified new value, if applicable                            |
| createdAt       | Date              | No `updatedAt` — activity entries are immutable                |

Allowed `action` values: `Task created`, `Task assigned`, `Status changed`,
`Priority changed`, `Due date changed`, `Comment added`, `Task updated`.

## How relationships are handled

- A **Project** holds an array of **User** references (`members`). A user
  can belong to many projects, and a project can have many members —
  a standard many-to-many modeled with an array of references on one side
  (chosen on `Project` since project membership is checked far more often
  than "which projects is this user in").
- A **Task** references exactly one **Project** and at most one **User**
  (`assignedTo`) — both one-to-many relationships from the referenced
  document's perspective.
- **Comment** and **Activity** both reference a **Task** and a **User**,
  forming a one-to-many relationship from Task → Comments/Activity.

## How `populate()` is used

Rather than storing denormalized copies of user/project names on every
task, controllers call `.populate()` to join the referenced documents at
query time, e.g.:

```js
Task.find(query)
  .populate('assignedTo', 'name email profileImage')
  .populate('project', 'name status')
  .populate('createdBy', 'name email');
```

The second argument to `populate()` is a field-projection string, so only
the fields the frontend needs are sent — the password hash, for example,
is never selected.

## Indexes

- `User`: unique index on `email`; text index on `name`/`email` for search.
- `Project`: text index on `name`/`description` for search.
- `Task`: text index on `title`/`description`; compound index on
  `(project, status, priority, dueDate)` to speed up the common
  filter/sort combinations used by the task list and dashboards.
