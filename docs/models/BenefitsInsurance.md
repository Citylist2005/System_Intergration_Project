# Model: BenefitsInsurance

- **Table Name:** `benefits_insurance`
- **Source File:** `d:/CMU-CS-445/Source/backend/src/database/payroll/entities/benefits-insurance.entity.ts`

## Description

TypeORM entity representing the `benefits_insurance` table.

## Properties

- `BenefitID: number`: Defined with decorators `@PrimaryGeneratedColumn()`
- `EmployeeID: number`: Defined with decorators `@Column()`
- `BenefitType: string`: Defined with decorators `@Column({ type: 'varchar', length: 80 })`
- `Provider: string`: Defined with decorators `@Column({ type: 'varchar', length: 150, nullable: true })`
- `PolicyNumber: string`: Defined with decorators `@Column({ type: 'varchar', length: 100, nullable: true })`
- `StartDate: Date`: Defined with decorators `@Column({ type: 'date', nullable: true })`
- `EndDate: Date`: Defined with decorators `@Column({ type: 'date', nullable: true })`
- `MonthlyCost: number`: Defined with decorators `@Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })`
- `EmployerShare: number`: Defined with decorators `@Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })`
- `EmployeeShare: number`: Defined with decorators `@Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })`
- `Status: string`: Defined with decorators `@Column({ type: 'varchar', length: 20, default: 'Active' })`
- `Notes: string`: Defined with decorators `@Column({ type: 'text', nullable: true })`
