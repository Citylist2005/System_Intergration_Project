# Model: SalaryPolicy

- **Table Name:** `salary_policies`
- **Source File:** `d:/CMU-CS-445/Source/backend/src/database/payroll/entities/salary-policy.entity.ts`

## Description

TypeORM entity representing the `salary_policies` table.

## Properties

- `PolicyID: number`: Defined with decorators `@PrimaryGeneratedColumn()`
- `PolicyName: string`: Defined with decorators `@Column({ type: 'varchar', length: 150 })`
- `PolicyCode: string`: Defined with decorators `@Column({ type: 'varchar', length: 50, unique: true, nullable: true })`
- `BaseSalaryMin: number`: Defined with decorators `@Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })`
- `BaseSalaryMax: number`: Defined with decorators `@Column({ type: 'decimal', precision: 15, scale: 2, nullable: true })`
- `OvertimeRate: number`: Defined with decorators `@Column({ type: 'decimal', precision: 5, scale: 2, default: 1.5 })`
- `HolidayRate: number`: Defined with decorators `@Column({ type: 'decimal', precision: 5, scale: 2, default: 2.0 })`
- `TaxRate: number`: Defined with decorators `@Column({ type: 'decimal', precision: 5, scale: 2, default: 10.0 })`
- `SocialIns: number`: Defined with decorators `@Column({ type: 'decimal', precision: 5, scale: 2, default: 8.0 })`
- `HealthIns: number`: Defined with decorators `@Column({ type: 'decimal', precision: 5, scale: 2, default: 1.5 })`
- `UnemployIns: number`: Defined with decorators `@Column({ type: 'decimal', precision: 5, scale: 2, default: 1.0 })`
- `EffectiveDate: Date`: Defined with decorators `@Column({ type: 'date', nullable: true })`
- `ExpiryDate: Date`: Defined with decorators `@Column({ type: 'date', nullable: true })`
- `IsActive: boolean`: Defined with decorators `@Column({ type: 'tinyint', default: 1 })`
- `Description: string`: Defined with decorators `@Column({ type: 'text', nullable: true })`
