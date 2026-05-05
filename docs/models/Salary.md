# Model: Salary

- **Table Name:** `salaries`
- **Source File:** `d:/CMU-CS-445/Source/backend/src/database/payroll/entities/salaries.entity.ts`

## Description

TypeORM entity representing the `salaries` table.

## Properties

- `SalaryID: number`: Defined with decorators `@PrimaryGeneratedColumn()`
- `EmployeeID: number`: Defined with decorators `@Column()`
- `SalaryMonth: Date`: Defined with decorators `@Column({ type: 'date' })`
- `BaseSalary: number`: Defined with decorators `@Column({ type: 'decimal', precision: 15, scale: 2, nullable: true })`
- `Bonus: number`: Defined with decorators `@Column({ type: 'decimal', precision: 15, scale: 2, nullable: true })`
- `Deductions: number`: Defined with decorators `@Column({ type: 'decimal', precision: 15, scale: 2, nullable: true })`
- `NetSalary: number`: Defined with decorators `@Column({ type: 'decimal', precision: 15, scale: 2, nullable: true })`
- `CreatedAt: Date`: Defined with decorators `@Column({ type: 'datetime', nullable: true })`
