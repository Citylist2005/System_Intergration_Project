# HR Payroll Integration System - API Design Document

> **Project**: HR Payroll Integration System  
> **Team Size**: 5 members  
> **Version**: 1.0.0  
> **Date**: 2026-04-30  
> **Base URL**: `/api/v1`  
> **Backend**: NestJS (TypeScript)  
> **Authentication**: JWT + Role-Based Access Control

---

## Table of Contents

| # | Section |
|---|---------|
| 1 | System Architecture |
| 2 | Standard Response Format |
| 3 | Authentication & Authorization |
| 4 | API Endpoints Summary |
| 5 | Module: Auth |
| 6 | Module: Employees |
| 7 | Module: Departments |
| 8 | Module: Positions |
| 9 | Module: Attendance |
| 10 | Module: Payroll |
| 11 | Module: Sync |
| 12 | Module: Dashboard |
| 13 | Module: Logs |
| 14 | Data Mapping (HUMAN -> PAYROLL) |
| 15 | Sync Flow Design |
| 16 | Logging Strategy |
| 17 | Error Handling |
| 18 | Testing Plan |
| 19 | Implementation Plan (NestJS) |

---

## 1. System Architecture

```
+----------------+       +-----------------------------------+       +-----------------+
|   React        |       |       NestJS REST API             |       |  HUMAN_2025     |
|   Dashboard    |<----->|  (JWT + RBAC Middleware)           |<----->|  SQL Server     |
|   (Frontend)   | JSON  |                                   |       +-----------------+
+----------------+       |  +-----------+  +----------------+|       +-----------------+
                         |  | Sync      |  | Audit Logger   ||<----->|  PAYROLL_2026   |
                         |  | Engine    |  +----------------+|       |  MySQL          |
                         |  +-----------+                    |       +-----------------+
                         +-----------------------------------+
```

### Data Flow

1. **HUMAN_2025 (SQL Server)** - Source of truth for HR data (employees, departments, positions, attendance)
2. **PAYROLL_2026 (MySQL)** - Destination for payroll processing
3. **Sync Engine** - Reads from HUMAN -> transforms -> writes to PAYROLL
4. **React Dashboard** - Displays reports, triggers manual sync, manages users

### Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React + Vite |
| Backend | NestJS (TypeScript) |
| Auth | JWT + bcrypt |
| DB Source | SQL Server (mssql driver) |
| DB Target | MySQL (mysql2 driver) |
| ORM | TypeORM (multi-connection) |
| API Format | JSON REST |

---

## 2. Standard Response Format

### Success Response

```json
{
  "status": "success",
  "message": "Employees fetched successfully",
  "data": {},
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "totalPages": 8
  }
}
```

### Error Response

```json
{
  "status": "failed",
  "message": "Employee not found",
  "errorCode": 404,
  "errors": [
    { "field": "employeeId", "message": "No employee with ID 999" }
  ]
}
```

### HTTP Status Codes

| Code | Meaning |
|------|---------|
| 200 | OK |
| 201 | Created |
| 400 | Bad Request / Validation Error |
| 401 | Unauthorized (missing/invalid JWT) |
| 403 | Forbidden (insufficient role) |
| 404 | Not Found |
| 409 | Conflict (duplicate) |
| 500 | Internal Server Error |

---

## 3. Authentication & Authorization

### 3.1 Roles

| Role | Description |
|------|------------|
| `ADMIN` | Full access, manage users and system |
| `HR_MANAGER` | Manage employees, departments, positions, attendance |
| `PAYROLL_STAFF` | View employees, manage payroll, trigger sync |
| `VIEWER` | Read-only access to dashboards and reports |

### 3.2 JWT Configuration

| Property | Value |
|----------|-------|
| Algorithm | HS256 |
| Access Token Expiry | 1 hour |
| Refresh Token Expiry | 7 days |
| Secret | Environment variable `JWT_SECRET` |
| Token Location | `Authorization: Bearer <token>` header |

### 3.3 Password Policy

- Minimum 8 characters
- At least 1 uppercase, 1 lowercase, 1 number, 1 special character
- Hashed with **bcrypt** (salt rounds: 10)
- Never stored or returned in plaintext

### 3.4 Role-Based Access Matrix

| Endpoint | ADMIN | HR_MANAGER | PAYROLL_STAFF | VIEWER |
|----------|:-----:|:----------:|:-------------:|:------:|
| `POST /auth/login` | Y | Y | Y | Y |
| `GET /employees` | Y | Y | Y | Y |
| `POST /employees` | Y | Y | - | - |
| `PUT /employees/:id` | Y | Y | - | - |
| `DELETE /employees/:id` | Y | - | - | - |
| `GET /departments` | Y | Y | Y | Y |
| `POST /departments` | Y | Y | - | - |
| `DELETE /departments/:id` | Y | - | - | - |
| `GET /attendance` | Y | Y | Y | Y |
| `POST /attendance` | Y | Y | - | - |
| `GET /payroll` | Y | - | Y | Y |
| `POST /payroll/calculate` | Y | - | Y | - |
| `PUT /payroll/:id/approve` | Y | - | - | - |
| `POST /sync/*` | Y | - | Y | - |
| `GET /sync/status` | Y | - | Y | Y |
| `GET /dashboard/*` | Y | Y | Y | Y |
| `GET /logs/*` | Y | - | - | - |

### 3.5 Security Best Practices

- **Rate Limiting**: 100 requests/minute per IP
- **CORS**: Whitelist frontend origin only
- **Helmet**: Security headers enabled
- **Input Validation**: class-validator DTOs on all endpoints
- **SQL Injection**: Parameterized queries via TypeORM
- **XSS**: Sanitize all string inputs

---

## 4. API Endpoints Summary

