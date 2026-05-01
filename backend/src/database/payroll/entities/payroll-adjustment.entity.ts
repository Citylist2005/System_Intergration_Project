import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

@Entity('payroll_adjustments')
export class PayrollAdjustment {
  @PrimaryGeneratedColumn()
  AdjustmentID: number;

  @Column()
  EmployeeID: number;

  @Column({ type: 'date' })
  SalaryMonth: Date;

  @Column({ type: 'varchar', length: 50 })
  AdjustType: string;

  @Column({ type: 'decimal', precision: 15, scale: 2 })
  Amount: number;

  @Column({ type: 'text', nullable: true })
  Reason: string;

  @Column({ nullable: true })
  ApprovedBy: number;

  @Column({ type: 'varchar', length: 20, default: 'Pending' })
  Status: string;

  @CreateDateColumn()
  CreatedAt: Date;

  @UpdateDateColumn()
  UpdatedAt: Date;
}
