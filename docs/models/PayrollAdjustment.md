# Model: PayrollAdjustment

- **Table Name:** `payroll_adjustments`
- **Source File:** `d:/CMU-CS-445/Source/backend/src/database/payroll/entities/payroll-adjustment.entity.ts`

## Description

TypeORM entity representing the `payroll_adjustments` table.

## Properties

- `AdjustmentID: number`: Defined with decorators `@PrimaryGeneratedColumn()`
- `EmployeeID: number`: Defined with decorators `@Column()`
- `SalaryMonth: Date`: Defined with decorators `@Column({ type: 'date' })`
- `AdjustType: string`: Defined with decorators `@Column({ type: 'varchar', length: 50 })`
- `Amount: number`: Defined with decorators `@Column({ type: 'decimal', precision: 15, scale: 2 })`
- `Reason: string`: Defined with decorators `@Column({ type: 'text', nullable: true })`
- `ApprovedBy: number`: Defined with decorators `@Column({ nullable: true })`
- `Status: string`: Defined with decorators `@Column({ type: 'varchar', length: 20, default: 'Pending' })`
