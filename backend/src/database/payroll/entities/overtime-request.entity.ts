import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('overtime_requests')
export class OvertimeRequest {
  @PrimaryGeneratedColumn()
  OvertimeID: number;

  @Column()
  EmployeeID: number;

  @Column({ type: 'date' })
  OvertimeDate: Date;

  @Column({ type: 'time' })
  StartTime: string;

  @Column({ type: 'time' })
  EndTime: string;

  @Column({ type: 'decimal', precision: 5, scale: 2 })
  Hours: number;

  @Column({ type: 'text', nullable: true })
  Reason: string;

  @Column({ type: 'varchar', length: 30, default: 'Weekday' })
  OvertimeType: string;

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