| # | Method | Endpoint | Module | Role |
|---|--------|----------|--------|------|
| 1 | POST | `/api/v1/auth/login` | Auth | Public |
| 2 | POST | `/api/v1/auth/refresh` | Auth | Authenticated |
| 3 | POST | `/api/v1/auth/logout` | Auth | Authenticated |
| 4 | GET | `/api/v1/auth/profile` | Auth | Authenticated |
| 5 | GET | `/api/v1/employees` | Employees | ALL |
| 6 | GET | `/api/v1/employees/:id` | Employees | ALL |
| 7 | POST | `/api/v1/employees` | Employees | ADMIN, HR_MANAGER |
| 8 | PUT | `/api/v1/employees/:id` | Employees | ADMIN, HR_MANAGER |
| 9 | DELETE | `/api/v1/employees/:id` | Employees | ADMIN |
| 10 | GET | `/api/v1/departments` | Departments | ALL |
| 11 | POST | `/api/v1/departments` | Departments | ADMIN, HR_MANAGER |
| 12 | PUT | `/api/v1/departments/:id` | Departments | ADMIN, HR_MANAGER |
| 13 | DELETE | `/api/v1/departments/:id` | Departments | ADMIN |
| 14 | GET | `/api/v1/positions` | Positions | ALL |
| 15 | POST | `/api/v1/positions` | Positions | ADMIN, HR_MANAGER |
| 16 | PUT | `/api/v1/positions/:id` | Positions | ADMIN, HR_MANAGER |
| 17 | DELETE | `/api/v1/positions/:id` | Positions | ADMIN |
| 18 | GET | `/api/v1/attendance` | Attendance | ALL |
| 19 | GET | `/api/v1/attendance/summary` | Attendance | ADMIN, HR_MANAGER, PAYROLL |
| 20 | POST | `/api/v1/attendance` | Attendance | ADMIN, HR_MANAGER |
| 21 | PUT | `/api/v1/attendance/:id` | Attendance | ADMIN, HR_MANAGER |
| 22 | GET | `/api/v1/payroll` | Payroll | ADMIN, PAYROLL, VIEWER |
| 23 | GET | `/api/v1/payroll/:id` | Payroll | ADMIN, PAYROLL, VIEWER |
| 24 | POST | `/api/v1/payroll/calculate` | Payroll | ADMIN, PAYROLL |
| 25 | PUT | `/api/v1/payroll/:id/approve` | Payroll | ADMIN |
| 26 | PUT | `/api/v1/payroll/:id/pay` | Payroll | ADMIN |
| 27 | POST | `/api/v1/sync/employees` | Sync | ADMIN, PAYROLL |
| 28 | POST | `/api/v1/sync/departments` | Sync | ADMIN, PAYROLL |
| 29 | POST | `/api/v1/sync/positions` | Sync | ADMIN, PAYROLL |
| 30 | POST | `/api/v1/sync/attendance` | Sync | ADMIN, PAYROLL |
| 31 | POST | `/api/v1/sync/payroll` | Sync | ADMIN, PAYROLL |
| 32 | POST | `/api/v1/sync/all` | Sync | ADMIN |
| 33 | GET | `/api/v1/sync/status` | Sync | ADMIN, PAYROLL, VIEWER |
| 34 | GET | `/api/v1/dashboard/overview` | Dashboard | ALL |
| 35 | GET | `/api/v1/dashboard/payroll-summary` | Dashboard | ADMIN, PAYROLL, VIEWER |
| 36 | GET | `/api/v1/dashboard/department-stats` | Dashboard | ADMIN, HR_MANAGER, VIEWER |
| 37 | GET | `/api/v1/dashboard/attendance-report` | Dashboard | ADMIN, HR_MANAGER, VIEWER |
| 38 | GET | `/api/v1/logs/sync` | Logs | ADMIN |
| 39 | GET | `/api/v1/logs/audit` | Logs | ADMIN |

**Total: 39 endpoints across 9 modules**

---

## 5. Module: Auth

### POST `/api/v1/auth/login`

> **Description**: Authenticate user and return JWT tokens  
> **Role**: Public

**Request Body**:
```json
{
  "username": "admin01",
  "password": "SecureP@ss123"
}
```

**Success Response** `200`:
```json
{
  "status": "success",
  "message": "Login successful",
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIs...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIs...",
    "expiresIn": 3600,
    "user": {
      "id": 1,
      "username": "admin01",
      "fullName": "Nguyen Van A",
      "role": "ADMIN"
    }
  }
}
```

**Error Response** `401`:
```json
{
  "status": "failed",
  "message": "Invalid username or password",
  "errorCode": 401
}
```

### POST `/api/v1/auth/refresh`

> **Description**: Refresh access token  
> **Role**: Authenticated

**Request**: `{ "refreshToken": "eyJhbGciOiJIUzI1NiIs..." }`

**Success** `200`: `{ "status": "success", "data": { "accessToken": "...", "expiresIn": 3600 } }`

### POST `/api/v1/auth/logout`

> **Description**: Invalidate refresh token  
> **Role**: Authenticated

**Request**: `{ "refreshToken": "eyJhbGciOiJIUzI1NiIs..." }`

**Success** `200`: `{ "status": "success", "message": "Logged out successfully", "data": null }`

### GET `/api/v1/auth/profile`

> **Description**: Get current user profile  
> **Role**: Authenticated  
> **Headers**: `Authorization: Bearer <accessToken>`

**Success** `200`:
```json
{
  "status": "success",
  "data": {
    "id": 1, "username": "admin01", "fullName": "Nguyen Van A",
    "email": "admin@company.com", "role": "ADMIN", "createdAt": "2026-01-15T08:00:00Z"
  }
}
```

---

## 6. Module: Employees

### GET `/api/v1/employees`

> **Description**: List employees with pagination & filters  
> **Role**: `ADMIN`, `HR_MANAGER`, `PAYROLL_STAFF`, `VIEWER`

**Query Parameters**:

