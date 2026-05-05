# Model: EmployeesPayroll

- **Table Name:** `employees_payroll`
- **Source File:** `d:/CMU-CS-445/Source/backend/src/database/payroll/entities/employees-payroll.entity.ts`

## Description

TypeORM entity representing the `employees_payroll` table.

## Properties

- `EmployeeID: number`: Defined with decorators `@PrimaryColumn()`
- `FullName: string`: Defined with decorators `@Column({ type: 'varchar', length: 100, nullable: true })`
- `DepartmentID: number`: Defined with decorators `@Column({ nullable: true })`
- `PositionID: number`: Defined with decorators `@Column({ nullable: true })`
- `Status: string`: Defined with decorators `@Column({ type: 'varchar', length: 20, default: 'Active' })`
- `SyncedAt: Date`: Defined with decorators `@Column({ type: 'datetime', nullable: true })`
