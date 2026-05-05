# Model: SyncStatus

- **Table Name:** `sync_status`
- **Source File:** `d:/CMU-CS-445/Source/backend/src/database/payroll/entities/sync-status.entity.ts`

## Description

TypeORM entity representing the `sync_status` table.

## Properties

- `StatusID: number`: Defined with decorators `@PrimaryGeneratedColumn()`
- `SyncType: string`: Defined with decorators `@Column({ type: 'varchar', length: 30 })`
- `Status: string`: Defined with decorators `@Column({ type: 'varchar', length: 20 })`
- `StartedAt: Date`: Defined with decorators `@Column({ type: 'datetime', nullable: true })`
- `CompletedAt: Date`: Defined with decorators `@Column({ type: 'datetime', nullable: true })`
- `Details: Record<string, unknown>`: Defined with decorators `@Column({ type: 'json', nullable: true })`
