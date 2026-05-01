import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

@Entity('kpi_okr')
export class KpiOkr {
  @PrimaryGeneratedColumn()
  KpiID: number;

  @Column()
  EmployeeID: number;

  @Column({ type: 'varchar', length: 20 })
  Period: string;

  @Column({ type: 'varchar', length: 10, default: 'Quarterly' })
  PeriodType: string;

  @Column({ type: 'varchar', length: 255 })
  Title: string;

  @Column({ type: 'text', nullable: true })
  Description: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  TargetValue: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  ActualValue: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 100 })
  Weight: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  Score: number;

  @Column({ type: 'varchar', length: 20, default: 'Active' })
  Status: string;

  @Column({ nullable: true })
  CreatedBy: number;

  @CreateDateColumn()
  CreatedAt: Date;

  @UpdateDateColumn()
  UpdatedAt: Date;
}
