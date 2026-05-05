# Model: LeaveRequest

- **Table Name:** `leave_requests`
- **Source File:** `d:/CMU-CS-445/Source/backend/src/database/payroll/entities/leave-request.entity.ts`

## Description

TypeORM entity representing the `leave_requests` table.

## Properties

- `LeaveID: number`: Defined with decorators `@PrimaryGeneratedColumn()`
- `EmployeeID: number`: Defined with decorators `@Column()`
- `LeaveType: string`: Defined with decorators `@Column({ type: 'varchar', length: 50 })`
- `StartDate: Date`: Defined with decorators `@Column({ type: 'date' })`
- `EndDate: Date`: Defined with decorators `@Column({ type: 'date' })`
- `TotalDays: number`: Defined with decorators `@Column({ type: 'decimal', precision: 5, scale: 1, default: 1 })`
- `Reason: string`: Defined with decorators `@Column({ type: 'text', nullable: true })`
- `Status: string`: Defined with decorators `@Column({ type: 'varchar', length: 20, default: 'Pending' })`
- `ApprovedBy: number`: Defined with decorators `@Column({ nullable: true })`
- `ApprovedAt: Date`: Defined with decorators `@Column({ type: 'datetime', nullable: true })`
