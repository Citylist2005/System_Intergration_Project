import { Entity, Column, PrimaryColumn, ManyToOne, JoinColumn } from 'typeorm';
import { PayrollDepartment } from './departments-payroll.entity';
import { PayrollPosition } from './positions-payroll.entity';

@Entity('employees_payroll')
export class EmployeesPayroll {
  @PrimaryColumn()
  EmployeeID: number;

  @Column({ type: 'varchar', length: 100, nullable: true })
  FullName: string;

  @Column({ name: 'DepartmentID', nullable: true })
  DepartmentID: number;

  @Column({ name: 'PositionID', nullable: true })
  PositionID: number;

  @Column({ type: 'varchar', length: 20, default: 'Active' })
  Status: string;

  @Column({ type: 'datetime', nullable: true })
  SyncedAt: Date;

  @ManyToOne(() => PayrollDepartment, { nullable: true })
  @JoinColumn({ name: 'DepartmentID' })
  department: PayrollDepartment;

  @ManyToOne(() => PayrollPosition, { nullable: true })
  @JoinColumn({ name: 'PositionID' })
  position: PayrollPosition;

  // Legacy properties kept as plain fields so older services still compile.
  EmployeeCode?: string;
  Email?: string;
  Phone?: string;
  DateOfBirth?: Date;
  Gender?: string;
  HireDate?: Date;
  TerminationDate?: Date;
  BaseSalary?: number;
  BankAccount?: string;
  BankName?: string;
  TaxCode?: string;
  InsuranceNumber?: string;
}
