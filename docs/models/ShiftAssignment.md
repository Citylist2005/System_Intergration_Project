# Model: ShiftAssignment

- **Table Name:** `shift_assignments`
- **Source File:** `d:/CMU-CS-445/Source/backend/src/database/payroll/entities/shift-assignment.entity.ts`

## Description

TypeORM entity representing the `shift_assignments` table.

## Properties

- `AssignmentID: number`: Defined with decorators `@PrimaryGeneratedColumn()`
- `EmployeeID: number`: Defined with decorators `@Column()`
- `ShiftID: number`: Defined with decorators `@Column()`
- `EffectiveDate: Date`: Defined with decorators `@Column({ type: 'date' })`
- `EndDate: Date`: Defined with decorators `@Column({ type: 'date', nullable: true })`
- `CreatedBy: number`: Defined with decorators `@Column({ nullable: true })`
