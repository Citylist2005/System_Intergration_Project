# Model: AuditLog

- **Table Name:** `audit_logs`
- **Source File:** `d:/CMU-CS-445/Source/backend/src/database/payroll/entities/audit-log.entity.ts`

## Description

TypeORM entity representing the `audit_logs` table.

## Properties

- `LogID: number`: Defined with decorators `@PrimaryGeneratedColumn()`
- `UserID: number`: Defined with decorators `@Column({ nullable: true })`
- `Username: string`: Defined with decorators `@Column({ type: 'varchar', length: 100, nullable: true })`
- `Action: string`: Defined with decorators `@Column({ type: 'varchar', length: 100 })`
- `EntityType: string`: Defined with decorators `@Column({ type: 'varchar', length: 80, nullable: true })`
- `EntityID: string`: Defined with decorators `@Column({ type: 'varchar', length: 50, nullable: true })`
- `OldValues: unknown`: Defined with decorators `@Column({ type: 'json', nullable: true })`
- `NewValues: unknown`: Defined with decorators `@Column({ type: 'json', nullable: true })`
- `IPAddress: string`: Defined with decorators `@Column({ type: 'varchar', length: 45, nullable: true })`
