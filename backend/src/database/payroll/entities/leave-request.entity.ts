import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('leave_requests')
export class LeaveRequest {
  @PrimaryGeneratedColumn()
  LeaveID: number;

  @Column()
  EmployeeID: number;

  @Column({ type: 'varchar', length: 50 })
  LeaveType: string;

  @Column({ type: 'date' })
  StartDate: Date;

  @Column({ type: 'date' })
  EndDate: Date;

  @Column({ type: 'decimal', precision: 5, scale: 1, default: 1 })
  TotalDays: number;

  @Column({ type: 'text', nullable: true })
  Reason: string;

  @Column({ type: 'varchar', length: 20, default: 'Pending' })
  Status: string;

  @Column({ nullable: true })
  ApprovedBy: number;

  @Column({ type: 'datetime', nullable: true })
  ApprovedAt: Date;

  @CreateDateColumn()
  CreatedAt: Date;

  @UpdateDateColumn()
  UpdatedAt: Date;
}
