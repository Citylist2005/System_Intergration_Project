import { Entity, Column, PrimaryColumn } from 'typeorm';

@Entity('Departments')
export class HumanDepartment {
  @PrimaryColumn()
  DepartmentID: number;

  @Column({ type: 'nvarchar', length: 100 })
  DepartmentName: string;

  @Column({ type: 'datetime', nullable: true })
  CreatedAt: Date;

  @Column({ type: 'datetime', nullable: true })
  UpdatedAt: Date;
}
