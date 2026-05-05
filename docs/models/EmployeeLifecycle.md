# Model: EmployeeLifecycle

- **Table Name:** `employee_lifecycle`
- **Source File:** `d:/CMU-CS-445/Source/backend/src/database/payroll/entities/employee-lifecycle.entity.ts`

## Description

TypeORM entity representing the `employee_lifecycle` table.

## Properties

- `LifecycleID: number`: Defined with decorators `@PrimaryGeneratedColumn()`
- `EmployeeID: number`: Defined with decorators `@Column()`
- `EventType: string`: Defined with decorators `@Column({ type: 'varchar', length: 80 })`
- `EventDate: Date`: Defined with decorators `@Column({ type: 'date' })`
- `FromPosition: string`: Defined with decorators `@Column({ type: 'varchar', length: 150, nullable: true })`
- `ToPosition: string`: Defined with decorators `@Column({ type: 'varchar', length: 150, nullable: true })`
- `FromDept: string`: Defined with decorators `@Column({ type: 'varchar', length: 150, nullable: true })`
- `ToDept: string`: Defined with decorators `@Column({ type: 'varchar', length: 150, nullable: true })`
- `Notes: string`: Defined with decorators `@Column({ type: 'text', nullable: true })`
- `CreatedBy: number`: Defined with decorators `@Column({ nullable: true })`