| Param | Type | Default | Description |
|-------|------|---------|-------------|
| page | number | 1 | Page number |
| limit | number | 20 | Items per page |
| search | string | - | Search by name or code |
| departmentId | number | - | Filter by department |
| status | string | - | `ACTIVE` / `INACTIVE` |

**Success Response** `200`:
```json
{
  "status": "success",
  "message": "Employees fetched",
  "data": [
    {
      "id": 1, "employeeCode": "EMP001", "fullName": "Tran Thi B",
      "email": "tranthib@company.com", "phone": "0901234567",
      "dateOfBirth": "1995-03-15", "gender": "FEMALE",
      "departmentId": 2, "departmentName": "Engineering",
      "positionId": 3, "positionName": "Software Engineer",
      "hireDate": "2023-06-01", "status": "ACTIVE", "baseSalary": 15000000
    }
  ],
  "meta": { "page": 1, "limit": 20, "total": 85, "totalPages": 5 }
}
```

### GET `/api/v1/employees/:id`

> **Description**: Get employee detail  
> **Role**: ALL

**Success Response** `200`:
```json
{
  "status": "success",
  "data": {
    "id": 1, "employeeCode": "EMP001", "fullName": "Tran Thi B",
    "email": "tranthib@company.com", "phone": "0901234567",
    "dateOfBirth": "1995-03-15", "gender": "FEMALE",
    "address": "123 Le Loi, Q1, HCM",
    "departmentId": 2, "departmentName": "Engineering",
    "positionId": 3, "positionName": "Software Engineer",
    "hireDate": "2023-06-01", "terminationDate": null, "status": "ACTIVE",
    "baseSalary": 15000000, "bankAccount": "1234567890", "bankName": "Vietcombank",
    "taxCode": "0123456789", "insuranceNumber": "SN123456",
    "createdAt": "2023-06-01T00:00:00Z", "updatedAt": "2026-04-20T10:30:00Z"
  }
}
```

**Error** `404`: `{ "status": "failed", "message": "Employee not found", "errorCode": 404 }`

### POST `/api/v1/employees`

> **Description**: Create new employee  
> **Role**: `ADMIN`, `HR_MANAGER`

**Request Body**:
```json
{
  "employeeCode": "EMP100", "fullName": "Le Van C", "email": "levanc@company.com",
  "phone": "0912345678", "dateOfBirth": "1998-07-20", "gender": "MALE",
  "address": "456 Nguyen Hue, Q1, HCM", "departmentId": 2, "positionId": 3,
  "hireDate": "2026-05-01", "baseSalary": 12000000,
  "bankAccount": "9876543210", "bankName": "Techcombank",
  "taxCode": "0987654321", "insuranceNumber": "SN654321"
}
```

**Success** `201`: `{ "status": "success", "data": { "id": 100, "employeeCode": "EMP100", "fullName": "Le Van C" } }`

**Error** `409`: `{ "status": "failed", "message": "Employee code EMP100 already exists", "errorCode": 409 }`

### PUT `/api/v1/employees/:id`

> **Description**: Update employee (partial)  
> **Role**: `ADMIN`, `HR_MANAGER`

**Request**: `{ "phone": "0999888777", "departmentId": 3, "baseSalary": 18000000 }`

**Success** `200`: `{ "status": "success", "data": { "id": 1, "employeeCode": "EMP001", "fullName": "Tran Thi B" } }`

### DELETE `/api/v1/employees/:id`

> **Description**: Soft-delete (set INACTIVE)  
> **Role**: `ADMIN`

**Success** `200`: `{ "status": "success", "message": "Employee deactivated", "data": { "id": 1, "status": "INACTIVE" } }`

---

## 7. Module: Departments

### GET `/api/v1/departments`

> **Role**: ALL

```json
{
  "status": "success",
  "data": [
    { "id": 1, "departmentCode": "DEP001", "departmentName": "Human Resources",
      "managerId": 5, "managerName": "Nguyen Van D", "employeeCount": 12, "status": "ACTIVE" },
    { "id": 2, "departmentCode": "DEP002", "departmentName": "Engineering",
      "managerId": 10, "managerName": "Tran Thi E", "employeeCount": 35, "status": "ACTIVE" }
  ]
}
```

### POST `/api/v1/departments` - Role: `ADMIN`, `HR_MANAGER`

**Request**: `{ "departmentCode": "DEP010", "departmentName": "Marketing", "managerId": 15 }`

**Success** `201`: `{ "status": "success", "data": { "id": 10, "departmentCode": "DEP010", "departmentName": "Marketing" } }`

### PUT `/api/v1/departments/:id` - Update - Role: `ADMIN`, `HR_MANAGER`

### DELETE `/api/v1/departments/:id` - Soft-delete - Role: `ADMIN`

*(Response format follows standard pattern)*

---

## 8. Module: Positions

### GET `/api/v1/positions`

> **Role**: ALL

```json
{
  "status": "success",
  "data": [
    { "id": 1, "positionCode": "POS001", "positionName": "Software Engineer",
      "level": "JUNIOR", "minSalary": 10000000, "maxSalary": 20000000, "status": "ACTIVE" },
    { "id": 2, "positionCode": "POS002", "positionName": "Project Manager",
      "level": "SENIOR", "minSalary": 25000000, "maxSalary": 45000000, "status": "ACTIVE" }
  ]
}
```

### POST `/api/v1/positions` - Role: `ADMIN`, `HR_MANAGER`

**Request**: `{ "positionCode": "POS010", "positionName": "DevOps Engineer", "level": "MID", "minSalary": 18000000, "maxSalary": 35000000 }`

### PUT `/api/v1/positions/:id` - Update - Role: `ADMIN`, `HR_MANAGER`

### DELETE `/api/v1/positions/:id` - Soft-delete - Role: `ADMIN`

---

## 9. Module: Attendance

### GET `/api/v1/attendance`

