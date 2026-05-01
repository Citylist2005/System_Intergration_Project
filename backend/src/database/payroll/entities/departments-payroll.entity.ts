import { Entity, Column, PrimaryColumn } from 'typeorm';

@Entity('departments_payroll')
export class PayrollDepartment {
  @PrimaryColumn()
  DepartmentID: number;

  @Column({ type: 'varchar', length: 100 })
  DepartmentName: string;

  @Column({ type: 'datetime', nullable: true })
  SyncedAt: Date;
}
