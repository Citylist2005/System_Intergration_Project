# Model: OvertimeRequest

- **Table Name:** `overtime_requests`
- **Source File:** `d:/CMU-CS-445/Source/backend/src/database/payroll/entities/overtime-request.entity.ts`

## Description

TypeORM entity representing the `overtime_requests` table.

## Properties

- `OvertimeID: number`: Defined with decorators `@PrimaryGeneratedColumn()`
- `EmployeeID: number`: Defined with decorators `@Column()`
- `OvertimeDate: Date`: Defined with decorators `@Column({ type: 'date' })`
- `StartTime: string`: Defined with decorators `@Column({ type: 'time' })`
- `EndTime: string`: Defined with decorators `@Column({ type: 'time' })`
- `Hours: number`: Defined with decorators `@Column({ type: 'decimal', precision: 5, scale: 2 })`
- `Reason: string`: Defined with decorators `@Column({ type: 'text', nullable: true })`
- `OvertimeType: string`: Defined with decorators `@Column({ type: 'varchar', length: 30, default: 'Weekday' })`
- `Status: string`: Defined with decorators `@Column({ type: 'varchar', length: 20, default: 'Pending' })`
- `ApprovedBy: number`: Defined with decorators `@Column({ nullable: true })`
- `ApprovedAt: Date`: Defined with decorators `@Column({ type: 'datetime', nullable: true })`