> **Role**: ALL  
> **Query**: `employeeId`, `month`, `year`, `page`, `limit`

```json
{
  "status": "success",
  "data": [
    {
      "id": 1, "employeeId": 1, "employeeCode": "EMP001", "employeeName": "Tran Thi B",
      "date": "2026-04-01", "checkIn": "08:02:00", "checkOut": "17:30:00",
      "workHours": 8.5, "overtimeHours": 0.5, "status": "PRESENT", "note": null
    },
    {
      "id": 2, "employeeId": 1, "employeeCode": "EMP001", "employeeName": "Tran Thi B",
      "date": "2026-04-02", "checkIn": null, "checkOut": null,
      "workHours": 0, "overtimeHours": 0, "status": "ABSENT", "note": "Sick leave"
    }
  ],
  "meta": { "page": 1, "limit": 20, "total": 22, "totalPages": 2 }
}
```

### GET `/api/v1/attendance/summary`

> **Role**: `ADMIN`, `HR_MANAGER`, `PAYROLL_STAFF`  
> **Query**: `employeeId`, `month`, `year`

```json
{
  "status": "success",
  "data": {
    "employeeId": 1, "employeeName": "Tran Thi B", "month": 4, "year": 2026,
    "totalWorkDays": 22, "presentDays": 20, "absentDays": 1, "leaveDays": 1,
    "totalWorkHours": 168.5, "totalOvertimeHours": 12.0, "lateCount": 2
  }
}
```

### POST `/api/v1/attendance` - Role: `ADMIN`, `HR_MANAGER`

**Request**: `{ "employeeId": 1, "date": "2026-04-15", "checkIn": "08:00:00", "checkOut": "17:00:00", "status": "PRESENT" }`

**Success** `201`: `{ "status": "success", "data": { "id": 100, "employeeId": 1, "date": "2026-04-15", "status": "PRESENT" } }`

### PUT `/api/v1/attendance/:id` - Update - Role: `ADMIN`, `HR_MANAGER`

---

## 10. Module: Payroll

### GET `/api/v1/payroll`

> **Role**: `ADMIN`, `PAYROLL_STAFF`, `VIEWER`  
> **Query**: `employeeId`, `month`, `year`, `status`, `page`, `limit`

```json
{
  "status": "success",
  "data": [
    {
      "id": 1, "employeeId": 1, "employeeCode": "EMP001", "employeeName": "Tran Thi B",
      "month": 4, "year": 2026, "baseSalary": 15000000,
      "workDays": 20, "totalWorkDays": 22, "overtimeHours": 12.0,
      "overtimePay": 1636363, "allowances": 2000000, "deductions": 500000,
      "insurance": 1575000, "tax": 750000, "netSalary": 15811363,
      "status": "CALCULATED", "paidDate": null
    }
  ],
  "meta": { "page": 1, "limit": 20, "total": 85, "totalPages": 5 }
}
```

### GET `/api/v1/payroll/:id`

> **Role**: `ADMIN`, `PAYROLL_STAFF`, `VIEWER`

```json
{
  "status": "success",
  "data": {
    "id": 1, "employeeId": 1, "employeeCode": "EMP001", "employeeName": "Tran Thi B",
    "departmentName": "Engineering", "positionName": "Software Engineer",
    "month": 4, "year": 2026, "baseSalary": 15000000,
    "workDays": 20, "totalWorkDays": 22,
    "overtimeHours": 12.0, "overtimeRate": 1.5, "overtimePay": 1636363,
    "allowances": 2000000,
    "allowanceDetails": [
      { "type": "MEAL", "amount": 1000000 },
      { "type": "TRANSPORT", "amount": 1000000 }
    ],
    "deductions": 500000,
    "deductionDetails": [{ "type": "LATE_PENALTY", "amount": 500000 }],
    "grossSalary": 18136363,
    "insurance": 1575000,
    "insuranceDetails": {
      "socialInsurance": 1200000, "healthInsurance": 225000, "unemploymentInsurance": 150000
    },
    "taxableIncome": 16561363, "tax": 750000, "netSalary": 15811363,
    "status": "CALCULATED", "calculatedAt": "2026-04-28T10:00:00Z",
    "approvedBy": null, "paidDate": null
  }
}
```

### POST `/api/v1/payroll/calculate`

> **Role**: `ADMIN`, `PAYROLL_STAFF`

**Request**: `{ "month": 4, "year": 2026, "employeeIds": [1, 2, 3] }`

> If `employeeIds` is empty/null, calculate for ALL active employees.

```json
{
  "status": "success",
  "message": "Payroll calculated for 3 employees",
  "data": {
    "month": 4, "year": 2026, "totalEmployees": 3, "totalNetSalary": 45000000,
    "records": [
      { "employeeId": 1, "employeeName": "Tran Thi B", "netSalary": 15811363, "status": "CALCULATED" },
      { "employeeId": 2, "employeeName": "Le Van C", "netSalary": 14200000, "status": "CALCULATED" },
      { "employeeId": 3, "employeeName": "Nguyen D", "netSalary": 14988637, "status": "CALCULATED" }
    ]
  }
}
```

### PUT `/api/v1/payroll/:id/approve` - Role: `ADMIN`

**Success**: `{ "status": "success", "data": { "id": 1, "status": "APPROVED", "approvedBy": "admin01" } }`

### PUT `/api/v1/payroll/:id/pay` - Role: `ADMIN`

**Success**: `{ "status": "success", "data": { "id": 1, "status": "PAID", "paidDate": "2026-04-30T00:00:00Z" } }`

---

## 11. Module: Sync

### POST `/api/v1/sync/employees`

> **Description**: Sync employees from HUMAN_2025 -> PAYROLL_2026  
> **Role**: `ADMIN`, `PAYROLL_STAFF`

**Request** (optional): `{ "mode": "INCREMENTAL", "employeeIds": [1, 2, 3] }`

