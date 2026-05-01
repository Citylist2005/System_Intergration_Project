import { Entity, Column, PrimaryColumn } from 'typeorm';

@Entity('attendance')
export class HumanAttendance {
  @PrimaryColumn()
  AttendanceID: number;

  @Column()
  EmployeeID: number;

  @Column({ type: 'date' })
  AttendanceDate: Date;

  @Column({ type: 'time', nullable: true })
  CheckIn: string;

  @Column({ type: 'time', nullable: true })
  CheckOut: string;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  WorkHours: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  OvertimeHours: number;

  @Column({ type: 'nvarchar', length: 10, nullable: true })
  Status: string;
}
