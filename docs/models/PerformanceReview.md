# Model: PerformanceReview

- **Table Name:** `performance_reviews`
- **Source File:** `d:/CMU-CS-445/Source/backend/src/database/payroll/entities/performance-review.entity.ts`

## Description

TypeORM entity representing the `performance_reviews` table.

## Properties

- `ReviewID: number`: Defined with decorators `@PrimaryGeneratedColumn()`
- `EmployeeID: number`: Defined with decorators `@Column()`
- `ReviewPeriod: string`: Defined with decorators `@Column({ type: 'varchar', length: 20 })`
- `ReviewDate: Date`: Defined with decorators `@Column({ type: 'date', nullable: true })`
- `ReviewerID: number`: Defined with decorators `@Column({ nullable: true })`
- `OverallScore: number`: Defined with decorators `@Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })`
- `Competency: number`: Defined with decorators `@Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })`
- `Attitude: number`: Defined with decorators `@Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })`
- `Teamwork: number`: Defined with decorators `@Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })`
- `Productivity: number`: Defined with decorators `@Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })`
- `Leadership: number`: Defined with decorators `@Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })`
- `Grade: string`: Defined with decorators `@Column({ type: 'varchar', length: 5, nullable: true })`
- `Strengths: string`: Defined with decorators `@Column({ type: 'text', nullable: true })`
- `Weaknesses: string`: Defined with decorators `@Column({ type: 'text', nullable: true })`
- `Goals: string`: Defined with decorators `@Column({ type: 'text', nullable: true })`
- `Status: string`: Defined with decorators `@Column({ type: 'varchar', length: 20, default: 'Draft' })`
