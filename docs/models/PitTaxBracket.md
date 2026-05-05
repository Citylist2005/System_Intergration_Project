# Model: PitTaxBracket

- **Table Name:** `pit_tax_brackets`
- **Source File:** `d:/CMU-CS-445/Source/backend/src/database/payroll/entities/pit-tax-bracket.entity.ts`

## Description

TypeORM entity representing the `pit_tax_brackets` table.

## Properties

- `BracketID: number`: Defined with decorators `@PrimaryGeneratedColumn()`
- `EffectiveDate: Date`: Defined with decorators `@Column({ type: 'date' })`
- `MinIncome: number`: Defined with decorators `@Column({ type: 'decimal', precision: 18, scale: 2, default: 0 })`
- `MaxIncome: number | null`: Defined with decorators `@Column({ type: 'decimal', precision: 18, scale: 2, nullable: true })`
- `Rate: number`: Defined with decorators `@Column({ type: 'decimal', precision: 5, scale: 2 })`
- `Deduction: number`: Defined with decorators `@Column({ type: 'decimal', precision: 18, scale: 2, default: 0 })`
- `IsActive: boolean`: Defined with decorators `@Column({ type: 'tinyint', default: 1 })`
