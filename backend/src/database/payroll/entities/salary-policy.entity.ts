import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('salary_policies')
export class SalaryPolicy {
  @PrimaryGeneratedColumn()
  PolicyID: number;

  @Column({ type: 'varchar', length: 150 })
  PolicyName: string;

  @Column({ type: 'varchar', length: 50, unique: true, nullable: true })
  PolicyCode: string;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  BaseSalaryMin: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, nullable: true })
  BaseSalaryMax: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 1.5 })
  OvertimeRate: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 2.0 })
  HolidayRate: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 10.0 })
  TaxRate: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 8.0 })
  SocialIns: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 1.5 })
  HealthIns: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 1.0 })
  UnemployIns: number;

  @Column({ type: 'date', nullable: true })
  EffectiveDate: Date;

  @Column({ type: 'date', nullable: true })
  ExpiryDate: Date;

  @Column({ type: 'tinyint', default: 1 })
  IsActive: boolean;

  @Column({ type: 'text', nullable: true })
  Description: string;

  @CreateDateColumn()
  CreatedAt: Date;

  @UpdateDateColumn()
  UpdatedAt: Date;
}
