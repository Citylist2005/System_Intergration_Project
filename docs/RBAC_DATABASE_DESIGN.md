# RBAC Database Design

## Overview

This document describes the Role-Based Access Control (RBAC) system used in the HR Payroll Integration project. The RBAC is fully database-driven and integrated into the NestJS backend via TypeORM entities, global guards, and permission decorators.

---

## Database Tables

All RBAC tables reside in the **`payroll_2026` MySQL database**.

### 1. `users` (extended)

| Column        | Type          | Description                        |
|---------------|---------------|------------------------------------|
| UserID        | INT PK AI     | Primary key                        |
| Username      | VARCHAR(100)  | Unique login name                  |
| Email         | VARCHAR(150)  | Unique email                       |
| PasswordHash  | VARCHAR(255)  | Hashed password (SHA-256 HMAC)     |
| FullName      | VARCHAR(150)  | Display name                       |
| Role          | VARCHAR(30)   | Legacy single-role (kept for compat)|
| EmployeeID    | INT NULL      | FK to employees_payroll            |
| IsActive      | TINYINT(1)    | 0 = disabled, 1 = active           |
| LastLoginAt   | DATETIME NULL | Last successful login timestamp    |
| CreatedAt     | DATETIME(6)   | Auto-generated creation timestamp  |
| UpdatedAt     | DATETIME(6)   | Auto-updated modification timestamp|

### 2. `roles`

| Column      | Type         | Description                       |
|-------------|--------------|-----------------------------------|
| id          | INT PK AI    | Primary key                       |
| name        | VARCHAR(100) | Unique role identifier (e.g. ADMIN)|
| description | VARCHAR(255) | Human-readable description        |
| createdAt   | DATETIME(6)  | Creation timestamp                |
| updatedAt   | DATETIME(6)  | Update timestamp                  |

### 3. `permissions`

| Column      | Type         | Description                        |
|-------------|--------------|-------------------------------------|
| id          | INT PK AI    | Primary key                         |
| name        | VARCHAR(100) | Unique permission key (e.g. `employee.read`) |
| description | VARCHAR(255) | Human-readable description         |
| createdAt   | DATETIME(6)  | Creation timestamp                  |
| updatedAt   | DATETIME(6)  | Update timestamp                    |

### 4. `user_roles` (junction)

| Column  | Type | Description                        |
|---------|------|------------------------------------|
| userId  | INT  | FK → `users.UserID` (cascade delete)|
| roleId  | INT  | FK → `roles.id` (cascade delete)   |

**Primary key**: composite `(userId, roleId)`

### 5. `role_permissions` (junction)

| Column       | Type | Description                              |
|--------------|------|------------------------------------------|
| roleId       | INT  | FK → `roles.id` (cascade delete)         |
| permissionId | INT  | FK → `permissions.id` (cascade delete)   |

**Primary key**: composite `(roleId, permissionId)`

---

## Entity Relationships

```
users (1) ──────── (N) user_roles (N) ──────── (1) roles
                                                      │
                                              (1) ───────── (N) role_permissions (N) ──────── (1) permissions
```

**Full traversal path for authorization:**
```
users → user_roles → roles → role_permissions → permissions
```

---

## Default Roles

| Name             | Description                                              |
|------------------|----------------------------------------------------------|
| `ADMIN`          | System administrator — full access to all permissions    |
| `HR_MANAGER`     | HR manager — manages employees, attendance, KPI, reports |
| `PAYROLL_MANAGER`| Payroll manager — manages salaries, policies, benefits   |
| `EMPLOYEE`       | Regular employee — read-only access to own data          |

---

## Default Permissions

| Permission            | Description                                       |
|-----------------------|---------------------------------------------------|
| `employee.read`       | View employee list and details                    |
| `employee.create`     | Add new employees                                 |
| `employee.update`     | Update employee information                       |
| `employee.delete`     | Soft-delete / deactivate employees                |
| `attendance.read`     | View attendance records                           |
| `attendance.create`   | Create attendance records                         |
| `attendance.update`   | Update attendance records                         |
| `payroll.read`        | View payroll records                              |
| `payroll.calculate`   | Calculate monthly payroll                         |
| `payroll.update`      | Update / adjust payroll entries                   |
| `reports.read`        | View consolidated reports                         |
| `dashboard.read`      | Access the dashboard                              |
| `user.manage`         | Manage user accounts (CRUD)                       |
| `role.manage`         | Assign / revoke roles                             |
| `audit.read`          | View system audit logs                            |
| `system.manage`       | System administration (backup, sync, etc.)        |

---

## Role → Permission Assignment

### ADMIN
All 16 permissions above.

### HR_MANAGER
| Permission          |
|---------------------|
| `employee.read`     |
| `employee.create`   |
| `employee.update`   |
| `employee.delete`   |
| `attendance.read`   |
| `attendance.create` |
| `attendance.update` |
| `reports.read`      |
| `dashboard.read`    |

### PAYROLL_MANAGER
| Permission          |
|---------------------|
| `payroll.read`      |
| `payroll.calculate` |
| `payroll.update`    |
| `reports.read`      |
| `dashboard.read`    |

