# Model: OnboardingOffboarding

- **Table Name:** `onboarding_offboarding`
- **Source File:** `d:/CMU-CS-445/Source/backend/src/database/payroll/entities/onboarding-offboarding.entity.ts`

## Description

TypeORM entity representing the `onboarding_offboarding` table.

## Properties

- `RecordID: number`: Defined with decorators `@PrimaryGeneratedColumn()`
- `EmployeeID: number`: Defined with decorators `@Column()`
- `ProcessType: string`: Defined with decorators `@Column({ type: 'varchar', length: 20 })`
- `StartDate: Date`: Defined with decorators `@Column({ type: 'date', nullable: true })`
- `TargetDate: Date`: Defined with decorators `@Column({ type: 'date', nullable: true })`
- `CompletedDate: Date`: Defined with decorators `@Column({ type: 'date', nullable: true })`
- `Status: string`: Defined with decorators `@Column({ type: 'varchar', length: 20, default: 'InProgress' })`
- `ChecklistJSON: unknown`: Defined with decorators `@Column({ type: 'json', nullable: true })`
- `AssignedTo: number`: Defined with decorators `@Column({ nullable: true })`
- `Notes: string`: Defined with decorators `@Column({ type: 'text', nullable: true })`
