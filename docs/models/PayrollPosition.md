# Model: PayrollPosition

- **Table Name:** `positions_payroll`
- **Source File:** `d:/CMU-CS-445/Source/backend/src/database/payroll/entities/positions-payroll.entity.ts`

## Description

TypeORM entity representing the `positions_payroll` table.

## Properties

- `PositionID: number`: Defined with decorators `@PrimaryColumn()`
- `PositionName: string`: Defined with decorators `@Column({ type: 'varchar', length: 100 })`
- `SyncedAt: Date`: Defined with decorators `@Column({ type: 'datetime', nullable: true })`
