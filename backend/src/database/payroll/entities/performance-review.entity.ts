import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

@Entity('performance_reviews')
export class PerformanceReview {
  @PrimaryGeneratedColumn()
  ReviewID: number;

  @Column()
  EmployeeID: number;

  @Column({ type: 'varchar', length: 20 })
  ReviewPeriod: string;

  @Column({ type: 'date', nullable: true })
  ReviewDate: Date;

  @Column({ nullable: true })
  ReviewerID: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  OverallScore: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  Competency: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  Attitude: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  Teamwork: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  Productivity: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  Leadership: number;

  @Column({ type: 'varchar', length: 5, nullable: true })
  Grade: string;

  @Column({ type: 'text', nullable: true })
  Strengths: string;

  @Column({ type: 'text', nullable: true })
  Weaknesses: string;

  @Column({ type: 'text', nullable: true })
  Goals: string;

  @Column({ type: 'varchar', length: 20, default: 'Draft' })
  Status: string;

  @CreateDateColumn()
  CreatedAt: Date;

  @UpdateDateColumn()
  UpdatedAt: Date;
}
