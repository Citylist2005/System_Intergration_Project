# Model: PayrollDepartment

- **Table Name:** `departments_payroll`
- **Source File:** `d:/CMU-CS-445/Source/backend/src/database/payroll/entities/departments-payroll.entity.ts`

## Description

TypeORM entity representing the `departments_payroll` table.

## Properties

- `DepartmentID: number`: Defined with decorators `@PrimaryColumn()`
- `DepartmentName: string`: Defined with decorators `@Column({ type: 'varchar', length: 100 })`
- `SyncedAt: Date`: Defined with decorators `@Column({ type: 'datetime', nullable: true })`
