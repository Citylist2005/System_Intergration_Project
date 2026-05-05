# Model: HumanAttendance

- **Table Name:** `attendance`
- **Source File:** `d:/CMU-CS-445/Source/backend/src/database/human/entities/attendance.entity.ts`

## Description

TypeORM entity representing the `attendance` table.

## Properties

- `AttendanceID: number`: Defined with decorators `@PrimaryColumn()`
- `EmployeeID: number`: Defined with decorators `@Column()`
- `AttendanceDate: Date`: Defined with decorators `@Column({ type: 'date' })`
- `CheckIn: string`: Defined with decorators `@Column({ type: 'time', nullable: true })`
- `CheckOut: string`: Defined with decorators `@Column({ type: 'time', nullable: true })`
- `WorkHours: number`: Defined with decorators `@Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })`
- `OvertimeHours: number`: Defined with decorators `@Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })`
- `Status: string`: Defined with decorators `@Column({ type: 'nvarchar', length: 10, nullable: true })`
