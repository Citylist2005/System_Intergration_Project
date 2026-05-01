import { Entity, Column, PrimaryColumn } from 'typeorm';

@Entity('Employees')
export class HumanEmployee {
  @PrimaryColumn()
  EmployeeID: number;

  @Column({ type: 'nvarchar', length: 100 })
  FullName: string;

  @Column({ type: 'date', nullable: true })
  DateOfBirth: Date;

  @Column({ type: 'nvarchar', length: 10, nullable: true })
  Gender: string;

  @Column({ type: 'nvarchar', length: 20, nullable: true })
  PhoneNumber: string;

  @Column({ type: 'nvarchar', length: 100, nullable: true })
  Email: string;

  @Column({ nullable: true })
  DepartmentID: number;

  @Column({ nullable: true })
  PositionID: number;

  @Column({ type: 'date', nullable: true })
  HireDate: Date;

  @Column({ type: 'nvarchar', length: 10, nullable: true })
  Status: string;

  @Column({ type: 'datetime', nullable: true })
  CreatedAt: Date;

  @Column({ type: 'datetime', nullable: true })
  UpdatedAt: Date;
}