> `mode`: `FULL` (all) or `INCREMENTAL` (changed since last sync). Default: `INCREMENTAL`

```json
{
  "status": "success",
  "message": "Employee sync completed",
  "data": {
    "syncId": "SYNC-20260430-001", "entity": "EMPLOYEE", "mode": "INCREMENTAL",
    "startedAt": "2026-04-30T10:00:00Z", "completedAt": "2026-04-30T10:00:05Z",
    "duration": "5s", "totalRecords": 85,
    "synced": 10, "created": 3, "updated": 7, "failed": 0, "skipped": 75
  }
}
```

**Error** `500`:
```json
{
  "status": "failed",
  "message": "Sync failed: connection to PAYROLL_2026 timed out",
  "errorCode": 500,
  "errors": [{ "employeeId": 5, "error": "Duplicate entry for key 'employee_code'" }]
}
```

### POST `/api/v1/sync/departments` - Role: `ADMIN`, `PAYROLL_STAFF`

**Request**: `{ "mode": "FULL" }`

**Success**: `{ "status": "success", "data": { "syncId": "SYNC-20260430-002", "entity": "DEPARTMENT", "synced": 8, "created": 1, "updated": 7, "failed": 0 } }`

### POST `/api/v1/sync/positions` - Role: `ADMIN`, `PAYROLL_STAFF`

*(Same pattern as departments)*

### POST `/api/v1/sync/attendance` - Role: `ADMIN`, `PAYROLL_STAFF`

**Request**: `{ "month": 4, "year": 2026, "mode": "INCREMENTAL" }`

**Success**: `{ "status": "success", "data": { "syncId": "SYNC-20260430-004", "entity": "ATTENDANCE", "month": 4, "year": 2026, "synced": 1870, "created": 220, "updated": 1650, "failed": 0 } }`

### POST `/api/v1/sync/payroll` - Role: `ADMIN`, `PAYROLL_STAFF`

**Request**: `{ "month": 4, "year": 2026 }`

**Success**: `{ "status": "success", "data": { "syncId": "SYNC-20260430-005", "entity": "PAYROLL", "synced": 85, "created": 85, "updated": 0, "failed": 0 } }`

### POST `/api/v1/sync/all` - Role: `ADMIN`

```json
{
  "status": "success",
  "message": "Full sync completed",
  "data": {
    "syncId": "SYNC-20260430-006",
    "startedAt": "2026-04-30T10:00:00Z", "completedAt": "2026-04-30T10:01:30Z",
    "results": [
      { "entity": "DEPARTMENT", "synced": 8, "failed": 0 },
      { "entity": "POSITION", "synced": 15, "failed": 0 },
      { "entity": "EMPLOYEE", "synced": 85, "failed": 0 },
      { "entity": "ATTENDANCE", "synced": 1870, "failed": 0 },
      { "entity": "PAYROLL", "synced": 85, "failed": 0 }
    ]
  }
}
```

### GET `/api/v1/sync/status` - Role: `ADMIN`, `PAYROLL_STAFF`, `VIEWER`

```json
{
  "status": "success",
  "data": [{
    "syncId": "SYNC-20260430-006", "entity": "ALL", "mode": "FULL",
    "triggeredBy": "admin01", "startedAt": "2026-04-30T10:00:00Z",
    "completedAt": "2026-04-30T10:01:30Z", "status": "SUCCESS",
    "totalSynced": 2063, "totalFailed": 0
  }]
}
```

---

## 12. Module: Dashboard

### GET `/api/v1/dashboard/overview` - Role: ALL

```json
{
  "status": "success",
  "data": {
    "totalEmployees": 85, "activeEmployees": 80,
    "totalDepartments": 8, "totalPositions": 15,
    "currentMonthPayroll": {
      "month": 4, "year": 2026, "totalGross": 1500000000,
      "totalNet": 1200000000, "status": "CALCULATED"
    },
    "syncStatus": { "lastSync": "2026-04-30T10:00:00Z", "status": "SUCCESS" },
    "attendanceToday": { "present": 72, "absent": 5, "leave": 3, "total": 80 }
  }
}
```

### GET `/api/v1/dashboard/payroll-summary` - Role: `ADMIN`, `PAYROLL_STAFF`, `VIEWER`

**Query**: `year` (default: current)

```json
{
  "status": "success",
  "data": {
    "year": 2026,
    "monthly": [
      { "month": 1, "totalNet": 1150000000, "totalEmployees": 78 },
      { "month": 2, "totalNet": 1180000000, "totalEmployees": 80 },
      { "month": 3, "totalNet": 1190000000, "totalEmployees": 82 },
      { "month": 4, "totalNet": 1200000000, "totalEmployees": 85 }
    ]
  }
}
```

### GET `/api/v1/dashboard/department-stats` - Role: `ADMIN`, `HR_MANAGER`, `VIEWER`

```json
{
  "status": "success",
  "data": [
    { "departmentName": "Engineering", "employeeCount": 35, "totalPayroll": 550000000 },
    { "departmentName": "Human Resources", "employeeCount": 12, "totalPayroll": 150000000 },
    { "departmentName": "Sales", "employeeCount": 20, "totalPayroll": 280000000 }
  ]
}
```

### GET `/api/v1/dashboard/attendance-report` - Role: `ADMIN`, `HR_MANAGER`, `VIEWER`

**Query**: `month`, `year`

```json
{
  "status": "success",
  "data": {
    "month": 4, "year": 2026,
    "summary": { "averageAttendanceRate": 95.5, "totalLateCount": 15, "totalAbsentCount": 22 },
    "byDepartment": [
      { "departmentName": "Engineering", "attendanceRate": 97.2 },
      { "departmentName": "Sales", "attendanceRate": 93.1 }
    ]
  }
}
```

---

## 13. Module: Logs

### GET `/api/v1/logs/sync` - Role: `ADMIN`

