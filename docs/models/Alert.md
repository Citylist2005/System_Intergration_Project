# Model: Alert

- **Table Name:** `alerts`
- **Source File:** `d:/CMU-CS-445/Source/backend/src/database/payroll/entities/alert.entity.ts`

## Description

TypeORM entity representing the `alerts` table.

## Properties

- `AlertID: number`: Defined with decorators `@PrimaryGeneratedColumn()`
- `AlertType: string`: Defined with decorators `@Column({ type: 'varchar', length: 50 })`
- `EmployeeID: number`: Defined with decorators `@Column({ nullable: true })`
- `Title: string`: Defined with decorators `@Column({ type: 'varchar', length: 200 })`
- `Message: string`: Defined with decorators `@Column({ type: 'text', nullable: true })`
- `IsRead: boolean`: Defined with decorators `@Column({ type: 'tinyint', default: 0 })`
- `IsActive: boolean`: Defined with decorators `@Column({ type: 'tinyint', default: 1 })`
- `TriggerDate: Date`: Defined with decorators `@Column({ type: 'date', nullable: true })`
