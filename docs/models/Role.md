# Model: Role

- **Table Name:** `roles`
- **Source File:** `d:/CMU-CS-445/Source/backend/src/database/payroll/entities/role.entity.ts`

## Description

TypeORM entity representing the `roles` table.

## Properties

- `id: number`: Defined with decorators `@PrimaryGeneratedColumn()`
- `name: string`: Defined with decorators `@Column({ type: 'varchar', length: 100, unique: true })`
- `description: string`: Defined with decorators `@Column({ type: 'varchar', length: 255, nullable: true })`