**Query**: `entity`, `status`, `startDate`, `endDate`, `page`, `limit`

```json
{
  "status": "success",
  "data": [
    { "id": 1, "syncId": "SYNC-20260430-006", "entity": "EMPLOYEE", "action": "CREATE",
      "sourceId": 100, "targetId": 100, "status": "SUCCESS",
      "message": "Employee EMP100 synced", "timestamp": "2026-04-30T10:00:02Z" },
    { "id": 2, "syncId": "SYNC-20260430-006", "entity": "EMPLOYEE", "action": "UPDATE",
      "sourceId": 5, "targetId": 5, "status": "FAILED",
      "message": "Data type mismatch on phone field", "timestamp": "2026-04-30T10:00:03Z" }
  ],
  "meta": { "page": 1, "limit": 20, "total": 200, "totalPages": 10 }
}
```

### GET `/api/v1/logs/audit` - Role: `ADMIN`

**Query**: `userId`, `action`, `entity`, `startDate`, `endDate`, `page`, `limit`

```json
{
  "status": "success",
  "data": [{
    "id": 1, "userId": 1, "username": "admin01", "action": "UPDATE",
    "entity": "EMPLOYEE", "entityId": 5,
    "changes": { "baseSalary": { "old": 12000000, "new": 15000000 } },
    "ipAddress": "192.168.1.100", "timestamp": "2026-04-29T14:30:00Z"
  }],
  "meta": { "page": 1, "limit": 20, "total": 500, "totalPages": 25 }
}
```

---

## 14. Data Mapping: HUMAN_2025 (SQL Server) -> PAYROLL_2026 (MySQL)

### 14.1 Employee Mapping

| HUMAN_2025 (SQL Server) | Type | PAYROLL_2026 (MySQL) | Type | Notes |
|--------------------------|------|----------------------|------|-------|
| `EmployeeID` | INT | `employee_id` | INT | Primary key |
| `EmployeeCode` | NVARCHAR(20) | `employee_code` | VARCHAR(20) | Unique |
| `FullName` | NVARCHAR(100) | `full_name` | VARCHAR(100) | - |
| `Email` | NVARCHAR(100) | `email` | VARCHAR(100) | - |
| `Phone` | NVARCHAR(20) | `phone` | VARCHAR(20) | - |
| `DateOfBirth` | DATE | `date_of_birth` | DATE | - |
| `Gender` | NVARCHAR(10) | `gender` | ENUM('MALE','FEMALE') | Cast string -> enum |
| `DepartmentID` | INT | `department_id` | INT | FK reference |
| `PositionID` | INT | `position_id` | INT | FK reference |
| `HireDate` | DATE | `hire_date` | DATE | - |
| `TerminationDate` | DATE | `termination_date` | DATE | Nullable |
| `Status` | NVARCHAR(10) | `status` | ENUM('ACTIVE','INACTIVE') | - |
| `BaseSalary` | DECIMAL(18,2) | `base_salary` | DECIMAL(15,2) | Precision check |
| `BankAccount` | NVARCHAR(30) | `bank_account` | VARCHAR(30) | - |
| `BankName` | NVARCHAR(50) | `bank_name` | VARCHAR(50) | - |
| `TaxCode` | NVARCHAR(20) | `tax_code` | VARCHAR(20) | - |
| `InsuranceNumber` | NVARCHAR(20) | `insurance_number` | VARCHAR(20) | - |
| `ModifiedDate` | DATETIME | `synced_at` | DATETIME | Track last sync |

### 14.2 Department Mapping

| HUMAN_2025 | Type | PAYROLL_2026 | Type |
|------------|------|-------------|------|
| `DepartmentID` | INT | `department_id` | INT |
| `DepartmentCode` | NVARCHAR(20) | `department_code` | VARCHAR(20) |
| `DepartmentName` | NVARCHAR(100) | `department_name` | VARCHAR(100) |
| `ManagerID` | INT | `manager_id` | INT |
| `Status` | NVARCHAR(10) | `status` | ENUM('ACTIVE','INACTIVE') |

### 14.3 Position Mapping

| HUMAN_2025 | Type | PAYROLL_2026 | Type |
|------------|------|-------------|------|
| `PositionID` | INT | `position_id` | INT |
| `PositionCode` | NVARCHAR(20) | `position_code` | VARCHAR(20) |
| `PositionName` | NVARCHAR(100) | `position_name` | VARCHAR(100) |
| `Level` | NVARCHAR(20) | `level` | ENUM('JUNIOR','MID','SENIOR','LEAD') |
| `MinSalary` | DECIMAL(18,2) | `min_salary` | DECIMAL(15,2) |
| `MaxSalary` | DECIMAL(18,2) | `max_salary` | DECIMAL(15,2) |

### 14.4 Attendance Mapping

| HUMAN_2025 | Type | PAYROLL_2026 | Type |
|------------|------|-------------|------|
| `AttendanceID` | INT | `attendance_id` | INT |
| `EmployeeID` | INT | `employee_id` | INT |
| `AttendanceDate` | DATE | `attendance_date` | DATE |
| `CheckIn` | TIME | `check_in` | TIME |
| `CheckOut` | TIME | `check_out` | TIME |
| `WorkHours` | DECIMAL(5,2) | `work_hours` | DECIMAL(5,2) |
| `OvertimeHours` | DECIMAL(5,2) | `overtime_hours` | DECIMAL(5,2) |
| `Status` | NVARCHAR(10) | `status` | ENUM('PRESENT','ABSENT','LEAVE','LATE') |

### 14.5 Payroll Mapping