### EMPLOYEE
| Permission        | Note                                     |
|-------------------|------------------------------------------|
| `employee.read`   | Service-level filter: own profile only   |
| `attendance.read` | Service-level filter: own records only   |
| `payroll.read`    | Service-level filter: own salary only    |
| `dashboard.read`  |                                          |

---

## Authentication Flow

### Login Response
```json
{
  "status": "success",
  "data": {
    "accessToken": "<token>",
    "expiresIn": 3600,
    "user": {
      "id": 1,
      "username": "admin",
      "email": "admin@company.com",
      "fullName": "Quản trị viên",
      "employeeId": null,
      "roles": ["ADMIN"],
      "permissions": ["employee.read", "employee.create", "...all 16..."]
    }
  }
}
```

### JWT Payload
```json
{
  "sub": 1,
  "username": "admin",
  "email": "admin@company.com",
  "roles": ["ADMIN"],
  "employeeId": null,
  "exp": 1234567890
}
```

> Permissions are **not** stored in the JWT to allow real-time permission revocation.  
> The `AuthGuard` loads fresh permissions from the database on every request.

---

## Backend Guards (Execution Order)

1. **`AuthGuard`** — Validates the JWT token and loads fresh permissions from the DB. Attaches `{ sub, username, email, roles, permissions }` to `request.user`.
2. **`RolesGuard`** — Checks `@Roles(...)` decorators against `request.user.roles[]`. Skips if no `@Roles` annotation.
3. **`PermissionsGuard`** — Checks `@Permissions(...)` decorators against `request.user.permissions[]`. ADMIN role bypasses all checks.

All three guards are registered as global `APP_GUARD` providers in `AuthModule`.

---

## API Protection Examples

| Method | Endpoint                  | Required Permission   |
|--------|---------------------------|-----------------------|
| GET    | `/api/v1/employees`       | `employee.read`       |
| POST   | `/api/v1/employees`       | `employee.create`     |
| PUT    | `/api/v1/employees/:id`   | `employee.update`     |
| DELETE | `/api/v1/employees/:id`   | `employee.delete`     |
| GET    | `/api/v1/attendance`      | `attendance.read`     |
| POST   | `/api/v1/attendance/manual`| `attendance.create`  |
| PUT    | `/api/v1/attendance/:id`  | `attendance.update`   |
| GET    | `/api/v1/payroll`         | `payroll.read`        |
| POST   | `/api/v1/payroll/calculate`| `payroll.calculate`  |
| POST   | `/api/v1/payroll/manual`  | `payroll.update`      |
| PUT    | `/api/v1/payroll/:id`     | `payroll.update`      |
| GET    | `/api/v1/audit-logs`      | `audit.read`          |
| GET    | `/api/v1/users`           | `user.manage`         |
| POST   | `/api/v1/users`           | `user.manage`         |
| PUT    | `/api/v1/users/:id/roles` | `role.manage`         |
| DELETE | `/api/v1/users/:id`       | `user.manage`         |
| GET    | `/api/v1/auth/profile`    | *(JWT required only)* |
| POST   | `/api/v1/auth/login`      | *(Public)*            |

---

## Frontend Permission Guards

The frontend uses the `useAuth()` hook (`src/hooks/useAuth.js`) which reads `hr_user` from localStorage:

```js
const { hasPermission, hasRole, roles, permissions } = useAuth();
```

### Sidebar Filtering
Navigation items with a `permission` field are hidden if `hasPermission(permission)` is false.

### Button Guards

| Page        | Button / Action     | Required Permission   |
|-------------|---------------------|------------------------|
| Employees   | "Thêm nhân viên"    | `employee.create`      |
| Employees   | "Sửa" (row)         | `employee.update`      |
| Employees   | "Vô hiệu hóa" (row) | `employee.delete`      |
| Payroll     | "Nhập lương"        | `payroll.update`       |
| Payroll     | "Tạo bảng lương"    | `payroll.calculate`    |
| Payroll     | "Sửa" (row)         | `payroll.update`       |

> **Defense in depth**: The frontend hides buttons as UX convenience. The backend independently blocks unauthorized API calls with a `403 Forbidden` response.

---

## Setup Instructions

### 1. Create Tables & Seed Data
```bash
cd backend
npm run seed:rbac
```

This script:
1. Creates `roles`, `permissions`, `user_roles`, `role_permissions` tables if they don't exist
2. Upserts all 4 default roles
3. Upserts all 16 default permissions
4. Assigns permissions to roles as described above

### 2. Assign Users to Roles
Via API (requires ADMIN token):
```bash
# Assign HR_MANAGER role to user ID 5
curl -X PUT http://localhost:3000/api/v1/users/5/roles \
  -H "Authorization: Bearer <admin_token>" \
  -H "Content-Type: application/json" \
  -d '{"roleNames": ["HR_MANAGER"]}'
```

### 3. The env-based admin auto-upgrade
When the admin logs in via environment variables (`ADMIN_EMAIL` + `ADMIN_PASSWORD`), the system automatically assigns the `ADMIN` DB role if not already present.
