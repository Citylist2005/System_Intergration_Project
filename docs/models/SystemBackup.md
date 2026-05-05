# Model: SystemBackup

- **Table Name:** `system_backups`
- **Source File:** `d:/CMU-CS-445/Source/backend/src/database/payroll/entities/system-backup.entity.ts`

## Description

TypeORM entity representing the `system_backups` table.

## Properties

- `BackupID: number`: Defined with decorators `@PrimaryGeneratedColumn()`
- `BackupType: string`: Defined with decorators `@Column({ type: 'varchar', length: 30, default: 'Manual' })`
- `BackupName: string`: Defined with decorators `@Column({ type: 'varchar', length: 255, nullable: true })`
- `FilePath: string`: Defined with decorators `@Column({ type: 'varchar', length: 500, nullable: true })`
- `FileSize: number`: Defined with decorators `@Column({ type: 'bigint', nullable: true })`
- `Status: string`: Defined with decorators `@Column({ type: 'varchar', length: 20, default: 'Running' })`
- `CompletedAt: Date`: Defined with decorators `@Column({ type: 'datetime', nullable: true })`
- `Duration: number`: Defined with decorators `@Column({ nullable: true })`
- `CreatedBy: number`: Defined with decorators `@Column({ nullable: true })`
- `RestoredAt: Date | null`: Defined with decorators `@Column({ type: 'datetime', nullable: true })`
- `RestoredBy: number | null`: Defined with decorators `@Column({ type: 'int', nullable: true })`
- `Notes: string`: Defined with decorators `@Column({ type: 'text', nullable: true })`