| HUMAN_2025 (Calculated) | Type | PAYROLL_2026 | Type |
|--------------------------|------|-------------|------|
| - | - | `payroll_id` | INT AUTO_INCREMENT |
| `EmployeeID` | INT | `employee_id` | INT |
| - | - | `month` | TINYINT |
| - | - | `year` | SMALLINT |
| `BaseSalary` | DECIMAL | `base_salary` | DECIMAL(15,2) |
| (computed) | - | `work_days` | INT |
| (computed) | - | `overtime_hours` | DECIMAL(5,2) |
| (computed) | - | `overtime_pay` | DECIMAL(15,2) |
| (computed) | - | `allowances` | DECIMAL(15,2) |
| (computed) | - | `deductions` | DECIMAL(15,2) |
| (computed) | - | `gross_salary` | DECIMAL(15,2) |
| (computed) | - | `insurance` | DECIMAL(15,2) |
| (computed) | - | `tax` | DECIMAL(15,2) |
| (computed) | - | `net_salary` | DECIMAL(15,2) |
| - | - | `status` | ENUM('CALCULATED','APPROVED','PAID') |
| - | - | `paid_date` | DATE |

---

## 15. Sync Flow Design

### 15.1 General Sync Process

```
+-------------------+      +----------------+      +------------------+
| 1. Read Source     |----->| 2. Transform   |----->| 3. Write Target  |
| HUMAN_2025 (SS)   |      | Map fields     |      | PAYROLL_2026     |
+-------------------+      | Validate       |      | (MySQL)          |
                            | Type cast      |      +------------------+
                            +----------------+             |
                                                           v
                                                  +------------------+
                                                  | 4. Log Result    |
                                                  | sync_logs table  |
                                                  +------------------+
```

### 15.2 Entity Sync Flows

**Employees**: Query WHERE `ModifiedDate > lastSyncTime` -> Check if `employee_code` exists -> INSERT or UPDATE -> Validate types -> Log result -> Update `lastSyncTime`

**Departments**: Query all -> UPSERT by `department_code` -> Ensure `manager_id` FK exists -> Log

**Positions**: Query all -> UPSERT by `position_code` -> Map Level string -> ENUM -> Log

**Attendance**: Query WHERE `month/year` -> Validate `employee_id` FK -> UPSERT by `(employee_id, date)` -> Log

**Payroll**: Calculate in API -> INSERT/UPDATE by `(employee_id, month, year)` -> Log

### 15.3 Conflict Resolution

| Scenario | Strategy |
|----------|----------|
| Record exists in target | UPDATE with source data (source wins) |
| Record deleted in source | Set status = INACTIVE in target |
| FK reference missing | Skip record, log as FAILED |
| Data type mismatch | Attempt cast, log FAILED if impossible |
| Duplicate key | Log as FAILED with error detail |

---

## 16. Logging Strategy

### 16.1 Sync Logs Table (`sync_logs`)

