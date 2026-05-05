# Model: KpiOkr

- **Table Name:** `kpi_okr`
- **Source File:** `d:/CMU-CS-445/Source/backend/src/database/payroll/entities/kpi-okr.entity.ts`

## Description

TypeORM entity representing the `kpi_okr` table.

## Properties

- `KpiID: number`: Defined with decorators `@PrimaryGeneratedColumn()`
- `EmployeeID: number`: Defined with decorators `@Column()`
- `Period: string`: Defined with decorators `@Column({ type: 'varchar', length: 20 })`
- `PeriodType: string`: Defined with decorators `@Column({ type: 'varchar', length: 10, default: 'Quarterly' })`
- `Title: string`: Defined with decorators `@Column({ type: 'varchar', length: 255 })`
- `Description: string`: Defined with decorators `@Column({ type: 'text', nullable: true })`
- `TargetValue: number`: Defined with decorators `@Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })`
- `ActualValue: number`: Defined with decorators `@Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })`
- `Weight: number`: Defined with decorators `@Column({ type: 'decimal', precision: 5, scale: 2, default: 100 })`
- `Score: number`: Defined with decorators `@Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })`
- `BonusAmount: number`: Defined with decorators `@Column({ type: 'decimal', precision: 15, scale: 2, nullable: true, default: 0 })`
- `Status: string`: Defined with decorators `@Column({ type: 'varchar', length: 20, default: 'Active' })`
- `CreatedBy: number`: Defined with decorators `@Column({ nullable: true })`
