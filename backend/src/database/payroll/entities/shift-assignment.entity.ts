import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { WorkShift } from './work-shift.entity';

@Entity('shift_assignments')
export class ShiftAssignment {
  @PrimaryGeneratedColumn()
  AssignmentID: number;

  @Column()
  EmployeeID: number;

  @Column()
  ShiftID: number;

  @Column({ type: 'date' })
  EffectiveDate: Date;

  @Column({ type: 'date', nullable: true })
  EndDate: Date;

  @Column({ nullable: true })
  CreatedBy: number;

  @CreateDateColumn()
  CreatedAt: Date;

  @UpdateDateColumn()
  UpdatedAt: Date;

  @ManyToOne(() => WorkShift, { nullable: true })
  @JoinColumn({ name: 'ShiftID' })
  shift?: WorkShift;
}
