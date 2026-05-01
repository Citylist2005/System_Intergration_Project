import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { EmployeesPayroll } from './employees-payroll.entity';

@Entity('salaries')
@Index('ux_salaries_employee_month', ['EmployeeID', 'SalaryMonth'], {
  unique: true,
})
export class Salary {
  @PrimaryGeneratedColumn()
  SalaryID: number;

  @Column()
  EmployeeID: number;

  @Column({ type: 'date' })
  SalaryMonth: Date;

  @Column({ type: 'decimal', precision: 15, scale: 2, nullable: true })
  BaseSalary: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, nullable: true })
  Bonus: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, nullable: true })
  Deductions: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, nullable: true })
  NetSalary: number;

  @Column({ type: 'datetime', nullable: true })
  CreatedAt: Date;

  @ManyToOne(() => EmployeesPayroll, { nullable: true })
  @JoinColumn({ name: 'EmployeeID' })
  employee: EmployeesPayroll;
}
