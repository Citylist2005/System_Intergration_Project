# Model: HumanEmployee

- **Table Name:** `Employees`
- **Source File:** `d:/CMU-CS-445/Source/backend/src/database/human/entities/employee.entity.ts`

## Description

TypeORM entity representing the `Employees` table.

## Properties

- `EmployeeID: number`: Defined with decorators `@PrimaryColumn()`
- `FullName: string`: Defined with decorators `@Column({ type: 'nvarchar', length: 100 })`
- `DateOfBirth: Date`: Defined with decorators `@Column({ type: 'date', nullable: true })`
- `Gender: string`: Defined with decorators `@Column({ type: 'nvarchar', length: 10, nullable: true })`
- `PhoneNumber: string`: Defined with decorators `@Column({ type: 'nvarchar', length: 20, nullable: true })`
- `Email: string`: Defined with decorators `@Column({ type: 'nvarchar', length: 100, nullable: true })`
- `DepartmentID: number`: Defined with decorators `@Column({ nullable: true })`
- `PositionID: number`: Defined with decorators `@Column({ nullable: true })`
- `HireDate: Date`: Defined with decorators `@Column({ type: 'date', nullable: true })`
- `Status: string`: Defined with decorators `@Column({ type: 'nvarchar', length: 10, nullable: true })`
- `CreatedAt: Date`: Defined with decorators `@Column({ type: 'datetime', nullable: true })`
- `UpdatedAt: Date`: Defined with decorators `@Column({ type: 'datetime', nullable: true })`
