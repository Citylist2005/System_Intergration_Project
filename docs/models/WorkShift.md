# Model: WorkShift

- **Table Name:** `work_shifts`
- **Source File:** `d:/CMU-CS-445/Source/backend/src/database/payroll/entities/work-shift.entity.ts`

## Description

TypeORM entity representing the `work_shifts` table.

## Properties

- `ShiftID: number`: Defined with decorators `@PrimaryGeneratedColumn()`
- `ShiftName: string`: Defined with decorators `@Column({ type: 'varchar', length: 100 })`
- `StartTime: string`: Defined with decorators `@Column({ type: 'time' })`
- `EndTime: string`: Defined with decorators `@Column({ type: 'time' })`
- `BreakMinutes: number`: Defined with decorators `@Column({ type: 'int', default: 60 })`
- `IsNightShift: boolean`: Defined with decorators `@Column({ type: 'tinyint', default: 0 })`
- `Description: string`: Defined with decorators `@Column({ type: 'varchar', length: 255, nullable: true })`
- `IsActive: boolean`: Defined with decorators `@Column({ type: 'tinyint', default: 1 })`
