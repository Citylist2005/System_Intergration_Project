# Model: User

- **Table Name:** `users`
- **Source File:** `d:/CMU-CS-445/Source/backend/src/database/payroll/entities/user.entity.ts`

## Description

TypeORM entity representing the `users` table.

## Properties

- `UserID: number`: Defined with decorators `@PrimaryGeneratedColumn()`
- `Username: string`: Defined with decorators `@Column({ type: 'varchar', length: 100, unique: true })`
- `Email: string`: Defined with decorators `@Column({ type: 'varchar', length: 150, unique: true })`
- `PasswordHash: string`: Defined with decorators `@Column({ type: 'varchar', length: 255 })`
- `FullName: string`: Defined with decorators `@Column({ type: 'varchar', length: 150, nullable: true })`
- `Role: string`: Defined with decorators `@Column({ type: 'varchar', length: 30, default: 'Employee' })`
- `EmployeeID: number`: Defined with decorators `@Column({ nullable: true })`
- `IsActive: boolean`: Defined with decorators `@Column({ type: 'tinyint', default: 1 })`
- `LastLoginAt: Date`: Defined with decorators `@Column({ type: 'datetime', nullable: true })`
- `ResetPasswordToken: string | null`: Defined with decorators `@Column({ type: 'varchar', length: 100, nullable: true })`
- `ResetPasswordExpiry: Date | null`: Defined with decorators `@Column({ type: 'datetime', nullable: true })`
