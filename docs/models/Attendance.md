# Model: Attendance

- **Table Name:** `attendance`
- **Source File:** `d:/CMU-CS-445/Source/backend/src/database/payroll/entities/attendance.entity.ts`

## Description

TypeORM entity representing the `attendance` table.

## Properties

- `AttendanceID: number`: Defined with decorators `@PrimaryGeneratedColumn()`
- `EmployeeID: number`: Defined with decorators `@Column()`
- `WorkDays: number`: Defined with decorators `@Column({ type: 'int', default: 0 })`
- `AbsentDays: number`: Defined with decorators `@Column({ type: 'int', default: 0 })`
- `LeaveDays: number`: Defined with decorators `@Column({ type: 'int', default: 0 })`
- `OvertimeHours: number`: Defined with decorators `@Column({ type: 'decimal', precision: 6, scale: 2, default: 0 })`
- `AttendanceMonth: Date`: Defined with decorators `@Column({ type: 'date' })`
- `CreatedAt: Date`: Defined with decorators `@Column({ type: 'datetime', nullable: true })`
