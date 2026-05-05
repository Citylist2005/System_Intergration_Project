# Model: HumanDepartment

- **Table Name:** `Departments`
- **Source File:** `d:/CMU-CS-445/Source/backend/src/database/human/entities/department.entity.ts`

## Description

TypeORM entity representing the `Departments` table.

## Properties

- `DepartmentID: number`: Defined with decorators `@PrimaryColumn()`
- `DepartmentName: string`: Defined with decorators `@Column({ type: 'nvarchar', length: 100 })`
- `CreatedAt: Date`: Defined with decorators `@Column({ type: 'datetime', nullable: true })`
- `UpdatedAt: Date`: Defined with decorators `@Column({ type: 'datetime', nullable: true })`