```sql
CREATE TABLE sync_logs (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  sync_id       VARCHAR(30) NOT NULL,
  entity        VARCHAR(20) NOT NULL,
  action        VARCHAR(10) NOT NULL,
  source_id     INT,
  target_id     INT,
  status        ENUM('SUCCESS', 'FAILED') NOT NULL,
  message       TEXT,
  error_detail  TEXT,
  created_at    DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### 16.2 Audit Logs Table (`audit_logs`)

```sql
CREATE TABLE audit_logs (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  user_id     INT NOT NULL,
  username    VARCHAR(50) NOT NULL,
  action      VARCHAR(20) NOT NULL,
  entity      VARCHAR(30),
  entity_id   INT,
  old_values  JSON,
  new_values  JSON,
  ip_address  VARCHAR(45),
  user_agent  VARCHAR(255),
  created_at  DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### 16.3 Log Levels & Rules

| Level | Usage |
|-------|-------|
| `INFO` | Sync started/completed, user login |
| `WARN` | Skipped records, type cast warnings |
| `ERROR` | Sync failed, DB connection error |

- Every sync operation -> `sync_log` entry per record
- Every data mutation -> `audit_log` entry
- Every login/logout -> `audit_log` entry
- Failed operations -> include `error_detail` with stack trace
- **Retention**: 90 days, archive older logs

---

## 17. Error Handling

### 17.1 Validation Error `400`

```json
{
  "status": "failed",
  "message": "Validation failed",
  "errorCode": 400,
  "errors": [
    { "field": "email", "message": "email must be a valid email address" },
    { "field": "baseSalary", "message": "baseSalary must be a positive number" }
  ]
}
```

### 17.2 Authentication Error `401`

```json
{ "status": "failed", "message": "Access token expired", "errorCode": 401 }
```

### 17.3 Authorization Error `403`

```json
{ "status": "failed", "message": "Insufficient permissions. Required role: ADMIN", "errorCode": 403 }
```

### 17.4 Not Found `404`

```json
{ "status": "failed", "message": "Employee with ID 999 not found", "errorCode": 404 }
```

### 17.5 Conflict `409`

```json
{ "status": "failed", "message": "Employee code EMP100 already exists", "errorCode": 409 }
```

### 17.6 Server Error `500`

```json
{ "status": "failed", "message": "Internal server error", "errorCode": 500 }
```

---

## 18. Testing Plan

### 18.1 Postman/API Testing

| Test Suite | Endpoints | Test Cases |
|-----------|----------|------------|
| Auth | login, refresh, logout, profile | Valid/invalid credentials, expired token, refresh flow |
| Employees | CRUD | Create, read, update, soft-delete, pagination, filter, duplicate code |
| Departments | CRUD | Create, read, update, soft-delete |
| Positions | CRUD | Create, read, update, soft-delete |
| Attendance | CRUD + summary | Create, filter by month, summary calculation |
| Payroll | Calculate, approve, pay | Calculate for month, approve, mark paid, filter |
| Sync | All sync endpoints | Full sync, incremental, error handling |
| Dashboard | All reports | Overview, payroll summary, dept stats, attendance |
| Logs | Sync + audit logs | Filter by date, entity, status |
| Security | All | Unauthorized access, wrong role, expired JWT |

### 18.2 Unit Tests (Jest) - Target: 80%+ coverage

```
AuthService       -> validate credentials, reject invalid, generate JWT
EmployeeService   -> create valid, reject duplicate code, soft-delete
PayrollService    -> calculate salary, overtime pay, deduct insurance/tax
SyncService       -> sync new/existing employee, handle FK missing, log results
```

### 18.3 Integration Tests

```
Full auth flow:     login -> access protected route -> refresh -> logout
Employee lifecycle: create -> update -> read -> deactivate
Payroll flow:       attendance -> calculate -> approve -> pay
Sync flow:          trigger sync -> verify PAYROLL_2026 data -> check logs
Dashboard:          verify data matches after sync
```

### 18.4 Security Tests

| Test | Expected |
|------|----------|
| No token | 401 |
| Invalid/expired JWT | 401 |
| Wrong role (VIEWER -> POST /employees) | 403 |
| SQL injection in search | Sanitized |
| Rate limit exceed (100 req/min) | 429 |

---

## 19. Implementation Plan (NestJS)

### 19.1 Folder Structure

```
src/
  main.ts
  app.module.ts
  common/
    decorators/          # @Roles(), @CurrentUser()
    guards/              # jwt-auth.guard.ts, roles.guard.ts
    interceptors/        # response.interceptor.ts, audit-log.interceptor.ts
    filters/             # http-exception.filter.ts
    dto/                 # pagination.dto.ts
    interfaces/          # response.interface.ts
  config/
    database.config.ts   # TypeORM multi-connection
    jwt.config.ts
    app.config.ts
  database/
    human/               # SQL Server entities
      entities/          # employee, department, position, attendance
      human.module.ts
    payroll/             # MySQL entities
      entities/          # employee, department, position, attendance, payroll, sync-log, audit-log
      payroll.module.ts
  modules/
    auth/                # controller, service, dto/, strategies/
    employees/           # controller, service, dto/
    departments/         # controller, service, dto/
    positions/           # controller, service, dto/
    attendance/          # controller, service, dto/
    payroll/             # controller, service, dto/
    sync/                # controller, service, dto/, mappers/
    dashboard/           # controller, service
    logs/                # controller, service
```

### 19.2 Module Responsibilities

| Module | Controller | Service |
|--------|-----------|---------|
| **Auth** | login/logout/refresh/profile | Validate credentials, issue JWT |
| **Employees** | CRUD, pagination/filter | Query HUMAN_2025, business rules |
| **Departments** | CRUD | Query HUMAN_2025, aggregation |
| **Positions** | CRUD | Query HUMAN_2025, salary validation |
| **Attendance** | CRUD, summary | Query HUMAN_2025, calculate hours |
| **Payroll** | Calculate/approve/pay | Salary computation, status management |
| **Sync** | Trigger sync routes | Read -> transform -> write -> log |
| **Dashboard** | Report routes | Aggregate queries across DBs |
| **Logs** | Query log routes | Filter and paginate logs |

### 19.3 DTO Design Pattern

```typescript
// Example: create-employee.dto.ts
import { IsString, IsEmail, IsEnum, IsNumber, IsDateString, IsOptional } from 'class-validator';

export class CreateEmployeeDto {
  @IsString()  employeeCode: string;
  @IsString()  fullName: string;
  @IsEmail()   email: string;
  @IsString()  phone: string;
  @IsDateString() dateOfBirth: string;
  @IsEnum(['MALE', 'FEMALE']) gender: string;
  @IsString() @IsOptional() address?: string;
  @IsNumber()  departmentId: number;
  @IsNumber()  positionId: number;
  @IsDateString() hireDate: string;
  @IsNumber()  baseSalary: number;
  @IsString() @IsOptional() bankAccount?: string;
  @IsString() @IsOptional() bankName?: string;
}
```

### 19.4 TypeORM Multi-Connection Config

```typescript
// database.config.ts
export const humanDbConfig: TypeOrmModuleOptions = {
  name: 'humanConnection',
  type: 'mssql',
  host: process.env.HUMAN_DB_HOST,
  port: parseInt(process.env.HUMAN_DB_PORT),
  username: process.env.HUMAN_DB_USER,
  password: process.env.HUMAN_DB_PASS,
  database: 'HUMAN_2025',
  entities: [__dirname + '/../database/human/entities/*.entity{.ts,.js}'],
  synchronize: false,
};

export const payrollDbConfig: TypeOrmModuleOptions = {
  name: 'payrollConnection',
  type: 'mysql',
  host: process.env.PAYROLL_DB_HOST,
  port: parseInt(process.env.PAYROLL_DB_PORT),
  username: process.env.PAYROLL_DB_USER,
  password: process.env.PAYROLL_DB_PASS,
  database: 'PAYROLL_2026',
  entities: [__dirname + '/../database/payroll/entities/*.entity{.ts,.js}'],
  synchronize: false,
};
```

### 19.5 Environment Variables

```env
# Server
PORT=3000
NODE_ENV=development

# JWT
JWT_SECRET=your-super-secret-key-change-in-production
JWT_EXPIRES_IN=3600
JWT_REFRESH_EXPIRES_IN=604800

# HUMAN_2025 (SQL Server)
HUMAN_DB_HOST=localhost
HUMAN_DB_PORT=1433
HUMAN_DB_USER=sa
HUMAN_DB_PASS=YourPassword123
HUMAN_DB_NAME=HUMAN_2025

# PAYROLL_2026 (MySQL)
PAYROLL_DB_HOST=localhost
PAYROLL_DB_PORT=3306
PAYROLL_DB_USER=root
PAYROLL_DB_PASS=YourPassword123
PAYROLL_DB_NAME=PAYROLL_2026

# CORS
CORS_ORIGIN=http://localhost:5173
```

---

> **End of API Design Document**  
> Version 1.0.0 | HR Payroll Integration System | April 2026
