import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { EmployeesPayroll } from './employees-payroll.entity';

@Entity('attendance')
@Index('ux_attendance_employee_month', ['EmployeeID', 'AttendanceMonth'], {
  unique: true,
})
export class Attendance {
  @PrimaryGeneratedColumn()
  AttendanceID: number;

  @Column()
  EmployeeID: number;

  @Column({ type: 'int', default: 0 })
  WorkDays: number;

  @Column({ type: 'int', default: 0 })
  AbsentDays: number;

  @Column({ type: 'int', default: 0 })
  LeaveDays: number;

  @Column({ type: 'decimal', precision: 6, scale: 2, default: 0 })
  OvertimeHours: number;

  @Column({ type: 'date' })
  AttendanceMonth: Date;

  @Column({ type: 'datetime', nullable: true })
  CreatedAt: Date;

  @ManyToOne(() => EmployeesPayroll, { nullable: true })
  @JoinColumn({ name: 'EmployeeID' })
  employee: EmployeesPayroll;

  // Legacy properties kept as plain fields so older services still compile.
  AttendanceDate?: Date;
  CheckIn?: string;
  CheckOut?: string;
  WorkHours?: number;
  Status?: string;
  Note?: string;
}
