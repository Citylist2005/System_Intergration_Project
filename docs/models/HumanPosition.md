# Model: HumanPosition

- **Table Name:** `Positions`
- **Source File:** `d:/CMU-CS-445/Source/backend/src/database/human/entities/position.entity.ts`

## Description

TypeORM entity representing the `Positions` table.

## Properties

- `PositionID: number`: Defined with decorators `@PrimaryColumn()`
- `PositionName: string`: Defined with decorators `@Column({ type: 'nvarchar', length: 100 })`
- `CreatedAt: Date`: Defined with decorators `@Column({ type: 'datetime', nullable: true })`
- `UpdatedAt: Date`: Defined with decorators `@Column({ type: 'datetime', nullable: true })`
